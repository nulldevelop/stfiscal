'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

export type ModulePermission = {
	module: string
	canCreate: boolean
	canRead: boolean
	canUpdate: boolean
	canDelete: boolean
}

export const updateMemberPermissions = withPermission(
	'update',
	async (ctx, memberId: string, permissions: ModulePermission[]) => {
		try {
			const member = await prisma.member.findUnique({
				where: { id: memberId },
				include: { user: { select: { name: true } } },
			})

			if (!member || member.organizationId !== ctx.organizationId) {
				return { success: false, error: 'Membro não encontrado' } as const
			}

			// Não permite alterar permissões de OWNER
			if (member.role === 'OWNER') {
				return {
					success: false,
					error: 'Não é possível alterar permissões do OWNER',
				} as const
			}

			// Snapshot das permissões antes da alteração
			const before = await prisma.memberPermission.findMany({
				where: { memberId },
				select: {
					modulo: { select: { key: true } },
					canCreate: true,
					canRead: true,
					canUpdate: true,
					canDelete: true,
				},
			})

			// Atualiza ou cria permissões para cada módulo
			for (const perm of permissions) {
				const modulo = await prisma.modulo.findUnique({
					where: {
						organizationId_key: {
							organizationId: ctx.organizationId,
							key: perm.module,
						},
					},
					select: { id: true },
				})

				if (!modulo) continue

				await prisma.memberPermission.upsert({
					where: {
						memberId_moduloId: {
							memberId,
							moduloId: modulo.id,
						},
					},
					update: {
						canCreate: perm.canCreate,
						canRead: perm.canRead,
						canUpdate: perm.canUpdate,
						canDelete: perm.canDelete,
					},
					create: {
						memberId,
						organizationId: ctx.organizationId,
						moduloId: modulo.id,
						canCreate: perm.canCreate,
						canRead: perm.canRead,
						canUpdate: perm.canUpdate,
						canDelete: perm.canDelete,
					},
				})
			}

			ctx.log({
				entityId: memberId,
				entityName: member.user.name,
				before: { permissions: before },
				after: { permissions },
			})

			revalidatePath('/dashboard-owner/permissions')

			return { success: true, data: null } as const
		} catch (error) {
			console.error('Erro ao atualizar permissões:', error)
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Erro ao atualizar permissões',
			} as const
		}
	},
	{ log: 'MemberPermission', module: 'owner' },
)
