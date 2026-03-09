'use server'

import { renderToBuffer } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import type {
	NotificacaoDesconformidade,
	NotificacaoEntrega,
	NotificacaoEntregaIncompleta,
} from '@/generated/prisma/client'
import { getSession } from '@/lib/auth-actions'
import { getContratoDetailsForPdf } from '../_data-access/get-contrato-details-for-pdf'
import { AnexoXXIITemplate } from '../pdf-templates/desconformidade'
import { AnexoEntregaTemplate } from '../pdf-templates/entrega'
import { AnexoEntregaIncompletaTemplate } from '../pdf-templates/entrega-incompleta'

interface PreviewEntregaData {
	contratoId: string
	numeroEmpenho?: string
	dataEmpenho?: Date | string
	emailEmpenho?: string
	responsavelEmpenho?: string
	prazoEntrega?: number
	dataCertidaoOcorrencia?: Date | string
	prazoDefesa?: number
	item?: string
	desconformidade?: string
	empresaEndereco?: string
	empresaRepresentanteNome?: string
	empresaRepresentanteCpf?: string
}

interface PreviewDesconformidadeData {
	contratoId: string
	numeroEmpenho?: string
	dataEmpenho?: Date | string
	emailEmpenho?: string
	responsavelEmpenho?: string
	dataCertidaoOcorrencia?: Date | string
	prazoRegularizacao?: number
	items?: {
		titulo: string
		caracteristicasContrato: string
		caracteristicasRecebido: string
	}[]
	empresaEndereco?: string
	empresaRepresentanteNome?: string
	empresaRepresentanteCpf?: string
}

type PreviewInput =
	| { tipo: 'entrega'; dados: PreviewEntregaData }
	| { tipo: 'entrega-incompleta'; dados: PreviewEntregaData }
	| { tipo: 'desconformidade'; dados: PreviewDesconformidadeData }

function toDateOrNull(value: Date | string | undefined | null): Date | null {
	if (!value) return null
	if (value instanceof Date) return value
	const parsed = new Date(value)
	return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function previewNotificacaoPdf(input: PreviewInput) {
	const session = await getSession()
	if (!session) {
		return { success: false, error: 'Usuário não autenticado.' }
	}

	try {
		const { tipo, dados } = input

		const contratoDetails = await getContratoDetailsForPdf(dados.contratoId)
		if (contratoDetails.error || !contratoDetails.data) {
			return { success: false, error: 'Erro ao buscar dados do contrato.' }
		}

		const empresaEndereco =
			dados.empresaEndereco || contratoDetails.data.empresaEndereco
		const empresaRepresentanteNome =
			dados.empresaRepresentanteNome ||
			contratoDetails.data.empresaRepresentanteNome
		const empresaRepresentanteCpf =
			dados.empresaRepresentanteCpf ||
			contratoDetails.data.empresaRepresentanteCpf

		const pdfData = {
			...contratoDetails.data,
			empresaEndereco,
			empresaRepresentanteNome,
			empresaRepresentanteCpf,
		}

		const qrCodeDataUri = await QRCode.toDataURL('PREVIEW')

		const now = new Date()
		const baseNotificacao = {
			id: 'preview',
			contratoId: dados.contratoId,
			organizationId: '',
			fiscalContratoId: '',
			dataEnvio: now,
			assinaturaDigital: 'PREVIEW',
			createdAt: now,
			updatedAt: now,
		}

		let pdfBuffer: Buffer

		if (tipo === 'entrega') {
			const notificacao: NotificacaoEntrega = {
				...baseNotificacao,
				tipo: 'Notificação Extrajudicial - Falta ou Atraso na Entrega',
				numeroEmpenho: dados.numeroEmpenho || null,
				dataEmpenho: toDateOrNull(dados.dataEmpenho),
				emailEmpenho: dados.emailEmpenho || null,
				responsavelEmpenho: dados.responsavelEmpenho || null,
				prazoEntrega: dados.prazoEntrega ?? null,
				dataCertidaoOcorrencia: toDateOrNull(dados.dataCertidaoOcorrencia),
				prazoDefesa: dados.prazoDefesa ?? null,
				item: dados.item || null,
				desconformidade: dados.desconformidade || null,
			}

			pdfBuffer = await renderToBuffer(
				<AnexoEntregaTemplate
					data={pdfData}
					notificacao={notificacao}
					qrCodeUrl={qrCodeDataUri}
				/>,
			)
		} else if (tipo === 'entrega-incompleta') {
			const notificacao: NotificacaoEntregaIncompleta = {
				...baseNotificacao,
				tipo: 'Notificação Extrajudicial - Entrega Incompleta',
				numeroEmpenho: dados.numeroEmpenho || null,
				dataEmpenho: toDateOrNull(dados.dataEmpenho),
				emailEmpenho: dados.emailEmpenho || null,
				responsavelEmpenho: dados.responsavelEmpenho || null,
				prazoEntrega: dados.prazoEntrega ?? null,
				dataCertidaoOcorrencia: toDateOrNull(dados.dataCertidaoOcorrencia),
				prazoDefesa: dados.prazoDefesa ?? null,
				item: dados.item || null,
				desconformidade: dados.desconformidade || null,
			}

			pdfBuffer = await renderToBuffer(
				<AnexoEntregaIncompletaTemplate
					data={pdfData}
					notificacao={notificacao}
					qrCodeUrl={qrCodeDataUri}
				/>,
			)
		} else {
			const items = dados.items ?? []
			const notificacao: NotificacaoDesconformidade = {
				...baseNotificacao,
				tipo: 'Notificação Extrajudicial - Desconformidade',
				numeroEmpenho: dados.numeroEmpenho || null,
				dataEmpenho: toDateOrNull(dados.dataEmpenho),
				emailEmpenho: dados.emailEmpenho || null,
				responsavelEmpenho: dados.responsavelEmpenho || null,
				dataCertidaoOcorrencia: toDateOrNull(dados.dataCertidaoOcorrencia),
				itemDesconformidade: JSON.stringify(items),
				prazoRegularizacao: dados.prazoRegularizacao ?? 0,
			}

			pdfBuffer = await renderToBuffer(
				<AnexoXXIITemplate
					data={pdfData}
					notificacao={notificacao}
					qrCodeUrl={qrCodeDataUri}
					items={items}
				/>,
			)
		}

		const base64 = Buffer.from(pdfBuffer).toString('base64')
		return { success: true, pdfBase64: base64 }
	} catch (error) {
		console.error('Erro ao gerar pré-visualização do PDF:', error)
		return { success: false, error: 'Erro ao gerar pré-visualização.' }
	}
}
