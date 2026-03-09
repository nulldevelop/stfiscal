import type { AditivoOxy, ContratoOxy, EmpenhoOxy, FiscalComStatus, LicitacaoOxy } from '../api/oxy-api'
import {
	getAditivosBatch,
	getContratosVigentes,
	getActiveYearsFromCache,
	getEmpenhosByLicitacao,
	getFiscaisByContratosBatch,
	getLicitacoes,
	buildLicitacaoLookupMap,
} from '../api/oxy-api'
import { buildApiLookupMap, parseLicitacaoDisplay } from '../utils/helpers'

const EMPENHO_CHUNK_SIZE = 50

export type FetchApiDataResult = {
	contratosApi: ContratoOxy[]
	licitacoesApi: LicitacaoOxy[]
	fiscaisMap: Map<string, FiscalComStatus[]>
	aditivosMap: Map<string, AditivoOxy[]>
	apiLookup: Map<string, ContratoOxy>
	licitacaoLookup: Map<string, LicitacaoOxy>
}

/**
 * Busca empenhos para uma lista de idOxy de licitações.
 * Usada pelo sync de empenhos (separado do sync principal).
 */
export async function fetchEmpenhosForLicitacoes(
	licitacaoIds: string[],
): Promise<Map<string, EmpenhoOxy[]>> {
	const empenhosMap = new Map<string, EmpenhoOxy[]>()
	if (licitacaoIds.length === 0) return empenhosMap

	console.log(`[SYNC-EMP] Buscando empenhos para ${licitacaoIds.length} licitações...`)

	for (let i = 0; i < licitacaoIds.length; i += EMPENHO_CHUNK_SIZE) {
		const chunk = licitacaoIds.slice(i, i + EMPENHO_CHUNK_SIZE)
		const results = await Promise.allSettled(
			chunk.map(async (idLic) => ({
				id: idLic,
				empenhos: await getEmpenhosByLicitacao(idLic),
			})),
		)

		for (const result of results) {
			if (result.status === 'fulfilled' && result.value.empenhos.length > 0) {
				empenhosMap.set(result.value.id, result.value.empenhos)
			}
		}

		const processados = Math.min(i + EMPENHO_CHUNK_SIZE, licitacaoIds.length)
		if (processados < licitacaoIds.length) {
			console.log(`[SYNC-EMP]   ${processados}/${licitacaoIds.length} licitações consultadas (${empenhosMap.size} com empenhos)...`)
		}
	}

	console.log(`[SYNC-EMP] Empenhos carregados: ${empenhosMap.size} licitações com empenhos`)
	return empenhosMap
}

export async function fetchApiData(
	apiUrlContratos: string,
	apiUrlLicitacoes: string,
	apiUrlFiscais: string,
	apiUrlAditivos: string,
): Promise<
	| { success: true; data: FetchApiDataResult }
	| { success: false; error: string }
> {
	let years = getActiveYearsFromCache(apiUrlContratos)

	if (!years.length) {
		console.log('[SYNC] Cache frio — populando cache com todos os anos.')
		await getContratosVigentes(apiUrlContratos)
		years = getActiveYearsFromCache(apiUrlContratos)
	}

	if (!years.length) {
		return {
			success: false,
			error: 'Nenhum ano com contratos ativos encontrado na API.',
		}
	}

	console.log('[SYNC] Anos com contratos ativos no cache:', years)

	// 1. Busca contratos primeiro para saber quais anos de licitação precisamos
	const contratosApi = await getContratosVigentes(apiUrlContratos, years)

	if (!contratosApi.length) {
		return { success: false, error: 'Nenhum contrato retornado pela API.' }
	}

	// 2. Coleta todos os anos de licitação mencionados nos contratos
	const biddingYears = new Set<number>(years)
	for (const c of contratosApi) {
		const { ano } = parseLicitacaoDisplay(
			c.displayLicitacao,
			c.exercicioLicitacao,
		)
		if (!Number.isNaN(ano)) {
			biddingYears.add(ano)
		}
	}

	console.log('[SYNC] Anos de licitação a buscar:', Array.from(biddingYears))

	// 3. Busca licitações, fiscais e aditivos em paralelo
	const idsOxy = contratosApi.map((c) => c.idOxy)
	const [licitacoesApi, fiscaisMap, aditivosMap] = await Promise.all([
		getLicitacoes(apiUrlLicitacoes, Array.from(biddingYears)),
		getFiscaisByContratosBatch(apiUrlFiscais, idsOxy),
		getAditivosBatch(apiUrlAditivos, idsOxy),
	])

	console.log(`[SYNC] Dados da API carregados:
    Contratos: ${contratosApi.length}
    Licitações: ${licitacoesApi.length}
    Fiscais (mapas): ${fiscaisMap.size}
    Aditivos (mapas): ${aditivosMap.size}`)

	const apiLookup = buildApiLookupMap(contratosApi)
	const licitacaoLookup = buildLicitacaoLookupMap(licitacoesApi)

	return {
		success: true,
		data: {
			contratosApi,
			licitacoesApi,
			fiscaisMap,
			aditivosMap,
			apiLookup,
			licitacaoLookup,
		},
	}
}
