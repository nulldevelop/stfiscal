import type { ROLES } from '@/generated/prisma/enums'
import type { Action } from './types'

// Usado pelo checkPermission (Member.role dentro da organização)
export const ROLE_PERMISSIONS: Record<ROLES, Action[]> = {
	OWNER: ['create', 'read', 'update', 'delete'],
	ADMIN: ['create', 'read', 'update', 'delete'],
	GESTOR_CONTRATOS: ['create', 'read', 'update', 'delete'],
	SUPORT: ['read', 'update'],
	FISCAL_PRINCIPAL: ['create', 'read', 'update', 'delete'],
	FISCAL_SETORIAL: ['create', 'read', 'update', 'delete'],
	USER: ['read'],
}

// Usado pelo middleware (User.role global)
export const ROUTE_PERMISSIONS: Record<string, ROLES[]> = {
	'/dashboard-owner': ['OWNER'],
	'/dashboard-gestor': ['OWNER', 'ADMIN', 'GESTOR_CONTRATOS'],
	'/dashboard-fiscal': [
		'OWNER',
		'ADMIN',
		'GESTOR_CONTRATOS',
		'FISCAL_PRINCIPAL',
		'FISCAL_SETORIAL',
	],
	'/dashboard': [
		'OWNER',
		'ADMIN',
		'GESTOR_CONTRATOS',
		'FISCAL_PRINCIPAL',
		'FISCAL_SETORIAL',
		'SUPORT',
		'USER',
	],
}

export type ProtectedRoute = keyof typeof ROUTE_PERMISSIONS
