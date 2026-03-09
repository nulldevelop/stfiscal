import { type AuditLogExtra, logAction } from '../audit-log'
import { checkPermission } from './check-permission'
import type {
	Action,
	ActionResponse,
	Module,
	PermissionContext,
	WithPermissionOptions,
} from './types'

export function withPermission<T extends unknown[], R>(
	action: Action,
	fn: (ctx: PermissionContext, ...args: T) => Promise<ActionResponse<R>>,
	options: WithPermissionOptions | Module,
) {
	return async (...args: T): Promise<ActionResponse<R>> => {
		// 1️⃣ Normaliza opções
		if (!options) {
			return { success: false, error: 'Módulo não informado' }
		}

		const opts: WithPermissionOptions =
			typeof options === 'string' ? { module: options } : options

		if (!opts.module) {
			return { success: false, error: 'Módulo não informado' }
		}

		// 2️⃣ Valida permissão
		const permission = await checkPermission(action, opts.module)

		if (!permission.allowed) {
			return { success: false, error: permission.error }
		}

		// 3️⃣ Detecta entityId automático (primeiro argumento string)
		const autoEntityId = typeof args[0] === 'string' ? args[0] : undefined

		let logExtra: AuditLogExtra = {}
		let logCalled = false

		// 4️⃣ Contexto injetado
		const ctx: PermissionContext = {
			userId: permission.userId,
			organizationId: permission.organizationId,
			role: permission.role,
			userName: permission.userName,
			userEmail: permission.userEmail,
			log: (extra: AuditLogExtra) => {
				logExtra = extra
				logCalled = true
			},
		}

		// 5️⃣ Executa ação protegida
		const result = await fn(ctx, ...args)

		// 6️⃣ Log automático apenas para mutações bem-sucedidas
		if (opts.log && action !== 'read' && result.success) {
			const actionMap = {
				create: 'CREATE',
				update: 'UPDATE',
				delete: 'DELETE',
			} as const

			await logAction({
				action: actionMap[action],
				entity: opts.log,
				entityId: logCalled ? logExtra.entityId : autoEntityId,
				entityName: logExtra.entityName,
				userId: permission.userId,
				userName: permission.userName,
				userEmail: permission.userEmail,
				organizationId: permission.organizationId,
				description: logExtra.description,
				before: logExtra.before,
				after: logExtra.after,
			})
		}

		// 7️⃣ Retorna resultado padronizado
		return result
	}
}
