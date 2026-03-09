'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export interface MemberItem {
	id: string
	userId: string
	role:
		| 'OWNER'
		| 'ADMIN'
		| 'SUPORT'
		| 'FISCAL_PRINCIPAL'
		| 'FISCAL_SETORIAL'
		| 'GESTOR_CONTRATOS'
		| 'USER'
	cpf: string | null
	user: {
		id: string
		name: string
		email: string
	}
}

export const getSettingsData = withPermission(
	'read',
	async (ctx) => {
		try {
			const [organization, nonMembers] = await Promise.all([
				prisma.organization.findUnique({
					where: { id: ctx.organizationId },
					include: {
						lotacoes: {
							orderBy: { createdAt: 'desc' },
						},
						members: {
							include: {
								user: {
									select: { id: true, name: true, email: true },
								},
							},
						},
					},
				}),
				prisma.user.findMany({
					where: {
						members: { none: { organizationId: ctx.organizationId } },
					},
					select: { id: true, name: true, email: true },
				}),
			])

			if (!organization) {
				return { success: false, error: 'Organização não encontrada' }
			}

			const members: MemberItem[] = organization.members.map((m) => ({
				id: m.id,
				userId: m.userId,
				role: m.role as MemberItem['role'],
				cpf: m.fiscalCpf,
				user: {
					id: m.user.id,
					name: m.user.name,
					email: m.user.email,
				},
			}))

			return {
				success: true,
				data: {
					id: organization.id,
					name: organization.name,
					slug: organization.slug,
					logo: organization.logo ?? '',
					email: organization.email,
					telefone: organization.telefone ?? '',
					cnpj: organization.cnpj ?? '',
					status: organization.status,
					cidade: organization.cidade ?? '',
					lotacoes: organization.lotacoes,
					members,
					nonMembers,
				},
			}
		} catch (error) {
			console.error('getSettingsData error:', error)
			return { success: false, error: 'Erro ao buscar dados das configurações' }
		}
	},
	{ module: 'owner' },
)
