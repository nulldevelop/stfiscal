import cron from 'node-cron'
import { syncOrganization, syncOrganizationEmpenhos } from '@/lib/sync/utils'
import { getPendingReportsEmailHtml, sendEmail } from '../email/mailer'
import { prisma } from '../prisma'
import { invalidateContratosCache } from '../query-client'

let schedulerStarted = false

/**
 * Envia emails para fiscais que possuem relatórios pendentes (>30 dias)
 */
async function sendPendingReportsEmails(): Promise<void> {
	console.log('[Cron-Email] Buscando fiscais com relatórios pendentes...')

	const organizations = await prisma.organization.findMany({
		where: { status: 'ACTIVE' },
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

				// Calcular dias desde o último relatório (ou desde sempre se não houver)
				const lastReportDate = lastReport?.createdAt
				const daysSinceLastReport = lastReportDate
					? Math.floor(
							(Date.now() - new Date(lastReportDate).getTime()) /
								(1000 * 60 * 60 * 24),
						)
					: 999 // Se nunca teve relatório, considerar como muito pendente

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
					console.log(
						`[Cron-Email] Email enviado para ${fiscal.user.email} - ${contratosPendentes.length} pendência(s)`,
					)
				} catch (error) {
					console.error(
						`[Cron-Email] Falha ao enviar email para ${fiscal.user.email}:`,
						error,
					)
				}
			}
		}
	}

	console.log('[Cron-Email] Envio de emails de pendências concluído')
}

/**
 * Inicia o agendador de tarefas.
 * Roda apenas uma vez no processo do servidor (singleton).
 *  - 03:00 → contratos, licitações, fiscais e aditivos
 *  - 04:00 → empenhos (sync separado, mais pesado em API calls)
 *  - 08:00 → emails de relatórios pendentes (seg-sex)
 */
export function startScheduler(): void {
	if (schedulerStarted) return
	schedulerStarted = true

	// Todos os dias às 03:00 — contratos/licitações/fiscais/aditivos
	cron.schedule('0 3 * * *', async () => {
		console.log(
			'[Cron] Iniciando sincronização diária de contratos —',
			new Date().toISOString(),
		)

		invalidateContratosCache()
		console.log('[Cron] Cache de contratos invalidado')

		try {
			const organizations = await prisma.organization.findMany({
				where: {
					status: 'ACTIVE',
					apiUrlContratos: { not: null },
					apiUrlLicitacoes: { not: null },
					apiUrlFiscais: { not: null },
					apiUrlAditivos: { not: null },
				},
				select: { id: true, name: true },
			})

			for (const org of organizations) {
				console.log(`[Cron] Sincronizando organização: ${org.name}`)
				const result = await syncOrganization(org.id)
				console.log(
					`[Cron] ${org.name}: ${result.success ? '✅' : '❌'} ${result.message}`,
				)
			}

			console.log('[Cron] Sincronização concluída —', new Date().toISOString())
		} catch (error) {
			console.error('[Cron] Erro na sincronização:', error)
		}
	})

	// Todos os dias às 04:00 — empenhos (separado para não atrasar o sync principal)
	cron.schedule('0 4 * * *', async () => {
		console.log(
			'[Cron] Iniciando sincronização de empenhos —',
			new Date().toISOString(),
		)

		try {
			const organizations = await prisma.organization.findMany({
				where: {
					status: 'ACTIVE',
					apiUrlContratos: { not: null },
				},
				select: { id: true, name: true },
			})

			for (const org of organizations) {
				console.log(`[Cron-Emp] Sincronizando empenhos: ${org.name}`)
				const result = await syncOrganizationEmpenhos(org.id)
				console.log(
					`[Cron-Emp] ${org.name}: ${result.success ? '✅' : '❌'} ${result.message}`,
				)
			}

			console.log('[Cron-Emp] Empenhos concluídos —', new Date().toISOString())
		} catch (error) {
			console.error('[Cron-Emp] Erro na sincronização de empenhos:', error)
		}
	})

	// Segunda a sexta às 08:00 — emails de relatórios pendentes
	cron.schedule('0 8 * * 1-5', async () => {
		console.log(
			'[Cron-Email] Iniciando envio de emails de pendências —',
			new Date().toISOString(),
		)

		try {
			await sendPendingReportsEmails()
		} catch (error) {
			console.error('[Cron-Email] Erro no envio de emails:', error)
		}
	})

	console.log(
		'[Cron] Agendador iniciado — contratos às 03:00, empenhos às 04:00, emails às 08:00 (seg-sex)',
	)
}
