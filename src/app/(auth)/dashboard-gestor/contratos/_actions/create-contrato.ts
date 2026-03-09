'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { Prisma } from '@/generated/prisma/client'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

const schema = z.object({
	licitacaoId: z.string().min(1, 'Licitação é obrigatória'),
	empresaId: z.string().min(1, 'Empresa é obrigatória'),
	numero: z.coerce.number().int().positive('Número deve ser positivo'),
	contratado: z.string().min(1, 'Contratado é obrigatório'),
	displayContrato: z.string().min(1, 'Identificação do contrato é obrigatória'),
	displayLicitacao: z
		.string()
		.min(1, 'Identificação da licitação é obrigatória'),
	dataInicio: z.coerce.date(),
	dataFim: z.coerce.date(),
	tipoAto: z.string().min(1, 'Tipo de ato é obrigatório'),
	exercicio: z.coerce.number().int().min(2000, 'Exercício inválido'),
	objeto: z.string().optional(),
	nomeFiscal: z.string().optional(),
})

export const createContratoAction = withPermission(
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
			const contrato = await prisma.contrato.create({
				data: {
					...parse.data,
					organizationId,
				},
			})

			ctx.log({
				entityId: contrato.id,
				entityName: contrato.displayContrato,
			})

			revalidatePath('/dashboard-gestor/contratos')
			return { success: true, data: contrato }
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				return {
					success: false,
					error:
						'Já existe um contrato com este número, tipo de ato e exercício.',
				}
			}
			return {
				success: false,
				error: 'Erro ao criar o contrato. Tente novamente.',
			}
		}
	},
	{
		module: 'gestor-contratos',
		log: 'CONTRATO',
	},
)
