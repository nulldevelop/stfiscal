import type { LogAction } from '@/generated/prisma/client'
import { prisma } from './prisma'

export type AuditLogInput = {
	action: LogAction
	entity: string
	entityId?: string
	entityName?: string
	userId: string
	userName: string
	userEmail: string
	organizationId: string
	description?: string
	before?: Record<string, unknown>
	after?: Record<string, unknown>
}

export type AuditLogExtra = Partial<
	Pick<
		AuditLogInput,
		'entityId' | 'entityName' | 'description' | 'before' | 'after'
	>
>

export async function logAction(input: AuditLogInput) {
	try {
		await prisma.auditLog.create({
			data: {
				action: input.action,
				entity: input.entity,
				entityId: input.entityId,
				entityName: input.entityName,
				userId: input.userId,
				userName: input.userName,
				userEmail: input.userEmail,
				organizationId: input.organizationId,
				description: input.description,
				before: input.before ? JSON.stringify(input.before) : undefined,
				after: input.after ? JSON.stringify(input.after) : undefined,
			},
		})
	} catch (err) {
		console.error('[AuditLog] Falha ao gravar log:', err)
	}
}
