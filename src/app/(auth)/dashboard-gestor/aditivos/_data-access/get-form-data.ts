'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getAditivosFormData() {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		throw new Error('No active organization')
	}

	const contratos = await prisma.contrato.findMany({
		where: { organizationId },
		select: { id: true, displayContrato: true, contratado: true },
		orderBy: { displayContrato: 'desc' },
	})

	return {
		contratos: contratos.map((c) => ({
			id: c.id,
			label: `${c.displayContrato} - ${c.contratado}`,
		})),
	}
}
