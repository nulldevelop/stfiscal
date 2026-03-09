import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getLicitacoes() {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		throw new Error('Organização não encontrada.')
	}

	const licitacoes = await prisma.licitacao.findMany({
		where: {
			organizationId,
		},
		select: {
			id: true,
			numero: true,
			entidade: true,
			objeto: true,
			Contratos: {
				select: {
					numero: true,
					contratado: true,
				},
			},
		},
		orderBy: {
			numero: 'asc',
		},
	})

	return licitacoes
}
