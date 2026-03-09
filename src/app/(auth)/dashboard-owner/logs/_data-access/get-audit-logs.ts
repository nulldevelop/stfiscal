'use server'

import type { LogAction } from '@/generated/prisma/enums'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export type LogFilters = {
	action?: LogAction
	entity?: string
	page?: number
	pageSize?: number
}

export type AuditLogsResponse = {
	logs: Awaited<ReturnType<typeof prisma.auditLog.findMany>>
	total: number
	page: number
	totalPages: number
}

export const getAuditLogs = withPermission<[LogFilters?], AuditLogsResponse>(
	'read',
	async (ctx, filters = {}) => {
		try {
			const { action, entity, page = 1, pageSize = 20 } = filters
			const skip = (page - 1) * pageSize

			const where = {
				organizationId: ctx.organizationId,
				...(action ? { action } : {}),
				...(entity ? { entity } : {}),
			}

			const [logs, total] = await Promise.all([
				prisma.auditLog.findMany({
					where,
					orderBy: { createdAt: 'desc' },
					skip,
					take: pageSize,
				}),
				prisma.auditLog.count({ where }),
			])

			return {
				success: true,
				data: {
					logs,
					total,
					page,
					totalPages: Math.ceil(total / pageSize),
				},
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Erro ao buscar logs',
			}
		}
	},
	{ module: 'organizacao' },
)

export const getAuditLogEntities = withPermission<[], string[]>(
	'read',
	async (ctx) => {
		try {
			const result = await prisma.auditLog.findMany({
				where: { organizationId: ctx.organizationId },
				select: { entity: true },
				distinct: ['entity'],
				orderBy: { entity: 'asc' },
			})

			return {
				success: true,
				data: result.map((r) => r.entity),
			}
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Erro ao buscar entidades',
			}
		}
	},
	{ module: 'organizacao' }, 
)
