'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { deleteFiscalLink } from '@/lib/sync/services/fiscal-service'

/**
 * Vincula um contrato ao fiscal
 */
export const linkContractToFiscalAction = withPermission(
	'update',
	async (ctx, fiscalId: string, contratoId: string) => {
		const { organizationId } = ctx

		try {
			const fiscalRecord = await prisma.fiscalContrato.findFirst({
				where: { userId: fiscalId, organizationId },
				select: { id: true },
			})

			if (!fiscalRecord)
				return { success: false, error: 'Registro fiscal não encontrado' }

			const link = await prisma.fiscalContratoLink.upsert({
				where: {
					fiscalContratoId_contratoId: {
						fiscalContratoId: fiscalRecord.id,
						contratoId,
					},
				},
				create: {
					fiscalContratoId: fiscalRecord.id,
					contratoId,
					dtinicio: new Date().toISOString(),
					ativo: true,
				},
				update: {
					ativo: true,
				},
			})

			ctx.log({
				entityId: link.id,
				description: `Contrato ${contratoId} vinculado ao fiscal ${fiscalId}`,
			})

			revalidatePath(`/dashboard-gestor/fiscais/${fiscalId}`)
			return { success: true, data: link }
		} catch (error) {
			console.error('Erro ao vincular contrato:', error)
			return { success: false, error: 'Erro ao vincular contrato' }
		}
	},
	{
		module: 'gestor-fiscais',
		log: 'FISCAL_LINKS',
	},
)

/**
 * Desvincula um contrato do fiscal (deleta o link)
 */
export const unlinkContractFromFiscalAction = withPermission(
	'update',
	async (ctx, linkId: string, fiscalId: string) => {
		try {
			await deleteFiscalLink(linkId)

			ctx.log({
				entityId: linkId,
				description: `Contrato desvinculado do fiscal ${fiscalId}`,
			})

			revalidatePath(`/dashboard-gestor/fiscais/${fiscalId}`)
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao desvincular contrato:', error)
			return { success: false, error: 'Erro ao desvincular contrato' }
		}
	},
	{
		module: 'gestor-fiscais',
		log: 'FISCAL_LINKS',
	},
)
