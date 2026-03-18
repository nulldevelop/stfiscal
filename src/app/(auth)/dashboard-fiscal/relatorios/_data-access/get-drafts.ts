'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getTerceirizacaoDrafts() {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) return []

	return prisma.terceirizacaoReport.findMany({
		where: {
			organizationId,
			fiscalDoContrato: { userId },
			status: 'RASCUNHO',
		},
		orderBy: { createdAt: 'desc' },
		include: {
			contrato: {
				select: {
					id: true,
					displayContrato: true,
					contratado: true,
				},
			},
		},
	})
}

export async function getTerceirizacaoReportById(reportId: string) {
	return prisma.terceirizacaoReport.findUnique({
		where: { id: reportId },
		include: {
			contrato: {
				select: {
					id: true,
					displayContrato: true,
					displayLicitacao: true,
					contratado: true,
					objeto: true,
					dataInicio: true,
					dataFim: true,
					licitacao: {
						select: {
							id: true,
							modalidade: true,
							numero: true,
							ano: true,
						},
					},
				},
			},
			fiscalDoContrato: {
				select: {
					nome: true,
					cpf: true,
				},
			},
		},
	})
}

export async function getBensEServicosReportById(reportId: string) {
	return prisma.bensEServicosReport.findUnique({
		where: { id: reportId },
		include: {
			contrato: {
				select: {
					id: true,
					displayContrato: true,
					displayLicitacao: true,
					contratado: true,
					objeto: true,
					dataInicio: true,
					dataFim: true,
					licitacao: {
						select: {
							id: true,
							modalidade: true,
							numero: true,
							ano: true,
						},
					},
				},
			},
			fiscalDoContrato: {
				select: {
					nome: true,
					cpf: true,
				},
			},
		},
	})
}

export async function getTransporteReportById(reportId: string) {
	return prisma.transporteReport.findUnique({
		where: { id: reportId },
		include: {
			contrato: {
				select: {
					id: true,
					displayContrato: true,
					displayLicitacao: true,
					contratado: true,
					objeto: true,
					dataInicio: true,
					dataFim: true,
					licitacao: {
						select: {
							id: true,
							modalidade: true,
							numero: true,
							ano: true,
						},
					},
				},
			},
			fiscalDoContrato: {
				select: {
					nome: true,
					cpf: true,
				},
			},
		},
	})
}

export async function getObrasReportById(reportId: string) {
	return prisma.obrasReport.findUnique({
		where: { id: reportId },
		include: {
			contrato: {
				select: {
					id: true,
					displayContrato: true,
					displayLicitacao: true,
					contratado: true,
					objeto: true,
					dataInicio: true,
					dataFim: true,
					licitacao: {
						select: {
							id: true,
							modalidade: true,
							numero: true,
							ano: true,
						},
					},
				},
			},
			fiscalDoContrato: {
				select: {
					nome: true,
					cpf: true,
				},
			},
		},
	})
}

export async function getAllDraftsByFiscal() {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return {
			terceirizacao: { type: 'Terceirização', reports: [] },
			bensServicos: { type: 'Bens e Serviços', reports: [] },
			transporte: { type: 'Serviços de Transporte', reports: [] },
			obras: { type: 'Obras', reports: [] },
			fiscalPrincipal: { type: 'Fiscal Principal', reports: [] },
		}
	}

	const baseWhere = {
		organizationId,
		fiscalDoContrato: { userId },
		status: 'RASCUNHO' as const,
	}

	const [terceirizacao, bensServicos, transporte, obras, fiscalPrincipal] =
		await Promise.all([
			prisma.terceirizacaoReport.findMany({
				where: baseWhere,
				select: {
					id: true,
					protocolo: true,
					createdAt: true,
					updatedAt: true,
					periodoAnalisadoInicio: true,
					periodoAnalisadoFim: true,
					contrato: {
						select: {
							displayContrato: true,
							contratado: true,
						},
					},
				},
			}),
			prisma.bensEServicosReport.findMany({
				where: baseWhere,
				select: {
					id: true,
					protocolo: true,
					createdAt: true,
					updatedAt: true,
					periodoAnalisadoInicio: true,
					periodoAnalisadoFim: true,
					contrato: {
						select: {
							displayContrato: true,
							contratado: true,
						},
					},
				},
			}),
			prisma.transporteReport.findMany({
				where: baseWhere,
				select: {
					id: true,
					protocolo: true,
					createdAt: true,
					updatedAt: true,
					periodoAnalisadoInicio: true,
					periodoAnalisadoFim: true,
					contrato: {
						select: {
							displayContrato: true,
							contratado: true,
						},
					},
				},
			}),
			prisma.obrasReport.findMany({
				where: baseWhere,
				select: {
					id: true,
					protocolo: true,
					createdAt: true,
					updatedAt: true,
					periodoAnalisadoInicio: true,
					periodoAnalisadoFim: true,
					contrato: {
						select: {
							displayContrato: true,
							contratado: true,
						},
					},
				},
			}),
			prisma.fiscalPrincipalReport.findMany({
				where: baseWhere,
				select: {
					id: true,
					protocolo: true,
					createdAt: true,
					updatedAt: true,
					periodoAnalisadoInicio: true,
					periodoAnalisadoFim: true,
					contrato: {
						select: {
							displayContrato: true,
							contratado: true,
						},
					},
				},
			}),
		])

	return {
		terceirizacao: { type: 'Terceirização', reports: terceirizacao },
		bensServicos: { type: 'Bens e Serviços', reports: bensServicos },
		transporte: { type: 'Serviços de Transporte', reports: transporte },
		obras: { type: 'Obras', reports: obras },
		fiscalPrincipal: { type: 'Fiscal Principal', reports: fiscalPrincipal },
	}
}
