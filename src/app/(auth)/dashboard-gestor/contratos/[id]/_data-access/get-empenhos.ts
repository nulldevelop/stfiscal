'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'
import {
	getEmpenhosByLicitacao,
	getEmpenhoTotais,
} from '@/lib/sync/api/oxy-api'

export const getEmpenhosByContrato = withPermission(
	'read',
	async (ctx, contratoId: string) => {
		const contrato = await prisma.contrato.findFirst({
			where: { id: contratoId, organizationId: ctx.organizationId },
			select: {
				id: true,
				licitacao: {
					select: {
						idOxy: true,
						entidade: true,
					},
				},
				empenhos: {
					select: {
						id: true,
						numero: true,
						exercicio: true,
						data: true,
						fornecedor: true,
						historico: true,
						valorEmpenhado: true,
						valorAnulado: true,
						valorLiquidado: true,
						valorRetido: true,
						valorPago: true,
						valorAPagar: true,
						origem: true,
					},
					orderBy: [{ exercicio: 'desc' }, { numero: 'desc' }],
				},
			},
		})

		if (!contrato) {
			return {
				success: false as const,
				error: 'Contrato não encontrado.',
			}
		}

		// Se tem empenhos no banco, usa eles (já sincronizados)
		// Busca totais da API se a licitação tem idOxy
		let totaisApi: Awaited<ReturnType<typeof getEmpenhoTotais>> = null

		if (contrato.licitacao?.idOxy) {
			try {
				totaisApi = await getEmpenhoTotais(contrato.licitacao.idOxy)
			} catch {
				// Ignora erro na API, usa dados do banco
			}
		}

		// Se não tem empenhos no banco mas tem idOxy, busca da API como fallback
		let empenhosApi: Awaited<ReturnType<typeof getEmpenhosByLicitacao>> = []
		if (contrato.empenhos.length === 0 && contrato.licitacao?.idOxy) {
			try {
				const entidade = Number(contrato.licitacao.entidade) || 1
				empenhosApi = await getEmpenhosByLicitacao(
					contrato.licitacao.idOxy,
					entidade,
				)
			} catch {
				// Ignora erro
			}
		}

		return {
			success: true as const,
			data: {
				totais: totaisApi,
				empenhosApi,
				empenhosManuais: contrato.empenhos,
			},
		}
	},
	'gestor-contratos',
)
