'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export const deleteLotacao = withPermission(
	'delete',
	async (ctx, lotacaoId: string) => {
		try {
			await prisma.lotacoes.delete({
				where: { id: lotacaoId, organizationId: ctx.organizationId },
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: null }
		} catch (error) {
			console.error('deleteLotacao error:', error)
			return { success: false, error: 'Erro ao remover lotação' }
		}
	},
	{ module: 'owner' },
)
