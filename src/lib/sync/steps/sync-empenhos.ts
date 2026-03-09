import { prisma } from '@/lib/prisma'
import type { EmpenhoOxy } from '../api/oxy-api'
import { buildEmpenhoRows, bulkUpsertEmpenhos } from '../services/empenho-service'

/**
 * Busca empenhos de cada licitação e salva vinculado aos contratos.
 * empenhosMap: Map<idOxyLicitacao, EmpenhoOxy[]>
 */
export async function syncEmpenhos(
	organizationId: string,
	empenhosMap: Map<string, EmpenhoOxy[]>,
): Promise<number> {
	if (empenhosMap.size === 0) return 0

	// Busca todos os contratos agrupados por idOxy da licitação
	const licitacoes = await prisma.licitacao.findMany({
		where: {
			organizationId,
			idOxy: { in: Array.from(empenhosMap.keys()) },
		},
		select: {
			idOxy: true,
			Contratos: { select: { id: true } },
		},
	})

	// Monta todos os rows de uma vez — sem round-trips individuais ao DB
	const allRows = licitacoes.flatMap((l) => {
		if (!l.idOxy || l.Contratos.length === 0) return []
		const empenhos = empenhosMap.get(l.idOxy)
		if (!empenhos?.length) return []
		return buildEmpenhoRows(
			organizationId,
			l.Contratos.map((c) => c.id),
			empenhos,
		)
	})

	if (allRows.length === 0) return 0

	console.log(`[SYNC] Salvando ${allRows.length} empenhos em lote único...`)
	const totalSalvos = await bulkUpsertEmpenhos(allRows)
	console.log(`[SYNC] Empenhos salvos: ${totalSalvos}`)
	return totalSalvos
}
