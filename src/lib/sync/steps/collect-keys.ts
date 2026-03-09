import type { TipoLicitacao } from '@/generated/prisma/enums'
import type { ContratoOxy, LicitacaoOxy } from '../api/oxy-api'
import {
	getContratoKey,
	getLicitacaoKey,
	getModalidade,
	parseLicitacaoDisplay,
	parseNumero,
} from '../utils/helpers'

export type CollectedKeys = {
	cnpjs: string[]
	licitacoesParaBuscar: Array<{
		numero: number
		ano: number
		modalidade: TipoLicitacao
	}>
	contratosParaBuscar: Array<{
		numero: number
		tipoAto: string
		exercicio: number
	}>
}

export function collectKeys(
	contratosApi: ContratoOxy[],
	licitacoesApi: LicitacaoOxy[],
): CollectedKeys {
	const cnpjs = [...new Set(contratosApi.map((c) => c.cnpjCpf))]
	const licitacoesParaBuscar: Array<{
		numero: number
		ano: number
		modalidade: TipoLicitacao
	}> = []
	const seenLicitacoes = new Set<string>()
	const contratosParaBuscar: Array<{
		numero: number
		tipoAto: string
		exercicio: number
	}> = []
	const seenContratos = new Set<string>()

	// Adiciona todas as licitações vindas da API de licitações
	for (const l of licitacoesApi) {
		const modalidade = getModalidade(l.descricao)
		const licKey = getLicitacaoKey(l.numeroLicitacao, l.exercicio, modalidade)
		if (!seenLicitacoes.has(licKey)) {
			licitacoesParaBuscar.push({
				numero: l.numeroLicitacao,
				ano: l.exercicio,
				modalidade,
			})
			seenLicitacoes.add(licKey)
		}
	}

	// Adiciona licitações mencionadas nos contratos
	for (const c of contratosApi) {
		const { numero: licNum, ano: licAno } = parseLicitacaoDisplay(
			c.displayLicitacao,
			c.exercicioLicitacao,
		)
		const modalidade = getModalidade(c.descricaoTipoLicitacao)
		const licKey = getLicitacaoKey(licNum, licAno, modalidade)
		if (
			!Number.isNaN(licNum) &&
			!Number.isNaN(licAno) &&
			!seenLicitacoes.has(licKey)
		) {
			licitacoesParaBuscar.push({ numero: licNum, ano: licAno, modalidade })
			seenLicitacoes.add(licKey)
		}

		const contratoNum = parseNumero(c.displayContrato)
		const contratoKey = getContratoKey(
			contratoNum,
			c.descricaoTipoAto,
			c.exercicio,
		)
		if (!Number.isNaN(contratoNum) && !seenContratos.has(contratoKey)) {
			contratosParaBuscar.push({
				numero: contratoNum,
				tipoAto: String(c.descricaoTipoAto || '')
					.trim()
					.toUpperCase(),
				exercicio: c.exercicio,
			})
			seenContratos.add(contratoKey)
		}
	}

	return { cnpjs, licitacoesParaBuscar, contratosParaBuscar }
}
