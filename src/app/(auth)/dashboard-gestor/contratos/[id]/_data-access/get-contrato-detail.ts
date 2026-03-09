'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const getContratoDetail = withPermission(
	'read',
	async (ctx, id: string) => {
		const contrato = await prisma.contrato.findFirst({
			where: { id, organizationId: ctx.organizationId },
			select: {
				id: true,
				numero: true,
				displayContrato: true,
				displayLicitacao: true,
				contratado: true,
				tipoAto: true,
				exercicio: true,
				dataInicio: true,
				dataFim: true,
				idOxy: true,
				createdAt: true,
				updatedAt: true,
				empresa: { select: { id: true, name: true, cnpj: true } },
				licitacao: {
					select: {
						id: true,
						numero: true,
						ano: true,
						modalidade: true,
						situacao: true,
						objeto: true,
						entidade: true,
						dataPublicacao: true,
						transporteReports: {
							select: {
								id: true,
								protocolo: true,
								periodoAnalisadoInicio: true,
								periodoAnalisadoFim: true,
								assinaturaDigital: true,
								createdAt: true,
							},
							orderBy: { createdAt: 'desc' },
							take: 10,
						},
						obrasReports: {
							select: {
								id: true,
								protocolo: true,
								periodoAnalisadoInicio: true,
								periodoAnalisadoFim: true,
								assinaturaDigital: true,
								createdAt: true,
							},
							orderBy: { createdAt: 'desc' },
							take: 10,
						},
					},
				},
				fiscalPrincipal: {
					select: {
						member: {
							select: {
								id: true,
								fiscalCargo: true,
								fiscalMatricula: true,
								fiscalContato: true,
								user: { select: { id: true, name: true, email: true } },
							},
						},
					},
				},
				setoriais: {
					select: {
						member: {
							select: {
								id: true,
								fiscalCargo: true,
								fiscalMatricula: true,
								user: { select: { id: true, name: true, email: true } },
							},
						},
					},
				},
				bensEServicosReports: {
					select: {
						id: true,
						protocolo: true,
						periodoAnalisadoInicio: true,
						periodoAnalisadoFim: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				// Adicionando outros tipos de relatórios
				assinaturasNotificacoes: {
					select: {
						id: true,
						tipo: true,
						dataEnvio: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				entregaNotificacoes: {
					select: {
						id: true,
						tipo: true,
						dataEnvio: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				entregaIncompletaNotificacoes: {
					select: {
						id: true,
						tipo: true,
						dataEnvio: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				notificacoesFiscalTrabalhista: {
					select: {
						id: true,
						tipo: true,
						dataEnvio: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				notificacoesDesconformidade: {
					select: {
						id: true,
						tipo: true,
						dataEnvio: true,
						assinaturaDigital: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				},
				aditivos: {
					select: {
						id: true,
						sequencia: true,
						data: true,
						dataPublicacao: true,
						dataTermino: true,
						valorAditivo: true,
						motivacao: true,
						createdAt: true,
					},
					orderBy: { sequencia: 'desc' },
				},
			},
		})

		if (!contrato) {
			return { success: false as const, error: 'Contrato não encontrado.' }
		}

		return { success: true as const, data: contrato }
	},
	'gestor-contratos',
)
