'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import {
	calculateOverdueStatus,
	getConfigKeyForReportType,
	getOverdueConfigsForOrg,
	type OverdueInfo,
} from '@/lib/overdue-utils'
import { prisma } from '@/lib/prisma'

export type ReportType =
	| 'Bens e Serviços'
	| 'Transporte'
	| 'Obras'
	| 'Terceirização'
	| 'Fiscal Tecnico'

export interface ReportWithDetails {
	id: string
	createdAt: Date
	type: ReportType
	protocolo: string
	contratoNumero: number | string
	contratada: string
	objeto: string
	fiscalNome: string | null
	filePath: string
	assinaturaDigital: string
	periodoInicio: Date
	periodoFim: Date
	overdueInfo?: OverdueInfo
}

export interface EmpresaWithReports {
	empresaId: string
	empresaNome: string
	empresaCnpj: string
	reports: ReportWithDetails[]
}

export interface ReportsResponse {
	groupedByEmpresa: EmpresaWithReports[]
	allReports: (ReportWithDetails & { empresaNome: string })[]
	stats: {
		total: number
		bensEServicos: number
		transporte: number
		obras: number
		terceirizacao: number
		fiscalPrincipal: number
	}
}

export interface ReportFilterParams {
	search?: string
	startDate?: string
	endDate?: string
}

export async function getReportsData({
	search,
	startDate,
	endDate,
}: ReportFilterParams): Promise<ReportsResponse> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return {
			groupedByEmpresa: [],
			allReports: [],
			stats: {
				total: 0,
				bensEServicos: 0,
				transporte: 0,
				obras: 0,
				terceirizacao: 0,
				fiscalPrincipal: 0,
			},
		}
	}

	const searchNumber = search ? Number.parseInt(search, 10) : Number.NaN
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

	const dateClause =
		startDate || endDate
			? {
					createdAt: {
						...(startDate && { gte: new Date(startDate) }),
						...(endDate && { lte: new Date(endDate) }),
					},
				}
			: {}

	const baseWhere = {
		organizationId,
		...searchClause,
		...dateClause,
	}

	try {
		// Busca configurações de overdue
		const overdueConfigs = await getOverdueConfigsForOrg(organizationId)

		const [
			bensReports,
			transporteReports,
			obrasReports,
			terceirizacaoReports,
			fiscalPrincipalReports,
		] = await Promise.all([
			prisma.bensEServicosReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: { include: { empresa: true } },
				},
			}),
			prisma.transporteReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: { include: { empresa: true } },
				},
			}),
			prisma.obrasReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: { include: { empresa: true } },
				},
			}),
			prisma.terceirizacaoReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: { include: { empresa: true } },
				},
			}),
			prisma.fiscalPrincipalReport.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: { include: { empresa: true } },
				},
			}),
		])

		// Função para calcular overdue de um relatório
		const getOverdueInfo = (
			reportType: ReportType,
			periodoAnalisadoFim: Date,
		): OverdueInfo => {
			const configKey = getConfigKeyForReportType(reportType)
			const config = overdueConfigs[configKey] || {
				diasOverdue: 30,
				diasAlerta: 7,
			}
			return calculateOverdueStatus(reportType, periodoAnalisadoFim, config)
		}

		// Mapear relatórios com informações da empresa
		type ReportWithEmpresa = ReportWithDetails & {
			empresaId: string
			empresaNome: string
			empresaCnpj: string
		}

		const mapCommonReport = (r: any, type: ReportType): ReportWithEmpresa => {
			const empresa = r.contrato?.empresa
			const contratoNumero =
				r.contrato?.displayContrato || r.contratoNumero || 'N/A'

			return {
				id: r.id,
				createdAt: r.createdAt,
				type: type,
				protocolo: r.protocolo,
				contratoNumero: contratoNumero,
				contratada: r.contrato?.contratado || r.contratada || 'Nao informada',
				objeto: r.objeto || 'Nao informado',
				fiscalNome: r.fiscalDoContrato.user?.name ?? r.fiscalDoContrato.nome,
				filePath: `/api/reports/${r.protocolo}.pdf`,
				assinaturaDigital: r.assinaturaDigital,
				periodoInicio: r.periodoAnalisadoInicio,
				periodoFim: r.periodoAnalisadoFim,
				overdueInfo: getOverdueInfo(type, r.periodoAnalisadoFim),
				empresaId: empresa?.id ?? `contratada-${r.contratada}`,
				empresaNome:
					empresa?.name ?? (r.contratada || 'Empresa nao encontrada'),
				empresaCnpj: empresa?.cnpj ?? 'N/A',
			}
		}

		const allReportsWithEmpresa: ReportWithEmpresa[] = [
			...bensReports.map((r) => mapCommonReport(r, 'Bens e Serviços')),
			...transporteReports.map((r) => mapCommonReport(r, 'Transporte')),
			...obrasReports.map((r) => mapCommonReport(r, 'Obras')),
			...terceirizacaoReports.map((r) => mapCommonReport(r, 'Terceirização')),
			...fiscalPrincipalReports.map((r) =>
				mapCommonReport(r, 'Fiscal Tecnico'),
			),
		].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

		// Agrupar por empresa
		const empresaMap = new Map<string, EmpresaWithReports>()

		for (const report of allReportsWithEmpresa) {
			const { empresaId, empresaNome, empresaCnpj, ...reportData } = report

			if (!empresaMap.has(empresaId)) {
				empresaMap.set(empresaId, {
					empresaId,
					empresaNome,
					empresaCnpj,
					reports: [],
				})
			}

			empresaMap.get(empresaId)?.reports.push(reportData)
		}

		// Ordenar empresas por quantidade de relatórios (desc) e depois por nome
		const groupedByEmpresa = Array.from(empresaMap.values()).sort((a, b) => {
			const diff = b.reports.length - a.reports.length
			if (diff !== 0) return diff
			return a.empresaNome.localeCompare(b.empresaNome)
		})

		return {
			groupedByEmpresa,
			allReports: allReportsWithEmpresa.map(
				({ empresaId, empresaCnpj, ...r }) => r,
			),
			stats: {
				total: allReportsWithEmpresa.length,
				bensEServicos: bensReports.length,
				transporte: transporteReports.length,
				obras: obrasReports.length,
				terceirizacao: terceirizacaoReports.length,
				fiscalPrincipal: fiscalPrincipalReports.length,
			},
		}
	} catch (error) {
		console.error('Error fetching reports data:', error)
		return {
			groupedByEmpresa: [],
			allReports: [],
			stats: {
				total: 0,
				bensEServicos: 0,
				transporte: 0,
				obras: 0,
				terceirizacao: 0,
				fiscalPrincipal: 0,
			},
		}
	}
}
