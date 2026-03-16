/** biome-ignore-all lint/style/noNonNullAssertion:dev */
import { NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth-actions'
import { getPendingReportsEmailHtml, sendEmail } from '@/lib/email/mailer'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Envia emails para fiscais que possuem relatórios pendentes (>30 dias)
 * Pode ser chamado via CRON ou manualmente pelo gestor
 */
async function sendPendingReportsEmails(organizationId?: string): Promise<{
	totalEmails: number
	totalPendencias: number
	details: string[]
}> {
	const details: string[] = []
	let totalEmails = 0
	let totalPendencias = 0

	const whereOrg = organizationId
		? { id: organizationId, status: 'ACTIVE' as const }
		: { status: 'ACTIVE' as const }

	const organizations = await prisma.organization.findMany({
		where: whereOrg,
		select: { id: true, name: true },
	})

	for (const org of organizations) {
		// Buscar todos os fiscais ativos com contratos na organização
		const fiscais = await prisma.fiscalContrato.findMany({
			where: {
				organizationId: org.id,
				ativo: true,
				userId: { not: undefined },
			},
			select: {
				id: true,
				nome: true,
				userId: true,
				user: {
					select: { email: true, name: true },
				},
				contratos: {
					where: { ativo: true },
					select: {
						contrato: {
							select: {
								id: true,
								numero: true,
								displayContrato: true,
								contratado: true,
								empresa: { select: { name: true } },
							},
						},
					},
				},
			},
		})

		for (const fiscal of fiscais) {
			if (!fiscal.user?.email || fiscal.contratos.length === 0) continue

			const contratosPendentes: {
				numero: string
				contratado: string
				diasPendente: number
			}[] = []

			for (const link of fiscal.contratos) {
				const contrato = link.contrato

				// Buscar último relatório de qualquer tipo para este contrato
				const [lastBens, lastTransp, lastObras, lastTerc] = await Promise.all([
					prisma.bensEServicosReport.findFirst({
						where: { contratoId: contrato.id, organizationId: org.id },
						orderBy: { createdAt: 'desc' },
						select: { createdAt: true },
					}),
					prisma.transporteReport.findFirst({
						where: { contratoId: contrato.id, organizationId: org.id },
						orderBy: { createdAt: 'desc' },
						select: { createdAt: true },
					}),
					prisma.obrasReport.findFirst({
						where: { contratoId: contrato.id, organizationId: org.id },
						orderBy: { createdAt: 'desc' },
						select: { createdAt: true },
					}),
					prisma.terceirizacaoReport.findFirst({
						where: { contratoId: contrato.id, organizationId: org.id },
						orderBy: { createdAt: 'desc' },
						select: { createdAt: true },
					}),
				])

				// Encontrar o relatório mais recente
				const allReports = [lastBens, lastTransp, lastObras, lastTerc].filter(
					Boolean,
				)
				const lastReport = allReports.sort(
					(a, b) =>
						new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime(),
				)[0]

				// Calcular dias desde o último relatório
				const lastReportDate = lastReport?.createdAt
				const daysSinceLastReport = lastReportDate
					? Math.floor(
							(Date.now() - new Date(lastReportDate).getTime()) /
								(1000 * 60 * 60 * 24),
						)
					: 999

				if (daysSinceLastReport > 30) {
					contratosPendentes.push({
						numero: contrato.displayContrato || `${contrato.numero}`,
						contratado: contrato.empresa?.name || contrato.contratado || 'N/A',
						diasPendente:
							daysSinceLastReport === 999 ? 30 : daysSinceLastReport,
					})
				}
			}

			// Se tem contratos pendentes, enviar email
			if (contratosPendentes.length > 0) {
				try {
					await sendEmail({
						to: fiscal.user.email,
						subject: `Relatórios Pendentes - ${contratosPendentes.length} contrato(s) aguardando`,
						html: getPendingReportsEmailHtml(
							fiscal.user.name || fiscal.nome,
							contratosPendentes,
						),
					})
					totalEmails++
					totalPendencias += contratosPendentes.length
					details.push(
						`${fiscal.nome}: ${contratosPendentes.length} pendência(s)`,
					)
				} catch (error) {
					console.error(
						`[API] Falha ao enviar email para ${fiscal.user.email}:`,
						error,
					)
					details.push(`${fiscal.nome}: ERRO no envio`)
				}
			}
		}
	}

	return { totalEmails, totalPendencias, details }
}

// POST - Disparo manual pelo gestor
export async function POST() {
	try {
		const session = await getAuth()

		if (!session?.user) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		// Verificar se é gestor ou owner
		const member = await prisma.member.findFirst({
			where: { userId: session.user.id },
			select: { role: true, organizationId: true },
		})

		if (
			!member ||
			!['OWNER', 'ADMIN', 'GESTOR_CONTRATOS'].includes(member.role)
		) {
			return NextResponse.json(
				{ error: 'Sem permissão para esta ação' },
				{ status: 403 },
			)
		}

		console.log(
			`[API] Disparo manual de emails de pendências por ${session.user.email}`,
		)

		const result = await sendPendingReportsEmails(member.organizationId)

		return NextResponse.json({
			success: true,
			message: `${result.totalEmails} email(s) enviado(s) com ${result.totalPendencias} pendência(s) total`,
			data: result,
		})
	} catch (error) {
		console.error('[API] Erro ao enviar emails de pendências:', error)
		return NextResponse.json(
			{ error: 'Erro interno do servidor' },
			{ status: 500 },
		)
	}
}

// GET - Para uso via CRON externo (com validação de token)
export async function GET(request: Request) {
	const authHeader = request.headers.get('authorization')
	const cronSecret = process.env.CRON_SECRET

	// Se tiver CRON_SECRET configurado, validar
	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
	}

	try {
		console.log('[CRON-API] Executando envio de emails de pendências')
		const result = await sendPendingReportsEmails()

		return NextResponse.json({
			success: true,
			message: `${result.totalEmails} email(s) enviado(s)`,
			data: result,
		})
	} catch (error) {
		console.error('[CRON-API] Erro:', error)
		return NextResponse.json(
			{ error: 'Erro interno do servidor' },
			{ status: 500 },
		)
	}
}
