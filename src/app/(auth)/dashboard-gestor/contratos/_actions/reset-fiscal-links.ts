'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { resetAllFiscalLinks } from '@/lib/sync/services/fiscal-service'

export const resetFiscalLinksAction = withPermission(
	'delete',
	async (ctx) => {
		const { organizationId } = ctx

		try {
			await resetAllFiscalLinks(organizationId)

			revalidatePath('/dashboard-gestor/contratos')
			revalidatePath('/dashboard-gestor/fiscais')

			return {
				success: true,
				data: { message: 'Todos os vínculos foram removidos com sucesso.' },
			}
		} catch (error) {
			console.error('Erro ao resetar vínculos de fiscais:', error)
			return {
				success: false,
				error: 'Ocorreu um erro ao tentar resetar os vínculos.',
			}
		}
	},
	{ module: 'gestor-contratos', log: 'RESET_FISCAL_LINKS' },
)
