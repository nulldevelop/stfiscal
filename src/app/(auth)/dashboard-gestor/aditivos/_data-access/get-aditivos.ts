'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentOrganizationId } from '@/lib/auth-actions'

export async function getAditivos(params: {
	search?: string
	page?: number
	pageSize?: number
}) {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		throw new Error('No active organization')
	}

	const { search, page = 1, pageSize = 10 } = params
	const skip = (page - 1) * pageSize

	const where = {
		organizationId,
		OR: search
			? [
					{
						contrato: {
							displayContrato: { contains: search },
						},
					},
					{
						motivacao: { contains: search },
					},
			  ]
			: undefined,
	}

	const [aditivos, total] = await Promise.all([
		prisma.aditivo.findMany({
			where,
			include: {
				contrato: {
					select: {
						displayContrato: true,
						contratado: true,
					},
				},
			},
			orderBy: { data: 'desc' },
			skip,
			take: pageSize,
		}),
		prisma.aditivo.count({ where }),
	])

	return {
		aditivos,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	}
}
