'use server'

import type { TipoNotificacaoRef } from '@/generated/prisma/client'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface NotificationWithHistorico {
	id: string
	createdAt: Date
	title: string
	message: string
	filePath: string
	tipo: string
	tipoNotificacao: TipoNotificacaoRef
	dataEnvio: Date
	assinaturaDigital: string
	contratoNumero: number
	fiscalNome: string | null
	historicoCount: number
	empresaNome?: string
}

export interface EmpresaWithNotifications {
	empresaId: string
	empresaNome: string
	empresaCnpj: string
	notifications: NotificationWithHistorico[]
}

export interface NotificationsResponse {
	groupedByEmpresa: EmpresaWithNotifications[]
	allNotifications: NotificationWithHistorico[]
	stats: {
		total: number
		geral: number
		entrega: number
		fiscalTrabalhista: number
		desconformidade: number
	}
}

export interface NotificationFilterParams {
	search?: string
	startDate?: string
	endDate?: string
}

export async function getNotificationsData({
	search,
	startDate,
	endDate,
}: NotificationFilterParams): Promise<NotificationsResponse> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return {
			groupedByEmpresa: [],
			allNotifications: [],
			stats: { total: 0, geral: 0, entrega: 0, fiscalTrabalhista: 0, desconformidade: 0 },
		}
	}

	const searchNumber = search ? Number.parseInt(search, 10) : Number.NaN
	const isSearchNumber = !Number.isNaN(searchNumber)

	const searchClause = search
		? {
				OR: [
					{ tipo: { contains: search } },
					...(isSearchNumber
						? [{ contrato: { numero: { equals: searchNumber } } }]
						: []),
					{ fiscalDoContrato: { nome: { contains: search } } },
					{ contrato: { empresa: { name: { contains: search } } } },
				],
			}
		: {}

	const dateClause =
		startDate || endDate
			? {
					createdAt: {
						...(startDate && { gte: new Date(startDate) }),
						...(endDate && { lte: new Date(endDate) }),
					},
				}
			: {}

	const baseWhere = {
		organizationId,
		...searchClause,
		...dateClause,
	}

	const includeClause = {
		fiscalDoContrato: { include: { user: { select: { name: true } } } },
		contrato: { include: { empresa: true } },
	}

	try {
		const [
			notificacoes,
			notificacoesEntrega,
			notificacoesEntregaIncompleta,
			notificacoesFiscalTrabalhista,
			notificacoesDesconformidade,
		] = await Promise.all([
			prisma.notificacoes.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: includeClause,
			}),
			prisma.notificacaoEntrega.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: includeClause,
			}),
			prisma.notificacaoEntregaIncompleta.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: includeClause,
			}),
			prisma.notificacaoFiscalTrabalhista.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: includeClause,
			}),
			prisma.notificacaoDesconformidade.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: includeClause,
			}),
		])

		// Buscar contagem de histórico para cada notificação
		const allNotificationIds = [
			...notificacoes.map((n) => ({
				id: n.id,
				tipo: 'NOTIFICACAO' as TipoNotificacaoRef,
			})),
			...notificacoesEntrega.map((n) => ({
				id: n.id,
				tipo: 'NOTIFICACAO_ENTREGA' as TipoNotificacaoRef,
			})),
			...notificacoesEntregaIncompleta.map((n) => ({
				id: n.id,
				tipo: 'NOTIFICACAO_ENTREGA_INCOMPLETA' as TipoNotificacaoRef,
			})),
			...notificacoesFiscalTrabalhista.map((n) => ({
				id: n.id,
				tipo: 'NOTIFICACAO_FISCAL_TRABALHISTA' as TipoNotificacaoRef,
			})),
			...notificacoesDesconformidade.map((n) => ({
				id: n.id,
				tipo: 'NOTIFICACAO_DESCONFORMIDADE' as TipoNotificacaoRef,
			})),
		]

		const historicoCounts = await prisma.notificacaoHistorico.groupBy({
			by: ['notificacaoId', 'tipoNotificacao'],
			where: {
				organizationId,
				OR: allNotificationIds.map((n) => ({
					notificacaoId: n.id,
					tipoNotificacao: n.tipo,
				})),
			},
			_count: { id: true },
		})

		const historicoMap = new Map<string, number>()
		for (const h of historicoCounts) {
			historicoMap.set(`${h.notificacaoId}-${h.tipoNotificacao}`, h._count.id)
		}

		// Mapear notificações
		const mapNotification = (
			n: (typeof notificacoes)[0],
			tipoNotificacao: TipoNotificacaoRef,
			messagePrefix: string,
		): NotificationWithHistorico & {
			empresaId: string
			empresaNome: string
			empresaCnpj: string
		} => ({
			id: n.id,
			createdAt: n.createdAt,
			title: n.tipo,
			message: `${messagePrefix} para o contrato ${n.contrato.numero}`,
			filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
			tipo: n.tipo,
			tipoNotificacao,
			dataEnvio: n.dataEnvio,
			assinaturaDigital: n.assinaturaDigital,
			contratoNumero: n.contrato.numero,
			fiscalNome: n.fiscalDoContrato.user?.name ?? n.fiscalDoContrato.nome,
			historicoCount: historicoMap.get(`${n.id}-${tipoNotificacao}`) ?? 0,
			empresaId: n.contrato.empresa.id,
			empresaNome: n.contrato.empresa.name,
			empresaCnpj: n.contrato.empresa.cnpj,
		})

		const allNotificationsWithEmpresa = [
			...notificacoes.map((n) =>
				mapNotification(n, 'NOTIFICACAO', 'Notificação'),
			),
			...notificacoesEntrega.map((n) =>
				mapNotification(
					n as unknown as (typeof notificacoes)[0],
					'NOTIFICACAO_ENTREGA',
					'Notificação de entrega',
				),
			),
			...notificacoesEntregaIncompleta.map((n) =>
				mapNotification(
					n as unknown as (typeof notificacoes)[0],
					'NOTIFICACAO_ENTREGA_INCOMPLETA',
					'Notificação de entrega incompleta',
				),
			),
			...notificacoesFiscalTrabalhista.map((n) =>
				mapNotification(
					n as unknown as (typeof notificacoes)[0],
					'NOTIFICACAO_FISCAL_TRABALHISTA',
					'Notificação fiscal trabalhista',
				),
			),
			...notificacoesDesconformidade.map((n) =>
				mapNotification(
					n as unknown as (typeof notificacoes)[0],
					'NOTIFICACAO_DESCONFORMIDADE',
					'Notificação de desconformidade',
				),
			),
		].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

		// Agrupar por empresa
		const empresaMap = new Map<string, EmpresaWithNotifications>()

		for (const notification of allNotificationsWithEmpresa) {
			const { empresaId, empresaNome, empresaCnpj, ...notificationData } =
				notification

			if (!empresaMap.has(empresaId)) {
				empresaMap.set(empresaId, {
					empresaId,
					empresaNome,
					empresaCnpj,
					notifications: [],
				})
			}

			empresaMap.get(empresaId)?.notifications.push(notificationData)
		}

		// Ordenar empresas por quantidade de notificações (desc) e depois por nome
		const groupedByEmpresa = Array.from(empresaMap.values()).sort((a, b) => {
			const diff = b.notifications.length - a.notifications.length
			if (diff !== 0) return diff
			return a.empresaNome.localeCompare(b.empresaNome)
		})

		return {
			groupedByEmpresa,
			allNotifications: allNotificationsWithEmpresa.map(({ empresaId, empresaCnpj, ...n }) => n),
			stats: {
				total: allNotificationsWithEmpresa.length,
				geral: notificacoes.length,
				entrega: notificacoesEntrega.length + notificacoesEntregaIncompleta.length,
				fiscalTrabalhista: notificacoesFiscalTrabalhista.length,
				desconformidade: notificacoesDesconformidade.length,
			},
		}
	} catch (error) {
		console.error('Error fetching notifications data:', error)
		return {
			groupedByEmpresa: [],
			allNotifications: [],
			stats: { total: 0, geral: 0, entrega: 0, fiscalTrabalhista: 0, desconformidade: 0 },
		}
	}
}

// Manter compatibilidade se necessário, mas recomendamos usar getNotificationsData
export async function getNotificationsByEmpresa(params: NotificationFilterParams): Promise<EmpresaWithNotifications[]> {
	const data = await getNotificationsData(params)
	return data.groupedByEmpresa
}
