'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserId, getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getContratoDetails(contratoId: string) {
	if (!contratoId) return null

	const userId = await getCurrentUserId()
	const organizationId = await getCurrentOrganizationId()

	if (!userId || !organizationId) return null

	try {
		const contrato = await prisma.contrato.findUnique({
			where: { id: contratoId },
			select: {
				id: true,
				numero: true,
				contratado: true,
				displayContrato: true,
				displayLicitacao: true,
				licitacao: {
					select: {
						objeto: true,
						numero: true,
						ano: true,
					},
				},
			},
		})

		if (!contrato) return null

		// Buscar o Member deste usuário na organização atual
		const member = await prisma.member.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
			select: { id: true },
		})

		let isPrincipalDoContrato = false

		if (member) {
			// Verificar se este member é o fiscal principal deste contrato específico
			const fiscalPrincipalVinculo = await prisma.contratoFiscal.findFirst({
				where: {
					contratoId: contrato.id,
					memberId: member.id,
				},
			})
			isPrincipalDoContrato = !!fiscalPrincipalVinculo
		}

		// Flatten the object for easier use
		return {
			id: contrato.id,
			numero: contrato.numero,
			contratado: contrato.contratado,
			displayContrato: contrato.displayContrato,
			displayLicitacao: contrato.displayLicitacao,
			objeto: contrato.licitacao.objeto,
			licitacaoNumero: contrato.licitacao.numero,
			isPrincipalDoContrato,
		}
	} catch (error) {
		console.error('Error fetching contrato details:', error)
		return null
	}
}
