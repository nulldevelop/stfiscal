'use server'

import fs from 'node:fs'
import path from 'node:path'
import pdf from '@react-pdf/renderer'
import qrcode from 'qrcode'
import React from 'react'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { ReportPdf } from '../_components/report-pdf'

import { withPermission } from '@/lib/permissions/with-permission'

export const finalizeTerceirizacaoReport = withPermission(
	'create',
	async (ctx, { reportId }: { reportId: string }) => {
		const { userId, organizationId, userName } = ctx

		const existingReport = await prisma.terceirizacaoReport.findUnique({
			where: { id: reportId },
			include: {
				contrato: {
					select: {
						dataInicio: true,
						dataFim: true,
					},
				},
			},
		})

		if (!existingReport) {
			return { success: false, error: 'Relatório não encontrado.' }
		}

		if (existingReport.status === 'FINALIZADO') {
			return { success: false, error: 'Este relatório já foi finalizado.' }
		}

		const fiscalContrato = await prisma.fiscalContrato.findFirst({
			where: {
				userId,
				organizationId,
				contratos: { some: { contratoId: existingReport.contratoId } },
			},
		})

		if (!fiscalContrato || fiscalContrato.id !== existingReport.fiscalContratoId) {
			return {
				success: false,
				error: 'Você não é o fiscal responsável por este relatório.',
			}
		}

		const updatedReport = await prisma.terceirizacaoReport.update({
			where: { id: reportId },
			data: { assinaturaDigital: simpleHash(reportId) },
		})

		const configs = await prisma.formConfig.findMany({
			where: { reportType: 'TERCEIRIZACAO', organizationId },
		})

		const brasaoPath = path.join(process.cwd(), 'public', 'imgs', 'Brasao.png')
		let brasaoBase64 = ''
		try {
			const buf = fs.readFileSync(brasaoPath)
			brasaoBase64 = `data:image/png;base64,${buf.toString('base64')}`
		} catch (error) {
			console.warn('Brasão não encontrado, usando valor padrão:', error)
		}

		const siteUrl = process.env.LINK_URL ?? ''
		const verificationUrl = `${siteUrl}/verify-report/${updatedReport.assinaturaDigital}`
		const qrCodeUrl = await qrcode.toDataURL(verificationUrl)

		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { name: true, cidade: true },
		})

		const reportDataForPdf = {
			...updatedReport,
			user: { name: userName },
			type: 'Terceirização de Mão de Obra',
			dataInicio: existingReport.contrato.dataInicio,
			dataFim: existingReport.contrato.dataFim,
			qrCodeUrl,
			brasaoBase64,
			configs,
			organizationName: organization?.name ?? 'Prefeitura Municipal',
			organizationCidade: organization?.cidade ?? null,
		}

		const pdfStream = await pdf
			.renderToStream(
				React.createElement(ReportPdf, {
					report: reportDataForPdf as any,
					siteUrl: siteUrl,
				}) as any,
			)
			.catch((err) => {
				console.error('PDF Generation Error:', err)
				return null
			})

		if (!pdfStream) return { success: false, error: 'Falha ao gerar o PDF.' }

		const reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'storage', 'reports')
		if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

		const filePath = path.join(reportsDir, `${updatedReport.protocolo}.pdf`)
		const writeStream = fs.createWriteStream(filePath)
		await new Promise<void>((resolve, reject) => {
			pdfStream.pipe(writeStream)
			pdfStream.on('end', () => resolve())
			pdfStream.on('error', reject)
		})

		await prisma.terceirizacaoReport.update({
			where: { id: reportId },
			data: {
				status: 'FINALIZADO',
				pdfPath: `/api/reports/${updatedReport.protocolo}.pdf`,
			},
		})

		return {
			success: true,
			data: {
				message: 'Relatório finalizado com sucesso!',
				filePath: `/api/reports/${updatedReport.protocolo}.pdf`,
			},
		}
	},
	{
		module: 'fiscal-relatorios',
		log: 'TERCEIRIZACAO_FINALIZE',
	},
)
