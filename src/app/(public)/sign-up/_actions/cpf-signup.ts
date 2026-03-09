'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
	cpf: z.string().length(11),
	email: z.string().email(),
	name: z.string().min(2),
	password: z.string().min(6),
})

type Input = z.infer<typeof schema>

export async function cpfSignUpAction(
	input: Input,
): Promise<{ error?: string }> {
	const parsed = schema.safeParse(input)
	if (!parsed.success) return { error: 'Dados inválidos' }

	const { cpf, email, name, password } = parsed.data

	const existing = await prisma.member.findFirst({ where: { fiscalCpf: cpf } })
	if (existing) return { error: 'CPF já cadastrado' }

	try {
		const result = await auth.api.signUpEmail({
			body: { email, password, name },
			headers: await headers(),
		})

		if (!result?.user?.id) return { error: 'Erro ao criar conta' }

		await prisma.member.updateMany({
			where: { userId: result.user.id },
			data: { fiscalCpf: cpf },
		})

		return {}
	} catch (err) {
		const message =
			err instanceof Error && err.message.toLowerCase().includes('already')
				? 'E-mail já cadastrado'
				: 'Erro interno'
		return { error: message }
	}
}
