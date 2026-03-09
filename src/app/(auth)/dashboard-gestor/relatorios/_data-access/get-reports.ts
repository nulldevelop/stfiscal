/** biome-ignore-all lint/correctness/noUnusedVariables: dev */
'use server'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface ReportFilterParams {
	search?: string
}

export async function getReports({ search }: ReportFilterParams) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return []
	}

	const searchNumber = search ? parseInt(search, 10) : NaN
	const isSearchNumber = !Number.isNaN(searchNumber)

	const searchClause = search
		? {
				OR: [
					{ contratada: { contains: search } },
					...(isSearchNumber
						? [{ contratoNumero: { equals: String(searchNumber) } }]
						: [{ contratoNumero: { contains: search } }]),
					{ objeto: { contains: search } },
					{ protocolo: { contains: search } },
					{ fiscalDoContrato: { nome: { contains: search } } },
				],
			}
		: {}

	// Common where clause for all report types
	const baseWhere = {
		organizationId,
		...searchClause,
	}

	try {
		const [
			bensReports,
			transporteReports,
			obrasReports,
			terceirizacaoReports,
			fiscalPrincipalReports
		] = await Promise.all([
			prisma.bensEServicosReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
			prisma.transporteReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
			prisma.obrasReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
			prisma.terceirizacaoReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
			prisma.fiscalPrincipalReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
				},
			}),
		])

		// Normalize and combine
		const allReports = [
			...bensReports.map((r) => {
				const contrato = r.contrato
				const numeroValue = contrato?.numero ?? parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				return {
					type: 'Bens e Serviços' as const,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					dataInicio: contrato?.dataInicio || null,
					dataFim: contrato?.dataFim || null,
					contratoTipoAto: contrato?.tipoAto,
					contratado: contrato?.contratado || r.contratada,
					filePath: `/api/reports/${r.protocolo}.pdf`,
					...restOfR,
				}
			}),
			...transporteReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				return {
					type: 'Transporte' as const,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Não informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					...restOfR,
				}
			}),
			...obrasReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				return {
					type: 'Obras' as const,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Não informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					...restOfR,
				}
			}),
			...terceirizacaoReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				return {
					type: 'Terceirização' as const,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Não informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					...restOfR,
				}
			}),
			...fiscalPrincipalReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				return {
					type: 'Fiscal Tecnico' as const,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Não informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					...restOfR,
				}
			}),
		]

		allReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

		return allReports
	} catch (error) {
		console.error('Error fetching reports:', error)
		return []
	}
}
