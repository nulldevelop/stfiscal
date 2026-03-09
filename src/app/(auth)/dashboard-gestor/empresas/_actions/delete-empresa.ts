'use server'
import { revalidatePath } from 'next/cache'
import { deleteEmpresa } from '@/lib/sync/services/empresa-service'
import { withPermission } from '@/lib/permissions/with-permission'

export const deleteEmpresaAction = withPermission(
	'delete',
	async (ctx, id: string) => {
		const { organizationId } = ctx

		try {
			await deleteEmpresa(id, organizationId)

			ctx.log({
				entityId: id,
			})

			revalidatePath('/dashboard-gestor/empresas')
			return { success: true as const, data: null }
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Erro ao excluir',
			}
		}
	},
	{
		module: 'gestor-empresas',
		log: 'EMPRESA',
	},
)
