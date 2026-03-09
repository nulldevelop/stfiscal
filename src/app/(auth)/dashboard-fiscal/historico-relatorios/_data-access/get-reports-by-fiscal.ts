/** biome-ignore-all lint/suspicious/noExplicitAny: dev */
'use server'
import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

interface GetReportsByFiscalParams {
	page?: number
	pageSize?: number
	search?: string
}
type ReportData = {
	id: string
	createdAt: Date
	type: string
	protocolo: string
	contratoNumero: string
	user: { name: string | null } | null
	filePath: string
	[key: string]: any
}

export async function getReportsByFiscal({
	page = 1,
	pageSize = 10,
	search = '',
}: GetReportsByFiscalParams) {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return { reports: [], total: 0 }
	}

	const commonWhere = {
		organizationId,
		fiscalDoContrato: {
			userId: userId,
		},
	}

	const offset = (page - 1) * pageSize

	const searchConditions = (search: string) =>
		search
			? {
					OR: [
						{ contratada: { contains: search } },
						{ contratoNumero: { contains: search } },
						{ objeto: { contains: search } },
						{ protocolo: { contains: search } },
					],
				}
			: {}

	const bensEServicosSearchConditions = searchConditions(search)
	const transporteSearchConditions = searchConditions(search)
	const obrasSearchConditions = search
		? {
				OR: [
					{ contratada: { contains: search } },
					{ contratoNumero: { contains: search } },
					{ objeto: { contains: search } },
				],
			}
		: {}

	try {
		const [totalBens, totalTransporte, totalObras] = await Promise.all([
			prisma.bensEServicosReport.count({
				where: { ...commonWhere, ...bensEServicosSearchConditions },
			}),
			prisma.transporteReport.count({
				where: { ...commonWhere, ...transporteSearchConditions },
			}),
			prisma.obrasReport.count({
				where: { ...commonWhere, ...obrasSearchConditions },
			}),
		])

		const total = totalBens + totalTransporte + totalObras

		if (total === 0) {
			return { reports: [], total: 0 }
		}
		const LIMIT_FETCH = offset + pageSize

		const [bensReports, transporteReports, obrasReports] = await Promise.all([
			prisma.bensEServicosReport.findMany({
				where: { ...commonWhere, ...bensEServicosSearchConditions },
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
			prisma.transporteReport.findMany({
				where: { ...commonWhere, ...transporteSearchConditions },
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
			prisma.obrasReport.findMany({
				where: { ...commonWhere, ...obrasSearchConditions },
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
		])
		const allReports: ReportData[] = [
			...bensReports.map((r) => ({
				...r,
				type: 'Bens e Serviços',
				user: r.fiscalDoContrato.user,
				filePath: `/api/reports/${r.protocolo}.pdf`,
				contratoNumero: r.contratoNumero,
				protocolo: r.protocolo,
			})),
			...transporteReports.map((r) => ({
				...r,
				type: 'Transporte',
				user: r.fiscalDoContrato.user,
				filePath: `/api/reports/${r.protocolo}.pdf`,
				contratoNumero: r.contratoNumero,
				protocolo: r.protocolo,
			})),
			...obrasReports.map((r) => ({
				...r,
				type: 'Obras',
				user: r.fiscalDoContrato.user,
				filePath: `/api/reports/${r.protocolo}.pdf`,
				contratoNumero: r.contratoNumero,
				protocolo: r.protocolo, // Ajuste caso obrasReport não tenha protocolo
			})),
		]

		// Ordenação (em memória) por data de criação (mais recente primeiro)
		allReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

		// Paginação (em memória)
		const paginatedReports = allReports.slice(offset, offset + pageSize)

		return { reports: paginatedReports, total }
	} catch (error) {
		console.error('Error fetching reports by fiscal:', error)
		return { reports: [], total: 0 }
	}
}
