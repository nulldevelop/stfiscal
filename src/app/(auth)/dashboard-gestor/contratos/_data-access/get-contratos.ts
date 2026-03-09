'use server'
import { differenceInDays } from 'date-fns'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

interface GetContratosParams {
	page?: number
	pageSize?: number
	search?: string
	createdAtStart?: string
	createdAtEnd?: string
}

export async function getContratos({
	page = 1,
	pageSize = 10,
	search = '',
	createdAtStart,
	createdAtEnd,
}: GetContratosParams) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { contratos: [], total: 0 }
	}

	const whereClause: any = {
		organizationId,

		...(search && {
			OR: [
				{ displayContrato: { contains: search } },
				{ displayLicitacao: { contains: search } },
				{ contratado: { contains: search } },
				{ empresa: { name: { contains: search } } },
			],
		}),

		...(createdAtStart || createdAtEnd
			? {
					createdAt: {
						...(createdAtStart && { gte: new Date(createdAtStart) }),
						...(createdAtEnd && { lte: new Date(createdAtEnd) }),
					},
				}
			: {}),
	}

	try {
		const [rows, total] = await Promise.all([
			prisma.contrato.findMany({
				where: whereClause,
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: [{ exercicio: 'desc' }, { numero: 'desc' }],
				select: {
					id: true,
					numero: true,
					displayContrato: true,
					displayLicitacao: true,
					contratado: true,
					tipoAto: true,
					dataInicio: true,
					dataFim: true,
					idOxy: true,
					empresa: { select: { name: true } },
					licitacao: { select: { numero: true, ano: true, modalidade: true } },
					nomeFiscal: true,
					fiscais: {
						select: {
							fiscalContrato: {
								select: {
									user: {
										select: { id: true, name: true },
									},
								},
							},
						},
					},
					bensEServicosReports: {
						select: { createdAt: true },
						orderBy: { createdAt: 'desc' },
						take: 1,
					},
				},
			}),

			prisma.contrato.count({ where: whereClause }),
		])

		// Buscar últimos relatórios de Transporte e Obras por número do contrato
		const contratoNumeros = rows.map((r) => String(r.numero))

		const [transporteReports, obrasReports] = await Promise.all([
			prisma.transporteReport.findMany({
				where: {
					organizationId,
					contratoNumero: { in: contratoNumeros },
				},
				select: { contratoNumero: true, createdAt: true },
				orderBy: { createdAt: 'desc' },
			}),
			prisma.obrasReport.findMany({
				where: {
					organizationId,
					contratoNumero: { in: contratoNumeros },
				},
				select: { contratoNumero: true, createdAt: true },
				orderBy: { createdAt: 'desc' },
			}),
		])

		// Mapear último relatório por número do contrato
		const lastTransporteByContrato = new Map<string, Date>()
		for (const r of transporteReports) {
			if (!lastTransporteByContrato.has(r.contratoNumero)) {
				lastTransporteByContrato.set(r.contratoNumero, r.createdAt)
			}
		}

		const lastObrasByContrato = new Map<string, Date>()
		for (const r of obrasReports) {
			if (!lastObrasByContrato.has(r.contratoNumero)) {
				lastObrasByContrato.set(r.contratoNumero, r.createdAt)
			}
		}

		const contratos = rows.map((r) => {
			const contratoNumeroStr = String(r.numero)

			// Coletar datas de todos os tipos de relatórios
			const reportDates: Date[] = []
			if (r.bensEServicosReports[0]?.createdAt) {
				reportDates.push(new Date(r.bensEServicosReports[0].createdAt))
			}
			const transporteDate = lastTransporteByContrato.get(contratoNumeroStr)
			if (transporteDate) {
				reportDates.push(new Date(transporteDate))
			}
			const obrasDate = lastObrasByContrato.get(contratoNumeroStr)
			if (obrasDate) {
				reportDates.push(new Date(obrasDate))
			}

			// Encontrar o relatório mais recente entre todos os tipos
			const lastReportDate =
				reportDates.length > 0
					? reportDates.reduce((latest, date) =>
							date > latest ? date : latest,
						)
					: null

			const isOverdue = lastReportDate
				? differenceInDays(new Date(), lastReportDate) > 30
				: false

			return {
				id: r.id,
				numero: r.numero,
				contratado: r.contratado,
				tipoAto: r.tipoAto,
				empresa: r.empresa.name,
				licitacao: r.licitacao.numero,
				licitacaoAno: r.licitacao.ano,
				dataInicio: r.dataInicio,
				dataFim: r.dataFim,
				licitacaoModalidade: r.licitacao.modalidade,
				nomeFiscal: r.nomeFiscal,
				displayLicitacao: r.displayLicitacao,
				displayContrato: r.displayContrato,
				idOxy: r.idOxy,
				fiscais: r.fiscais
					.filter((f) => Boolean(f.fiscalContrato?.user?.id && f.fiscalContrato?.user?.name))
					.map((f) => ({
						id: f.fiscalContrato!.user!.id,
						name: f.fiscalContrato!.user!.name,
					})),
				isOverdue,
			}
		}).sort((a, b) => {
			if (a.isOverdue === b.isOverdue) return 0
			return a.isOverdue ? -1 : 1
		})

		return { contratos, total }
	} catch {
		return { contratos: [], total: 0 }
	}
}
