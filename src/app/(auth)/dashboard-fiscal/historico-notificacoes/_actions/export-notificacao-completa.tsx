'use server'

import fs from 'node:fs'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import type { TipoNotificacaoRef } from '@/generated/prisma/client'
import { CompleteNotificationPdf } from '../_components/complete-notification-pdf'
import { getNotificationById } from '../_data-access/get-notifications-by-empresa'
import { getHistoricoByNotificacao } from './historico-actions'

interface HistoricoItem {
	id: string
	tipo: string
	titulo: string
	descricao: string | null
	anexoPath: string | null
	anexoNome: string | null
	createdAt: Date
	user: { name: string | null }
}

async function processImageAttachment(
	anexoPath: string | null,
): Promise<string[]> {
	if (!anexoPath) return []

	try {
		const fileName = anexoPath.split('/').pop()
		const attachmentsDir =
			process.env.ATTACHMENTS_DIR ||
			path.join(process.cwd(), 'public', 'attachments')
		const filePath = path.join(attachmentsDir, fileName || '')

		if (!fs.existsSync(filePath)) return []

		const ext = fileName?.split('.').pop()?.toLowerCase()

		// Se for imagem, retorna o data URI dela para o react-pdf
		if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
			const image = fs.readFileSync(filePath)
			const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
			return [`data:${mimeType};base64,${image.toString('base64')}`]
		}
	} catch (error) {
		console.error('Erro ao processar imagem:', error)
	}

	return []
}

export async function exportNotificacaoCompleta(
	id: string,
	tipoNotificacao: TipoNotificacaoRef,
) {
	try {
		const [notification, historicosRes] = await Promise.all([
			getNotificationById(id, tipoNotificacao),
			getHistoricoByNotificacao(id, tipoNotificacao),
		])

		if (!notification) {
			return { success: false, error: 'Notificação não encontrada' }
		}

		if (!historicosRes.success) {
			return {
				success: false,
				error: 'Erro ao buscar histórico da notificação',
			}
		}

		const historicosRaw = (historicosRes.data || []) as HistoricoItem[]

		// Processar apenas images para o componente React-PDF
		const historicos = await Promise.all(
			historicosRaw.map(async (h) => {
				const processedImages = await processImageAttachment(h.anexoPath)
				return {
					...h,
					processedImages,
				}
			}),
		)

		// 1. Gerar o PDF BASE (Relatório + images)
		const basePdfBuffer = await renderToBuffer(
			<CompleteNotificationPdf
				notification={notification}
				historicos={historicos}
			/>,
		)

		// 2. Usar pdf-lib para mesclar ANEXOS PDF, se existirem
		const mainPdfDoc = await PDFDocument.load(basePdfBuffer)

		for (const h of historicosRaw) {
			if (h.anexoPath?.toLowerCase().endsWith('.pdf')) {
				try {
					const fileName = h.anexoPath.split('/').pop()
					const attachmentsDir =
						process.env.ATTACHMENTS_DIR ||
						path.join(process.cwd(), 'public', 'attachments')
					const filePath = path.join(attachmentsDir, fileName || '')

					if (fs.existsSync(filePath)) {
						const attachmentPdfBytes = fs.readFileSync(filePath)
						const attachmentPdfDoc = await PDFDocument.load(attachmentPdfBytes)

						// Copiar todas as páginas do anexo para o documento principal
						const copiedPages = await mainPdfDoc.copyPages(
							attachmentPdfDoc,
							attachmentPdfDoc.getPageIndices(),
						)

						copiedPages.forEach((page) => {
							mainPdfDoc.addPage(page)
						})
					}
				} catch (mergeErr) {
					console.error('Erro ao mesclar anexo PDF:', mergeErr)
				}
			}
		}

		// 3. Obter o buffer final (seja mesclado ou apenas o base)
		const finalPdfBytes = await mainPdfDoc.save()
		const finalPdfBuffer = Buffer.from(finalPdfBytes)

		// Definir o diretório de notificações
		const notificationsDir =
			process.env.NOTIFICATION_DIR ||
			path.join(process.cwd(), 'public', 'notificacoes')

		if (!fs.existsSync(notificationsDir)) {
			fs.mkdirSync(notificationsDir, { recursive: true })
		}

		const filename = `completa_${notification.assinaturaDigital}.pdf`
		const filePath = path.join(notificationsDir, filename)

		// Salvar o arquivo final
		fs.writeFileSync(filePath, finalPdfBuffer)

		return {
			success: true,
			filePath: `/api/notifications/${filename}`,
			filename,
		}
	} catch (error) {
		console.error('Erro ao exportar notificação completa:', error)
		return { success: false, error: 'Erro ao gerar PDF completo' }
	}
}
