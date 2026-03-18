'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface FiscalInfo {
	id: string
	nome: string
	portaria: string | null
	cpf: string | null
	matricula: string | null
	contato: string | null
	isIncomplete: boolean
}

export async function getFiscalInfo(): Promise<FiscalInfo | null> {
	const userId = await getCurrentUserId()
	const organizationId = await getCurrentOrganizationId()

	if (!userId || !organizationId) {
		return null
	}

	const fiscalContrato = await prisma.fiscalContrato.findFirst({
		where: {
			userId,
			organizationId,
		},
		select: {
			id: true,
			nome: true,
			portaria: true,
			cpf: true,
			matricula: true,
			contato: true,
		},
	})

	if (!fiscalContrato) {
		return null
	}

	const isIncomplete =
		!fiscalContrato.cpf ||
		fiscalContrato.cpf.trim() === '' ||
		!fiscalContrato.matricula ||
		fiscalContrato.matricula.trim() === '' ||
		!fiscalContrato.contato ||
		fiscalContrato.contato.trim() === '' ||
		!fiscalContrato.portaria ||
		fiscalContrato.portaria.trim() === ''

	return {
		id: fiscalContrato.id,
		nome: fiscalContrato.nome,
		portaria: fiscalContrato.portaria,
		cpf: fiscalContrato.cpf,
		matricula: fiscalContrato.matricula,
		contato: fiscalContrato.contato,
		isIncomplete,
	}
}
