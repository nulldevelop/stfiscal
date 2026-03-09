'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

export const toggleActiveSystemUpdate = withPermission(
	'update',
	async (ctx, id: string) => {
		try {
			const existing = await prisma.systemUpdate.findUnique({
				where: { id, organizationId: ctx.organizationId },
				select: { isActive: true },
			})

			if (!existing) {
				return { success: false, error: 'Atualização não encontrada' }
			}

			await prisma.systemUpdate.update({
				where: { id, organizationId: ctx.organizationId },
				data: { isActive: !existing.isActive },
			})

			revalidatePath('/dashboard-owner/changelog')
			return { success: true, data: {id} }
		} catch (error) {
			console.error('Erro ao alternar status:', error)
			return { success: false, error: 'Erro ao alternar status' }
		}
	},
	{module: 'changelog'}
)
