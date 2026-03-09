'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { syncOrganization } from '@/lib/sync/utils'

export async function updateApiConfig(data: {
	apiUrlContratos?: string
	apiUrlLicitacoes?: string
	apiUrlFiscais?: string
	apiUrlAditivos?: string
	autoLinkFiscais?: boolean
	smtpHost?: string
	smtpPort?: number
	smtpUser?: string
	smtpPass?: string
	smtpFrom?: string
	notifyEmail?: string
}) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) return { error: 'Organização não encontrada' }

	try {
		await prisma.organization.update({
			where: { id: organizationId },
			data,
		})

		revalidatePath('/dashboard-owner/settings')
		return { success: true }
	} catch {
		return { error: 'Erro ao salvar configurações' }
	}
}

export async function triggerManualSync() {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) return { error: 'Organização não encontrada' }

	const result = await syncOrganization(organizationId)
	revalidatePath('/dashboard-owner/settings')
	return result
}
