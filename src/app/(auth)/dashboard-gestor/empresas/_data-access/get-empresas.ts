'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

import type { EmpresaDTO } from './types'

interface GetEmpresasParams {
	page?: number
	pageSize?: number
	search?: string
}

export interface EmpresasResponse {
	empresas: EmpresaDTO[]
	total: number
	stats: {
		total: number
		comRepresentante: number
		semRepresentante: number
	}
}

export async function getEmpresas({
	page = 1,
	pageSize = 10,
	search = '',
}: GetEmpresasParams): Promise<EmpresasResponse> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return {
			empresas: [],
			total: 0,
			stats: { total: 0, comRepresentante: 0, semRepresentante: 0 }
		}
	}

	const whereClause = {
		organizationId,
		...(search && {
			OR: [
				{ name: { contains: search } },
				{ cnpj: { contains: search } },
				{ representanteNome: { contains: search } },
				{ representanteCpf: { contains: search } },
			],
		}),
	}

	try {
		const [rows, total, comRepresentante, semRepresentante] = await Promise.all([
			prisma.empresas.findMany({
				where: whereClause,
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: { name: 'asc' },
				select: {
					id: true,
					name: true,
					cnpj: true,
					representanteNome: true,
					representanteCpf: true,
				},
			}),
			prisma.empresas.count({ where: whereClause }),
			prisma.empresas.count({
				where: {
					...whereClause,
					representanteNome: { not: '' }
				}
			}),
			prisma.empresas.count({
				where: {
					...whereClause,
					OR: [
						{ representanteNome: null },
						{ representanteNome: '' }
					]
				}
			}),
		])

		return {
			empresas: rows,
			total,
			stats: {
				total,
				comRepresentante,
				semRepresentante
			}
		}
	} catch (error) {
		console.error('Error fetching empresas:', error)
		return {
			empresas: [],
			total: 0,
			stats: { total: 0, comRepresentante: 0, semRepresentante: 0 }
		}
	}
}
