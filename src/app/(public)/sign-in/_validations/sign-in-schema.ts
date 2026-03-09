import { z } from 'zod'

export const signInSchemas = {
	email: z.object({
		identifier: z.email('E-mail inválido'),
		password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
	}),
	username: z.object({
		identifier: z.string().min(3, 'Username deve ter ao menos 3 caracteres'),
		password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
	}),
	cpf: z.object({
		identifier: z
			.string()
			.refine((v) => v.replace(/\D/g, '').length === 11, {
				message: 'CPF inválido',
			}),
		password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
	}),
}
