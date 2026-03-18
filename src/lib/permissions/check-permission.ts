import { headers } from 'next/headers'
import type { ROLES } from '@/generated/prisma/enums'
import { auth } from '@/lib/auth'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import type { Action, PermissionResult } from './types'

const ROLE_DEFAULT_PERMISSIONS: Partial<
	Record<ROLES, { moduleKey: string; actions: Action[] }[]>
> = {
	FISCAL_SETORIAL: [
		{ moduleKey: 'DadosFiscais', actions: ['read', 'update'] },
		{
			moduleKey: 'fiscal-relatorios',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'fiscal-notificacoes',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'mensagens-internas',
			actions: ['read', 'create', 'update'],
		},
	],
	FISCAL_PRINCIPAL: [
		{ moduleKey: 'DadosFiscais', actions: ['read', 'update'] },
		{
			moduleKey: 'fiscal-relatorios',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'fiscal-notificacoes',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'mensagens-internas',
			actions: ['read', 'create', 'update'],
		},
	],
	GESTOR_CONTRATOS: [
		{
			moduleKey: 'gestor-empresas',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'gestor-licitacoes',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'gestor-fiscais',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'gestor-contratos',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'gestor-notificacoes',
			actions: ['read', 'create', 'update', 'delete'],
		},
		{
			moduleKey: 'mensagens-internas',
			actions: ['read', 'create', 'update', 'delete'],
		},
	],
}

export async function getMemberRole(userId?: string, organizationId?: string) {
	let finalUserId = userId
	let finalOrgId = organizationId

	if (!finalUserId || !finalOrgId) {
		const session = await auth.api.getSession({
			headers: await headers(),
		})
		finalUserId = finalUserId || session?.user?.id
		finalOrgId = finalOrgId || (await getCurrentOrganizationId()) || undefined
	}

	if (!finalUserId || !finalOrgId) return null

	const member = await prisma.member.findFirst({
		where: {
			userId: finalUserId,
			organizationId: finalOrgId,
		},
		select: { role: true },
	})

	return member?.role ?? null
}

export async function checkPermission(
	action: Action,
	moduleKey: string,
): Promise<PermissionResult> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return { allowed: false, error: 'Usuário não autenticado' }
	}

	// ─────────────────────────────────────────────
	// 1️⃣ Organização ativa
	// ─────────────────────────────────────────────

	let organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		const fallback = await prisma.member.findFirst({
			where: { userId: session.user.id },
			select: { organizationId: true },
		})

		organizationId = fallback?.organizationId ?? null
	}

	if (!organizationId) {
		return { allowed: false, error: 'Nenhuma organização ativa' }
	}

	// ─────────────────────────────────────────────
	// 2️⃣ Buscar Member
	// ─────────────────────────────────────────────

	const member = await prisma.member.findFirst({
		where: {
			userId: session.user.id,
			organizationId,
		},
		select: {
			id: true,
			role: true,
		},
	})

	if (!member) {
		return { allowed: false, error: 'Usuário não é membro desta organização' }
	}

	// ─────────────────────────────────────────────
	// 3️⃣ OWNER e ADMIN — bypass total
	// ─────────────────────────────────────────────

	if (member.role === 'OWNER' || member.role === 'ADMIN') {
		return {
			allowed: true,
			userId: session.user.id,
			organizationId,
			role: member.role,
			userName: session.user.name,
			userEmail: session.user.email,
		}
	}

	// ─────────────────────────────────────────────
	// 4️⃣ Permissões padrão por role (sem consulta ao banco)
	// ─────────────────────────────────────────────

	const roleDefaults = ROLE_DEFAULT_PERMISSIONS[member.role]
	if (roleDefaults) {
		const match = roleDefaults.find((d) => d.moduleKey === moduleKey)
		if (match?.actions.includes(action)) {
			return {
				allowed: true,
				userId: session.user.id,
				organizationId,
				role: member.role,
				userName: session.user.name,
				userEmail: session.user.email,
			}
		}
	}

	// ─────────────────────────────────────────────
	// 5️⃣ Buscar módulo dentro da organização
	// ─────────────────────────────────────────────

	const modulo = await prisma.modulo.findFirst({
		where: {
			key: moduleKey,
			organizationId,
		},
		select: { id: true },
	})

	if (!modulo) {
		return { allowed: false, error: 'Módulo não encontrado nesta organização' }
	}

	// ─────────────────────────────────────────────
	// 6️⃣ Buscar permissão do membro
	// ─────────────────────────────────────────────

	const permission = await prisma.memberPermission.findUnique({
		where: {
			memberId_moduloId: {
				memberId: member.id,
				moduloId: modulo.id,
			},
		},
	})

	if (!permission) {
		return { allowed: false, error: 'Permissão não configurada' }
	}

	// ─────────────────────────────────────────────
	// 7️⃣ Validar ação
	// ─────────────────────────────────────────────

	const actionMap = {
		create: permission.canCreate,
		read: permission.canRead,
		update: permission.canUpdate,
		delete: permission.canDelete,
	} as const

	if (!actionMap[action]) {
		return { allowed: false, error: 'Sem permissão para esta ação' }
	}

	// ─────────────────────────────────────────────
	// 8️⃣ Retorno final
	// ─────────────────────────────────────────────

	return {
		allowed: true,
		userId: session.user.id,
		organizationId,
		role: member.role,
		userName: session.user.name,
		userEmail: session.user.email,
	}
}
