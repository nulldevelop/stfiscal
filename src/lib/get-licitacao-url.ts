import type { ContratoRow } from '@/app/(auth)/dashboard-gestor/contratos/_components/contratos-table'

const MODALIDADE_MAP: Record<string, number> = {
	CONCORRENCIA: 1,
	TOMADA_DE_PRECO: 2,
	CONVITE: 3,
	PREGAO: 6,
	LEILAO: 5,
}

export function getLicitacaoPortalUrl(r: ContratoRow) {
	const tipoLicitacao = MODALIDADE_MAP[r.licitacaoModalidade] || 6
	return `https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/licitacoes/detalhes?entidade=1&exercicio=${r.licitacaoAno}&tipoLicitacao=${tipoLicitacao}&licitacao=${r.licitacao}`
}
