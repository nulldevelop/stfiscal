import { prisma } from '../lib/prisma'
import { resolveMemberRole } from './resolve-member-role'

// Garante que o usuário tem um Member vinculado a uma organização ativa.
// Retorna o organizationId (existente ou recém-criado), ou null se não houver org.

// Chamada tanto no cadastro quanto no login — o login é a garantia definitiva.
export async function ensureMember(
	userId: string,
	email: string,
): Promise<{ organizationId: string } | null> {
	// Membro já existe — retorna sem fazer nada
	const existing = await prisma.member.findFirst({
		where: { userId },
		select: { organizationId: true },
	})
	if (existing) return existing

	const org = await prisma.organization.findFirst({
		where: { status: 'ACTIVE' },
		select: { id: true },
	})

	if (!org) {
		console.warn(
			'[ensureMember] Nenhuma organização ativa para vincular o usuário:',
			userId,
		)
		return null
	}

	const memberRole = resolveMemberRole(email)

	try {
		await prisma.member.create({
			data: {
				userId,
				organizationId: org.id,
				role: memberRole,
				email,
				createdAt: new Date(),
			},
		})
	} catch {
		// Race condition: outro processo criou o member ao mesmo tempo.
		// Tenta buscar o que foi criado concorrentemente antes de propagar erro.
		const concurrent = await prisma.member.findFirst({
			where: { userId },
			select: { organizationId: true },
		})
		if (concurrent) return concurrent
		throw new Error(`Falha ao criar member para o usuário ${userId}`)
	}

	return { organizationId: org.id }
}
