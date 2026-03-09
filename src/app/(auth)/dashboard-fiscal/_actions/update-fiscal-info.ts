'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

const schema = z.object({
	cpf: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres'),
	matricula: z.string().min(1, 'Matrícula é obrigatória'),
	portaria: z.string().min(1, 'Portaria é obrigatória'),
	contato: z.string().min(1, 'Contato é obrigatório'),
})

export const updateFiscalInfoAction = withPermission(
	'update',
	async (ctx, data: z.infer<typeof schema>) => {
		const parse = schema.safeParse(data)
		if (!parse.success) {
			return { success: false, error: 'Dados inválidos' }
		}

		try {
			const { userId, organizationId } = ctx

			// Verificar se o CPF já está em uso por outro fiscal
			const existingFiscal = await prisma.fiscalContrato.findFirst({
				where: {
					cpf: parse.data.cpf,
					organizationId,
					NOT: { userId },
				},
			})

			if (existingFiscal) {
				return {
					success: false,
					error: 'Este CPF já está em uso por outro fiscal.',
				}
			}

			// Atualizar todos os registros de FiscalContrato do usuário
			await prisma.fiscalContrato.updateMany({
				where: {
					userId,
					organizationId,
				},
				data: {
					cpf: parse.data.cpf,
					matricula: parse.data.matricula,
					portaria: parse.data.portaria,
					contato: parse.data.contato,
				},
			})

			// Atualizar também os dados no Member
			await prisma.member.updateMany({
				where: {
					userId,
					organizationId,
				},
				data: {
					fiscalCpf: parse.data.cpf,
					fiscalMatricula: parse.data.matricula,
					fiscalContato: parse.data.contato,
				},
			})

			revalidatePath('/(fiscal)/dashboard-fiscal')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao atualizar dados do fiscal:', error)
			return { success: false, error: 'Erro ao atualizar dados' }
		}
	},
	{
		module: 'DadosFiscais',
		log: 'FISCAL_INFO',
	},
)
