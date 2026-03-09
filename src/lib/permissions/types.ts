import type { ROLES } from '@/generated/prisma/enums'
import type { AuditLogExtra } from '../audit-log'

export type Action = 'create' | 'read' | 'update' | 'delete'

export type Module = string

export type ActionResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string }

export type PermissionResult =
	| {
			allowed: true
			userId: string
			organizationId: string
			role: ROLES
			userName: string
			userEmail: string
	  }
	| {
			allowed: false
			error: string
	  }

export type PermissionContext = {
	userId: string
	organizationId: string
	role: ROLES
	userName: string
	userEmail: string
	log: (extra: AuditLogExtra) => void
}

export type WithPermissionOptions = {
	module: Module
	log?: string
}
