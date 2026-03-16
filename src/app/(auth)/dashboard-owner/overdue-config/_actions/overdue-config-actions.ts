'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

// Tipos de relatórios disponíveis
const REPORT_TYPES_DATA = [
	{
		key: 'BENS_SERVICOS' as const,
		label: 'Bens e Servicos',
		description: 'Aquisicao de bens e servicos (Anexo III)',
	},
	{
		key: 'TRANSPORTE' as const,
		label: 'Transporte',
		description: 'Servicos de transporte',
	},
	{
		key: 'OBRAS' as const,
		label: 'Obras',
		description: 'Execucao de obras e medicoes',
	},
	{
		key: 'TERCEIRIZACAO' as const,
		label: 'Terceirizacao',
		description: 'Servicos terceirizados (Anexo XI)',
	},
	{
		key: 'FISCAL_PRINCIPAL' as const,
		label: 'Fiscal Tecnico',
		description: 'Relatorio do Fiscal Tecnico (Anexo IV)',
	},
]

type ReportTypeKey =
	| 'BENS_SERVICOS'
	| 'TRANSPORTE'
	| 'OBRAS'
	| 'TERCEIRIZACAO'
	| 'FISCAL_PRINCIPAL'

// Valores padrão para cada tipo de relatório
const DEFAULT_OVERDUE_CONFIG: Record<
	ReportTypeKey,
	{ diasOverdue: number; diasAlerta: number }
> = {
	BENS_SERVICOS: { diasOverdue: 30, diasAlerta: 7 },
	TRANSPORTE: { diasOverdue: 60, diasAlerta: 14 },
	OBRAS: { diasOverdue: 30, diasAlerta: 7 },
	TERCEIRIZACAO: { diasOverdue: 30, diasAlerta: 7 },
	FISCAL_PRINCIPAL: { diasOverdue: 30, diasAlerta: 7 },
}

// Tipo para o resultado com metadados
interface OverdueConfigWithMeta {
	id: string
	reportType: string
	diasOverdue: number
	diasAlerta: number
	isActive: boolean
	organizationId: string
	createdAt: Date
	updatedAt: Date
	label: string
	description: string
}

// Função auxiliar para obter os tipos de relatório
export async function getReportTypes() {
	return REPORT_TYPES_DATA
}

// Busca todas as configurações de overdue (cria se não existir)
export const getOverdueConfigs = withPermission(
	'read',
	async (ctx) => {
		// Primeiro, garante que todos os tipos tenham configuração
		const defaults = REPORT_TYPES_DATA.map((rt) => {
			const config = DEFAULT_OVERDUE_CONFIG[rt.key]
			return {
				reportType: rt.key,
				diasOverdue: config.diasOverdue,
				diasAlerta: config.diasAlerta,
				isActive: true,
				organizationId: ctx.organizationId,
			}
		})

		await prisma.reportOverdueConfig.createMany({
			data: defaults,
			skipDuplicates: true,
		})

		// Busca todas as configurações
		const configs = await prisma.reportOverdueConfig.findMany({
			where: {
				organizationId: ctx.organizationId,
			},
			orderBy: { reportType: 'asc' },
		})

		// Adiciona metadados
		const allConfigs: OverdueConfigWithMeta[] = configs.map((c) => {
			const rtInfo = REPORT_TYPES_DATA.find((rt) => rt.key === c.reportType)
			return {
				...c,
				label: rtInfo?.label || c.reportType,
				description: rtInfo?.description || '',
			}
		})

		return { success: true as const, data: allConfigs }
	},
	'CONFIG',
)

// Busca configuração de overdue para um tipo específico (cria se não existir)
export const getOverdueConfigByType = withPermission(
	'read',
	async (ctx, reportType: ReportTypeKey) => {
		// Tenta buscar ou criar
		const defaults = DEFAULT_OVERDUE_CONFIG[reportType]

		const config = await prisma.reportOverdueConfig.upsert({
			where: {
				reportType_organizationId: {
					reportType,
					organizationId: ctx.organizationId,
				},
			},
			update: {},
			create: {
				reportType,
				diasOverdue: defaults.diasOverdue,
				diasAlerta: defaults.diasAlerta,
				isActive: true,
				organizationId: ctx.organizationId,
			},
		})

		return { success: true as const, data: config }
	},
	'CONFIG',
)

// Atualiza ou cria configuração de overdue
export const updateOverdueConfig = withPermission(
	'update',
	async (
		ctx,
		reportType: ReportTypeKey,
		data: { diasOverdue: number; diasAlerta: number; isActive?: boolean },
	) => {
		const reportInfo = REPORT_TYPES_DATA.find((rt) => rt.key === reportType)

		const updated = await prisma.reportOverdueConfig.upsert({
			where: {
				reportType_organizationId: {
					reportType,
					organizationId: ctx.organizationId,
				},
			},
			update: {
				diasOverdue: data.diasOverdue,
				diasAlerta: data.diasAlerta,
				isActive: data.isActive ?? true,
			},
			create: {
				reportType,
				diasOverdue: data.diasOverdue,
				diasAlerta: data.diasAlerta,
				isActive: data.isActive ?? true,
				organizationId: ctx.organizationId,
			},
		})

		ctx.log({
			entityId: updated.id,
			entityName: reportInfo?.label || reportType,
			description: `Atualizou configuracao de vencimento para ${reportInfo?.label || reportType}: ${data.diasOverdue} dias overdue, ${data.diasAlerta} dias alerta`,
			after: data,
		})

		revalidatePath('/dashboard-owner/overdue-config')
		return { success: true as const, data: updated }
	},
	{ module: 'CONFIG', log: 'OVERDUE_CONFIG' },
)

// Inicializa todas as configurações com valores padrão
export const seedDefaultOverdueConfigs = withPermission(
	'create',
	async (ctx) => {
		const defaults = REPORT_TYPES_DATA.map((rt) => {
			const config = DEFAULT_OVERDUE_CONFIG[rt.key]
			return {
				reportType: rt.key,
				diasOverdue: config.diasOverdue,
				diasAlerta: config.diasAlerta,
				isActive: true,
				organizationId: ctx.organizationId,
			}
		})

		const result = await prisma.reportOverdueConfig.createMany({
			data: defaults,
			skipDuplicates: true,
		})

		ctx.log({
			description: `Inicializou configuracoes de vencimento padrao para ${result.count} tipos de relatorio`,
		})

		revalidatePath('/dashboard-owner/overdue-config')
		return { success: true as const, data: { created: result.count } }
	},
	{ module: 'CONFIG', log: 'OVERDUE_CONFIG' },
)

// Reseta uma configuração para os valores padrão
export const resetOverdueConfig = withPermission(
	'update',
	async (ctx, reportType: ReportTypeKey) => {
		const defaults = DEFAULT_OVERDUE_CONFIG[reportType]
		const reportInfo = REPORT_TYPES_DATA.find((rt) => rt.key === reportType)

		const updated = await prisma.reportOverdueConfig.upsert({
			where: {
				reportType_organizationId: {
					reportType,
					organizationId: ctx.organizationId,
				},
			},
			update: {
				diasOverdue: defaults.diasOverdue,
				diasAlerta: defaults.diasAlerta,
				isActive: true,
			},
			create: {
				reportType,
				diasOverdue: defaults.diasOverdue,
				diasAlerta: defaults.diasAlerta,
				isActive: true,
				organizationId: ctx.organizationId,
			},
		})

		ctx.log({
			entityId: updated.id,
			entityName: reportInfo?.label || reportType,
			description: `Resetou configuracao de vencimento para ${reportInfo?.label || reportType} aos valores padrao`,
		})

		revalidatePath('/dashboard-owner/overdue-config')
		return { success: true as const, data: updated }
	},
	{ module: 'CONFIG', log: 'OVERDUE_CONFIG' },
)
