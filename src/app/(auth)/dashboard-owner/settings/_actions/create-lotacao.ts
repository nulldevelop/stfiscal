'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/permission'
import { prisma } from '@/lib/prisma'
import { lotacaoSchema } from '../_schemas/lotacoes.schema'

export const createLotacao = withPermission(
	'create',
	async (ctx, name: string) => {
		try {
			const parsed = lotacaoSchema.safeParse({ name })

			if (!parsed.success) {
				return { success: false, error: parsed.error.issues[0].message }
			}

			const existing = await prisma.lotacoes.findFirst({
				where: { name: parsed.data.name, organizationId: ctx.organizationId },
			})

			if (existing) {
				return { success: false, error: 'Já existe uma lotação com esse nome' }
			}

			const lotacao = await prisma.lotacoes.create({
				data: {
					name: parsed.data.name,
					organizationId: ctx.organizationId,
				},
			})

			revalidatePath('/dashboard-owner/settings')
			return { success: true, data: lotacao }
		} catch (error) {
			console.error('createLotacao error:', error)
			return { success: false, error: 'Erro ao criar lotação' }
		}
	},
	{ module: 'owner' },
)
