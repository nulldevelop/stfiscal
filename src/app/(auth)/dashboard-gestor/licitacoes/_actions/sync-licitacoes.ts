'use server'

import { revalidatePath } from 'next/cache'
import type { PermissionContext } from '@/lib/permissions/types'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import {
	getLicitacoes as fetchLicitacoesFromApi,
	getActiveYearsFromCache,
	getContratosVigentes,
} from '@/lib/sync/api/oxy-api'
import { syncLicitacoesFromApi } from '@/lib/sync/services/licitacao-service'
import { parseLicitacaoDisplay } from '@/lib/sync/utils/helpers'

export const syncLicitacoesAction = withPermission(
	'create',
	async (ctx: PermissionContext) => {
		const { organizationId } = ctx

		const org = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: {
				apiUrlContratos: true,
				apiUrlLicitacoes: true,
			},
		})

		if (!org?.apiUrlLicitacoes || !org?.apiUrlContratos) {
			return {
				success: false as const,
				error:
					'URLs da API não configuradas. Acesse Configurações > Integrações.',
			}
		}

		try {
			// 1. Identificar anos com contratos vigentes
			let years = getActiveYearsFromCache(org.apiUrlContratos)
			if (!years.length) {
				await getContratosVigentes(org.apiUrlContratos)
				years = getActiveYearsFromCache(org.apiUrlContratos)
			}

			if (!years.length) {
				const currentYear = new Date().getFullYear()
				years = [currentYear - 1, currentYear, currentYear + 1]
			}

			// 2. Buscar contratos para identificar anos de licitação
			const contratosApi = await getContratosVigentes(
				org.apiUrlContratos,
				years,
			)
			const biddingYears = new Set<number>(years)
			for (const c of contratosApi) {
				const { ano } = parseLicitacaoDisplay(
					c.displayLicitacao,
					c.exercicioLicitacao,
				)
				if (!Number.isNaN(ano)) {
					biddingYears.add(ano)
				}
			}

			// 3. Buscar todas as licitações da API para esses anos
			const licitacoesApi = await fetchLicitacoesFromApi(
				org.apiUrlLicitacoes,
				Array.from(biddingYears),
			)

			if (!licitacoesApi.length) {
				return {
					success: false as const,
					error:
						'Nenhuma licitação encontrada na API para os anos identificados.',
				}
			}

			// 4. Utilizar o serviço centralizado para sincronizar
			const result = await syncLicitacoesFromApi(organizationId, licitacoesApi)

			revalidatePath('/dashboard-gestor/licitacoes')

			return {
				success: true as const,
				data: {
					criadas: result.criadas,
					atualizadas: result.atualizadas,
				},
			}
		} catch (error) {
			console.error('Erro ao sincronizar licitações:', error)
			return {
				success: false as const,
				error: 'Erro interno ao processar sincronização.',
			}
		}
	},
	{ module: 'gestor-contratos' },
)
