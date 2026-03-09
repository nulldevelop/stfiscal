import type {
	BensEServicosReport,
	Contrato as ContratoModel,
	Empresas as EmpresaModel,
	Licitacao as LicitacaoModel,
} from '@/generated/prisma/client'

export type ContratoWithLicitacao = ContratoModel & {
	licitacao: LicitacaoModel
	bensEServicosReports: BensEServicosReport[]
	empresa: EmpresaModel
}
