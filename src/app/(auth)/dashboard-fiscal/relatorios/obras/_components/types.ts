import type { FormConfig } from "@/generated/prisma/client"

export type ContratoDetails = {
	id: string
	numero: number
	contratado: string
	displayContrato: string
	displayLicitacao: string
	objeto: string
	licitacaoNumero: number
	isPrincipalDoContrato: boolean
} | null

export interface ObrasReportFormProps {
	initialContrato: ContratoDetails
	formConfig: FormConfig[]
}
