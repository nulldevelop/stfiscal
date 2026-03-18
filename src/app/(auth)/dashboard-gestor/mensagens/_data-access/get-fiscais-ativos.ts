'use server'

import { STATUS } from '@/generated/prisma/enums'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface FiscalAtivoItem {
	id: string
	nome: string
	cargo: string
	contato: string | null
}

export async function getFiscaisAtivos(): Promise<FiscalAtivoItem[]> {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		return []
	}

	try {
		const fiscais = await prisma.fiscalContrato.findMany({
			where: {
				organizationId,
				status: STATUS.ATIVO,
			},
			select: {
				id: true,
				nome: true,
				cargo: true,
				contato: true,
			},
			orderBy: { nome: 'asc' },
		})

		return fiscais
	} catch (error) {
		console.error('Erro ao buscar fiscais ativos:', error)
		return []
	}
}

export interface ContratoComFiscaisItem {
	id: string
	displayContrato: string
	contratado: string
	objeto: string | null
	fiscaisCount: number
}

export async function getContratosComFiscais(): Promise<
	ContratoComFiscaisItem[]
> {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId) {
		return []
	}

	try {
		const contratos = await prisma.contrato.findMany({
			where: {
				organizationId,
				fiscais: {
					some: {
						ativo: true,
						fiscalContrato: {
							status: STATUS.ATIVO,
						},
					},
				},
			},
			select: {
				id: true,
				displayContrato: true,
				contratado: true,
				objeto: true,
				_count: {
					select: {
						fiscais: {
							where: {
								ativo: true,
								fiscalContrato: {
									status: STATUS.ATIVO,
								},
							},
						},
					},
				},
			},
			orderBy: { displayContrato: 'asc' },
		})

		return contratos.map((c) => ({
			id: c.id,
			displayContrato: c.displayContrato,
			contratado: c.contratado,
			objeto: c.objeto,
			fiscaisCount: c._count.fiscais,
		}))
	} catch (error) {
		console.error('Erro ao buscar contratos com fiscais:', error)
		return []
	}
}

export async function getFiscaisPorContrato(
	contratoId: string,
): Promise<FiscalAtivoItem[]> {
	const organizationId = await getCurrentOrganizationId()

	if (!organizationId || !contratoId) {
		return []
	}

	try {
		const fiscaisLinks = await prisma.fiscalContratoLink.findMany({
			where: {
				contratoId,
				ativo: true,
				fiscalContrato: {
					organizationId,
					status: STATUS.ATIVO,
				},
			},
			select: {
				fiscalContrato: {
					select: {
						id: true,
						nome: true,
						cargo: true,
						contato: true,
					},
				},
			},
			orderBy: { fiscalContrato: { nome: 'asc' } },
		})

		return fiscaisLinks.map((f) => f.fiscalContrato)
	} catch (error) {
		console.error('Erro ao buscar fiscais do contrato:', error)
		return []
	}
}
