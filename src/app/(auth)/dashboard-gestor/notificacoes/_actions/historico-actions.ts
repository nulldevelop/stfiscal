'use server'

import { revalidatePath } from 'next/cache'
import type {
	TipoHistoricoNotificacao,
	TipoNotificacaoRef,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

export interface CreateHistoricoInput {
	notificacaoId: string
	tipoNotificacao: TipoNotificacaoRef
	tipo: TipoHistoricoNotificacao
	titulo: string
	descricao?: string
	anexoPath?: string
	anexoNome?: string
}

export const createHistorico = withPermission(
	'create',
	async (ctx, input: CreateHistoricoInput) => {
		const { userId, organizationId } = ctx

		try {
			const historico = await prisma.notificacaoHistorico.create({
				data: {
					notificacaoId: input.notificacaoId,
					tipoNotificacao: input.tipoNotificacao,
					organizationId,
					userId,
					tipo: input.tipo,
					titulo: input.titulo,
					descricao: input.descricao,
					anexoPath: input.anexoPath,
					anexoNome: input.anexoNome,
				},
				include: {
					user: { select: { name: true } },
				},
			})

			revalidatePath('/(private)/dashboard-gestor/notificacoes')

			return { success: true, data: historico }
		} catch (error) {
			console.error('Erro ao criar histórico:', error)
			return { success: false, error: 'Erro ao criar histórico' }
		}
	},
	{ module: 'gestor-notificacoes', log: 'HISTORICO_NOTIFICACAO' }
)

export const getHistoricoByNotificacao = withPermission(
	'read',
	async (ctx, notificacaoId: string, tipoNotificacao: TipoNotificacaoRef) => {
		const { organizationId } = ctx

		try {
			const historicos = await prisma.notificacaoHistorico.findMany({
				where: {
					notificacaoId,
					tipoNotificacao,
					organizationId,
				},
				orderBy: { createdAt: 'desc' },
				include: {
					user: { select: { name: true } },
				},
			})

			return { success: true, data: historicos }
		} catch (error) {
			console.error('Erro ao buscar histórico:', error)
			return { success: false, error: 'Erro ao buscar histórico' }
		}
	},
	'gestor-notificacoes'
)

export const deleteHistorico = withPermission(
	'delete',
	async (ctx, historicoId: string) => {
		const { organizationId } = ctx

		try {
			await prisma.notificacaoHistorico.delete({
				where: {
					id: historicoId,
					organizationId,
				},
			})

			revalidatePath('/(private)/dashboard-gestor/notificacoes')

			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao deletar histórico:', error)
			return { success: false, error: 'Erro ao deletar histórico' }
		}
	},
	{ module: 'gestor-notificacoes', log: 'HISTORICO_NOTIFICACAO' }
)
