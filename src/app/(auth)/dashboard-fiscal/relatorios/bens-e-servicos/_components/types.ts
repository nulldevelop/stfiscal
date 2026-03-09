export type ContratoDetails = {
	id: string
	numero: number
	contratado: string
	displayContrato: string
	displayLicitacao: string
	objeto: string
	licitacaoNumero: number
} | null

export interface BensEServicosReportFormProps {
	initialContrato: ContratoDetails
	formConfig: any[]
}
