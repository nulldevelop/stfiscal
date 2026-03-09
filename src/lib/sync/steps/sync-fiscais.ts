import type { ContratoOxy, FiscalComStatus } from '../api/oxy-api'
import { linkAllFiscaisToContrato } from '../services/fiscal-service'
import { getContratoKey, isContratoVigente } from '../utils/helpers'
import type { TransactionResult } from './execute-transaction'

const BATCH_SIZE = 600

/**
 * Vincula fiscais aos contratos criados/atualizados na sincronização.
 * 1 FiscalContrato por pessoa (único por organização).
 * N FiscalContratoLinks (um por contrato onde é fiscal).
 */
export async function syncFiscais(
	resultado: TransactionResult,
	fiscaisMap: Map<string, FiscalComStatus[]>,
	apiLookup: Map<string, ContratoOxy>,
	organizationId: string,
): Promise<{ vinculados: number; pulados: number; semFiscais: number }> {
	const todosContratos = [
		...resultado.contratosRecemCriados.map((c) => ({
			contratoId: c.id,
			numero: c.numero,
			tipoAto: c.tipoAto,
			exercicio: c.exercicio,
		})),
		...resultado.contratosAtualizadosIds,
	]

	console.log(
		`[SYNC] Vinculando fiscais para ${todosContratos.length} contratos (fiscaisMap: ${fiscaisMap.size} entradas)...`,
	)

	if (fiscaisMap.size === 0) {
		console.warn('[SYNC] fiscaisMap vazio — API não retornou fiscais ou URL incorreta.')
	}

	let vinculados = 0
	let pulados = 0
	let semFiscais = 0

	for (let i = 0; i < todosContratos.length; i += BATCH_SIZE) {
		const chunk = todosContratos.slice(i, i + BATCH_SIZE)
		await Promise.all(
			chunk.map(async (info) => {
				const key = getContratoKey(info.numero, info.tipoAto, info.exercicio)
				const apiContrato = apiLookup.get(key)
				if (!apiContrato) {
					pulados++
					return
				}

				const dataFimContrato = new Date(
					apiContrato.vigencia || apiContrato.terminoVigencia,
				)
				if (!isContratoVigente(dataFimContrato)) {
					pulados++
					return
				}

				const fiscais = fiscaisMap.get(apiContrato.idOxy) || []
				if (!fiscais.length) {
					semFiscais++
					return
				}

				try {
					await linkAllFiscaisToContrato(
						info.contratoId,
						fiscais,
						organizationId,
						dataFimContrato,
					)
					vinculados++
				} catch (err) {
					console.warn(
						`[SYNC] Erro ao vincular fiscais ao contrato ${info.numero}:`,
						err instanceof Error ? err.message : err,
					)
				}
			}),
		)
	}

	console.log(
		`[SYNC] Fiscais: ${vinculados} vinculados, ${semFiscais} sem fiscais na API, ${pulados} expirados/não encontrados no apiLookup.`,
	)

	if (pulados > 0 && vinculados === 0) {
		console.warn(
			`[SYNC] Todos os contratos foram pulados. Possível problema de chave no apiLookup. ` +
			`Verifique se tipoAto/exercicio no banco batem com descricaoTipoAto/exercicio da API.`,
		)
	}

	return { vinculados, pulados, semFiscais }
}
