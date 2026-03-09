'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

const schema = z.object({
	contratoId: z.string().min(1, 'Contrato é obrigatório'),
	numero: z.coerce.number().int().min(1, 'Número do empenho é obrigatório'),
	exercicio: z.coerce.number().int().min(2000, 'Exercício inválido'),
	data: z.coerce.date(),
	fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
	historico: z.string().optional(),
	valorEmpenhado: z.coerce.number().min(0, 'Valor deve ser positivo'),
	valorAnulado: z.coerce.number().min(0).default(0),
	valorLiquidado: z.coerce.number().min(0).default(0),
	valorRetido: z.coerce.number().min(0).default(0),
	valorPago: z.coerce.number().min(0).default(0),
	valorAPagar: z.coerce.number().min(0).default(0),
})

export const createEmpenhoAction = withPermission(
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
			const empenho = await prisma.empenho.create({
				data: {
					...parse.data,
					organizationId,
					origem: 'MANUAL',
				},
			})

			ctx.log({
				entityId: empenho.id,
				entityName: `Empenho ${empenho.numero}/${empenho.exercicio} - Contrato ${empenho.contratoId}`,
			})

			revalidatePath(`/dashboard-gestor/contratos/${parse.data.contratoId}`)
			return { success: true, data: empenho }
		} catch (error) {
			return {
				success: false,
				error: 'Erro ao criar o empenho. Verifique se o número/exercício já existe para este contrato.',
			}
		}
	},
	{
		module: 'gestor-contratos',
		log: 'EMPENHO',
	},
)
