'use server'

import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export type Role =
	| 'OWNER'
	| 'ADMIN'
	| 'SUPORT'
	| 'FISCAL_PRINCIPAL'
	| 'FISCAL_SETORIAL'
	| 'GESTOR_CONTRATOS'
	| 'USER'

export interface MemberItem {
	id: string
	userId: string
	role: Role
	cpf: string | null
	user: {
		id: string
		name: string
		email: string
	}
}

export const getOrganizationById = withPermission(
	'read',
	async (ctx) => {
		try {
			const org = await prisma.organization.findUnique({
				where: { id: ctx.organizationId },
				include: {
					members: {
						include: {
							user: {
								select: { id: true, name: true, email: true },
							},
						},
					},
				},
			})

			if (!org) {
				return { success: false, error: 'Organização não encontrada' }
			}

			return {
				success: true,
				data: {
					id: org.id,
					name: org.name,
					slug: org.slug,
					logo: org.logo ?? '',
					email: org.email,
					telefone: org.telefone ?? '',
					cnpj: org.cnpj ?? '',
					status: org.status as 'ACTIVE' | 'INACTIVE',
					createdAt: org.createdAt,
					members: org.members.map((member) => ({
						id: member.id,
						userId: member.userId,
						role: member.role as Role,
						fiscalCpf: member.fiscalCpf,
						user: {
							id: member.user.id,
							name: member.user.name,
							email: member.user.email,
						},
					})),
				},
			}
		} catch (error) {
			console.error('getOrganizationById error:', error)
			return { success: false, error: 'Erro ao buscar organização' }
		}
	},
	{ module: 'owner' },
)
