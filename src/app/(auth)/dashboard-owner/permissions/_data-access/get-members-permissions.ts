'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const getMembersWithPermissions = withPermission(
	'read',
	async (ctx) => {
		try {
			const members = await prisma.member.findMany({
				where: { organizationId: ctx.organizationId },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					permissions: {
						include: { modulo: true },
					},
				},
				orderBy: { createdAt: 'desc' },
			})

			return { success: true, data: members }
		} catch (error) {
			console.error('Erro ao buscar membros:', error)
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Erro ao buscar membros',
			}
		}
	},
	{ module: 'owner' },
)
