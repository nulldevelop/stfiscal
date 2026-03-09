import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureMember } from '@/utils/ensure-member'

function getDashboardForRole(role: string): string {
	switch (role) {
		case 'OWNER':
			return '/dashboard-owner'
		case 'ADMIN':
			return '/dashboard-gestor'
		case 'GESTOR_CONTRATOS':
			return '/dashboard-gestor'
		case 'FISCAL_PRINCIPAL':
			return '/dashboard-fiscal'
		case 'FISCAL_SETORIAL':
			return '/dashboard-fiscal'
		default:
			return '/'
	}
}

// Página de callback pós-OAuth. Roda no servidor e garante que o member
// e o activeOrganizationId estejam criados antes de redirecionar.
export default async function AuthCallbackPage() {
	const sessionData = await auth.api.getSession({
		headers: await headers(),
	})

	if (!sessionData?.user) {
		redirect('/')
	}

	const result = await ensureMember(
		sessionData.user.id,
		sessionData.user.email.toLowerCase(),
	)

	if (!result) {
		redirect('/')
	}

	// Garante que o activeOrganizationId está na sessão
	await prisma.session
		.update({
			where: { id: sessionData.session.id },
			data: { activeOrganizationId: result.organizationId },
		})
		.catch(() => null)

	const member = await prisma.member.findFirst({
		where: {
			userId: sessionData.user.id,
			organizationId: result.organizationId,
		},
		select: { role: true },
	})

	if (!member) {
		redirect('/')
	}

	redirect(getDashboardForRole(member.role))
}
