'use server'

import { STATUS } from '@/generated/prisma/enums'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface FiscalData {
	id: string
	userId: string | null
	name: string
	email: string
	cpf: string | null
	matricula: string | null
	cargo: string | null
	contato: string | null
	createdAt: Date
}

interface GetFiscaisParams {
	page?: number
	pageSize?: number
	search?: string
}

export async function getFiscais({
	page = 1,
	pageSize = 10,
	search = '',
}: GetFiscaisParams): Promise<{ fiscais: FiscalData[]; total: number }> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { fiscais: [], total: 0 }
	}

	const whereClause = {
		organizationId,
		status: STATUS.ATIVO,
		...(search && {
			OR: [
				{ nome: { contains: search } },
				{ cpf: { contains: search } },
				{ matricula: { contains: search } },
			],
		}),
	}

	try {
		const total = await prisma.fiscalContrato.count({ where: whereClause })

		const records = await prisma.fiscalContrato.findMany({
			where: whereClause,
			select: {
				id: true,
				userId: true,
				nome: true,
				cpf: true,
				matricula: true,
				cargo: true,
				contato: true,
				createdAt: true,
				user: { select: { email: true } },
			},
			orderBy: { nome: 'asc' },
			skip: (page - 1) * pageSize,
			take: pageSize,
		})

		// Buscar members para recuperar userId de fiscais sem vínculo pelo CPF
		const members = await prisma.member.findMany({
			where: {
				organizationId,
				fiscalCpf: {
					in: records.map((f) => f.cpf).filter((cpf): cpf is string => !!cpf),
				},
			},
			select: { userId: true, fiscalCpf: true },
		})

		const fiscais = records.map((f) => ({
			id: f.id,
			userId: f.userId || members.find((m) => m.fiscalCpf === f.cpf)?.userId || null,
			name: f.nome,
			email: f.user?.email ?? '',
			cpf: f.cpf,
			matricula: f.matricula,
			cargo: f.cargo,
			contato: f.contato ?? null,
			createdAt: f.createdAt,
		}))

		return { fiscais, total }
	} catch (error) {
		console.error('Erro ao buscar fiscais:', error)
		return { fiscais: [], total: 0 }
	}
}
