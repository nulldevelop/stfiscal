import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getLicitacaoDetails(id: string) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) throw new Error('Organização não encontrada')

	const licitacao = await prisma.licitacao.findUnique({
		where: { id, organizationId },
		include: {
			Contratos: {
				include: {
					empresa: true,
					fiscalPrincipal: {
						include: {
							member: {
								include: {
									user: true
								}
							}
						}
					}
				}
			},
			bensEServicosReports: {
				orderBy: { createdAt: 'desc' },
				take: 10,
				include: {
					fiscalDoContrato: true
				}
			}
		}
	})

	return licitacao
}
