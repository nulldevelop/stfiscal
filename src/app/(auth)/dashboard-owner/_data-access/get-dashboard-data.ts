'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardData() {
	try {
		const [
			organizationsTotal,
			membersTotal,
			contratosTotal,
			fiscaisAtivos,
			recentMembers,
			recentAuditLogs,
		] = await Promise.all([
			prisma.organization.count(),
			prisma.member.count(),
			prisma.contrato.count(),
			prisma.fiscalContrato.count({ where: { status: 'ATIVO' } }),
			prisma.member.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				include: {
					user: {
						select: { id: true, name: true, email: true, image: true },
					},
					organization: { select: { name: true } },
				},
			}),
			prisma.auditLog.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				include: {
					organization: { select: { name: true } },
				},
			}),
		])

		return {
			metrics: {
				organizationsTotal,
				membersTotal,
				contratosTotal,
				fiscaisAtivos,
			},
			recentMembers: recentMembers.map((m) => ({
				id: m.id,
				name: m.user.name,
				email: m.user.email,
				image: m.user.image,
				role: m.role,
				organizationName: m.organization.name,
				createdAt: m.createdAt,
			})),
			recentAuditLogs: recentAuditLogs.map((log) => ({
				id: log.id,
				action: log.action as 'CREATE' | 'UPDATE' | 'DELETE',
				entity: log.entity,
				entityName: log.entityName ?? '-',
				userName: log.userName,
				userEmail: log.userEmail,
				organizationName: log.organization.name,
				createdAt: log.createdAt,
			})),
		}
	} catch (error) {
		console.error(error)
		throw new Error('Falha ao carregar dados do dashboard.')
	}
}
