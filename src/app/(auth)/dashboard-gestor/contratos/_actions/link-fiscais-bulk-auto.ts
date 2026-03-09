'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { deactivateExpiredLinks } from '@/lib/sync/services/contrato-service'
import type { TransactionResult } from '@/lib/sync/steps/execute-transaction'
import { fetchApiData } from '@/lib/sync/steps/fetch-api-data'
import { syncFiscais } from '@/lib/sync/steps/sync-fiscais'
import { getContratoKey } from '@/lib/sync/utils/helpers'

export const bulkAutoLinkFiscaisAction = withPermission(
	'update',
	async (ctx) => {
		const { organizationId } = ctx

		try {
			// 1. Buscar URLs da API da organização
			const org = await prisma.organization.findUnique({
				where: { id: organizationId },
				select: {
					apiUrlContratos: true,
					apiUrlLicitacoes: true,
					apiUrlFiscais: true,
					apiUrlAditivos: true,
				},
			})

			if (
				!org?.apiUrlContratos ||
				!org?.apiUrlFiscais ||
				!org?.apiUrlLicitacoes ||
				!org?.apiUrlAditivos
			) {
				return {
					success: false,
					error: 'URLs da API não configuradas corretamente.',
				}
			}

			// 2. Buscar dados da API Oxy usando a ferramenta de sync
			const apiResult = await fetchApiData(
				org.apiUrlContratos,
				org.apiUrlLicitacoes,
				org.apiUrlFiscais,
				org.apiUrlAditivos,
			)

			if (!apiResult.success) {
				return {
					success: false,
					error: `Erro ao buscar dados da API: ${apiResult.error}`,
				}
			}

			const { apiLookup, fiscaisMap } = apiResult.data

			// 3. Buscar todos os contratos da organização no DB para tentar vincular
			const contratosDb = await prisma.contrato.findMany({
				where: { organizationId },
				select: {
					id: true,
					numero: true,
					tipoAto: true,
					exercicio: true,
				},
			})

			// 4. Preparar TransactionResult "fictício" para o syncFiscais
			const contratosAtualizadosIds: TransactionResult['contratosAtualizadosIds'] =
				[]

			for (const c of contratosDb) {
				const key = getContratoKey(c.numero, c.tipoAto, c.exercicio)
				if (apiLookup.has(key)) {
					contratosAtualizadosIds.push({
						contratoId: c.id,
						numero: c.numero,
						tipoAto: c.tipoAto,
						exercicio: c.exercicio,
					})
				}
			}

			const transactionResult: TransactionResult = {
				contratosRecemCriados: [],
				contratosAtualizadosIds,
			}

			// 5. Utilizar a ferramenta de sync para vincular os fiscais
			const result = await syncFiscais(
				transactionResult,
				fiscaisMap,
				apiLookup,
				organizationId,
			)

			// 6. Desativar links de contratos expirados
			const deactivatedCount = await deactivateExpiredLinks(organizationId)

			revalidatePath('/dashboard-gestor/contratos')
			revalidatePath('/dashboard-gestor/fiscais')

			const message = [
				`Vínculos processados: ${result.vinculados}.`,
				`Sem fiscais na API: ${result.semFiscais}.`,
				`Contratos expirados/pulados: ${result.pulados}.`,
				`Vínculos expirados desativados: ${deactivatedCount}.`,
			].join('\n')

			return { success: true, data: { message } }
		} catch (error) {
			console.error('Erro ao vincular fiscais em massa:', error)
			return {
				success: false,
				error: 'Ocorreu um erro ao tentar vincular os fiscais.',
			}
		}
	},
	{ module: 'gestor-contratos', log: 'BULK_LINK_FISCAIS' },
)
