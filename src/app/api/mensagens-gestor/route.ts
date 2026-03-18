import { type NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	const { userId, organizationId } = await getAuth()

	if (!userId || !organizationId) {
		return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
	}

	const { searchParams } = request.nextUrl
	const page = Number(searchParams.get('page')) || 1
	const pageSize = Number(searchParams.get('pageSize')) || 10
	const search = searchParams.get('search') || ''
	const status =
		(searchParams.get('status') as 'ATIVA' | 'ARQUIVADA' | 'todas') || 'ATIVA'

	try {
		const whereClause = {
			organizationId,
			remetenteId: userId,
			...(status !== 'todas' && { status }),
			...(search && {
				OR: [
					{ assunto: { contains: search } },
					{ conteudo: { contains: search } },
				],
			}),
		}

		const [total, mensagens] = await Promise.all([
			prisma.mensagemInterna.count({ where: whereClause }),
			prisma.mensagemInterna.findMany({
				where: whereClause,
				select: {
					id: true,
					assunto: true,
					conteudo: true,
					tipo: true,
					status: true,
					createdAt: true,
					contratoId: true,
					contrato: {
						select: { displayContrato: true, contratado: true },
					},
					destinatarios: {
						select: {
							lida: true,
							fiscalContrato: { select: { nome: true } },
						},
					},
					respostas: {
						select: { lidaPeloRemetente: true },
					},
				},
				orderBy: { createdAt: 'desc' },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
		])

		const mensagensFormatadas = mensagens.map((m) => ({
			id: m.id,
			assunto: m.assunto,
			conteudo: m.conteudo,
			tipo: m.tipo,
			status: m.status,
			createdAt: m.createdAt,
			contratoId: m.contratoId,
			contratoDisplay: m.contrato?.displayContrato || null,
			contratoNome: m.contrato?.contratado || null,
			destinatariosNomes: m.destinatarios.map((d) => d.fiscalContrato.nome),
			totalDestinatarios: m.destinatarios.length,
			totalLidas: m.destinatarios.filter((d) => d.lida).length,
			totalRespostas: m.respostas.length,
			respostasNaoLidas: m.respostas.filter((r) => !r.lidaPeloRemetente).length,
		}))

		return NextResponse.json({ mensagens: mensagensFormatadas, total })
	} catch (error) {
		console.error('Erro ao buscar mensagens:', error)
		return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
	}
}
