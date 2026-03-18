'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface MensagemListItem {
	id: string
	assunto: string
	conteudo: string
	tipo: string
	status: string
	createdAt: Date
	contratoId: string | null
	contratoDisplay: string | null
	contratoNome: string | null
	destinatariosNomes: string[]
	totalDestinatarios: number
	totalLidas: number
	totalRespostas: number
	respostasNaoLidas: number
}

export interface ChatEntry {
	id: string
	conteudo: string
	createdAt: Date
	/** true = bolha da direita (gestor), false = bolha da esquerda (fiscal) */
	doGestor: boolean
	lidaPeloRemetente: boolean
	lidaEm: Date | null
	autor: {
		id: string
		nome: string
		cargo: string
	}
}

export interface MensagemDetalhes {
	id: string
	assunto: string
	conteudo: string
	tipo: string
	status: string
	createdAt: Date
	remetente: { id: string; nome: string }
	contrato: {
		id: string
		displayContrato: string
	} | null
	destinatarios: {
		id: string
		lida: boolean
		lidaEm: Date | null
		fiscalContrato: {
			id: string
			nome: string
			cargo: string
		}
	}[]
	/** Todas as respostas do chat (fiscais + gestor) em ordem cronológica */
	chat: ChatEntry[]
}

export async function getMensagemById(
	mensagemId: string,
): Promise<MensagemDetalhes | null> {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId || !mensagemId) {
		return null
	}

	try {
		const mensagem = await prisma.mensagemInterna.findFirst({
			where: {
				id: mensagemId,
				organizationId,
				remetenteId: userId,
			},
			select: {
				id: true,
				assunto: true,
				conteudo: true,
				tipo: true,
				status: true,
				createdAt: true,
				remetente: { select: { id: true, name: true } },
				contrato: {
					select: { id: true, displayContrato: true },
				},
				destinatarios: {
					select: {
						id: true,
						lida: true,
						lidaEm: true,
						fiscalContrato: {
							select: { id: true, nome: true, cargo: true },
						},
					},
					orderBy: { fiscalContrato: { nome: 'asc' } },
				},
				respostas: {
					select: {
						id: true,
						conteudo: true,
						createdAt: true,
						lidaPeloRemetente: true,
						lidaEm: true,
						autorGestorId: true,
						autorGestor: { select: { id: true, name: true } },
						fiscalContratoId: true,
						fiscalContrato: {
							select: { id: true, nome: true, cargo: true },
						},
					},
					orderBy: { createdAt: 'asc' },
				},
			},
		})

		if (!mensagem) return null

		const chat: ChatEntry[] = mensagem.respostas.map((r) => {
			if (r.autorGestorId && r.autorGestor) {
				return {
					id: r.id,
					conteudo: r.conteudo,
					createdAt: r.createdAt,
					doGestor: true,
					lidaPeloRemetente: r.lidaPeloRemetente,
					lidaEm: r.lidaEm,
					autor: {
						id: r.autorGestor.id,
						nome: r.autorGestor.name,
						cargo: 'Administrador de Contratos',
					},
				}
			}
			return {
				id: r.id,
				conteudo: r.conteudo,
				createdAt: r.createdAt,
				doGestor: false,
				lidaPeloRemetente: r.lidaPeloRemetente,
				lidaEm: r.lidaEm,
				autor: r.fiscalContrato
					? {
							id: r.fiscalContrato.id,
							nome: r.fiscalContrato.nome,
							cargo: r.fiscalContrato.cargo,
						}
					: { id: '', nome: 'Fiscal', cargo: '' },
			}
		})

		return {
			id: mensagem.id,
			assunto: mensagem.assunto,
			conteudo: mensagem.conteudo,
			tipo: mensagem.tipo,
			status: mensagem.status,
			createdAt: mensagem.createdAt,
			remetente: { id: mensagem.remetente.id, nome: mensagem.remetente.name },
			contrato: mensagem.contrato,
			destinatarios: mensagem.destinatarios,
			chat,
		}
	} catch (error) {
		console.error('Erro ao buscar mensagem:', error)
		return null
	}
}
