'use server'

import { STATUS } from '@/generated/prisma/enums'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export type FiscalSource = 'member' | 'fiscalContrato' | 'both'

export interface FiscalUnificado {
	id: string
	memberId: string | null
	fiscalContratoId: string | null
	userId: string | null
	nome: string
	email: string
	cpf: string | null
	matricula: string | null
	cargo: string | null
	contato: string | null
	role: string | null
	contratosCount: number
	source: FiscalSource
	ativo: boolean
	createdAt: Date
}

interface GetFiscaisUnificadoParams {
	page?: number
	pageSize?: number
	search?: string
	filter?: 'all' | 'members' | 'fiscais' | 'pending'
}

export async function getFiscaisUnificado({
	page = 1,
	pageSize = 10,
	search = '',
	filter = 'all',
}: GetFiscaisUnificadoParams): Promise<{
	fiscais: FiscalUnificado[]
	total: number
	stats: {
		totalMembers: number
		totalFiscalContrato: number
		totalPending: number
	}
}> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return {
			fiscais: [],
			total: 0,
			stats: { totalMembers: 0, totalFiscalContrato: 0, totalPending: 0 },
		}
	}

	try {
		// 1. Buscar todos os Members com role FISCAL
		const members = await prisma.member.findMany({
			where: {
				organizationId,
				role: { in: ['FISCAL_PRINCIPAL', 'FISCAL_SETORIAL'] },
				...(search && {
					OR: [
						{ user: { name: { contains: search, mode: 'insensitive' } } },
						{ user: { email: { contains: search, mode: 'insensitive' } } },
						{ fiscalCpf: { contains: search } },
						{ fiscalMatricula: { contains: search } },
					],
				}),
			},
			include: {
				user: { select: { id: true, name: true, email: true } },
				fiscalPrincipalContratos: true,
				setoriaisContratos: true,
			},
			orderBy: { user: { name: 'asc' } },
		})

		// 2. Buscar todos os FiscalContrato
		const fiscaisContrato = await prisma.fiscalContrato.findMany({
			where: {
				organizationId,
				status: STATUS.ATIVO,
				...(search && {
					OR: [
						{ nome: { contains: search, mode: 'insensitive' } },
						{ cpf: { contains: search } },
						{ matricula: { contains: search } },
						{ user: { email: { contains: search, mode: 'insensitive' } } },
					],
				}),
			},
			include: {
				user: { select: { id: true, name: true, email: true } },
				contratos: { where: { ativo: true } },
			},
			orderBy: { nome: 'asc' },
		})

		// 3. Criar mapa de userId -> fiscalContrato para merge
		const fiscalContratoByUserId = new Map(
			fiscaisContrato.filter((f) => f.userId).map((f) => [f.userId!, f])
		)

		// 4. Criar mapa de fiscalContratoId para saber quais já foram processados
		const processedFiscalContratoIds = new Set<string>()

		// 5. Unificar dados
		const unificados: FiscalUnificado[] = []

		// Primeiro, processar members
		for (const member of members) {
			const fiscalContrato = fiscalContratoByUserId.get(member.userId)

			if (fiscalContrato) {
				processedFiscalContratoIds.add(fiscalContrato.id)
			}

			const contratosFromMember =
				member.fiscalPrincipalContratos.length + member.setoriaisContratos.length
			const contratosFromFiscal = fiscalContrato?.contratos.length ?? 0

			unificados.push({
				id: member.id,
				memberId: member.id,
				fiscalContratoId: fiscalContrato?.id ?? null,
				userId: member.userId,
				nome: member.user.name || 'Sem nome',
				email: member.user.email,
				cpf: fiscalContrato?.cpf ?? member.fiscalCpf,
				matricula: fiscalContrato?.matricula ?? member.fiscalMatricula,
				cargo: fiscalContrato?.cargo ?? member.fiscalCargo,
				contato: fiscalContrato?.contato ?? member.fiscalContato,
				role: member.role,
				contratosCount: Math.max(contratosFromMember, contratosFromFiscal),
				source: fiscalContrato ? 'both' : 'member',
				ativo: true,
				createdAt: member.createdAt,
			})
		}

		// Depois, adicionar fiscalContrato que não têm member associado
		for (const fiscal of fiscaisContrato) {
			if (processedFiscalContratoIds.has(fiscal.id)) {
				continue // Já foi processado junto com o member
			}

			unificados.push({
				id: fiscal.id,
				memberId: null,
				fiscalContratoId: fiscal.id,
				userId: fiscal.userId,
				nome: fiscal.nome,
				email: fiscal.user?.email ?? '',
				cpf: fiscal.cpf,
				matricula: fiscal.matricula,
				cargo: fiscal.cargo,
				contato: fiscal.contato,
				role: null,
				contratosCount: fiscal.contratos.length,
				source: 'fiscalContrato',
				ativo: fiscal.ativo,
				createdAt: fiscal.createdAt,
			})
		}

		// 6. Calcular estatísticas
		const stats = {
			totalMembers: members.length,
			totalFiscalContrato: fiscaisContrato.length,
			totalPending: unificados.filter((f) => f.source === 'member').length,
		}

		// 7. Filtrar conforme solicitado
		let filtered = unificados
		if (filter === 'members') {
			filtered = unificados.filter((f) => f.memberId !== null)
		} else if (filter === 'fiscais') {
			filtered = unificados.filter((f) => f.fiscalContratoId !== null)
		} else if (filter === 'pending') {
			filtered = unificados.filter((f) => f.source === 'member')
		}

		// 8. Ordenar por nome
		filtered.sort((a, b) => a.nome.localeCompare(b.nome))

		// 9. Paginar
		const total = filtered.length
		const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

		return { fiscais: paginated, total, stats }
	} catch (error) {
		console.error('Erro ao buscar fiscais unificados:', error)
		return {
			fiscais: [],
			total: 0,
			stats: { totalMembers: 0, totalFiscalContrato: 0, totalPending: 0 },
		}
	}
}
