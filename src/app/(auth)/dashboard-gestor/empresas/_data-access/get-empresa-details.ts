import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getEmpresaDetails(id: string) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) throw new Error('Organização não encontrada')

	const empresa = await prisma.empresas.findUnique({
		where: { id },
		include: {
			Contrato: {
				where: { organizationId },
				include: {
					licitacao: true,
					fiscalPrincipal: {
						include: {
							member: {
								include: {
									user: true
								}
							}
						}
					}
				},
				orderBy: {
					numero: 'desc'
				}
			}
		}
	})

	return empresa
}
