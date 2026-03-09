import { z } from 'zod'

const nameField = z.string().min(2, 'Nome deve ter ao menos 2 caracteres')
const emailField = z.string().email('E-mail inválido')
const passwordField = z.string().min(6, 'Senha deve ter ao menos 6 caracteres')

const passwordsMatch = (d: { password: string; confirmPassword: string }) =>
	d.password === d.confirmPassword

const passwordRefine = {
	message: 'As senhas não conferem',
	path: ['confirmPassword'],
}

export const signUpSchemas = {
	email: z
		.object({
			name: nameField,
			identifier: emailField,
			email: z.string(),
			password: passwordField,
			confirmPassword: z.string(),
		})
		.refine(passwordsMatch, passwordRefine),

	username: z
		.object({
			name: nameField,
			identifier: z
				.string()
				.min(3, 'Username deve ter ao menos 3 caracteres')
				.regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
			email: emailField,
			password: passwordField,
			confirmPassword: z.string(),
		})
		.refine(passwordsMatch, passwordRefine),

	cpf: z
		.object({
			name: nameField,
			identifier: z.string().refine((v) => v.replace(/\D/g, '').length === 11, {
				message: 'CPF inválido',
			}),
			email: emailField,
			password: passwordField,
			confirmPassword: z.string(),
		})
		.refine(passwordsMatch, passwordRefine),
}
