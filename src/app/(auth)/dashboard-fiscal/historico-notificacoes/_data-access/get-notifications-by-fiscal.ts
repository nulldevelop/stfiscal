/** biome-ignore-all lint/suspicious/noExplicitAny: dev */
'use server'
import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

interface GetNotificationsByFiscalParams {
	page?: number
	pageSize?: number
	search?: string
}

type NotificationData = {
	id: string
	createdAt: Date
	type: string
	protocolo: string
	contratoNumero: number
	user: { name: string | null } | null
	filePath: string
	[key: string]: any
}

export async function getNotificationsByFiscal({
	page = 1,
	pageSize = 10,
	search = '',
}: GetNotificationsByFiscalParams) {
	const organizationId = await getCurrentOrganizationId()
	const userId = await getCurrentUserId()

	if (!organizationId || !userId) {
		return { notifications: [], total: 0 }
	}

	const commonWhere = {
		organizationId,
		fiscalDoContrato: {
			userId: userId,
		},
	}

	const offset = (page - 1) * pageSize

	const _searchConditions = (search: string) =>
		search
			? {
					OR: [
						{ contratada: { contains: search } },
						{ contratoNumero: { contains: search } },
						{ objeto: { contains: search } },
						{ protocolo: { contains: search } },
					],
				}
			: {}

	const notificacoesSearchConditions = search
		? { OR: [{ tipo: { contains: search } }, { item: { contains: search } }] }
		: {}
	const notificacaoEntregaSearchConditions = search
		? { OR: [{ tipo: { contains: search } }, { item: { contains: search } }] }
		: {}
	const notificacaoEntregaIncompletaSearchConditions = search
		? { OR: [{ tipo: { contains: search } }, { item: { contains: search } }] }
		: {}
	const notificacaoFiscalTrabalhistaSearchConditions = search
		? {
				OR: [
					{ tipo: { contains: search } },
					{ certidaoNome: { contains: search } },
				],
			}
		: {}
	const notificacaoDesconformidadeSearchConditions = search
		? {
				OR: [
					{ tipo: { contains: search } },
					{ itemDesconformidade: { contains: search } },
				],
			}
		: {}

	try {
		const [
			totalNotificacoes,
			totalNotificacaoEntrega,
			totalNotificacaoEntregaIncompleta,
			totalNotificacaoFiscalTrabalhista,
			totalNotificacaoDesconformidade,
		] = await Promise.all([
			prisma.notificacoes.count({
				where: { ...commonWhere, ...notificacoesSearchConditions },
			}),
			prisma.notificacaoEntrega.count({
				where: { ...commonWhere, ...notificacaoEntregaSearchConditions },
			}),
			prisma.notificacaoEntregaIncompleta.count({
				where: {
					...commonWhere,
					...notificacaoEntregaIncompletaSearchConditions,
				},
			}),
			prisma.notificacaoFiscalTrabalhista.count({
				where: {
					...commonWhere,
					...notificacaoFiscalTrabalhistaSearchConditions,
				},
			}),
			prisma.notificacaoDesconformidade.count({
				where: {
					...commonWhere,
					...notificacaoDesconformidadeSearchConditions,
				},
			}),
		])

		const total =
			totalNotificacoes +
			totalNotificacaoEntrega +
			totalNotificacaoEntregaIncompleta +
			totalNotificacaoFiscalTrabalhista +
			totalNotificacaoDesconformidade

		if (total === 0) {
			return { notifications: [], total: 0 }
		}
		const LIMIT_FETCH = offset + pageSize

		const [
			notificacoes,
			notificacaoEntrega,
			notificacaoEntregaIncompleta,
			notificacaoFiscalTrabalhista,
			notificacaoDesconformidade,
		] = await Promise.all([
			prisma.notificacoes.findMany({
				where: { ...commonWhere, ...notificacoesSearchConditions },
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
			prisma.notificacaoEntrega.findMany({
				where: { ...commonWhere, ...notificacaoEntregaSearchConditions },
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
			prisma.notificacaoEntregaIncompleta.findMany({
				where: {
					...commonWhere,
					...notificacaoEntregaIncompletaSearchConditions,
				},
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
			prisma.notificacaoFiscalTrabalhista.findMany({
				where: {
					...commonWhere,
					...notificacaoFiscalTrabalhistaSearchConditions,
				},
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
			prisma.notificacaoDesconformidade.findMany({
				where: {
					...commonWhere,
					...notificacaoDesconformidadeSearchConditions,
				},
				orderBy: { createdAt: 'desc' },
				take: LIMIT_FETCH,
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			}),
		])
		const allNotifications: NotificationData[] = [
			...notificacoes.map((n) => ({
				...n,
				type: n.tipo,
				user: n.fiscalDoContrato.user,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				contratoNumero: n.contrato.numero,
				protocolo: n.assinaturaDigital,
			})),
			...notificacaoEntrega.map((n) => ({
				...n,
				type: n.tipo,
				user: n.fiscalDoContrato.user,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				contratoNumero: n.contrato.numero,
				protocolo: n.assinaturaDigital,
			})),
			...notificacaoEntregaIncompleta.map((n) => ({
				...n,
				type: n.tipo,
				user: n.fiscalDoContrato.user,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				contratoNumero: n.contrato.numero,
				protocolo: n.assinaturaDigital,
			})),
			...notificacaoFiscalTrabalhista.map((n) => ({
				...n,
				type: n.tipo,
				user: n.fiscalDoContrato.user,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				contratoNumero: n.contrato.numero,
				protocolo: n.assinaturaDigital,
			})),
			...notificacaoDesconformidade.map((n) => ({
				...n,
				type: n.tipo,
				user: n.fiscalDoContrato.user,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				contratoNumero: n.contrato.numero,
				protocolo: n.assinaturaDigital,
			})),
		]

		// Ordenação (em memória) por data de criação (mais recente primeiro)
		allNotifications.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		)

		// Paginação (em memória)
		const paginatedNotifications = allNotifications.slice(
			offset,
			offset + pageSize,
		)

		return { notifications: paginatedNotifications, total }
	} catch (error) {
		console.error('Error fetching notifications by fiscal:', error)
		return { notifications: [], total: 0 }
	}
}
