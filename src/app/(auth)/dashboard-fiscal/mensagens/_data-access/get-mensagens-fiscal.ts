'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface MensagemFiscalListItem {
	id: string
	assunto: string
	conteudo: string
	tipo: string
	createdAt: Date
	lida: boolean
	lidaEm: Date | null
	remetente: { nome: string }
	totalRespostas: number
	contratoDisplay: string | null
}

export interface ChatEntryFiscal {
	id: string
	conteudo: string
	createdAt: Date
	/** true = gestor (esquerda no ponto de vista do fiscal), false = fiscal (direita) */
	doGestor: boolean
	autor: { nome: string; cargo: string }
}

export interface MensagemFiscalDetalhes {
	id: string
	assunto: string
	conteudo: string
	tipo: string
	createdAt: Date
	lida: boolean
	lidaEm: Date | null
	remetente: { nome: string }
	contrato: { id: string; displayContrato: string } | null
	chat: ChatEntryFiscal[]
}

export async function getMensagemFiscalById(
	mensagemId: string,
): Promise<MensagemFiscalDetalhes | null> {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId || !mensagemId) return null

	try {
		const fiscal = await prisma.fiscalContrato.findFirst({
			where: { userId, organizationId, ativo: true },
		})

		if (!fiscal) return null

		const destinatario = await prisma.destinatarioMensagem.findFirst({
			where: { mensagemId, fiscalContratoId: fiscal.id },
			select: {
				lida: true,
				lidaEm: true,
				mensagem: {
					select: {
						id: true,
						assunto: true,
						conteudo: true,
						tipo: true,
						createdAt: true,
						remetente: { select: { name: true } },
						contrato: { select: { id: true, displayContrato: true } },
						respostas: {
							select: {
								id: true,
								conteudo: true,
								createdAt: true,
								fiscalContratoId: true,
								fiscalContrato: { select: { id: true, nome: true, cargo: true } },
								autorGestorId: true,
								autorGestor: { select: { name: true } },
							},
							orderBy: { createdAt: 'asc' },
						},
					},
				},
			},
		})

		if (!destinatario) return null

		const chat: ChatEntryFiscal[] = destinatario.mensagem.respostas.map((r) => {
			if (r.autorGestorId && r.autorGestor) {
				return {
					id: r.id,
					conteudo: r.conteudo,
					createdAt: r.createdAt,
					doGestor: true,
					autor: { nome: r.autorGestor.name, cargo: 'Administrador de Contratos' },
				}
			}
			return {
				id: r.id,
				conteudo: r.conteudo,
				createdAt: r.createdAt,
				doGestor: false,
				autor: {
					nome: r.fiscalContrato?.nome ?? 'Fiscal',
					cargo: r.fiscalContrato?.cargo ?? '',
				},
			}
		})

		return {
			id: destinatario.mensagem.id,
			assunto: destinatario.mensagem.assunto,
			conteudo: destinatario.mensagem.conteudo,
			tipo: destinatario.mensagem.tipo,
			createdAt: destinatario.mensagem.createdAt,
			lida: destinatario.lida,
			lidaEm: destinatario.lidaEm,
			remetente: { nome: destinatario.mensagem.remetente.name },
			contrato: destinatario.mensagem.contrato,
			chat,
		}
	} catch (error) {
		console.error('Erro ao buscar mensagem:', error)
		return null
	}
}
