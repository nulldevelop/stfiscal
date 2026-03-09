'use server'

import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

export const getActiveFormConfig = withPermission(
	'read',
	async (ctx, reportType: string) => {
		const { organizationId, role } = ctx

		const configs = await prisma.formConfig.findMany({
			where: {
				reportType,
				organizationId: organizationId,
				isActive: true,
			},
			orderBy: { order: 'asc' },
		})

		// Filtra por Role
		const filteredConfigs = configs.filter((config) => {
			if (role === 'FISCAL_PRINCIPAL') return config.isVisiblePrincipal
			if (role === 'FISCAL_SETORIAL') return config.isVisibleSetorial
			// Se for admin ou owner, vê tudo que está ativo
			if (['ADMIN', 'OWNER'].includes(role)) return true
			return false
		})

		return {
			success: true,
			data: filteredConfigs,
		}
	},
	'fiscal-relatorios',
)
