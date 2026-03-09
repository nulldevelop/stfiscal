'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

type CreateSystemUpdateInput = {
	title: string
	description: string
	version?: string
	isActive?: boolean
	targetRoles?: string[]
}

export const createSystemUpdate = withPermission(
	'create',
	async (ctx, data: CreateSystemUpdateInput) => {
		try {
			if (!data.title?.trim() || !data.description?.trim()) {
				return { success: false, error: 'Título e descrição são obrigatórios' }
			}

			const targetRoles =
				data.targetRoles && data.targetRoles.length > 0
					? JSON.stringify(data.targetRoles)
					: null

			await prisma.systemUpdate.create({
				data: {
					title: data.title.trim(),
					description: data.description.trim(),
					version: data.version?.trim() || null,
					isActive: data.isActive ?? true,
					targetRoles,
					organizationId: ctx.organizationId,
				},
			})

			revalidatePath('/dashboard-owner/changelog')
			return { success: true, data: { ...data} }
		} catch (error) {
			console.error('Erro ao criar atualização:', error)
			return { success: false, error: 'Erro ao criar atualização' }
		}
	},
	{module: 'changelog'}
)
