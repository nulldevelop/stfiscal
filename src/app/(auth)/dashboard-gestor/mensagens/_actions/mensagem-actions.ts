'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { StatusMensagem, TipoMensagem } from '@/generated/prisma/enums'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

// Schema para criar mensagem
const criarMensagemSchema = z.object({
	assunto: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
	conteudo: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
	tipo: z.enum(TipoMensagem),
	destinatariosIds: z
		.array(z.string())
		.min(1, 'Selecione pelo menos um destinatário'),
	contratoId: z.string().optional().nullable(),
})

export type CriarMensagemInput = z.infer<typeof criarMensagemSchema>

// Criar nova mensagem
export const criarMensagemAction = withPermission(
	'create',
	async (ctx, data: CriarMensagemInput) => {
		const { organizationId, userId } = ctx

		const parse = criarMensagemSchema.safeParse(data)
		if (!parse.success) {
			return {
				success: false,
				error: parse.error.issues[0]?.message || 'Dados inválidos.',
			}
		}

		const { assunto, conteudo, tipo, destinatariosIds, contratoId } = parse.data

		try {
			// Verificar se os fiscais existem e pertencem à organização
			const fiscaisValidos = await prisma.fiscalContrato.findMany({
				where: {
					id: { in: destinatariosIds },
					organizationId,
					ativo: true,
				},
				select: { id: true },
			})

			if (fiscaisValidos.length === 0) {
				return { success: false, error: 'Nenhum fiscal válido selecionado.' }
			}

			// Criar mensagem com destinatários
			const mensagem = await prisma.mensagemInterna.create({
				data: {
					organizationId,
					remetenteId: userId,
					assunto,
					conteudo,
					tipo,
					contratoId: contratoId || null,
					destinatarios: {
						create: fiscaisValidos.map((fiscal) => ({
							fiscalContratoId: fiscal.id,
						})),
					},
				},
				include: {
					destinatarios: {
						include: {
							fiscalContrato: { select: { nome: true } },
						},
					},
				},
			})

			ctx.log({
				entityId: mensagem.id,
				entityName: assunto,
				description: `Mensagem enviada para ${fiscaisValidos.length} fiscal(is)`,
			})

			revalidatePath('/dashboard-gestor/mensagens')
			return { success: true, data: mensagem }
		} catch (error) {
			console.error('Erro ao criar mensagem:', error)
			return { success: false, error: 'Ocorreu um erro ao enviar a mensagem.' }
		}
	},
	{ module: 'mensagens-internas', log: 'MENSAGEM' },
)

// Arquivar mensagem
export const arquivarMensagemAction = withPermission(
	'update',
	async (ctx, mensagemId: string) => {
		const { organizationId } = ctx

		if (!mensagemId) {
			return { success: false, error: 'ID da mensagem é obrigatório.' }
		}

		try {
			const mensagem = await prisma.mensagemInterna.findFirst({
				where: { id: mensagemId, organizationId },
			})

			if (!mensagem) {
				return { success: false, error: 'Mensagem não encontrada.' }
			}

			await prisma.mensagemInterna.update({
				where: { id: mensagemId },
				data: { status: StatusMensagem.ARQUIVADA },
			})

			ctx.log({
				entityId: mensagemId,
				entityName: mensagem.assunto,
				description: 'Mensagem arquivada',
			})

			revalidatePath('/dashboard-gestor/mensagens')
			revalidatePath('/dashboard-fiscal/mensagens')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao arquivar mensagem:', error)
			return {
				success: false,
				error: 'Ocorreu um erro ao arquivar a mensagem.',
			}
		}
	},
	{ module: 'mensagens-internas', log: 'MENSAGEM' },
)

// Marcar respostas como lidas (aceita um único ID ou um array de IDs)
export const marcarRespostaLidaAction = withPermission(
	'update',
	async (ctx, respostaIds: string | string[]) => {
		const { organizationId } = ctx

		const ids = Array.isArray(respostaIds) ? respostaIds : [respostaIds]

		if (ids.length === 0) {
			return { success: false, error: 'ID da resposta é obrigatório.' }
		}

		try {
			await prisma.respostaMensagem.updateMany({
				where: {
					id: { in: ids },
					lidaPeloRemetente: false,
					mensagem: { organizationId },
				},
				data: {
					lidaPeloRemetente: true,
					lidaEm: new Date(),
				},
			})

			revalidatePath('/dashboard-gestor/mensagens')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao marcar respostas como lidas:', error)
			return {
				success: false,
				error: 'Ocorreu um erro ao marcar as respostas.',
			}
		}
	},
	{ module: 'mensagens-internas' },
)

// Gestor responde no chat da mensagem
export const responderMensagemGestorAction = withPermission(
	'create',
	async (ctx, data: { mensagemId: string; conteudo: string }) => {
		const { organizationId, userId } = ctx

		if (!data.mensagemId || !data.conteudo?.trim()) {
			return { success: false, error: 'Dados inválidos.' }
		}

		try {
			const mensagem = await prisma.mensagemInterna.findFirst({
				where: { id: data.mensagemId, organizationId, remetenteId: userId },
			})

			if (!mensagem) {
				return { success: false, error: 'Mensagem não encontrada.' }
			}

			const resposta = await prisma.respostaMensagem.create({
				data: {
					mensagemId: data.mensagemId,
					autorGestorId: userId,
					conteudo: data.conteudo.trim(),
					// respostas do gestor já são "lidas" por ele mesmo
					lidaPeloRemetente: true,
				},
			})

			revalidatePath(`/dashboard-gestor/mensagens/${data.mensagemId}`)
			return { success: true, data: resposta }
		} catch (error) {
			console.error('Erro ao responder mensagem:', error)
			return { success: false, error: 'Ocorreu um erro ao enviar a resposta.' }
		}
	},
	{ module: 'mensagens-internas' },
)

// Buscar fiscais por contrato
export const buscarFiscaisPorContratoAction = withPermission(
	'read',
	async (ctx, contratoId: string) => {
		const { organizationId } = ctx

		if (!contratoId) {
			return { success: false, error: 'ID do contrato é obrigatório.' }
		}

		try {
			const fiscaisDoContrato = await prisma.fiscalContratoLink.findMany({
				where: {
					contratoId,
					ativo: true,
					fiscalContrato: {
						organizationId,
						ativo: true,
					},
				},
				select: {
					fiscalContrato: {
						select: {
							id: true,
							nome: true,
							cargo: true,
						},
					},
				},
			})

			const fiscais = fiscaisDoContrato.map((f) => f.fiscalContrato)

			return { success: true, data: fiscais }
		} catch (error) {
			console.error('Erro ao buscar fiscais do contrato:', error)
			return { success: false, error: 'Ocorreu um erro ao buscar os fiscais.' }
		}
	},
	{ module: 'mensagens-internas' },
)
