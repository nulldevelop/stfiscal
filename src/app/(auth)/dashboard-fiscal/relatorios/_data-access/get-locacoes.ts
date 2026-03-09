'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getLotacoes() {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		return []
	}

	return prisma.lotacoes.findMany({
		where: { organizationId },
		orderBy: { name: 'asc' },
	})
}
