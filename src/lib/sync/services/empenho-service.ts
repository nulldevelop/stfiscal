import { prisma } from '@/lib/prisma'
import type { EmpenhoOxy } from '../api/oxy-api'

// 13 colunas de dados + 3 fixas (origem, createdAt, updatedAt) = 16 por linha
// MySQL max params: 65535 → 65535 / 13 ≈ 5041; usando 2000 com margem segura
const BATCH_SIZE = 2000

type EmpenhoRow = {
	organizationId: string
	contratoId: string
	numero: number
	exercicio: number
	data: Date
	fornecedor: string
	historico: string | null
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
}

export function buildEmpenhoRows(
	organizationId: string,
	contratoIds: string[],
	empenhos: EmpenhoOxy[],
): EmpenhoRow[] {
	return contratoIds.flatMap((contratoId) =>
		empenhos.map((e) => ({
			organizationId,
			contratoId,
			numero: e.empenho,
			exercicio: e.exercicio,
			data: new Date(e.data),
			fornecedor: e.nome,
			historico: e.historico || null,
			valorEmpenhado: e.valorEmpenhado,
			valorAnulado: e.valorAnulado,
			valorLiquidado: e.valorLiquidado,
			valorRetido: e.valorRetido,
			valorPago: e.valorPago,
			valorAPagar: e.valorAPagar,
		})),
	)
}

export async function bulkUpsertEmpenhos(rows: EmpenhoRow[]): Promise<number> {
	if (rows.length === 0) return 0

	let totalSalvos = 0

	for (let i = 0; i < rows.length; i += BATCH_SIZE) {
		const batch = rows.slice(i, i + BATCH_SIZE)

		// Placeholder fixo — sem regex, sem surpresas
		const placeholders = batch
			.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "API", NOW(), NOW())')
			.join(', ')

		const values = batch.flatMap((r) => [
			r.organizationId,
			r.contratoId,
			r.numero,
			r.exercicio,
			r.data,
			r.fornecedor,
			r.historico,
			r.valorEmpenhado,
			r.valorAnulado,
			r.valorLiquidado,
			r.valorRetido,
			r.valorPago,
			r.valorAPagar,
		])

		await prisma.$executeRawUnsafe(
			`INSERT INTO Empenho
				(organizationId, contratoId, numero, exercicio, data, fornecedor, historico,
				 valorEmpenhado, valorAnulado, valorLiquidado, valorRetido, valorPago, valorAPagar, origem,
				 createdAt, updatedAt)
			VALUES ${placeholders}
			ON DUPLICATE KEY UPDATE
				data            = VALUES(data),
				fornecedor      = VALUES(fornecedor),
				historico       = VALUES(historico),
				valorEmpenhado  = VALUES(valorEmpenhado),
				valorAnulado    = VALUES(valorAnulado),
				valorLiquidado  = VALUES(valorLiquidado),
				valorRetido     = VALUES(valorRetido),
				valorPago       = VALUES(valorPago),
				valorAPagar     = VALUES(valorAPagar),
				updatedAt       = NOW()`,
			...values,
		)

		totalSalvos += batch.length
	}

	return totalSalvos
}

export async function syncEmpenhosForLicitacao(
	organizationId: string,
	contratoIds: string[],
	empenhos: EmpenhoOxy[],
): Promise<number> {
	if (contratoIds.length === 0 || empenhos.length === 0) return 0
	return bulkUpsertEmpenhos(buildEmpenhoRows(organizationId, contratoIds, empenhos))
}
