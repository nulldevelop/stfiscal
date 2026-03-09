import { z } from 'zod'

export const lotacaoSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
})

export type LotacaoFormValues = z.infer<typeof lotacaoSchema>
