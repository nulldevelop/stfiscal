'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getApiConfig() {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) return null

	return prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			apiUrlContratos: true,
			apiUrlLicitacoes: true,
			apiUrlFiscais: true,
			apiUrlAditivos: true,
			autoLinkFiscais: true,
			smtpHost: true,
			smtpPort: true,
			smtpUser: true,
			smtpFrom: true,
			notifyEmail: true,
			lastSyncAt: true,
			lastSyncStatus: true,
			lastSyncMessage: true,
		},
	})
}

export async function getApiSyncLogs(limit = 10) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) return []

	return prisma.apiSyncLog.findMany({
		where: { organizationId },
		orderBy: { createdAt: 'desc' },
		take: limit,
	})
}
