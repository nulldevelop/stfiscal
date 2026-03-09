'use server'

import { revalidatePath } from 'next/cache'
import type { OrganizationStatus } from '@/generated/prisma/enums'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'
import { extractCnpj } from '@/utils/formatCNPJ'
import { extractPhoneNumber } from '@/utils/formatPhone'

export interface UpdateOrganizationInput {
	name: string
	email: string
	telefone: string
	cnpj: string
	slug: string
	logo: string | null
	status: OrganizationStatus
	cidade?: string
}

export const updateOrganization = withPermission(
	'update',
	async (ctx, data: UpdateOrganizationInput) => {
		try {
			// Normaliza dados antes de salvar no banco
			const normalizedData = {
				...data,
				cnpj: extractCnpj(data.cnpj),
				telefone: extractPhoneNumber(data.telefone),
			}

			const updated = await prisma.organization.update({
				where: { id: ctx.organizationId },
				data: normalizedData,
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: updated }
		} catch (error) {
			console.error('updateOrganization error:', error)
			return { success: false, error: 'Erro ao atualizar dados da organização' }
		}
	},
	{ module: 'owner' },
)
