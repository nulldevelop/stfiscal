import { z } from 'zod'

export const organizationSchema = z.object({
	name: z
		.string()
		.min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
	slug: z
		.string()
		.min(3, { message: 'O slug deve ter pelo menos 3 caracteres' })
		.transform((value) => value.toLowerCase().replace(/\s+/g, '-')),
	logo: z.string().optional(),
	email: z.string().email({ message: 'Informe um e-mail válido' }),
	telefone: z
		.string()
		.min(11, { message: 'O telefone deve ter pelo menos 11 caracteres' }),
	cnpj: z
		.string()
		.min(14, { message: 'O CNPJ deve ter pelo menos 14 caracteres' }),
	status: z.enum(['ACTIVE', 'DESACTIVE', 'TRIAL']),
	cidade: z.string().optional(),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>
