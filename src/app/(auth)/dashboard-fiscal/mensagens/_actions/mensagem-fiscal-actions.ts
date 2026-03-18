'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

// Schema para responder mensagem
const responderMensagemSchema = z.object({
	mensagemId: z.string().min(1, 'ID da mensagem é obrigatório'),
	conteudo: z.string().min(2, 'Resposta deve ter pelo menos 5 caracteres'),
})

export type ResponderMensagemInput = z.infer<typeof responderMensagemSchema>

// Responder uma mensagem
export async function responderMensagemAction(data: ResponderMensagemInput) {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return { success: false, error: 'Usuário não autenticado.' }
	}

	const parse = responderMensagemSchema.safeParse(data)
	if (!parse.success) {
		return { success: false, error: parse.error.issues[0]?.message || 'Dados inválidos.' }
	}

	const { mensagemId, conteudo } = parse.data

	try {
		// Buscar o fiscal associado ao usuário
		const fiscal = await prisma.fiscalContrato.findFirst({
			where: {
				userId,
				organizationId,
				ativo: true,
			},
		})

		if (!fiscal) {
			return { success: false, error: 'Fiscal não encontrado.' }
		}

		// Verificar se o fiscal é destinatário da mensagem
		const destinatario = await prisma.destinatarioMensagem.findFirst({
			where: {
				mensagemId,
				fiscalContratoId: fiscal.id,
			},
		})

		if (!destinatario) {
			return { success: false, error: 'Você não é destinatário desta mensagem.' }
		}

		// Criar resposta
		await prisma.respostaMensagem.create({
			data: {
				mensagemId,
				fiscalContratoId: fiscal.id,
				conteudo,
			},
		})

		revalidatePath('/dashboard-fiscal/mensagens')
		revalidatePath(`/dashboard-fiscal/mensagens/${mensagemId}`)
		return { success: true, data: null }
	} catch (error) {
		console.error('Erro ao responder mensagem:', error)
		return { success: false, error: 'Ocorreu um erro ao enviar a resposta.' }
	}
}

// Marcar mensagem como lida
export async function marcarMensagemLidaAction(mensagemId: string) {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return { success: false, error: 'Usuário não autenticado.' }
	}

	if (!mensagemId) {
		return { success: false, error: 'ID da mensagem é obrigatório.' }
	}

	try {
		// Buscar o fiscal associado ao usuário
		const fiscal = await prisma.fiscalContrato.findFirst({
			where: {
				userId,
				organizationId,
				ativo: true,
			},
		})

		if (!fiscal) {
			return { success: false, error: 'Fiscal não encontrado.' }
		}

		// Atualizar destinatário como lido
		await prisma.destinatarioMensagem.updateMany({
			where: {
				mensagemId,
				fiscalContratoId: fiscal.id,
				lida: false,
			},
			data: {
				lida: true,
				lidaEm: new Date(),
			},
		})

		revalidatePath('/dashboard-fiscal/mensagens')
		revalidatePath('/dashboard-gestor/mensagens')
		return { success: true, data: null }
	} catch (error) {
		console.error('Erro ao marcar mensagem como lida:', error)
		return { success: false, error: 'Ocorreu um erro ao marcar a mensagem.' }
	}
}
