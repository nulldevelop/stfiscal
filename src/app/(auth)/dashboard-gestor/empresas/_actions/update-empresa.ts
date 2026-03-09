'use server'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { prisma } from '@/lib/prisma'
import { updateEmpresa } from '@/lib/sync/services/empresa-service'
import { withPermission } from '@/lib/permissions/with-permission'

const MIN_NAME_LENGTH = 2
const MIN_CNPJ_LENGTH = 14

const schema = z.object({
	id: z.string().min(1),
	name: z.string().min(MIN_NAME_LENGTH),
	cnpj: z.string().min(MIN_CNPJ_LENGTH),
	endereco: z.string().optional(),
	representanteNome: z.string().optional(),
	representanteRg: z.string().optional(),
	representanteCpf: z.string().optional(),
})

export const updateEmpresaAction = withPermission(
	'update',
	async (ctx, data: z.infer<typeof schema>) => {
		const { organizationId } = ctx

		const parse = schema.safeParse(data)
		if (!parse.success) {
			return { success: false, error: 'Dados inválidos' }
		}

		try {
			await updateEmpresa(parse.data.id, organizationId, {
				name: parse.data.name,
				cnpj: parse.data.cnpj,
				endereco: parse.data.endereco,
				representanteNome: parse.data.representanteNome,
				representanteRg: parse.data.representanteRg,
				representanteCpf: parse.data.representanteCpf,
			})

			ctx.log({
				entityId: parse.data.id,
				entityName: parse.data.name,
			})

			revalidatePath('/dashboard-gestor/empresas')
			return { success: true as const, data: null }
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Erro ao atualizar',
			}
		}
	},
	{
		module: 'gestor-empresas',
		log: 'EMPRESA',
	},
)
