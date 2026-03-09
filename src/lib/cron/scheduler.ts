import cron from 'node-cron'
import { syncOrganization, syncOrganizationEmpenhos } from '@/lib/sync/utils'
import { prisma } from '../prisma'
import { invalidateContratosCache } from '../query-client'

let schedulerStarted = false

/**
 * Inicia o agendador de tarefas.
 * Roda apenas uma vez no processo do servidor (singleton).
 *  - 03:00 → contratos, licitações, fiscais e aditivos
 *  - 04:00 → empenhos (sync separado, mais pesado em API calls)
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

	console.log('[Cron] Agendador iniciado — contratos às 03:00, empenhos às 04:00')
}
