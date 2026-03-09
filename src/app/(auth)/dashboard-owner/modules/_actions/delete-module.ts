'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const deleteModule = withPermission(
	'delete',
	async (ctx, key: string) => {
		try {
			await prisma.modulo.delete({
				where: {
					organizationId_key: {
						organizationId: ctx.organizationId,
						key,
					},
				},
			})

			revalidatePath('/dashboard-owner/modules')
			revalidatePath('/dashboard-owner/permissions')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao excluir módulo:', error)
			return { success: false, error: 'Erro ao excluir módulo' }
		}
	},
	{ module: 'owner' },
)
