'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface DashboardMetrics {
	empresas: number
	licitacoes: number
	contratos: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics | null> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { empresas: 0, licitacoes: 0, contratos: 0 }
	}
	try {
		const [empresas, licitacoes, contratos] = await Promise.all([
			prisma.empresas.count({ where: { organizationId } }),
			prisma.licitacao.count({ where: { organizationId } }),
			prisma.contrato.count({ where: { organizationId } }),
		])
		return { empresas, licitacoes, contratos }
	} catch {
		return null
	}
}
