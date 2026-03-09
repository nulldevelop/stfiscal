'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { deleteLicitacao } from '@/lib/sync/services/licitacao-service'
import { withPermission } from '@/lib/permissions/with-permission'

export const deleteLicitacaoAction = withPermission(
	'delete',
	async (ctx, id: string) => {
		const { organizationId } = ctx

		try {
			await deleteLicitacao(id, organizationId)
			revalidatePath('/(private)/dashboard-gestor/licitacoes')
			return { success: true, data: null }
		} catch (err) {
			return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir' }
		}
	},
	{ module: 'gestor-licitacoes', log: 'LICITACAO' }
)
