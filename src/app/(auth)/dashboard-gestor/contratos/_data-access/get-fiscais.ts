'use server'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface FiscalOption {
	id: string // userId
	memberId: string
	name: string
}

export async function getFiscais(): Promise<{
	success: boolean
	data: FiscalOption[]
}> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { success: false, data: [] }
	}
	try {
		const members = await prisma.member.findMany({
			where: {
				organizationId,
				role: { in: ['FISCAL_PRINCIPAL', 'FISCAL_SETORIAL'] },
			},
			select: {
				id: true,
				user: { select: { id: true, name: true } },
			},
			orderBy: { user: { name: 'asc' } },
		})
		const data = members.map((m) => ({
			id: m.user.id,
			memberId: m.id,
			name: m.user.name,
		}))
		return { success: true, data }
	} catch {
		return { success: false, data: [] }
	}
}
