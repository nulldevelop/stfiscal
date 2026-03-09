'use server'

import { revalidatePath } from 'next/cache'
import { ROLES } from '@/generated/prisma/enums'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const addMember = withPermission(
	'create',
	async (ctx, userId: string, role = 'USER') => {
		try {
			const existing = await prisma.member.findFirst({
				where: { organizationId: ctx.organizationId, userId },
			})
			if (existing) {
				return { success: false, error: 'Usuário já é membro desta organização' }
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { email: true },
			})
			if (!user) {
				return { success: false, error: 'Usuário não encontrado' }
			}

			const newMember = await prisma.member.create({
				data: {
					organizationId: ctx.organizationId,
					userId,
					role: ROLES[role as keyof typeof ROLES] ?? ROLES.USER,
					email: user.email,
					createdAt: new Date(),
				},
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: newMember }
		} catch (error) {
			console.error('addMember error:', error)
			return { success: false, error: 'Erro ao adicionar membro' }
		}
	},
	{ module: 'owner' },
)
