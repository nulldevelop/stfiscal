import { z } from 'zod'

const keyRegex = /^[a-z][a-z0-9_-]*$/

export const createModuleSchema = z.object({
	key: z
		.string()
		.min(1, 'Chave é obrigatória')
		.regex(
			keyRegex,
			'Chave deve conter apenas letras minúsculas, números, hífens e underscores',
		),
})

export type CreateModuleInput = z.infer<typeof createModuleSchema>

export const updateModuleSchema = z.object({
	oldKey: z.string().min(1),
	newKey: z
		.string()
		.min(1, 'Nova chave é obrigatória')
		.regex(
			keyRegex,
			'Chave deve conter apenas letras minúsculas, números, hífens e underscores',
		),
})

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
