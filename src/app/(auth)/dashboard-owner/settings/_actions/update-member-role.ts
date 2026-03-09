'use server'

import { revalidatePath } from 'next/cache'
import { ROLES } from '@/generated/prisma/enums'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const updateMemberRole = withPermission(
	'update',
	async (ctx, { memberId, role }: { memberId: string; role: string }) => {
		try {
			if (!(role && role in ROLES)) {
				return { success: false, error: 'Papel inválido' }
			}

			const roleEnum = ROLES[role as keyof typeof ROLES]

			const existingMember = await prisma.member.findUnique({
				where: { id: memberId },
				include: {
					organization: {
						include: { members: true },
					},
				},
			})

			if (!existingMember || existingMember.organizationId !== ctx.organizationId) {
				return { success: false, error: 'Membro não encontrado nesta organização.' }
			}

			if (existingMember.role === ROLES.OWNER && roleEnum !== ROLES.OWNER) {
				const ownerCount = existingMember.organization.members.filter(
					(m) => m.role === ROLES.OWNER,
				).length

				if (ownerCount <= 1) {
					return { success: false, error: 'Não é possível remover o último OWNER da organização' }
				}
			}

			const updated = await prisma.member.update({
				where: { id: memberId },
				data: { role: { set: roleEnum } },
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: updated }
		} catch (error) {
			console.error('updateMemberRole error:', error)
			return { success: false, error: 'Erro ao atualizar papel do membro' }
		}
	},
	{ module: 'owner' },
)
