import { SituacaoLicitacao, TipoLicitacao } from '@/generated/prisma/client'
import type { ContratoOxy } from '../api/oxy-api'

// --- Constants & Maps ---

export const SITUACAO_MAP: Record<string, SituacaoLicitacao> = {
	VIGENTE: SituacaoLicitacao.ANDAMENTO,
	'EM ANDAMENTO': SituacaoLicitacao.ANDAMENTO,
	ANDAMENTO: SituacaoLicitacao.ANDAMENTO,
	HOMOLOGADA: SituacaoLicitacao.ANDAMENTO,
	ADJUDICADA: SituacaoLicitacao.ANDAMENTO,
	CONCLUIDA: SituacaoLicitacao.CONCLUIDA,
	CONCLUÍDA: SituacaoLicitacao.CONCLUIDA,
	CANCELADA: SituacaoLicitacao.CANCELADA,
	REVOGADA: SituacaoLicitacao.CANCELADA,
	DESERTA: SituacaoLicitacao.CANCELADA,
	SUSPENSA: SituacaoLicitacao.SUSPENSA,
}

export const MODALIDADE_MAP: Record<string, TipoLicitacao> = {
	PREGÃO: TipoLicitacao.PREGAO,
	PREGAO: TipoLicitacao.PREGAO,
	CONCORRÊNCIA: TipoLicitacao.CONCORRENCIA,
	CONCORRENCIA: TipoLicitacao.CONCORRENCIA,
	'TOMADA DE PREÇO': TipoLicitacao.TOMADA_DE_PRECO,
	'TOMADA DE PRECO': TipoLicitacao.TOMADA_DE_PRECO,
	CONVITE: TipoLicitacao.CONVITE,
	LEILÃO: TipoLicitacao.LEILAO,
	LEILAO: TipoLicitacao.LEILAO,
	INEXIGIBILIDADE: TipoLicitacao.INEXIGIBILIDADE,
	DISPENSA: TipoLicitacao.DISPENSA,
}

// --- Status & Modalidade Helpers ---

export function getSituacao(situacao: string | null | undefined): SituacaoLicitacao {
	if (!situacao) return SituacaoLicitacao.AGUARDANDO
	const cleaned = situacao.trim().toUpperCase()
	return SITUACAO_MAP[cleaned] ?? SituacaoLicitacao.AGUARDANDO
}

export function getModalidade(tipo: string): TipoLicitacao {
	const normalized = tipo?.toUpperCase() || ''
	if (normalized.includes('PREGÃO') || normalized.includes('PREGAO'))
		return TipoLicitacao.PREGAO
	if (normalized.includes('INEXIGIBILIDADE'))
		return TipoLicitacao.INEXIGIBILIDADE
	if (normalized.includes('DISPENSA')) return TipoLicitacao.DISPENSA
	if (
		normalized.includes('CONCORRÊNCIA') ||
		normalized.includes('CONCORRENCIA')
	)
		return TipoLicitacao.CONCORRENCIA
	if (
		normalized.includes('TOMADA DE PREÇO') ||
		normalized.includes('TOMADA DE PRECO')
	)
		return TipoLicitacao.TOMADA_DE_PRECO
	if (normalized.includes('CONVITE')) return TipoLicitacao.CONVITE
	if (normalized.includes('LEILÃO') || normalized.includes('LEILAO'))
		return TipoLicitacao.LEILAO

	return MODALIDADE_MAP[normalized] ?? TipoLicitacao.OUTROS
}

// --- Key Helpers ---

export function getContratoKey(
	numero: number,
	tipoAto: string | null | undefined,
	exercicio: number | string | null | undefined,
): string {
	const ato = String(tipoAto || '')
		.trim()
		.toUpperCase()
	const ex = String(exercicio || '').trim()
	return `${numero}-${ato}-${ex}`
}

export function getLicitacaoKey(
	numero: number,
	ano: number,
	modalidade: TipoLicitacao,
): string {
	return `${numero}/${ano}-${modalidade}`
}

// --- Parsing Helpers ---

export function parseNumero(display: string): number {
	return parseInt(display.split('/')[0], 10)
}

export function parseLicitacaoDisplay(
	display: string | number,
	fallbackAno: number,
): { numero: number; ano: number } {
	const parts = String(display).split('/')
	return {
		numero: parseInt(parts[0], 10),
		ano: parseInt(parts[1], 10) || fallbackAno,
	}
}

// --- Vigencia Helpers ---

export function isContratoVigente(
	dataFim: Date | string | null | undefined,
): boolean {
	if (!dataFim) return false
	const d = typeof dataFim === 'string' ? new Date(dataFim) : dataFim
	if (Number.isNaN(d.getTime())) return false
	const hoje = new Date()
	hoje.setHours(0, 0, 0, 0)
	return d >= hoje
}

export function isFiscalVigente(
	dataTermino: string | null | undefined,
): boolean {
	if (!dataTermino) return true
	const dataFim = new Date(dataTermino)
	if (Number.isNaN(dataFim.getTime())) return true
	const hoje = new Date()
	hoje.setHours(0, 0, 0, 0)
	return dataFim >= hoje
}

export function formatDataTermino(
	dataTermino?: string | number[] | null,
): string | undefined {
	if (!dataTermino) return undefined
	if (typeof dataTermino === 'string') return dataTermino
	if (Array.isArray(dataTermino) && dataTermino.length >= 3) {
		const [ano, mes, dia] = dataTermino
		return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
	}
	return undefined
}

// --- Normalization Helpers ---

export function normalizeName(name: string): string {
	return name.trim().toUpperCase()
}

// --- Map Builder Helpers ---

export function buildApiLookupMap(
	contratosApi: ContratoOxy[],
): Map<string, ContratoOxy> {
	const map = new Map<string, ContratoOxy>()
	for (const c of contratosApi) {
		const num = parseNumero(c.displayContrato)
		if (!Number.isNaN(num)) {
			// Usa o mesmo fallback de 'Não informado' que classify-records salva no banco,
			// garantindo que a chave do apiLookup bata com info.tipoAto lido do DB no syncFiscais
			const key = getContratoKey(num, c.descricaoTipoAto || 'Não informado', c.exercicio)
			if (map.has(key)) {
				console.warn(
					`[API] Colisão de contrato detectada para chave ${key}. O registro anterior será sobrescrito.`,
				)
			}
			map.set(key, c)
		}
	}
	return map
}
