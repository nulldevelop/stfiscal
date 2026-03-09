'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const removeMember = withPermission(
	'delete',
	async (ctx, memberId: string) => {
		try {
			const memberToDelete = await prisma.member.findUnique({
				where: { id: memberId },
				select: { organizationId: true },
			})

			if (!memberToDelete || memberToDelete.organizationId !== ctx.organizationId) {
				return { success: false, error: 'Membro não encontrado para remoção nesta organização.' }
			}

			await prisma.member.deleteMany({
				where: { id: memberId },
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: null }
		} catch (error) {
			console.error('removeMember error:', error)
			return { success: false, error: 'Erro ao remover membro' }
		}
	},
	{ module: 'owner' },
)
