'use server'


import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const getSystemUpdates = withPermission('read', async (ctx) => {
	try {
		const updates = await prisma.systemUpdate.findMany({
			where: { organizationId: ctx.organizationId },
			orderBy: { createdAt: 'desc' },
		})

		return { success: true, data: updates }
	} catch (error) {
		console.error('Erro ao buscar atualizações:', error)
		return { success: false, error: 'Erro ao buscar atualizações' }
	}
}, {module: 'changelog'})
