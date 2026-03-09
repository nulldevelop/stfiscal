'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
	id: z.string().min(1, 'ID do usuário é obrigatório'),
	name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
	email: z.string().email('Email inválido'),
	cpf: z.string().min(11, 'CPF deve ter 11 caracteres'),
	matricula: z.string().min(1, 'Matrícula é obrigatória'),
	cargo: z.string().min(1, 'Cargo é obrigatório'),
	contato: z.string().optional(),
})

export const updateFiscalAction = withPermission(
	'update',
	async (ctx, data: z.infer<typeof updateSchema>) => {
		const { organizationId } = ctx

		const parse = updateSchema.safeParse(data)
		if (!parse.success) {
			return { success: false, error: 'Dados inválidos.' }
		}

		const {
			id: userId,
			name,
			email,
			cpf,
			matricula,
			cargo,
			contato,
		} = parse.data

		try {
			const userToUpdate = await prisma.user.findFirst({
				where: { id: userId, members: { some: { organizationId } } },
				include: { fiscais: { where: { organizationId }, take: 1 } },
			})

			if (!userToUpdate) {
				return { success: false, error: 'Fiscal não encontrado.' }
			}

			if (email !== userToUpdate.email) {
				const existingUser = await prisma.user.findUnique({ where: { email } })
				if (existingUser) {
					return { success: false, error: 'Este email já está em uso.' }
				}
			}

			if (cpf !== userToUpdate.fiscais[0]?.cpf) {
				const existingFiscal = await prisma.fiscalContrato.findFirst({
					where: { cpf, organizationId, NOT: { userId } },
				})
				if (existingFiscal) {
					return {
						success: false,
						error: 'Este CPF já está em uso por outro fiscal.',
					}
				}
			}

			await prisma.$transaction([
				prisma.user.update({
					where: { id: userId },
					data: { name, email },
				}),
				prisma.member.update({
					where: { userId_organizationId: { userId, organizationId } },
					data: {
						fiscalCpf: cpf,
						fiscalMatricula: matricula,
						fiscalCargo: cargo,
						fiscalContato: contato,
					},
				}),
				prisma.fiscalContrato.updateMany({
					where: { userId, organizationId },
					data: { nome: name, cpf, matricula, cargo, contato },
				}),
			])

			revalidatePath('/dashboard-gestor/fiscais')
			return { success: true, data: null }
		} catch (error) {
			console.error('Erro ao atualizar fiscal:', error)
			return { success: false, error: 'Ocorreu um erro ao atualizar o fiscal.' }
		}
	},
	{ module: 'gestor-fiscais', log: 'FISCAL' },
)
