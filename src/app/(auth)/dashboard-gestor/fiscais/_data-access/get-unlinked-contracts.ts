'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getUnlinkedContracts(fiscalId: string) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) throw new Error('Organização não encontrada')

	// 1. Buscar o ID do registro em FiscalContrato para este fiscal (userId)
	const fiscalRecord = await prisma.fiscalContrato.findFirst({
		where: { userId: fiscalId, organizationId },
		select: { id: true },
	})

	if (!fiscalRecord) return { data: [] }

	// 2. Buscar contratos da organização que NÃO estão vinculados a este fiscal
	const unlinkedContracts = await prisma.contrato.findMany({
		where: {
			organizationId,
			NOT: {
				fiscais: {
					some: {
						fiscalContratoId: fiscalRecord.id
					}
				}
			}
		},
		select: {
			id: true,
			numero: true,
			displayContrato: true,
			contratado: true,
		},
		orderBy: {
			numero: 'asc'
		}
	})


	return { data: unlinkedContracts }
}
