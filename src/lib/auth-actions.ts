'use server'
import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from './prisma'

export async function getAuth() {
	const cookieStore = await cookies()
	const headerStore = await headers()
	const cookieHeader = cookieStore.toString()
	const authorization = headerStore.get('authorization') ?? ''
	const rawSession = await auth.api.getSession({
		headers: {
			cookie: cookieHeader,
			authorization,
		},
	})
	const session = rawSession?.session ?? null
	const user = rawSession?.user ?? null
	const userId = user?.id ?? null
	const member = await prisma.member.findFirst({
		where: { userId: userId || '' },
		include: {
			organization: { select: { id: true } },
		},
	})
	const organizationId = member?.organization?.id ?? null
	return { session, user, userId, organizationId, member }
}

// @lib: AUTH - Função utilitária para obter a sessão completa do usuário.
// @entrada: N/A
// @retorno: String | null/undefined (O ID do usuário atual).
export async function getCurrentUserId() {
	const { userId } = await getAuth()
	return userId
}

// @lib: AUTH - Função utilitária para obter a sessão completa do usuário.
// @entrada: N/A
// @retorno: Boolean (true se o usuário estiver logado, false caso contrário).
export async function isAuthenticated() {
	const { userId } = await getAuth()
	return !!userId
}

// @lib: AUTH - Função utilitária para obter a sessão completa do usuário.
// @entrada: N/A
// @retorno: String | null/undefined (O ID da organização ativa).
export async function getCurrentOrganizationId() {
	const { organizationId } = await getAuth()
	return organizationId
}

// @lib: AUTH - Função utilitária para obter a sessão completa do usuário.
// @entrada: N/A
// @retorno: Objeto de Sessão completo (Ex: { session, user, userId, ... }).
export async function getSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	return session
}

// ─── Tipos de sessão ────────────────────────────────────────────────────────
export type SessionUser = {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image: string | null
	createdAt: Date
	updatedAt: Date
}

export type Session = {
	user: SessionUser
	session: {
		id: string
		token: string
		userId: string
		expiresAt: Date
		activeOrganizationId?: string | null
		activeTeamId?: string | null
	}
} | null

// ─── getCurrentMember ────────────────────────────────────────────────────────
export async function getCurrentMember() {
	const userId = await getCurrentUserId()
	if (!userId) return null
	const member = await prisma.member.findFirst({
		where: { userId },
		include: { organization: true },
	})
	return member
}
