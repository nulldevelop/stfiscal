'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

interface GetLicitacoesParams {
	page?: number
	pageSize?: number
	search?: string
}

export interface LicitacoesResponse {
	licitacoes: any[]
	total: number
	stats: {
		total: number
		emAndamento: number
		concluidas: number
		outras: number
	}
}

export async function getLicitacoes({
	page = 1,
	pageSize = 10,
	search = '',
}: GetLicitacoesParams): Promise<LicitacoesResponse> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { 
			licitacoes: [], 
			total: 0, 
			stats: { total: 0, emAndamento: 0, concluidas: 0, outras: 0 } 
		}
	}

	const searchNumber = parseInt(search, 10)
	const isSearchNumber = !Number.isNaN(searchNumber)

	const whereClause = {
		organizationId,
		...(search && {
			OR: [
				{ entidade: { contains: search } },
				{ objeto: { contains: search } },
				...(isSearchNumber ? [{ numero: { equals: searchNumber } }] : []),
			],
		}),
	}

	try {
		const [rows, total, emAndamento, concluidas] = await Promise.all([
			prisma.licitacao.findMany({
				where: whereClause,
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: [{ ano: 'desc' }, { numero: 'desc' }],
				select: {
					id: true,
					entidade: true,
					objeto: true,
					numero: true,
					ano: true,
					situacao: true,
					modalidade: true,
					dataPublicacao: true,
				},
			}),
			prisma.licitacao.count({ where: whereClause }),
			prisma.licitacao.count({ 
				where: { ...whereClause, situacao: 'ANDAMENTO' } 
			}),
			prisma.licitacao.count({ 
				where: { ...whereClause, situacao: 'CONCLUIDA' } 
			}),
		])

		const licitacoes = rows.map((r) => ({
			...r,
			dataPublicacao: r.dataPublicacao.toISOString().slice(0, 10),
		}))

		return { 
			licitacoes, 
			total,
			stats: {
				total,
				emAndamento,
				concluidas,
				outras: total - emAndamento - concluidas
			}
		}
	} catch (error) {
		console.error('Error fetching licitacoes:', error)
		return { 
			licitacoes: [], 
			total: 0, 
			stats: { total: 0, emAndamento: 0, concluidas: 0, outras: 0 } 
		}
	}
}
