'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'
import { type UpdateModuleInput, updateModuleSchema } from '../_types/schemas'

export const updateModule = withPermission(
	'update',
	async (ctx, data: UpdateModuleInput) => {
		try {
			const validated = updateModuleSchema.safeParse(data)
			if (!validated.success) {
				return { success: false, error: 'Dados inválidos' }
			}

			const { oldKey, newKey } = validated.data

			if (oldKey === newKey) {
				return { success: true, data: null }
			}

			const existing = await prisma.modulo.findFirst({
				where: {
					key: newKey,
					organizationId: ctx.organizationId,
				},
			})

			if (existing) {
				return { success: false, error: 'Já existe um módulo com esta chave' }
			}

			await prisma.modulo.update({
				where: {
					organizationId_key: {
						organizationId: ctx.organizationId,
						key: oldKey,
					},
				},
				data: {
					key: newKey,
					name: newKey,
				},
			})

			revalidatePath('/dashboard-owner/modules')
			revalidatePath('/dashboard-owner/permissions')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao atualizar módulo:', error)
			return { success: false, error: 'Erro ao atualizar módulo' }
		}
	},
	{ module: 'owner' },
)
