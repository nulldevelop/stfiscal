import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getFiscalDetails(id: string) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) throw new Error('Organização não encontrada')

	const fiscal = await prisma.fiscalContrato.findUnique({
		where: { id, organizationId },
		include: {
			user: true,
			contratos: {
				include: {
					contrato: {
						include: {
							empresa: true,
							fiscalPrincipal: {
								include: {
									member: true,
								},
							},
							setoriais: true,
						},
					},
				}
			},
			bensEServicosReports: {
				orderBy: { createdAt: 'desc' },
				take: 10
			},
			notificacoes: {
				orderBy: { createdAt: 'desc' },
				take: 10
			}
		}
	})

	if (!fiscal) return null

	// Buscar vínculos de member para saber se ele é principal ou setorial nos contratos
	const member = fiscal.userId 
		? await prisma.member.findFirst({ 
				where: { userId: fiscal.userId, organizationId } 
			}) 
		: null

	return {
		...fiscal,
		member
	}
}
