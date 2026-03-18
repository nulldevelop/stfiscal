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
		const fiscal = await prisma.fiscalContrato.findFirst({
			where: { userId, organizationId, ativo: true },
		})

		if (!fiscal) {
			return NextResponse.json(
				{ error: 'Fiscal não encontrado' },
				{ status: 404 },
			)
		}

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
								fiscalContrato: {
									select: { id: true, nome: true, cargo: true },
								},
								autorGestorId: true,
								autorGestor: { select: { name: true } },
							},
							orderBy: { createdAt: 'asc' },
						},
					},
				},
			},
		})

		if (!destinatario) {
			return NextResponse.json(
				{ error: 'Mensagem não encontrada' },
				{ status: 404 },
			)
		}

		const chat = destinatario.mensagem.respostas.map((r) => {
			if (r.autorGestorId && r.autorGestor) {
				return {
					id: r.id,
					conteudo: r.conteudo,
					createdAt: r.createdAt,
					doGestor: true,
					autor: {
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
				autor: {
					nome: r.fiscalContrato?.nome ?? 'Fiscal',
					cargo: r.fiscalContrato?.cargo ?? '',
				},
			}
		})

		return NextResponse.json({
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
		})
	} catch (error) {
		console.error('Erro ao buscar mensagem do fiscal:', error)
		return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
	}
}
