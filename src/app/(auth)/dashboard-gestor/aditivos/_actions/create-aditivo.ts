'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

const schema = z.object({
	contratoId: z.string().min(1, 'Contrato é obrigatório'),
	sequencia: z.coerce.number().int().min(1, 'Sequência deve ser pelo menos 1'),
	data: z.coerce.date(),
	dataPublicacao: z.coerce.date().optional(),
	dataTermino: z.coerce.date().optional(),
	valorAditivo: z.coerce.number().optional(),
	motivacao: z.string().optional(),
})

export const createAditivoAction = withPermission(
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
			const aditivo = await prisma.aditivo.create({
				data: {
					...parse.data,
					organizationId,
				}
			})

			ctx.log({
				entityId: aditivo.id,
				entityName: `Aditivo ${aditivo.sequencia} - Contrato ${aditivo.contratoId}`,
			})

			revalidatePath(`/dashboard-gestor/contratos/${parse.data.contratoId}`)
			revalidatePath('/dashboard-gestor/aditivos')
			return { success: true, data: aditivo }
		} catch (error) {
			return {
				success: false,
				error: 'Erro ao criar o aditivo. Verifique se a sequência já existe para este contrato.',
			}
		}
	},
	{
		module: 'gestor-contratos',
		log: 'ADITIVO',
	},
)
