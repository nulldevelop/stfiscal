import { prisma } from '@/lib/prisma'

// Mapeamento de tipos de relatório para as chaves de configuração
const REPORT_TYPE_MAP: Record<string, string> = {
	'Bens e Servicos': 'BENS_SERVICOS',
	'Bens e Serviços': 'BENS_SERVICOS',
	Transporte: 'TRANSPORTE',
	Obras: 'OBRAS',
	Terceirizacao: 'TERCEIRIZACAO',
	Terceirização: 'TERCEIRIZACAO',
	'Fiscal Tecnico': 'FISCAL_PRINCIPAL',
	'Fiscal Técnico': 'FISCAL_PRINCIPAL',
}

// Valores padrão caso não exista configuração
const DEFAULT_CONFIGS: Record<
	string,
	{ diasOverdue: number; diasAlerta: number }
> = {
	BENS_SERVICOS: { diasOverdue: 30, diasAlerta: 7 },
	TRANSPORTE: { diasOverdue: 60, diasAlerta: 14 },
	OBRAS: { diasOverdue: 30, diasAlerta: 7 },
	TERCEIRIZACAO: { diasOverdue: 30, diasAlerta: 7 },
	FISCAL_PRINCIPAL: { diasOverdue: 30, diasAlerta: 7 },
}

export type OverdueStatus =
	| 'ok' // Dentro do prazo
	| 'warning' // Proximo do vencimento (dentro do periodo de alerta)
	| 'overdue' // Atrasado

export interface OverdueInfo {
	status: OverdueStatus
	diasRestantes: number // Dias positivos = faltam X dias, negativos = atrasado X dias
	diasOverdue: number // Configuracao de dias para overdue
	diasAlerta: number // Configuracao de dias para alerta
}

/**
 * Busca as configurações de overdue para uma organização
 */
export async function getOverdueConfigsForOrg(organizationId: string) {
	const configs = await prisma.reportOverdueConfig.findMany({
		where: {
			organizationId,
			isActive: true,
		},
	})

	// Cria um mapa de reportType -> config
	const configMap: Record<string, { diasOverdue: number; diasAlerta: number }> =
		{}

	for (const config of configs) {
		configMap[config.reportType] = {
			diasOverdue: config.diasOverdue,
			diasAlerta: config.diasAlerta,
		}
	}

	// Preenche com defaults para tipos não configurados
	for (const [key, defaults] of Object.entries(DEFAULT_CONFIGS)) {
		if (!configMap[key]) {
			configMap[key] = defaults
		}
	}

	return configMap
}

/**
 * Calcula o status de overdue de um relatório
 * @param reportType - Tipo do relatório (ex: "Bens e Serviços", "Transporte")
 * @param periodoAnalisadoFim - Data de fim do período analisado
 * @param config - Configuração de overdue (dias)
 */
export function calculateOverdueStatus(
	reportType: string,
	periodoAnalisadoFim: Date,
	config: { diasOverdue: number; diasAlerta: number },
): OverdueInfo {
	const now = new Date()
	const dataVencimento = new Date(periodoAnalisadoFim)
	dataVencimento.setDate(dataVencimento.getDate() + config.diasOverdue)

	const diffTime = dataVencimento.getTime() - now.getTime()
	const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	let status: OverdueStatus = 'ok'

	if (diasRestantes < 0) {
		status = 'overdue'
	} else if (diasRestantes <= config.diasAlerta) {
		status = 'warning'
	}

	return {
		status,
		diasRestantes,
		diasOverdue: config.diasOverdue,
		diasAlerta: config.diasAlerta,
	}
}

/**
 * Retorna a chave de configuração para um tipo de relatório
 */
export function getConfigKeyForReportType(reportType: string): string {
	return REPORT_TYPE_MAP[reportType] || 'BENS_SERVICOS'
}
