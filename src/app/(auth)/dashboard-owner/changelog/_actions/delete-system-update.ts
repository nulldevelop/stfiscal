'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

export const deleteSystemUpdate = withPermission(
	'delete',
	async (ctx, id: string) => {
		try {
			await prisma.systemUpdate.delete({
				where: { id, organizationId: ctx.organizationId },
			})

			revalidatePath('/dashboard-owner/changelog')
			return { success: true, data: { id } }
		} catch (error) {
			console.error('Erro ao excluir atualização:', error)
			return { success: false, error: 'Erro ao excluir atualização' }
		}
	},
	{module: 'changelog'}
)
