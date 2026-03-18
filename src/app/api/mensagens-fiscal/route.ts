import { type NextRequest, NextResponse } from 'next/server'
import { StatusMensagem } from '@/generated/prisma/enums'
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
	const lida =
		(searchParams.get('lida') as 'todas' | 'lidas' | 'nao_lidas') || 'todas'

	try {
		const fiscal = await prisma.fiscalContrato.findFirst({
			where: { userId, organizationId, ativo: true },
		})

		if (!fiscal) {
			return NextResponse.json({ mensagens: [], total: 0, naoLidas: 0 })
		}

		const lidaFilter =
			lida === 'lidas' ? true : lida === 'nao_lidas' ? false : undefined

		const mensagemFilter = search
			? {
					status: StatusMensagem.ATIVA,
					OR: [
						{ assunto: { contains: search } },
						{ conteudo: { contains: search } },
					],
				}
			: { status: StatusMensagem.ATIVA }

		const baseWhere = {
			fiscalContratoId: fiscal.id,
			...(lidaFilter !== undefined && { lida: lidaFilter }),
			mensagem: mensagemFilter,
		}

		const [total, naoLidas, destinatarios] = await Promise.all([
			prisma.destinatarioMensagem.count({ where: baseWhere }),
			prisma.destinatarioMensagem.count({
				where: {
					fiscalContratoId: fiscal.id,
					lida: false,
					mensagem: { status: StatusMensagem.ATIVA },
				},
			}),
			prisma.destinatarioMensagem.findMany({
				where: baseWhere,
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
							contrato: { select: { displayContrato: true } },
							respostas: {
								where: { fiscalContratoId: fiscal.id },
								select: { id: true },
							},
						},
					},
				},
				orderBy: [{ lida: 'asc' }, { mensagem: { createdAt: 'desc' } }],
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
		])

		const mensagens = destinatarios.map((d) => ({
			id: d.mensagem.id,
			assunto: d.mensagem.assunto,
			conteudo: d.mensagem.conteudo,
			tipo: d.mensagem.tipo,
			createdAt: d.mensagem.createdAt,
			lida: d.lida,
			lidaEm: d.lidaEm,
			remetente: { nome: d.mensagem.remetente.name },
			totalRespostas: d.mensagem.respostas.length,
			contratoDisplay: d.mensagem.contrato?.displayContrato ?? null,
		}))

		return NextResponse.json({ mensagens, total, naoLidas })
	} catch (error) {
		console.error('Erro ao buscar mensagens do fiscal:', error)
		return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
	}
}
