'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getContratosFormData() {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		throw new Error('No active organization')
	}


	const [licitacoes, empresas] = await Promise.all([
		prisma.licitacao.findMany({
			where: { organizationId },
			select: { id: true, numero: true, ano: true, modalidade: true },
			orderBy: [{ ano: 'desc' }, { numero: 'desc' }],
		}),
		prisma.empresas.findMany({
			where: { organizationId },
			select: { id: true, name: true, cnpj: true },
			orderBy: { name: 'asc' },
		}),
	])

	return {
		licitacoes: licitacoes.map((l) => ({
			id: l.id,
			label: `${l.numero}/${l.ano} - ${l.modalidade}`,
		})),
		empresas: empresas.map((e) => ({
			id: e.id,
			label: `${e.name} (${e.cnpj})`,
			name: e.name,
		})),
	}
}
