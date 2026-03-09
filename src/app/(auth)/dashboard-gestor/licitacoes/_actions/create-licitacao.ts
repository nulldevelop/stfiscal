'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import {
	Prisma,
	SituacaoLicitacao,
	TipoLicitacao,
} from '@/generated/prisma/client'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

const schema = z.object({
	entidade: z.string().min(1, 'Entidade é obrigatória'),
	objeto: z.string().min(1, 'Objeto é obrigatório'),
	numero: z.coerce.number().int().positive('Número deve ser positivo'),
	ano: z.coerce.number().int().min(2000, 'Ano inválido'),
	situacao: z.nativeEnum(SituacaoLicitacao),
	modalidade: z.nativeEnum(TipoLicitacao),
	dataPublicacao: z.coerce.date(),
})

export const createLicitacaoAction = withPermission(
	'create',
	async (ctx, data: z.infer<typeof schema>) => {
		const { organizationId } = ctx

		const parse = schema.safeParse(data)

		if (!parse.success) {
			return {
				success: false,
				error: 'Dados inválidos',
				issues: parse.error.issues,
			}
		}

		try {
			const licitacao = await prisma.licitacao.create({
				data: {
					...parse.data,
					organizationId,
				},
			})

			ctx.log({
				entityId: licitacao.id,
				entityName: `${licitacao.numero}/${licitacao.ano} - ${licitacao.modalidade}`,
			})

			revalidatePath('/dashboard-gestor/licitacoes')
			return { success: true, data: licitacao }
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				return {
					success: false,
					error: 'Já existe uma licitação com este número, ano e modalidade.',
				}
			}
			return {
				success: false,
				error: 'Erro ao criar a licitação. Tente novamente.',
			}
		}
	},
	{
		module: 'gestor-licitacoes',
		log: 'LICITACAO',
	},
)
