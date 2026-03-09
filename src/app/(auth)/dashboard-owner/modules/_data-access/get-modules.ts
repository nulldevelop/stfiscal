'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const getModules = withPermission(
	'read',
	async (ctx) => {
		try {
			const modules = await prisma.modulo.findMany({
				where: { organizationId: ctx.organizationId },
				include: {
					_count: { select: { permissions: true } },
				},
				orderBy: { key: 'asc' },
			})

			return {
				success: true,
				data: modules.map((m) => ({
					key: m.key,
					name: m.name,
					memberCount: m._count.permissions,
				})),
			}
		} catch (error) {
			console.error('Erro ao buscar módulos:', error)
			return { success: false, error: 'Erro ao buscar módulos' }
		}
	},
	{ module: 'owner' },
)
