'use server'

import { endOfMonth, startOfMonth } from 'date-fns'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface NotificationFilterParams {
	month: number
	year: number
	search?: string
}

export async function getNotifications({
	month,
	year,
	search,
}: NotificationFilterParams) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return []
	}

	const startDate = startOfMonth(new Date(year, month - 1))
	const endDate = endOfMonth(new Date(year, month - 1))

	const searchNumber = search ? parseInt(search, 10) : NaN
	const isSearchNumber = !Number.isNaN(searchNumber)

	const searchClause = search
		? {
				OR: [
					{ tipo: { contains: search } },
					...(isSearchNumber
						? [{ contrato: { numero: { equals: searchNumber } } }]
						: []),
					{ fiscalDoContrato: { nome: { contains: search } } },
				],
			}
		: {}

	const baseWhere = {
		organizationId,
		createdAt: {
			gte: startDate,
			lte: endDate,
		},
		...searchClause,
	}

	try {
		const notificacoes = await prisma.notificacoes.findMany({
			where: baseWhere,
			orderBy: { createdAt: 'desc' },
			include: {
				fiscalDoContrato: { include: { user: { select: { name: true } } } },
				contrato: true,
			},
		})

		const notificacoesEntrega = await prisma.notificacaoEntrega.findMany({
			where: baseWhere,
			orderBy: { createdAt: 'desc' },
			include: {
				fiscalDoContrato: { include: { user: { select: { name: true } } } },
				contrato: true,
			},
		})

		const notificacoesEntregaIncompleta =
			await prisma.notificacaoEntregaIncompleta.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			})

		const notificacoesFiscalTrabalhista =
			await prisma.notificacaoFiscalTrabalhista.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			})

		const notificacoesDesconformidade =
			await prisma.notificacaoDesconformidade.findMany({
				where: baseWhere,
				orderBy: { createdAt: 'desc' },
				include: {
					fiscalDoContrato: { include: { user: { select: { name: true } } } },
					contrato: true,
				},
			})

		const allNotifications = [
			...notificacoes.map((n) => ({
				title: n.tipo,
				message: `Notificação para o contrato ${n.contrato.numero}`,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				user: n.fiscalDoContrato.user,
				...n,
			})),
			...notificacoesEntrega.map((n) => ({
				title: n.tipo,
				message: `Notificação de entrega para o contrato ${n.contrato.numero}`,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				user: n.fiscalDoContrato.user,
				...n,
			})),
			...notificacoesEntregaIncompleta.map((n) => ({
				title: n.tipo,
				message: `Notificação de entrega incompleta para o contrato ${n.contrato.numero}`,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				user: n.fiscalDoContrato.user,
				...n,
			})),
			...notificacoesFiscalTrabalhista.map((n) => ({
				title: n.tipo,
				message: `Notificação fiscal trabalhista para o contrato ${n.contrato.numero}`,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				user: n.fiscalDoContrato.user,
				...n,
			})),
			...notificacoesDesconformidade.map((n) => ({
				title: n.tipo,
				message: `Notificação de desconformidade para o contrato ${n.contrato.numero}`,
				filePath: `/api/notifications/${n.assinaturaDigital}.pdf`,
				user: n.fiscalDoContrato.user,
				...n,
			})),
		]

		allNotifications.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		)

		return allNotifications
	} catch (error) {
		console.error('Error fetching notifications:', error)
		return []
	}
}
