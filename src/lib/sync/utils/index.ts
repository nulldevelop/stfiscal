import { prisma } from '@/lib/prisma'
import { classifyRecords } from '../steps/classify-records'
import { collectKeys } from '../steps/collect-keys'
import { executeTransaction } from '../steps/execute-transaction'
import { fetchApiData, fetchEmpenhosForLicitacoes } from '../steps/fetch-api-data'
import { fetchDbState } from '../steps/fetch-db-state'
import { syncAditivos } from '../steps/sync-aditivos'
import { syncEmpenhos } from '../steps/sync-empenhos'
import { syncFiscais } from '../steps/sync-fiscais'

export type SyncResult = {
	success: boolean
	message: string
	data?: {
		contratosCreated: number
		contratosUpdated: number
		licitacoesSync: number
		fiscaisVinculados: number
		aditivosSalvos: number
	}
}

export type SyncEmpenhoResult = {
	success: boolean
	message: string
	data?: { empenhosSalvos: number }
}

/**
 * Sync principal: contratos, licitações, fiscais e aditivos.
 * Não inclui empenhos (use syncOrganizationEmpenhos separado).
 *
 * Pipeline:
 *  1. Busca contratos vigentes + licitações + fiscais + aditivos
 *  2. Coleta chaves únicas para consulta eficiente ao banco
 *  3. Busca estado atual do banco (empresas, licitações, contratos)
 *  4. Classifica o que criar/atualizar
 *  5. Executa transação atômica (empresas → licitações → contratos)
 *  6. Em paralelo: vincula fiscais e salva aditivos
 */
export async function syncOrganization(
	organizationId: string,
): Promise<SyncResult> {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			id: true,
			name: true,
			apiUrlContratos: true,
			apiUrlLicitacoes: true,
			apiUrlFiscais: true,
			apiUrlAditivos: true,
		},
	})

	if (!org) {
		return { success: false, message: 'Organização não encontrada.' }
	}

	if (
		!org.apiUrlContratos ||
		!org.apiUrlLicitacoes ||
		!org.apiUrlFiscais ||
		!org.apiUrlAditivos
	) {
		return {
			success: false,
			message:
				'URLs da API não configuradas. Acesse Configurações > Integrações.',
		}
	}

	const startedAt = new Date()

	try {
		// Etapa 1: Buscar dados das 4 APIs em paralelo
		const apiResult = await fetchApiData(
			org.apiUrlContratos,
			org.apiUrlLicitacoes,
			org.apiUrlFiscais,
			org.apiUrlAditivos,
		)

		if (!apiResult.success) {
			throw new Error(apiResult.error)
		}

		const {
			contratosApi,
			licitacoesApi,
			fiscaisMap,
			aditivosMap,
			apiLookup,
			licitacaoLookup,
		} = apiResult.data

		// Etapa 2: Coletar chaves únicas
		const { cnpjs, licitacoesParaBuscar, contratosParaBuscar } = collectKeys(
			contratosApi,
			licitacoesApi,
		)

		// Etapa 3: Buscar estado do banco
		const { empresasMap, licitacoesMap, contratosMap } = await fetchDbState(
			organizationId,
			cnpjs,
			licitacoesParaBuscar,
			contratosParaBuscar,
		)

		// Etapa 4: Classificar o que criar/atualizar
		const {
			empresasToCreate,
			licitacoesToCreate,
			licitacoesToUpdate,
			contratosToCreate,
			contratosToUpdate,
		} = await classifyRecords(
			contratosApi,
			licitacoesApi,
			empresasMap,
			licitacoesMap,
			contratosMap,
			licitacaoLookup,
			organizationId,
			org.apiUrlLicitacoes,
		)

		console.log(`[SYNC] Classificação:
    Empresas a criar: ${empresasToCreate.size}
    Licitações a criar: ${licitacoesToCreate.size}
    Licitações a atualizar: ${licitacoesToUpdate.size}
    Contratos a criar: ${contratosToCreate.length}
    Contratos a atualizar: ${contratosToUpdate.length}`)

		// Etapa 5: Transação atômica
		const resultado = await executeTransaction(
			organizationId,
			empresasToCreate,
			licitacoesToCreate,
			licitacoesToUpdate,
			contratosToCreate,
			contratosToUpdate,
			empresasMap,
			licitacoesMap,
			apiLookup,
		)

		// Etapa 6: Fiscais e aditivos em paralelo (fora da transação)
		const [fiscaisStats, aditivosSalvos] = await Promise.all([
			syncFiscais(resultado, fiscaisMap, apiLookup, organizationId),
			syncAditivos(resultado, aditivosMap, apiLookup, organizationId),
		])

		const message =
			`${contratosToCreate.length} contratos criados, ${contratosToUpdate.length} atualizados. ` +
			`${licitacoesToCreate.size + licitacoesToUpdate.size} licitações sincronizadas. ` +
			`${fiscaisStats.vinculados} fiscais vinculados. ` +
			`${aditivosSalvos} aditivos salvos.`

		await Promise.all([
			prisma.organization.update({
				where: { id: organizationId },
				data: {
					lastSyncAt: startedAt,
					lastSyncStatus: 'success',
					lastSyncMessage: message,
				},
			}),
			prisma.apiSyncLog.create({
				data: {
					organizationId,
					status: 'success',
					totalContratos: contratosToCreate.length + contratosToUpdate.length,
					totalFiscais: fiscaisStats.vinculados,
					message,
				},
			}),
		])

		console.log(`[SYNC] Concluído: ${message}`)

		return {
			success: true,
			message,
			data: {
				contratosCreated: contratosToCreate.length,
				contratosUpdated: contratosToUpdate.length,
				licitacoesSync: licitacoesToCreate.size + licitacoesToUpdate.size,
				fiscaisVinculados: fiscaisStats.vinculados,
				aditivosSalvos,
			},
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Erro desconhecido na sincronização'

		console.error(`[SYNC] Erro: ${errorMessage}`)

		await Promise.all([
			prisma.organization.update({
				where: { id: organizationId },
				data: {
					lastSyncAt: startedAt,
					lastSyncStatus: 'error',
					lastSyncMessage: errorMessage,
				},
			}),
			prisma.apiSyncLog.create({
				data: {
					organizationId,
					status: 'error',
					message: errorMessage,
				},
			}),
		])

		return { success: false, message: errorMessage }
	}
}

/**
 * Sync separado apenas de empenhos.
 * Busca os idOxy das licitações já no banco e vai na API buscar os empenhos.
 * Rodar após syncOrganization (licitações precisam existir no banco).
 */
export async function syncOrganizationEmpenhos(
	organizationId: string,
): Promise<SyncEmpenhoResult> {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true, name: true },
	})

	if (!org) {
		return { success: false, message: 'Organização não encontrada.' }
	}

	try {
		// Busca todos os idOxy das licitações já sincronizadas no banco
		const licitacoes = await prisma.licitacao.findMany({
			where: { organizationId, idOxy: { not: null } },
			select: { idOxy: true },
		})

		const ids = licitacoes
			.map((l) => l.idOxy)
			.filter((id): id is string => !!id)

		if (ids.length === 0) {
			return {
				success: true,
				message: 'Nenhuma licitação com idOxy encontrada no banco.',
				data: { empenhosSalvos: 0 },
			}
		}

		const empenhosMap = await fetchEmpenhosForLicitacoes(ids)
		const empenhosSalvos = await syncEmpenhos(organizationId, empenhosMap)

		const message = `${empenhosSalvos} empenhos sincronizados (${empenhosMap.size} licitações com empenhos).`
		console.log(`[SYNC-EMP] ${org.name}: ${message}`)

		return { success: true, message, data: { empenhosSalvos } }
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Erro desconhecido'
		console.error(`[SYNC-EMP] Erro: ${errorMessage}`)
		return { success: false, message: errorMessage }
	}
}
