'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { prisma } from '@/lib/prisma'
import { updateLicitacao } from '@/lib/sync/services/licitacao-service'
import { withPermission } from '@/lib/permissions/with-permission'

const schema = z.object({
	id: z.string().min(1),
	entidade: z.string().min(2),
	objeto: z.string().min(2),
	numero: z.coerce.number().int().positive(),
	ano: z.coerce.number().int().positive(),
	situacao: z.enum([
		'AGUARDANDO',
		'ANDAMENTO',
		'CANCELADA',
		'CONCLUIDA',
		'SUSPENSA',
	]),
	modalidade: z.enum([
		'CONCORRENCIA',
		'TOMADA_DE_PRECO',
		'CONVITE',
		'PREGAO',
		'LEILAO',
	]),
	dataPublicacao: z.string().min(8),
})

export const updateLicitacaoAction = withPermission(
	'update',
	async (ctx, data: z.infer<typeof schema>) => {
		const { organizationId } = ctx

		const parsed = schema.safeParse(data)
		if (!parsed.success) {
			return { success: false, error: 'Dados inválidos' }
		}

		try {
			await updateLicitacao(parsed.data.id, organizationId, {
				entidade: parsed.data.entidade,
				objeto: parsed.data.objeto,
				numero: parsed.data.numero,
				ano: parsed.data.ano,
				situacao: parsed.data.situacao,
				modalidade: parsed.data.modalidade,
				dataPublicacao: new Date(parsed.data.dataPublicacao),
			})
			revalidatePath('/(private)/dashboard-gestor/licitacoes')
			return { success: true, data: null }
		} catch (err) {
			return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar' }
		}
	},
	{ module: 'gestor-licitacoes', log: 'LICITACAO' }
)
