import { prisma } from '@/lib/prisma'
import type { AditivoOxy, ContratoOxy } from '../api/oxy-api'
import { getContratoKey } from '../utils/helpers'

export async function syncAditivosForContratos(
	organizationId: string,
	contratos: Array<{
		contratoId: string
		numero: number
		tipoAto: string
		exercicio: number
	}>,
	aditivosMap: Map<string, AditivoOxy[]>,
	apiLookup: Map<string, ContratoOxy>,
) {
	let salvos = 0

	for (const info of contratos) {
		const key = getContratoKey(info.numero, info.tipoAto, info.exercicio)
		const apiContrato = apiLookup.get(key)
		if (!apiContrato) continue

		const aditivos = aditivosMap.get(apiContrato.idOxy) || []
		if (!aditivos.length) continue

		for (const a of aditivos) {
			try {
				await prisma.aditivo.upsert({
					where: {
						contratoId_sequencia: {
							contratoId: info.contratoId,
							sequencia: a.sequencia,
						},
					},
					create: {
						organization: { connect: { id: organizationId } },
						contrato: { connect: { id: info.contratoId } },
						sequencia: a.sequencia,
						data: new Date(a.data),
						dataPublicacao: a.dataPublicacao
							? new Date(a.dataPublicacao)
							: null,
						dataTermino: a.dataTermino ? new Date(a.dataTermino) : null,
						valorAditivo: a.valorAditivo,
						motivacao: a.motivacao,
					},
					update: {
						data: new Date(a.data),
						dataPublicacao: a.dataPublicacao
							? new Date(a.dataPublicacao)
							: null,
						dataTermino: a.dataTermino ? new Date(a.dataTermino) : null,
						valorAditivo: a.valorAditivo,
						motivacao: a.motivacao,
					},
				})
				salvos++
			} catch (err) {
				console.warn(
					`[SYNC] Erro ao salvar aditivo seq ${a.sequencia} do contrato ${info.numero}:`,
					err instanceof Error ? err.message : err,
				)
			}
		}
	}

	return salvos
}
