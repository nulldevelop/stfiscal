'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const getLotacoes = withPermission(
	'read',
	async (ctx) => {
		try {
			const lotacoes = await prisma.lotacoes.findMany({
				where: { organizationId: ctx.organizationId },
				orderBy: { createdAt: 'desc' },
			})

			return { success: true, data: lotacoes }
		} catch (error) {
			console.error('getLotacoes error:', error)
			return { success: false, error: 'Erro ao buscar lotações' }
		}
	},
	{ module: 'owner' },
)
