'use server'

import { differenceInDays } from 'date-fns'
import { withPermission } from '@/lib/permissions/permission'
import type { ActionResponse } from '@/lib/permissions/types'
import { prisma } from '@/lib/prisma'

export interface DashboardAlert {
	id: string
	type: 'warning' | 'info' | 'error' | 'success'
	title: string
	description: string
	createdAt: Date
	link?: string
}

export const getDashboardAlerts = withPermission<[], DashboardAlert[]>(
	'read',
	async (ctx): Promise<ActionResponse<DashboardAlert[]>> => {
		try {
			const alerts: DashboardAlert[] = []

			// 1. Buscar Contratos com Relatórios Atrasados (> 30 dias)
			const contratos = await prisma.contrato.findMany({
				where: { organizationId: ctx.organizationId },
				select: {
					id: true,
					displayContrato: true,
					numero: true,
					tipoAto: true,
					exercicio: true,
					bensEServicosReports: {
						select: { createdAt: true },
						orderBy: { createdAt: 'desc' },
						take: 1,
					},
				},
			})

			// Buscar último TransporteReport e ObrasReport por contratoNumero
			// (essas tabelas não têm FK para Contrato, vinculam por contratoNumero string)
			const [transporteReports, obrasReports] = await Promise.all([
				prisma.transporteReport.findMany({
					where: { organizationId: ctx.organizationId },
					select: { contratoNumero: true, createdAt: true },
					orderBy: { createdAt: 'desc' },
				}),
				prisma.obrasReport.findMany({
					where: { organizationId: ctx.organizationId },
					select: { contratoNumero: true, createdAt: true },
					orderBy: { createdAt: 'desc' },
				}),
			])

			// Indexar o relatório mais recente por contratoNumero
			const lastTransporteByNumero = new Map<string, Date>()
			for (const r of transporteReports) {
				if (!lastTransporteByNumero.has(r.contratoNumero)) {
					lastTransporteByNumero.set(r.contratoNumero, r.createdAt)
				}
			}

			const lastObrasByNumero = new Map<string, Date>()
			for (const r of obrasReports) {
				if (!lastObrasByNumero.has(r.contratoNumero)) {
					lastObrasByNumero.set(r.contratoNumero, r.createdAt)
				}
			}

			for (const contrato of contratos) {
				const contratoNumeroStr = String(contrato.numero)

				// Checar BensEServicos
				const lastBens = contrato.bensEServicosReports[0]
				const daysBens = lastBens
					? differenceInDays(new Date(), lastBens.createdAt)
					: 999

				if (daysBens > 30) {
					alerts.push({
						id: `overdue-bens-${contrato.id}`,
						type: 'error',
						title: 'Relatório de Bens e Serviços Atrasado',
						description: `${contrato.displayContrato}: ${lastBens ? `Último há ${daysBens} dias` : 'Nenhum relatório enviado'}.`,
						createdAt: lastBens?.createdAt ?? new Date(),
						link: `/dashboard-gestor/contratos/${contrato.id}`,
					})
				}

				// Checar Transporte
				const lastTransporteDate = lastTransporteByNumero.get(contratoNumeroStr)
				const daysTransporte = lastTransporteDate
					? differenceInDays(new Date(), lastTransporteDate)
					: null // null = não é contrato de transporte (sem relatório algum)

				if (daysTransporte !== null && daysTransporte > 30) {
					alerts.push({
						id: `overdue-transporte-${contrato.id}`,
						type: 'error',
						title: 'Relatório de Transporte Atrasado',
						description: `${contrato.displayContrato}: Último relatório há ${daysTransporte} dias.`,
						createdAt: lastTransporteDate!,
						link: `/dashboard-gestor/contratos/${contrato.id}`,
					})
				}

				// Checar Obras
				const lastObrasDate = lastObrasByNumero.get(contratoNumeroStr)
				const daysObras = lastObrasDate
					? differenceInDays(new Date(), lastObrasDate)
					: null

				if (daysObras !== null && daysObras > 30) {
					alerts.push({
						id: `overdue-obras-${contrato.id}`,
						type: 'error',
						title: 'Relatório de Obras Atrasado',
						description: `${contrato.displayContrato}: Último relatório há ${daysObras} dias.`,
						createdAt: lastObrasDate!,
						link: `/dashboard-gestor/contratos/${contrato.id}`,
					})
				}
			}

			// 2. Erros de sincronização
			const syncLogs = await prisma.apiSyncLog.findMany({
				where: { organizationId: ctx.organizationId, status: 'error' },
				orderBy: { createdAt: 'desc' },
				take: 3,
			})

			for (const log of syncLogs) {
				alerts.push({
					id: `sync-${log.id}`,
					type: 'warning',
					title: 'Erro na Sincronização',
					description:
						log.message ?? 'Falha ao sincronizar dados com o sistema externo.',
					createdAt: log.createdAt,
				})
			}

			// 3. Logs de exclusão
			const auditLogs = await prisma.auditLog.findMany({
				where: { organizationId: ctx.organizationId, action: 'DELETE' },
				orderBy: { createdAt: 'desc' },
				take: 3,
			})

			for (const log of auditLogs) {
				alerts.push({
					id: `audit-${log.id}`,
					type: 'info',
					title: 'Exclusão de Registro',
					description: `${log.userName} excluiu ${log.entityName ?? log.entity}.`,
					createdAt: log.createdAt,
				})
			}

			alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

			return { success: true, data: alerts.slice(0, 20) }
		} catch (error) {
			console.error('getDashboardAlerts error:', error)
			return { success: false, error: 'Erro ao buscar alertas do dashboard.' }
		}
	},
	'gestor-contratos',
)
