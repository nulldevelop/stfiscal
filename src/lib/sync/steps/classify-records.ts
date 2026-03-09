import type { Contrato, Empresas, Licitacao } from '@/generated/prisma/client'
import { SituacaoLicitacao } from '@/generated/prisma/client'
import type { ContratoOxy, LicitacaoOxy } from '../api/oxy-api'
import { getLicitacaoIndividual } from '../api/oxy-api'
import {
	getContratoKey,
	getLicitacaoKey,
	getModalidade,
	getSituacao,
	parseLicitacaoDisplay,
	parseNumero,
} from '../utils/helpers'
import type { ContratoData, LicitacaoData } from '../utils/types'

export type Classification = {
	empresasToCreate: Map<
		string,
		{ name: string; cnpj: string; organizationId: string }
	>
	licitacoesToCreate: Map<string, LicitacaoData>
	licitacoesToUpdate: Map<string, LicitacaoData & { id: string }>
	contratosToCreate: ContratoData[]
	contratosToUpdate: Array<ContratoData & { id: string }>
}

export async function classifyRecords(
	contratosApi: ContratoOxy[],
	licitacoesApi: LicitacaoOxy[],
	empresasMap: Map<string, Empresas>,
	licitacoesMap: Map<string, Licitacao>,
	contratosMap: Map<string, Contrato>,
	licitacaoLookup: Map<string, LicitacaoOxy>,
	organizationId: string,
	apiUrlLicitacoes: string,
): Promise<Classification> {
	const empresasToCreate = new Map<
		string,
		{ name: string; cnpj: string; organizationId: string }
	>()
	const licitacoesToCreate = new Map<string, LicitacaoData>()
	const licitacoesToUpdate = new Map<string, LicitacaoData & { id: string }>()
	const contratosToCreate: ContratoData[] = []
	const contratosToUpdate: Array<ContratoData & { id: string }> = []
	const seenContratosToCreate = new Set<string>()

	// 1. Processar todas as Licitações da API
	for (const lApi of licitacoesApi) {
		const modalidade = getModalidade(lApi.descricao)
		const licitacaoKey = getLicitacaoKey(
			lApi.numeroLicitacao,
			lApi.exercicio,
			modalidade,
		)
		const situacao = getSituacao(lApi.situacao || lApi.tipoCancelamento)
		const licitacaoData: LicitacaoData = {
			idOxy: lApi.idOxy,
			entidade: lApi.nomeEntidade || 'Não informado',
			objeto: lApi.objeto || 'Não informado',
			numero: lApi.numeroLicitacao,
			ano: lApi.exercicio,
			situacao,
			modalidade,
			dataPublicacao: new Date(lApi.dataPublicacao),
			organizationId,
		}

		const existingLicitacao = licitacoesMap.get(licitacaoKey)
		if (existingLicitacao) {
			licitacoesToUpdate.set(licitacaoKey, {
				...licitacaoData,
				id: existingLicitacao.id,
			})
		} else if (situacao === SituacaoLicitacao.ANDAMENTO) {
			// Apenas cadastra licitações vigentes/em andamento
			licitacoesToCreate.set(licitacaoKey, licitacaoData)
		}
	}

	// 2. Processar Contratos — apenas vigentes (filtro principal)
	const licitacaoKeysComContratos = new Set<string>()
	let skippedDueToParsing = 0
	for (const item of contratosApi) {
		const { numero: licitacaoNumero, ano: anoLicitacao } =
			parseLicitacaoDisplay(item.displayLicitacao, item.exercicioLicitacao)
		const contratoNumero = parseNumero(item.displayContrato)

		if (
			Number.isNaN(licitacaoNumero) ||
			Number.isNaN(contratoNumero) ||
			Number.isNaN(anoLicitacao)
		) {
			skippedDueToParsing++
			continue
		}

		const contratoKey = getContratoKey(
			contratoNumero,
			item.descricaoTipoAto || 'Não informado',
			item.exercicio,
		)

		// Resolve a modalidade da licitação cruzando com os dados já processados
		let modalidadeLicitacao = getModalidade(item.descricaoTipoLicitacao)
		let licitacaoKey = getLicitacaoKey(
			licitacaoNumero,
			anoLicitacao,
			modalidadeLicitacao,
		)

		if (
			!licitacoesToCreate.has(licitacaoKey) &&
			!licitacoesToUpdate.has(licitacaoKey)
		) {
			for (const [key, value] of licitacaoLookup.entries()) {
				if (
					value.numeroLicitacao === licitacaoNumero &&
					value.exercicio === anoLicitacao
				) {
					licitacaoKey = key
					modalidadeLicitacao = getModalidade(value.descricao)
					break
				}
			}
		}

		// Registra que este contrato está vinculado à licitação
		licitacaoKeysComContratos.add(licitacaoKey)

		if (!empresasMap.has(item.cnpjCpf) && !empresasToCreate.has(item.cnpjCpf)) {
			empresasToCreate.set(item.cnpjCpf, {
				name: item.nome,
				cnpj: item.cnpjCpf,
				organizationId,
			})
		}

		// Garante que a licitação existe (busca individual se necessário)
		if (
			!licitacoesToCreate.has(licitacaoKey) &&
			!licitacoesToUpdate.has(licitacaoKey)
		) {
			let licitacaoApi = licitacaoLookup.get(licitacaoKey)

			if (!licitacaoApi && apiUrlLicitacoes) {
				licitacaoApi =
					(await getLicitacaoIndividual(
						apiUrlLicitacoes,
						item.entidade || 1,
						anoLicitacao,
						item.tipoLicitacao,
						licitacaoNumero,
					)) || undefined

				if (licitacaoApi) {
					licitacaoLookup.set(licitacaoKey, licitacaoApi)
				}
			}

			const existingLicitacao = licitacoesMap.get(licitacaoKey)

			if (licitacaoApi) {
				const situacaoApi = getSituacao(
					licitacaoApi.situacao || licitacaoApi.tipoCancelamento || item.situacao,
				)
				const licitacaoData: LicitacaoData = {
					idOxy: licitacaoApi.idOxy,
					entidade:
						licitacaoApi.nomeEntidade ||
						item.descricaoEntidadeLicitacao ||
						'Não informado',
					objeto: licitacaoApi.objeto || 'Não informado',
					numero: licitacaoNumero,
					ano: anoLicitacao,
					situacao: situacaoApi,
					modalidade: modalidadeLicitacao,
					dataPublicacao: licitacaoApi.dataPublicacao
						? new Date(licitacaoApi.dataPublicacao)
						: new Date(item.inicioVigencia),
					organizationId,
				}

				if (existingLicitacao) {
					licitacoesToUpdate.set(licitacaoKey, {
						...licitacaoData,
						id: existingLicitacao.id,
					})
				} else if (situacaoApi === SituacaoLicitacao.ANDAMENTO) {
					// Apenas cadastra licitações vigentes/em andamento
					licitacoesToCreate.set(licitacaoKey, licitacaoData)
				}
			} else if (!existingLicitacao) {
				const situacaoStub = getSituacao(item.situacao)
				// Stub: licitação não encontrada nem na API nem no banco
				// Só cria o stub se estiver vigente/em andamento
				if (situacaoStub === SituacaoLicitacao.ANDAMENTO) {
					licitacoesToCreate.set(licitacaoKey, {
						idOxy: undefined,
						entidade: item.descricaoEntidadeLicitacao || 'Não informado',
						objeto: 'Objeto da Licitação não informado',
						numero: licitacaoNumero,
						ano: anoLicitacao,
						situacao: situacaoStub,
						modalidade: modalidadeLicitacao,
						dataPublicacao: new Date(item.inicioVigencia),
						organizationId,
					})
				}
			}
		}

		const contratoData: ContratoData = {
			numero: contratoNumero,
			displayContrato: String(item.displayContrato),
			displayLicitacao: `${licitacaoNumero}/${anoLicitacao}`,
			contratado: item.nome,
			objeto: item.objeto || 'Não informado',
			dataInicio: new Date(item.inicioVigencia),
			dataFim: new Date(item.vigencia || item.terminoVigencia),
			tipoAto: item.descricaoTipoAto || 'Não informado',
			exercicio: item.exercicio || new Date().getFullYear(),
			organizationId,
			idOxy: item.idOxy ?? null,
		}

		const existingContrato = contratosMap.get(contratoKey)
		if (existingContrato) {
			contratosToUpdate.push({ id: existingContrato.id, ...contratoData })
		} else if (!seenContratosToCreate.has(contratoKey)) {
			contratosToCreate.push(contratoData)
			seenContratosToCreate.add(contratoKey)
		}
	}

	if (skippedDueToParsing > 0) {
		console.warn(
			`[SYNC] ${skippedDueToParsing} registros ignorados por falha no parsing de números.`,
		)
	}

	// Remove licitações sem contrato vinculado (não devem ser cadastradas)
	let licitacoesSemContrato = 0
	for (const key of Array.from(licitacoesToCreate.keys())) {
		if (!licitacaoKeysComContratos.has(key) && !licitacoesMap.has(key)) {
			licitacoesToCreate.delete(key)
			licitacoesSemContrato++
		}
	}
	if (licitacoesSemContrato > 0) {
		console.warn(
			`[SYNC] ${licitacoesSemContrato} licitação(ões) ignorada(s): sem contrato vinculado.`,
		)
	}

	return {
		empresasToCreate,
		licitacoesToCreate,
		licitacoesToUpdate,
		contratosToCreate,
		contratosToUpdate,
	}
}
