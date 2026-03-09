'use server'

import { revalidatePath } from 'next/cache'
import type { PermissionContext } from '@/lib/permissions/types'
import { withPermission } from '@/lib/permissions/with-permission'
import { syncOrganization } from '@/lib/sync/utils'

export const importContratos = withPermission(
	'create',
	async (ctx: PermissionContext) => {
		const result = await syncOrganization(ctx.organizationId)

		if (!result.success) {
			return { success: false as const, error: result.message }
		}

		revalidatePath('/dashboard-gestor/contratos')

		return {
			success: true as const,
			data: {
				criados: result.data?.contratosCreated ?? 0,
				atualizados: result.data?.contratosUpdated ?? 0,
				licitacoesSync: result.data?.licitacoesSync ?? 0,
			},
		}
	},
	{ module: 'gestor-contratos' },
)
