import { type NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { userId, organizationId } = await getAuth()

	if (!userId || !organizationId) {
		return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
	}

	const { id: mensagemId } = await params

	try {
		const mensagem = await prisma.mensagemInterna.findFirst({
			where: { id: mensagemId, organizationId, remetenteId: userId },
			select: {
				id: true,
				assunto: true,
				conteudo: true,
				tipo: true,
				status: true,
				createdAt: true,
				remetente: { select: { id: true, name: true } },
				contrato: { select: { id: true, displayContrato: true } },
				destinatarios: {
					select: {
						id: true,
						lida: true,
						lidaEm: true,
						fiscalContrato: { select: { id: true, nome: true, cargo: true } },
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
						fiscalContrato: { select: { id: true, nome: true, cargo: true } },
					},
					orderBy: { createdAt: 'asc' },
				},
			},
		})

		if (!mensagem) {
			return NextResponse.json(
				{ error: 'Mensagem não encontrada' },
				{ status: 404 },
			)
		}

		const chat = mensagem.respostas.map((r) => {
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

		return NextResponse.json({
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
		})
	} catch (error) {
		console.error('Erro ao buscar mensagem do gestor:', error)
		return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
	}
}
