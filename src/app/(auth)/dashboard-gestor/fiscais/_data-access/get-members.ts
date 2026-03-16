'use server'

import { ROLES } from '@/generated/prisma/enums'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface MemberData {
	id: string
	oderId: string
	name: string
	email: string
	role: string
	fiscalCpf: string | null
	fiscalMatricula: string | null
	fiscalCargo: string | null
	fiscalContato: string | null
	createdAt: Date
	contratosCount: number
}

interface GetMembersParams {
	page?: number
	pageSize?: number
	search?: string
}

export async function getMembers({
	page = 1,
	pageSize = 10,
	search = '',
}: GetMembersParams): Promise<{ members: MemberData[]; total: number }> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { members: [], total: 0 }
	}

	const whereClause = {
		organizationId,
		role: {
			in: ['FISCAL_PRINCIPAL' as const, 'FISCAL_SETORIAL' as const],
		},
		...(search && {
			OR: [
				{ user: { name: { contains: search, mode: 'insensitive' as const } } },
				{ user: { email: { contains: search, mode: 'insensitive' as const } } },
				{ fiscalCpf: { contains: search } },
				{ fiscalMatricula: { contains: search } },
			],
		}),
	}

	try {
		const total = await prisma.member.count({ where: whereClause })

		const records = await prisma.member.findMany({
			where: whereClause,
			include: {
				user: {
					select: {
						name: true,
						email: true,
					},
				},
				fiscalPrincipalContratos: true,
				setoriaisContratos: true,
			},
			orderBy: { user: { name: 'asc' } },
			skip: (page - 1) * pageSize,
			take: pageSize,
		})

		const members: MemberData[] = records.map((r) => ({
			id: r.id,
			oderId: r.userId,
			name: r.user.name || 'Sem nome',
			email: r.user.email || r.email,
			role: r.role,
			fiscalCpf: r.fiscalCpf,
			fiscalMatricula: r.fiscalMatricula,
			fiscalCargo: r.fiscalCargo,
			fiscalContato: r.fiscalContato,
			createdAt: r.createdAt,
			contratosCount:
				r.fiscalPrincipalContratos.length + r.setoriaisContratos.length,
		}))

		return { members, total }
	} catch (error) {
		console.error('Erro ao buscar members:', error)
		return { members: [], total: 0 }
	}
}

export async function getContratosParaVincular() {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return []
	}

	const contratos = await prisma.contrato.findMany({
		where: {
			organizationId,
		},
		include: {
			empresa: {
				select: { name: true },
			},
			fiscalPrincipal: {
				select: { memberId: true },
			},
		},
		orderBy: { numero: 'desc' },
	})

	return contratos.map((c) => ({
		id: c.id,
		label: c.displayContrato || `Contrato ${c.numero}`,
		contratado: c.empresa?.name || c.contratado || 'N/A',
		hasFiscalPrincipal: !!c.fiscalPrincipal,
	}))
}
