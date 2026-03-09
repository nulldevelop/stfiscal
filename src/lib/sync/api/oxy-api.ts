import { serverQueryClient } from '@/lib/query-client'
import { getLicitacaoKey, getModalidade } from '../utils/helpers'

// --- Types ---

export interface ContratoOxy {
	idOxy: string
	entidade: number
	exercicio: number
	contrato: string
	numeroContrato: number
	cnpjCpf: string
	nome: string
	descricaoEntidadeLicitacao: string
	objeto: string
	displayContrato: string
	numeroLicitacao: number
	licitacao: number
	displayLicitacao: string | number
	exercicioLicitacao: number
	situacao: string
	descricaoTipoLicitacao: string
	tipoLicitacao: number
	inicioVigencia: string
	terminoVigencia: string
	vigencia: string
	tipoAto: number
	descricaoTipoAto: string
	valorContratado: number
	valorAditivo: number
}

export interface LicitacaoOxy {
	idOxy: string
	entidade: number
	exercicio: number
	licitacao: number
	numeroLicitacao: number
	displayLicitacao: string
	descricao: string
	tipoLicitacao: number
	objeto: string
	dataPublicacao: string
	tipoCancelamento: string
	situacao?: string
	nomeEntidade: string
}

export interface AditivoOxy {
	entidade: number
	exercicio: number
	numero: number
	sequencia: number
	numeroAditivo: number
	data: string
	dataPublicacao: string | null
	dataTermino: string | null
	valorAditivo: number
	motivacao: string | null
	exercicioContrato: number
	numeroContrato: number
	tipoAto: number
}

export type ResponsavelOxy = {
	tipo: string
	ocupante: string
	descricaoCargo: string
	matricula: string | null
	dataInicio: string
	dataTermino: string | null
}

export type FiscalComStatus = ResponsavelOxy & {
	ativo: boolean
}

export interface EmpenhoTotaisOxy {
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
}

export interface EmpenhoOxy {
	entidade: number
	empenho: number
	exercicio: number
	empenhoExercicio: string
	data: string
	fornecedor: number
	nome: string
	historico: string
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
}

// --- Constants ---

const PORTAL_BASE_URL =
	'https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia-api'
const DEFAULT_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const ADITIVO_CHUNK_SIZE = 100
const FISCAL_CHUNK_SIZE = 600

// --- Helpers ---

function isFiscalAtivo(dataTermino: string | null): boolean {
	if (!dataTermino) return true
	const dataFim = new Date(dataTermino)
	if (Number.isNaN(dataFim.getTime())) return true
	const hoje = new Date()
	hoje.setHours(0, 0, 0, 0)
	return dataFim >= hoje
}

// --- API Functions ---

// 1. Contratos

async function fetchContratosPorAno(
	baseUrl: string,
	year: number,
): Promise<ContratoOxy[]> {
	return serverQueryClient.fetchQuery({
		queryKey: ['contratos-vigentes', baseUrl, year],
		queryFn: async () => {
			const allContratos: ContratoOxy[] = []
			let page = 0
			let totalPages = 1

			do {
				const url = `${baseUrl}?entidade=1&exercicio=${year}&exercicioContrato=${year}&contratosVigentes=true&size=600&page=${page}`
				const res = await fetch(url)

				if (!res.ok) {
					console.warn(
						`Erro ${res.status} ao buscar contratos do ano ${year} página ${page}`,
					)
					break
				}

				const data = await res.json()
				if (data.content && Array.isArray(data.content)) {
					allContratos.push(...(data.content as ContratoOxy[]))
					totalPages = data.totalPages ?? 1
				} else {
					console.warn(`Resposta inesperada da API para o ano ${year}`)
					break
				}

				page++
			} while (page < totalPages)

			return allContratos
		},
	})
}

export async function getContratosVigentes(
	baseUrl: string,
	years: number[] = DEFAULT_YEARS,
): Promise<ContratoOxy[]> {
	const results = await Promise.allSettled(
		years.map((year) => fetchContratosPorAno(baseUrl, year)),
	)

	const allContratos: ContratoOxy[] = []
	for (const result of results) {
		if (result.status === 'fulfilled') {
			allContratos.push(...result.value)
		}
	}

	return allContratos
}

export function getActiveYearsFromCache(baseUrl: string): number[] {
	const cached = serverQueryClient.getQueriesData<ContratoOxy[]>({
		queryKey: ['contratos-vigentes', baseUrl],
	})

	const hoje = new Date()
	hoje.setHours(0, 0, 0, 0)
	const activeYears = new Set<number>()

	for (const [queryKey, contratos] of cached) {
		if (!contratos?.length) continue
		const temAtivo = contratos.some((c) => {
			const dataFim = new Date(c.vigencia || c.terminoVigencia)
			return !Number.isNaN(dataFim.getTime()) && dataFim >= hoje
		})
		if (temAtivo) {
			const year = queryKey[2] as number
			if (year) activeYears.add(year)
		}
	}

	return [...activeYears].sort((a, b) => a - b)
}

// 2. Licitações

async function fetchLicitacoesPorAno(
	baseUrl: string,
	year: number,
): Promise<LicitacaoOxy[]> {
	return serverQueryClient.fetchQuery({
		queryKey: ['licitacoes', baseUrl, year],
		queryFn: async () => {
			const allLicitacoes: LicitacaoOxy[] = []
			let page = 0
			let totalPages = 1

			do {
				const url = `${baseUrl}?entidade=1&exercicio=${year}&size=100&page=${page}`
				const res = await fetch(url)

				if (!res.ok) {
					console.warn(
						`Erro ${res.status} ao buscar licitações do ano ${year} página ${page}`,
					)
					break
				}

				const data = await res.json()
				if (data.content && Array.isArray(data.content)) {
					allLicitacoes.push(...(data.content as LicitacaoOxy[]))
					totalPages = data.totalPages ?? 1
				} else {
					break
				}

				page++
			} while (page < totalPages)

			return allLicitacoes
		},
	})
}

export async function getLicitacoes(
	baseUrl: string,
	years: number[],
): Promise<LicitacaoOxy[]> {
	const results = await Promise.allSettled(
		years.map((year) => fetchLicitacoesPorAno(baseUrl, year)),
	)

	const all: LicitacaoOxy[] = []
	for (const result of results) {
		if (result.status === 'fulfilled') {
			all.push(...result.value)
		}
	}

	return all
}

export async function getLicitacaoIndividual(
	baseUrl: string,
	entidade: number,
	exercicio: number,
	tipoLicitacao: number,
	numeroLicitacao: number,
): Promise<LicitacaoOxy | null> {
	return serverQueryClient.fetchQuery({
		queryKey: [
			'licitacao-individual',
			baseUrl,
			entidade,
			exercicio,
			tipoLicitacao,
			numeroLicitacao,
		],
		queryFn: async () => {
			const url = `${baseUrl}/${entidade}/${exercicio}/${tipoLicitacao}/${numeroLicitacao}`
			try {
				const res = await fetch(url)
				if (!res.ok) return null
				return await res.json()
			} catch (err) {
				console.error(`Erro ao buscar licitação individual ${url}:`, err)
				return null
			}
		},
	})
}

export function buildLicitacaoLookupMap(
	licitacoes: LicitacaoOxy[],
): Map<string, LicitacaoOxy> {
	const map = new Map<string, LicitacaoOxy>()
	for (const l of licitacoes) {
		const modalidade = getModalidade(l.descricao)
		map.set(getLicitacaoKey(l.numeroLicitacao, l.exercicio, modalidade), l)
	}
	return map
}

// 3. Aditivos

export async function getAditivosByContrato(
	baseUrl: string,
	idOxy: string,
): Promise<AditivoOxy[]> {
	const url = new URL(baseUrl)
	url.searchParams.set('idOxy', idOxy)

	try {
		const res = await fetch(url.toString(), { cache: 'no-store' })
		if (!res.ok) {
			if (res.status !== 404) {
				console.warn(
					`Erro ${res.status} ao buscar aditivos do contrato ${idOxy}`,
				)
			}
			return []
		}

		const data = await res.json()
		return Array.isArray(data) ? (data as AditivoOxy[]) : []
	} catch (e) {
		console.error(`Erro ao buscar aditivos do contrato ${idOxy}`, e)
		return []
	}
}

export async function getAditivosBatch(
	baseUrl: string,
	idsOxy: string[],
): Promise<Map<string, AditivoOxy[]>> {
	const map = new Map<string, AditivoOxy[]>()

	for (let i = 0; i < idsOxy.length; i += ADITIVO_CHUNK_SIZE) {
		const chunk = idsOxy.slice(i, i + ADITIVO_CHUNK_SIZE)
		const results = await Promise.allSettled(
			chunk.map(async (id) => ({
				id,
				aditivos: await getAditivosByContrato(baseUrl, id),
			})),
		)

		for (const result of results) {
			if (result.status === 'fulfilled') {
				map.set(result.value.id, result.value.aditivos)
			}
		}
	}

	return map
}

// 4. Fiscais

async function fetchFiscaisDeContrato(
	baseUrl: string,
	idOxy: string,
): Promise<{ idOxy: string; fiscais: FiscalComStatus[] }> {
	const url = new URL(baseUrl)
	url.searchParams.set('idOxy', idOxy)

	try {
		const res = await fetch(url.toString(), { cache: 'no-store' })
		if (!res.ok) {
			if (res.status !== 404) {
				console.warn(`Erro ${res.status} no contrato ${idOxy}`)
			}
			return { idOxy, fiscais: [] }
		}

		const data: ResponsavelOxy[] = await res.json()

		const fiscais: FiscalComStatus[] = data
			.filter((r) => r.tipo === 'FISCAL')
			.map((fiscal) => ({
				...fiscal,
				ativo: isFiscalAtivo(fiscal.dataTermino),
			}))

		return { idOxy, fiscais }
	} catch (e) {
		console.error(`Erro contrato ${idOxy}`, e)
		return { idOxy, fiscais: [] }
	}
}

// 5. Empenhos

export async function getEmpenhoTotais(
	idLicitacao: string,
): Promise<EmpenhoTotaisOxy | null> {
	const url = `${PORTAL_BASE_URL}/empenhos/totais-sem-exercicio/${idLicitacao}`
	try {
		const res = await fetch(url, { cache: 'no-store' })
		if (!res.ok) return null
		return await res.json()
	} catch (e) {
		console.error(
			`Erro ao buscar totais de empenhos da licitação ${idLicitacao}`,
			e,
		)
		return null
	}
}

export async function getEmpenhosByLicitacao(
	idLicitacao: string,
	entidade = 1,
): Promise<EmpenhoOxy[]> {
	const PAGE_SIZE = 500

	const makeUrl = (page: number) => {
		const search = `licitacao.id%3D%3D${idLicitacao}+and+entidadeLicitacao%3D%3D${entidade}`
		return `${PORTAL_BASE_URL}/empenhos/lista/sem-exercicio?search=${search}&entidade=${entidade}&page=${page}&size=${PAGE_SIZE}`
	}

	try {
		// Primeira página: obtém dados e totalPages
		const res = await fetch(makeUrl(0), { cache: 'no-store' })
		if (!res.ok) return []

		const data = await res.json()
		if (!data.content || !Array.isArray(data.content)) return []

		const allEmpenhos: EmpenhoOxy[] = [...(data.content as EmpenhoOxy[])]
		const totalPages: number = data.totalPages ?? 1

		// Páginas restantes em paralelo
		if (totalPages > 1) {
			const remaining = Array.from({ length: totalPages - 1 }, (_, i) => i + 1)
			const results = await Promise.allSettled(
				remaining.map(async (page) => {
					const r = await fetch(makeUrl(page), { cache: 'no-store' })
					if (!r.ok) return [] as EmpenhoOxy[]
					const d = await r.json()
					return Array.isArray(d.content) ? (d.content as EmpenhoOxy[]) : []
				}),
			)
			for (const result of results) {
				if (result.status === 'fulfilled') allEmpenhos.push(...result.value)
			}
		}

		return allEmpenhos
	} catch (e) {
		console.error(`Erro ao buscar empenhos da licitação ${idLicitacao}`, e)
		return []
	}
}

export async function getFiscaisByContratosBatch(
	baseUrl: string,
	idsOxy: string[],
): Promise<Map<string, FiscalComStatus[]>> {
	console.log(
		`Buscando responsáveis para ${idsOxy.length} contratos (lotes de ${FISCAL_CHUNK_SIZE})`,
	)

	const map = new Map<string, FiscalComStatus[]>()

	for (let i = 0; i < idsOxy.length; i += FISCAL_CHUNK_SIZE) {
		const chunk = idsOxy.slice(i, i + FISCAL_CHUNK_SIZE)
		const results = await Promise.allSettled(
			chunk.map((id) => fetchFiscaisDeContrato(baseUrl, id)),
		)

		for (const result of results) {
			if (result.status === 'fulfilled') {
				map.set(result.value.idOxy, result.value.fiscais)
			}
		}

		const processados = Math.min(i + FISCAL_CHUNK_SIZE, idsOxy.length)
		if (processados < idsOxy.length) {
			console.log(`  Processados ${processados}/${idsOxy.length} contratos...`)
		}
	}

	console.log(`Fiscais buscados para ${map.size} contratos`)
	return map
}
