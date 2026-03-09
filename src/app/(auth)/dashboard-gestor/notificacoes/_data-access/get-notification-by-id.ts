'use server'

import type { TipoNotificacaoRef } from '@/generated/prisma/client'
import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { differenceInDays } from 'date-fns'

export interface NotificationDetail {
	id: string
	createdAt: Date
	tipo: string
	tipoNotificacao: TipoNotificacaoRef
	dataEnvio: Date
	assinaturaDigital: string
	contratoNumero: number
	contratoId: string
	fiscalNome: string | null
	empresaNome: string
	empresaCnpj: string
	filePath: string
	detalhesEspecificos: any
}

export async function getNotificationById(
	id: string,
	type: TipoNotificacaoRef,
): Promise<NotificationDetail | null> {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) return null

	const includeClause = {
		fiscalDoContrato: { include: { user: { select: { name: true } } } },
		contrato: { include: { empresa: true } },
	}

	try {
		let data: any = null

		switch (type) {
			case 'NOTIFICACAO':
				data = await prisma.notificacoes.findUnique({
					where: { id, organizationId },
					include: includeClause,
				})
				break
			case 'NOTIFICACAO_ENTREGA':
				data = await prisma.notificacaoEntrega.findUnique({
					where: { id, organizationId },
					include: includeClause,
				})
				break
			case 'NOTIFICACAO_ENTREGA_INCOMPLETA':
				data = await prisma.notificacaoEntregaIncompleta.findUnique({
					where: { id, organizationId },
					include: includeClause,
				})
				break
			case 'NOTIFICACAO_FISCAL_TRABALHISTA':
				data = await prisma.notificacaoFiscalTrabalhista.findUnique({
					where: { id, organizationId },
					include: includeClause,
				})
				break
			case 'NOTIFICACAO_DESCONFORMIDADE':
				data = await prisma.notificacaoDesconformidade.findUnique({
					where: { id, organizationId },
					include: includeClause,
				})
				break
		}

		if (!data) return null

		const { fiscalDoContrato, contrato, ...rest } = data

		return {
			id: data.id,
			createdAt: data.createdAt,
			tipo: data.tipo,
			tipoNotificacao: type,
			dataEnvio: data.dataEnvio,
			assinaturaDigital: data.assinaturaDigital,
			contratoNumero: contrato.numero,
			contratoId: contrato.id,
			fiscalNome: fiscalDoContrato.user?.name ?? fiscalDoContrato.nome,
			empresaNome: contrato.empresa.name,
			empresaCnpj: contrato.empresa.cnpj,
			filePath: `/api/notifications/${data.assinaturaDigital}.pdf`,
			detalhesEspecificos: rest,
		}
	} catch (error) {
		console.error('Error fetching notification by ID:', error)
		return null
	}
}
