'use server'

import { endOfMonth, startOfMonth } from 'date-fns'
import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export type ContratoDashboard = {
	id: string
	numero: number
	displayContrato: string
	displayLicitacao: string
	contratado: string
	tipoAto: string | null
	idOxy: string | null
	fiscalContratoId: string
	licitacaoId: string
	licitacao: {
		objeto: string
		numero: number
		ano: number
		modalidade: string
	}
	empresa: {
		name: string
	}
	// Usamos um nome genérico ou mantemos bensEServicosReports mas com tipo flexível
	// já que o componente ContratosTable espera este nome.
	bensEServicosReports: { createdAt: Date | string }[]
}

export type DashboardData = {
	contratos: ContratoDashboard[]
	totalContratos: number
	totalRelatoriosMes: number
	relatoriosFeitos: number
	relatoriosPendentes: number
}

export async function getDashboardDataByFiscal(): Promise<DashboardData> {
	const userId = await getCurrentUserId()
	const organizationId = await getCurrentOrganizationId()

	if (!userId || !organizationId) {
		throw new Error('Usuário ou organização não identificados.')
	}

	const currentMonthStart = startOfMonth(new Date())
	const currentMonthEnd = endOfMonth(new Date())

	// Buscar todos os registros de FiscalContrato desta pessoa na organização atual
	const fiscalRecords = await prisma.fiscalContrato.findMany({
		where: { userId, organizationId },
		include: {
			contratos: {
				where: { ativo: true },
				include: {
					contrato: {
						include: {
							licitacao: true,
							empresa: true,
							bensEServicosReports: {
								orderBy: { createdAt: 'desc' },
								take: 1,
							},
						},
					},
				},
			},
		},
	})

	if (fiscalRecords.length === 0) {
		return {
			contratos: [],
			totalContratos: 0,
			totalRelatoriosMes: 0,
			relatoriosFeitos: 0,
			relatoriosPendentes: 0,
		}
	}

	// Consolidar e deduplicar contratos
	const contratosMap = new Map<string, any>()

	for (const record of fiscalRecords) {
		for (const link of record.contratos) {
			const contrato = link.contrato
			if (!contratosMap.has(contrato.id)) {
				contratosMap.set(contrato.id, {
					...contrato,
					fiscalContratoId: record.id,
				})
			}
		}
	}

	const contratosBase = Array.from(contratosMap.values())

	const contratos = await Promise.all(
		contratosBase.map(async (contrato) => {
			const lastBens = contrato.bensEServicosReports[0]

			const lastTransp = await prisma.transporteReport.findFirst({
				where: {
					contratoId: contrato.id,
					organizationId,
				},
				orderBy: { createdAt: 'desc' },
			})

			const lastObras = await prisma.obrasReport.findFirst({
				where: {
					contratoId: contrato.id,
					organizationId,
				},
				orderBy: { createdAt: 'desc' },
			})

			const lastTerceirizacao = await prisma.terceirizacaoReport.findFirst({
				where: {
					contratoId: contrato.id,
					organizationId,
				},
				orderBy: { createdAt: 'desc' },
			})

			const allLastReports = [
				lastBens,
				lastTransp,
				lastObras,
				lastTerceirizacao,
			]
				.filter(Boolean)
				.sort(
					(a: any, b: any) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)

			const lastReport = allLastReports[0]

			return {
				id: contrato.id,
				numero: contrato.numero,
				displayContrato: contrato.displayContrato,
				displayLicitacao: contrato.displayLicitacao,
				contratado: contrato.contratado,
				tipoAto: contrato.tipoAto,
				idOxy: contrato.idOxy,
				fiscalContratoId: contrato.fiscalContratoId,
				licitacaoId: contrato.licitacaoId,
				licitacao: {
					objeto: contrato.licitacao?.objeto || '',
					numero: contrato.licitacao?.numero ?? 0,
					ano: contrato.licitacao?.ano ?? new Date().getFullYear(),
					modalidade: contrato.licitacao?.modalidade || '',
				},
				empresa: {
					name: contrato.empresa?.name || '',
				},
				bensEServicosReports: lastReport
					? [{ createdAt: lastReport.createdAt }]
					: [],
			} as ContratoDashboard
		}),
	)

	const contratoIds = contratos.map((c) => c.id)

	const [bensCount, transpCount, obrasCount, terceirizacaoCount] =
		await Promise.all([
			prisma.bensEServicosReport.count({
				where: {
					contratoId: { in: contratoIds },
					organizationId,
					createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
				},
			}),
			prisma.transporteReport.count({
				where: {
					contratoId: { in: contratoIds },
					organizationId,
					createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
				},
			}),
			prisma.obrasReport.count({
				where: {
					contratoId: { in: contratoIds },
					organizationId,
					createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
				},
			}),
			prisma.terceirizacaoReport.count({
				where: {
					contratoId: { in: contratoIds },
					organizationId,
					createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
				},
			}),
		])

	const totalContratos = contratos.length
	const totalRelatoriosMes =
		bensCount + transpCount + obrasCount + terceirizacaoCount

	const now = new Date()
	const relatoriosPendentes = contratos.filter((contrato) => {
		const lastReport = contrato.bensEServicosReports[0]
		if (!lastReport) return true
		const daysSinceLastReport = Math.floor(
			(now.getTime() - new Date(lastReport.createdAt).getTime()) /
				(1000 * 60 * 60 * 24),
		)
		return daysSinceLastReport > 30
	}).length

	const relatoriosFeitos = totalContratos - relatoriosPendentes

	const sortedContratos = [...contratos].sort((a, b) => {
		const lastReportA = a.bensEServicosReports[0]
		const lastReportB = b.bensEServicosReports[0]
		const daysA = lastReportA
			? Math.floor(
					(now.getTime() - new Date(lastReportA.createdAt).getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: Infinity
		const daysB = lastReportB
			? Math.floor(
					(now.getTime() - new Date(lastReportB.createdAt).getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: Infinity

		const isPendingA = daysA > 30
		const isPendingB = daysB > 30

		if (isPendingA && !isPendingB) return -1
		if (!isPendingA && isPendingB) return 1
		return 0
	})

	return {
		contratos: sortedContratos,
		totalContratos,
		totalRelatoriosMes,
		relatoriosFeitos,
		relatoriosPendentes,
	}
}

export async function getContratoDetails(contratoId: string) {
	const userId = await getCurrentUserId()
	const organizationId = await getCurrentOrganizationId()

	if (!userId || !organizationId) {
		throw new Error('Usuário não autenticado.')
	}

	const contrato = await prisma.contrato.findUnique({
		where: { id: contratoId },
		include: {
			licitacao: true,
			empresa: true,
			bensEServicosReports: {
				where: { status: 'FINALIZADO' },
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: {
						include: { user: { select: { name: true } } },
					},
				},
			},
			entregaNotificacoes: {
				orderBy: { createdAt: 'desc' },
			},
			entregaIncompletaNotificacoes: {
				orderBy: { createdAt: 'desc' },
			},
			notificacoesDesconformidade: {
				orderBy: { createdAt: 'desc' },
			},
			notificacoesFiscalTrabalhista: {
				orderBy: { createdAt: 'desc' },
			},
			assinaturasNotificacoes: {
				orderBy: { createdAt: 'desc' },
			},
			fiscalPrincipalReports: {
				where: { status: 'FINALIZADO' },
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: {
						include: { user: { select: { name: true } } },
					},
				},
			},
		},
	})

	if (!contrato) {
		return null
	}

	// 1. Localizar o Member deste usuário na organização atual
	const member = await prisma.member.findUnique({
		where: { userId_organizationId: { userId, organizationId } },
		select: { id: true },
	})

	let isPrincipalDoContrato = false

	if (member) {
		// 2. Verificar se este member é o fiscal principal deste contrato específico (tabela ContratoFiscal)
		const fiscalPrincipalVinculo = await prisma.contratoFiscal.findFirst({
			where: {
				contratoId: contrato.id,
				memberId: member.id,
			},
		})
		isPrincipalDoContrato = !!fiscalPrincipalVinculo
	}

	const [transporteReports, obrasReports, terceirizacaoReports] =
		await Promise.all([
			prisma.transporteReport.findMany({
				where: { contratoId: contrato.id, status: 'FINALIZADO' },
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: {
						include: { user: { select: { name: true } } },
					},
				},
			}),
			prisma.obrasReport.findMany({
				where: { contratoId: contrato.id, status: 'FINALIZADO' },
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: {
						include: { user: { select: { name: true } } },
					},
				},
			}),
			prisma.terceirizacaoReport.findMany({
				where: { contratoId: contrato.id, status: 'FINALIZADO' },
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: {
						include: { user: { select: { name: true } } },
					},
				},
			}),
		])

	return {
		...contrato,
		transporteReports,
		obrasReports,
		terceirizacaoReports,
		isPrincipalDoContrato, 
	}
}
