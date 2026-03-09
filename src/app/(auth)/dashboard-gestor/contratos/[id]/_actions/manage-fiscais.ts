'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'

// ── Fiscal Tecnico ────────────────────────────────────────

export const linkFiscalPrincipal = withPermission(
	'update',
	async (
		ctx,
		{ contratoId, memberId }: { contratoId, memberId: string },
	) => {
		await prisma.contratoFiscal.upsert({
			where: { contratoId },
			create: { contratoId, memberId },
			update: { memberId },
		})
		revalidatePath(`/dashboard-gestor/contratos/${contratoId}`)
		return { success: true as const, data: 'Fiscal tecnico vinculado.' }
	},
	{ module: 'gestor-contratos', log: 'MANAGE_FISCAIS' },
)

export const unlinkFiscalPrincipal = withPermission(
	'update',
	async (_ctx, contratoId: string) => {
		await prisma.contratoFiscal.delete({ where: { contratoId } })
		revalidatePath(`/dashboard-gestor/contratos/${contratoId}`)
		return { success: true as const, data: 'Fiscal tecnico removido.' }
	},
	{ module: 'gestor-contratos', log: 'MANAGE_FISCAIS' },
)

// ── Fiscais Administrativos ───────────────────────────────

export const linkFiscalSetorial = withPermission(
	'update',
	async (
		ctx,
		{ contratoId, memberId }: { contratoId, memberId: string },
	) => {
		await prisma.contratoSetorial.upsert({
			where: { contratoId_memberId: { contratoId, memberId } },
			create: { contratoId, memberId },
			update: {},
		})
		revalidatePath(`/dashboard-gestor/contratos/${contratoId}`)
		return { success: true as const, data: 'Fiscal administrativo vinculado.' }
	},
	{ module: 'gestor-contratos', log: 'MANAGE_FISCAIS' },
)

export const unlinkFiscalSetorial = withPermission(
	'update',
	async (
		ctx,
		{ contratoId, memberId }: { contratoId, memberId: string },
	) => {
		await prisma.contratoSetorial.delete({
			where: { contratoId_memberId: { contratoId, memberId } },
		})
		revalidatePath(`/dashboard-gestor/contratos/${contratoId}`)
		return { success: true as const, data: 'Fiscal administrativo removido.' }
	},
	{ module: 'gestor-contratos', log: 'MANAGE_FISCAIS' },
)
