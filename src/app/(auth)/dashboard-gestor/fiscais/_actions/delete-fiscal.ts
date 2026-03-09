'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { withPermission } from '@/lib/permissions/with-permission'
import { deleteFiscal } from '@/lib/sync/services/fiscal-service'

const schema = z.object({
	id: z.string().min(1, 'ID do usuário é obrigatório'),
})

export const deleteFiscalAction = withPermission(
	'delete',
	async (ctx, data: z.infer<typeof schema>) => {
		const { organizationId } = ctx

		const parse = schema.safeParse(data)
		if (!parse.success) {
			return { success: false, error: 'Dados inválidos' }
		}

		try {
			await deleteFiscal(parse.data.id, organizationId)
			revalidatePath('/dashboard-gestor/fiscais')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao excluir fiscal:', error)
			return {
				success: false,
				error: 'Ocorreu um erro ao excluir o fiscal.',
			}
		}
	},
	{ module: 'gestor-fiscais', log: 'FISCAL' },
)
