import type { AditivoOxy, ContratoOxy } from '../api/oxy-api'
import { syncAditivosForContratos } from '../services/aditivo-service'
import type { TransactionResult } from './execute-transaction'

/**
 * Salva (upsert) os aditivos dos contratos criados/atualizados.
 * Único por (contratoId, sequencia).
 */
export async function syncAditivos(
	resultado: TransactionResult,
	aditivosMap: Map<string, AditivoOxy[]>,
	apiLookup: Map<string, ContratoOxy>,
	organizationId: string,
): Promise<number> {
	const todosContratos = [
		...resultado.contratosRecemCriados.map((c) => ({
			contratoId: c.id,
			numero: c.numero,
			tipoAto: c.tipoAto,
			exercicio: c.exercicio,
		})),
		...resultado.contratosAtualizadosIds,
	]

	const salvos = await syncAditivosForContratos(
		organizationId,
		todosContratos,
		aditivosMap,
		apiLookup
	)

	console.log(`[SYNC] Aditivos salvos: ${salvos}`)
	return salvos
}
