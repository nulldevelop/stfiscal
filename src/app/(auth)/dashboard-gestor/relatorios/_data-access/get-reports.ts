/** biome-ignore-all lint/correctness/noUnusedVariables: dev */
'use server'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import {
	calculateOverdueStatus,
	getConfigKeyForReportType,
	getOverdueConfigsForOrg,
	type OverdueInfo,
} from '@/lib/overdue-utils'
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
		// Busca configurações de overdue
		const overdueConfigs = await getOverdueConfigsForOrg(organizationId)

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

		// Função para calcular overdue de um relatório
		const getOverdueInfo = (
			reportType: string,
			periodoAnalisadoFim: Date,
		): OverdueInfo => {
			const configKey = getConfigKeyForReportType(reportType)
			const config = overdueConfigs[configKey] || {
				diasOverdue: 30,
				diasAlerta: 7,
			}
			return calculateOverdueStatus(reportType, periodoAnalisadoFim, config)
		}

		// Normalize and combine
		const allReports = [
			...bensReports.map((r) => {
				const contrato = r.contrato
				const numeroValue = contrato?.numero ?? parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				const reportType = 'Bens e Servicos' as const
				return {
					type: reportType,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					dataInicio: contrato?.dataInicio || null,
					dataFim: contrato?.dataFim || null,
					contratoTipoAto: contrato?.tipoAto,
					contratado: contrato?.contratado || r.contratada,
					filePath: `/api/reports/${r.protocolo}.pdf`,
					overdueInfo: getOverdueInfo(reportType, r.periodoAnalisadoFim),
					...restOfR,
				}
			}),
			...transporteReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				const reportType = 'Transporte' as const
				return {
					type: reportType,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Nao informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					overdueInfo: getOverdueInfo(reportType, r.periodoAnalisadoFim),
					...restOfR,
				}
			}),
			...obrasReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				const reportType = 'Obras' as const
				return {
					type: reportType,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Nao informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					overdueInfo: getOverdueInfo(reportType, r.periodoAnalisadoFim),
					...restOfR,
				}
			}),
			...terceirizacaoReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				const reportType = 'Terceirizacao' as const
				return {
					type: reportType,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Nao informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					overdueInfo: getOverdueInfo(reportType, r.periodoAnalisadoFim),
					...restOfR,
				}
			}),
			...fiscalPrincipalReports.map((r) => {
				const numeroValue = parseInt(r.contratoNumero, 10)
				const { contratoNumero, ...restOfR } = r
				const reportType = 'Fiscal Tecnico' as const
				return {
					type: reportType,
					user: r.fiscalDoContrato.user,
					contratoNumero: Number.isNaN(numeroValue) ? 0 : numeroValue,
					contratado: r.contratada || 'Nao informado',
					filePath: `/api/reports/${r.protocolo}.pdf`,
					overdueInfo: getOverdueInfo(reportType, r.periodoAnalisadoFim),
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
