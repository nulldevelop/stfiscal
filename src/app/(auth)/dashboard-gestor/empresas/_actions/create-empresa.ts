'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { createEmpresa } from '@/lib/sync/services/empresa-service'
import { withPermission } from '@/lib/permissions/with-permission'

const MIN_NAME_LENGTH = 2
const CNPJ_DIGITS_LENGTH = 14

const schema = z.object({
	name: z
		.string()
		.min(MIN_NAME_LENGTH, {
			message: 'O nome deve ter pelo menos 2 caracteres.',
		})
		.trim(),
	cnpj: z
		.string()
		.length(CNPJ_DIGITS_LENGTH, {
			message: 'O CNPJ deve conter exatamente 14 dígitos.',
		})
		.regex(/^\d+$/, { message: 'O CNPJ deve conter apenas números.' }),
	endereco: z.string().optional(),
	telefone: z.string().optional().transform(v => v ? v.replace(/[^\d]/g, '') : v),
	representanteNome: z.string().optional(),
	representanteRg: z.string().optional(),
	representanteCpf: z.string().optional().transform(v => v ? v.replace(/[^\d]/g, '') : v),
	representanteTelefone: z.string().optional().transform(v => v ? v.replace(/[^\d]/g, '') : v),
})

export const createEmpresaAction = withPermission(
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
			const empresa = await prisma.empresas.create({
				data: {
					name: parse.data.name,
					cnpj: parse.data.cnpj,
					endereco: parse.data.endereco,
					telefone: parse.data.telefone,
					representanteNome: parse.data.representanteNome,
					representanteRg: parse.data.representanteRg,
					representanteCpf: parse.data.representanteCpf,
					representanteTelefone: parse.data.representanteTelefone,
					organizationId,
				}
			})

			ctx.log({
				entityId: empresa.id,
				entityName: empresa.name,
			})

			revalidatePath('/dashboard-gestor/empresas')
			return { success: true, data: empresa }
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				const target = (error.meta?.target as string[])?.join(', ')
				if (target?.includes('cnpj')) {
					return {
						success: false,
						error: 'Este CNPJ já está cadastrado em nossa base de dados.',
					}
				}
			}
			return {
				success: false,
				error: 'Erro ao criar a empresa. Tente novamente.',
			}
		}
	},
	{
		module: 'gestor-empresas',
		log: 'EMPRESA',
	},
)
