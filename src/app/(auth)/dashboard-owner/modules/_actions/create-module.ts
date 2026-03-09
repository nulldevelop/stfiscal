'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'
import { type CreateModuleInput, createModuleSchema } from '../_types/schemas'

export const createModule = withPermission(
	'create',
	async (ctx, data: CreateModuleInput) => {
		try {
			const validated = createModuleSchema.safeParse(data)
			if (!validated.success) {
				return { success: false, error: 'Dados inválidos' }
			}

			const existing = await prisma.modulo.findFirst({
				where: {
					key: validated.data.key,
					organizationId: ctx.organizationId,
				},
			})

			if (existing) {
				return { success: false, error: 'Já existe um módulo com esta chave' }
			}

			// Primeiro criamos o módulo
			const modulo = await prisma.modulo.create({
				data: {
					key: validated.data.key,
					name: validated.data.key,
					organizationId: ctx.organizationId,
				},
			})

			// Depois criamos as permissões para todos os membros
			const members = await prisma.member.findMany({
				where: { organizationId: ctx.organizationId },
				select: { id: true },
			})

			await prisma.memberPermission.createMany({
				data: members.map((m) => ({
					memberId: m.id,
					moduloId: modulo.id,
					organizationId: ctx.organizationId,
					canCreate: false,
					canRead: true,
					canUpdate: false,
					canDelete: false,
				})),
				skipDuplicates: true,
			})

			revalidatePath('/dashboard-owner/modules')
			revalidatePath('/dashboard-owner/permissions')
			return { success: true, data: modulo }
		} catch (error) {
			console.error('Erro ao criar módulo:', error)
			return { success: false, error: 'Erro ao criar módulo' }
		}
	},
	{ module: 'owner' },
)
