'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
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
}

export interface EmpresaWithReports {
	empresaId: string
	empresaNome: string
	empresaCnpj: string
	reports: ReportWithDetails[]
}

export interface ReportFilterParams {
	search?: string
}

export async function getReportsByEmpresaFiscal({
	search,
}: ReportFilterParams): Promise<EmpresaWithReports[]> {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return []
	}

	const searchClause = search
		? {
				OR: [
					{ contratada: { contains: search } },
					{ contratoNumero: { contains: search } },
					{ objeto: { contains: search } },
					{ protocolo: { contains: search } },
				],
			}
		: {}

	const baseWhere = {
		organizationId,
		fiscalDoContrato: {
			userId,
		},
		...searchClause,
	}

	try {
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
				contratada: r.contrato?.contratado || r.contratada || 'Não informada',
				objeto: r.objeto || 'Não informado',
				fiscalNome: r.fiscalDoContrato.user?.name ?? r.fiscalDoContrato.nome,
				filePath: `/api/reports/${r.protocolo}.pdf`,
				assinaturaDigital: r.assinaturaDigital,
				periodoInicio: r.periodoAnalisadoInicio,
				periodoFim: r.periodoAnalisadoFim,
				empresaId: empresa?.id ?? `contratada-${r.contratada}`,
				empresaNome: empresa?.name ?? (r.contratada || 'Empresa não encontrada'),
				empresaCnpj: empresa?.cnpj ?? 'N/A',
			}
		}

		const allReports: ReportWithEmpresa[] = [
			...bensReports.map((r) => mapCommonReport(r, 'Bens e Serviços')),
			...transporteReports.map((r) => mapCommonReport(r, 'Transporte')),
			...obrasReports.map((r) => mapCommonReport(r, 'Obras')),
			...terceirizacaoReports.map((r) => mapCommonReport(r, 'Terceirização')),
			...fiscalPrincipalReports.map((r) => mapCommonReport(r, 'Fiscal Tecnico')),
		]

		// Agrupar por empresa
		const empresaMap = new Map<string, EmpresaWithReports>()

		for (const report of allReports) {
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

		// Ordenar relatórios dentro de cada empresa
		for (const empresa of empresaMap.values()) {
			empresa.reports.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
			)
		}

		// Ordenar empresas por quantidade de relatórios (desc) e depois por nome
		const result = Array.from(empresaMap.values()).sort((a, b) => {
			const diff = b.reports.length - a.reports.length
			if (diff !== 0) return diff
			return a.empresaNome.localeCompare(b.empresaNome)
		})

		return result
	} catch (error) {
		console.error('Error fetching reports by empresa:', error)
		return []
	}
}
