'use server'

import type { Contrato, Empresas } from '@/generated/prisma/client'
import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export type ReportType = 'BENS_E_SERVICOS' | 'TRANSPORTE' | 'OBRAS' | 'TERCEIRIZACAO' | 'FISCAL_PRINCIPAL'

export interface ReportWithMeta {
	id: string
	createdAt: Date
	title: string
	protocolo: string
	filePath: string
	type: ReportType
	contratoNumero: string
	fiscalNome: string | null
}

export interface EmpresaWithReports {
	empresaId: string
	empresaNome: string
	empresaCnpj: string
	reports: ReportWithMeta[]
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
					{ protocolo: { contains: search } },
					{ contratoNumero: { contains: search } },
				],
			}
		: {}

	const baseWhere = {
		organizationId,
		fiscalDoContrato: {
			userId: userId,
		},
		...searchClause,
	}

	try {
		const [bensEServicosReports, transporteReports, obrasReports, terceirizacaoReports, fiscalPrincipalReports] =
			await Promise.all([
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

		// --- Step 2: Combine all reports ---
		const allReports: (ReportWithMeta & {
			empresaId: string
			empresaNome: string
			empresaCnpj: string
		})[] = []

		// Helper to push report with empresa data
		const pushReport = (r: any, type: ReportType, title: string, filePath: string) => {
			let empresaData = {
				empresaId: 'unknown',
				empresaNome: 'Empresa não encontrada',
				empresaCnpj: '00.000.000/0000-00',
			}

			// Try to get empresa from the report's own contract relation
			if (r.contrato?.empresa) {
				empresaData = {
					empresaId: r.contrato.empresa.id,
					empresaNome: r.contrato.empresa.name,
					empresaCnpj: r.contrato.empresa.cnpj,
				}
			} else {
				// Fallback to searching by name in the report itself if contract relation is missing
				empresaData = {
					empresaId: `fallback-${r.contratada}`,
					empresaNome: r.contratada || 'Empresa não informada',
					empresaCnpj: 'N/A',
				}
			}

			allReports.push({
				id: r.id,
				createdAt: r.createdAt,
				title,
				protocolo: r.protocolo,
				filePath,
				type,
				contratoNumero: r.contratoNumero,
				fiscalNome: r.fiscalDoContrato?.user?.name ?? r.fiscalDoContrato?.nome ?? 'N/A',
				...empresaData
			})
		}

		for (const r of bensEServicosReports) {
			pushReport(r, 'BENS_E_SERVICOS', `Relatório de Bens e Serviços #${r.protocolo}`, `/api/reports/${r.protocolo}.pdf`)
		}

		for (const r of transporteReports) {
			pushReport(r, 'TRANSPORTE', `Relatório de Transporte #${r.protocolo}`, `/api/reports/${r.protocolo}.pdf`)
		}

		for (const r of obrasReports) {
			pushReport(r, 'OBRAS', `Relatório de Obras #${r.protocolo}`, `/api/reports/${r.protocolo}.pdf`)
		}

		for (const r of terceirizacaoReports) {
			pushReport(r, 'TERCEIRIZACAO', `Relatório de Terceirização #${r.protocolo}`, `/api/reports/${r.protocolo}.pdf`)
		}

		for (const r of fiscalPrincipalReports) {
			pushReport(r, 'FISCAL_PRINCIPAL', `Relatório Final (Fiscal Tecnico) #${r.protocolo}`, `/api/reports/${r.protocolo}.pdf`)
		}

		// --- Filter by empresa name if search term is provided ---
		let filteredReports = allReports
		if (search && Number.isNaN(Number(search))) {
			filteredReports = allReports.filter((r) =>
				r.empresaNome.toLowerCase().includes(search.toLowerCase()),
			)
		}

		// --- Step 6: Group and Sort ---
		const empresaMap = new Map<string, EmpresaWithReports>()

		for (const report of filteredReports) {
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

		for (const empresa of empresaMap.values()) {
			empresa.reports.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
			)
		}

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
