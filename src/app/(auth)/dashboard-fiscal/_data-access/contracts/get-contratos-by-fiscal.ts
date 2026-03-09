'use server'

import { getSession } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function getContratosByFiscal() {
	const session = await getSession()
	if (!session) {
		throw new Error('Usuário não autenticado.')
	}

	const fiscalRecord = await prisma.fiscalContrato.findFirst({
		where: { userId: session.user.id },
		select: {
			contratos: {
				where: { ativo: true },
				select: {
					contrato: {
						include: {
							licitacao: true,
							bensEServicosReports: true,
						},
					},
				},
			},
		},
	})

	const contratos = (fiscalRecord?.contratos ?? []).map((l) => l.contrato)

	return contratos
}
