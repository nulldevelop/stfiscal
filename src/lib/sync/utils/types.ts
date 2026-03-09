import type {
	SituacaoLicitacao,
	TipoLicitacao,
} from '@/generated/prisma/client'

export interface LicitacaoData {
	idOxy?: string
	entidade: string
	objeto: string
	numero: number
	ano: number
	situacao: SituacaoLicitacao
	modalidade: TipoLicitacao
	dataPublicacao: Date
	organizationId: string
}

export interface ContratoData {
	numero: number
	displayContrato: string
	displayLicitacao: string
	contratado: string
	objeto: string
	dataInicio: Date
	dataFim: Date
	tipoAto: string
	exercicio: number
	organizationId: string
	idOxy: string | null
}
