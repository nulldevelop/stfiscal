'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
	cpf: z.string().length(11),
})

export async function cpfLookupAction(
	input: z.infer<typeof schema>,
): Promise<{ email?: string; error?: string }> {
	const parsed = schema.safeParse(input)
	if (!parsed.success) return { error: 'Dados inválidos' }

	const member = await prisma.member.findFirst({
		where: { fiscalCpf: parsed.data.cpf },
		select: { email: true },
	})

	if (!member) return { error: 'Credenciais inválidas' }

	return { email: member.email }
}
