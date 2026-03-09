'use server'


import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type UpdateSystemUpdateInput = {
	id: string
	title: string
	description: string
	version?: string
	isActive?: boolean
	targetRoles?: string[]
}

export const updateSystemUpdate = withPermission(
	'update',
	async (ctx, data: UpdateSystemUpdateInput) => {
		try {
			if (!data.title?.trim() || !data.description?.trim()) {
				return { success: false, error: 'Título e descrição são obrigatórios' }
			}

			const targetRoles =
				data.targetRoles && data.targetRoles.length > 0
					? JSON.stringify(data.targetRoles)
					: null

			await prisma.systemUpdate.update({
				where: { id: data.id, organizationId: ctx.organizationId },
				data: {
					title: data.title.trim(),
					description: data.description.trim(),
					version: data.version?.trim() || null,
					isActive: data.isActive ?? true,
					targetRoles,
				},
			})

			revalidatePath('/dashboard-owner/changelog')
			return { success: true, data: false}
		} catch (error) {
			console.error('Erro ao atualizar:', error)
			return { success: false, error: 'Erro ao atualizar' }
		}
	},
	{module: 'changelog'}
)
