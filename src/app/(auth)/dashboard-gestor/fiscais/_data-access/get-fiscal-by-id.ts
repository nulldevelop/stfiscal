'use server'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface FiscalDetails {
	id: string
	name: string
	email: string
	cpf: string | null
	matricula: string | null
	cargo: string | null
	contato: string | null
	createdAt: Date
	contratos: {
		id: string
		numero: number
		idOxy: string | null
		displayContrato: string
		displayLicitacao: string
		contratado: string
		valor: number
		dataInicio: Date
		dataFim: Date
		fiscalInicio: string | null
		fiscalFim: string | null
		licitacaoAno: number | null
		licitacaoNumero: number | null
		licitacaoModalidade: string | null
	}[]
}

export async function getFiscalById(id: string): Promise<FiscalDetails | null> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return null
	}

	try {
		const user = await prisma.user.findFirst({
			where: {
				id,
				members: {
					some: {
						organizationId,
						role: { in: ['FISCAL_PRINCIPAL', 'FISCAL_SETORIAL'] },
					},
				},
			},
			include: {
				members: {
					where: { organizationId },
					take: 1,
				},
				fiscais: {
					where: { organizationId },
					include: {
						contratos: {
							include: {
								contrato: {
									include: {
										licitacao: true,
									},
								},
							},
						},
					},
				},
			},
		})

		if (!user || user.members.length === 0) {
			return null
		}

		const member = user.members[0]
		const fiscalRecord = user.fiscais[0]

		const contratosData = (fiscalRecord?.contratos ?? [])
			.filter((link) => link.contrato !== null)
			.map((link) => ({
				id: link.contrato.id,
				numero: link.contrato.numero,
				exercicio: link.contrato.exercicio,
				idOxy: link.contrato.idOxy,
				displayContrato: link.contrato.displayContrato,
				displayLicitacao: link.contrato.displayLicitacao,
				contratado: link.contrato.contratado,
				valor: 0,
				dataInicio: link.contrato.dataInicio,
				dataFim: link.contrato.dataFim,
				fiscalInicio: link.dtinicio,
				fiscalFim: link.dtfim,
				licitacaoAno: link.contrato.licitacao?.ano || null,
				licitacaoNumero: link.contrato.licitacao?.numero || null,
				licitacaoModalidade: link.contrato.licitacao?.modalidade || null,
			}))
			// Ordena por ano DESC, depois por número ASC — ex: 1/2026 vem antes de 51/2025
			.sort((a, b) => {
				const anoA = a.exercicio || a.licitacaoAno || 0
				const anoB = b.exercicio || b.licitacaoAno || 0
				if (anoB !== anoA) return anoB - anoA
				return a.numero - b.numero
			})

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			cpf: member.fiscalCpf || null,
			matricula: member.fiscalMatricula || null,
			cargo: member.fiscalCargo || null,
			contato: member.fiscalContato || null,
			createdAt: user.createdAt,
			contratos: contratosData,
		}
	} catch (error) {
		console.error('Erro ao buscar fiscal por ID:', error)
		return null
	}
}
