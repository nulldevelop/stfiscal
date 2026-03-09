'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getLatestSystemUpdate(role: string) {
	try {
		const organizationId = await getCurrentOrganizationId()
		if (!organizationId) return null

		const updates = await prisma.systemUpdate.findMany({
			where: { organizationId, isActive: true },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				description: true,
				version: true,
				targetRoles: true,
				createdAt: true,
			},
		})

		for (const update of updates) {
			if (!update.targetRoles) return update

			let roles: string[] = []
			try {
				roles = JSON.parse(update.targetRoles)
			} catch {
				return update
			}

			if (roles.length === 0 || roles.includes(role)) return update
		}

		return null
	} catch (error) {
		console.error('Erro ao buscar atualização:', error)
		return null
	}
}
