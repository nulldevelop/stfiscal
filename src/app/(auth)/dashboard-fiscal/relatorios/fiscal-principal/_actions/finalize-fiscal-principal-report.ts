'use server'

import fs from 'node:fs'
import path from 'node:path'
import pdf from '@react-pdf/renderer'
import qrcode from 'qrcode'
import React from 'react'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { FiscalPrincipalReportPdf } from '../_components/report-pdf'

export async function finalizeFiscalPrincipalReport(
	reportId: string,
) {
	const session = await getSession()
	const organizationId = await getCurrentOrganizationId()

	if (!session) throw new Error('Usuário não autenticado.')
	if (!organizationId) throw new Error('Organização não encontrada.')

	const member = await prisma.member.findFirst({
		where: { userId: session.user.id, organizationId },
	})

	if (!member) throw new Error('Membro não encontrado.')

	if (member.role !== 'FISCAL_PRINCIPAL') {
		return { error: 'Apenas o Fiscal Tecnico pode finalizar este relatório.', data: null }
	}

	const existingReport = await prisma.fiscalPrincipalReport.findUnique({
		where: { id: reportId },
	})

	if (!existingReport) {
		return { error: 'Relatório não encontrado.', data: null }
	}

	if (existingReport.status === 'FINALIZADO') {
		return { error: 'Este relatório já foi finalizado.', data: null }
	}

	const fiscalContrato = await prisma.fiscalContrato.findFirst({
		where: {
			userId: session.user.id,
			organizationId,
			contratos: { some: { contratoId: existingReport.contratoId } },
		},
	})

	if (!fiscalContrato || fiscalContrato.id !== existingReport.fiscalContratoId) {
		return { error: 'Você não é o fiscal responsável por este relatório.', data: null }
	}

	const contract = await prisma.contrato.findUnique({
		where: { id: existingReport.contratoId },
		select: { dataInicio: true, dataFim: true },
	})

	const updatedReport = await prisma.fiscalPrincipalReport.update({
		where: { id: reportId },
		data: { assinaturaDigital: simpleHash(reportId) },
	})

	const configs = await prisma.formConfig.findMany({
		where: {
			organizationId,
			reportType: 'FISCAL_PRINCIPAL',
			isActive: true,
		},
		orderBy: { order: 'asc' },
	})

	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true, cidade: true },
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

	const atosDeFormato = existingReport.atosDeFormato ? JSON.parse(existingReport.atosDeFormato) : []
	const medidasAdotadas = existingReport.medidasAdotadas ? JSON.parse(existingReport.medidasAdotadas) : []

	const reportData = {
		...updatedReport,
		user: { name: session.user.name },
		brasaoBase64,
		qrCodeUrl,
		protocolo: updatedReport.protocolo,
		atosDeFormato,
		medidasAdotadas,
		demaisInformacoes: existingReport.demaisInformacoes || '',
		organizationName: organization?.name ?? 'Prefeitura Municipal',
		organizationCidade: organization?.cidade ?? null,
		type: 'Relatório do Fiscal Tecnico',
		dataInicio: contract?.dataInicio,
		dataFim: contract?.dataFim,
		configs,
	}

	const pdfStream = await pdf
		.renderToStream(
			React.createElement(FiscalPrincipalReportPdf, {
				report: reportData,
				siteUrl,
			}) as any,
		)
		.catch((err) => {
			console.error(err)
			return null
		})

	if (!pdfStream) return { error: 'Falha ao gerar o PDF.', data: null }

	const reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'storage', 'reports')
	if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

	const filePath = path.join(reportsDir, `${updatedReport.protocolo}.pdf`)
	const writeStream = fs.createWriteStream(filePath)
	await new Promise<void>((resolve, reject) => {
		pdfStream.pipe(writeStream)
		pdfStream.on('end', () => resolve())
		pdfStream.on('error', reject)
	})

	await prisma.fiscalPrincipalReport.update({
		where: { id: reportId },
		data: {
			status: 'FINALIZADO',
			pdfPath: `/api/reports/${updatedReport.protocolo}.pdf`,
		},
	})

	return {
		error: null,
		data: {
			message: 'Relatório finalizado com sucesso!',
			filePath: `/api/reports/${updatedReport.protocolo}.pdf`,
		},
	}
}
