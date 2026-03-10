'use server'

import fs from 'node:fs'
import path from 'node:path'
import pdf from '@react-pdf/renderer'
import qrcode from 'qrcode'
import React from 'react'
import type { z } from 'zod'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { FiscalPrincipalReportPdf } from '../_components/report-pdf'
import { formSchemaFiscalPrincipal } from './action-schema'

export async function createFiscalPrincipalReport(
	values: z.infer<typeof formSchemaFiscalPrincipal>,
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
		return {
			error: 'Apenas o Fiscal Tecnico pode gerar este relatório.',
			data: null,
		}
	}

	const validatedFields = formSchemaFiscalPrincipal.safeParse(values)
	if (!validatedFields.success) {
		return { error: 'Campos inválidos. Verifique o preenchimento.', data: null }
	}

	const { dynamicData, ...baseData } = validatedFields.data

	const fiscalContrato = await prisma.fiscalContrato.findFirst({
		where: {
			userId: session.user.id,
			organizationId,
			contratos: { some: { contratoId: baseData.contratoId } },
		},
	})

	if (!fiscalContrato) {
		return {
			error: 'Você não é um fiscal deste contrato.',
			data: null,
		}
	}

	const contract = await prisma.contrato.findUnique({
		where: { id: baseData.contratoId },
		select: {
			licitacaoId: true,
			displayContrato: true,
			displayLicitacao: true,
			dataInicio: true,
			dataFim: true,
		},
	})

	if (!contract) return { error: 'Contrato não encontrado.', data: null }

	// Protocolo sequencial
	const lastReport = await prisma.fiscalPrincipalReport.findFirst({
		where: {
			organizationId,
			createdAt: {
				gte: new Date(new Date().getFullYear(), 0, 1),
				lt: new Date(new Date().getFullYear() + 1, 0, 1),
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	let newProtocol: string
	if (lastReport?.protocolo) {
		const parts = lastReport.protocolo.split('-')
		const lastNum = Number.parseInt(parts[parts.length - 1], 10)
		newProtocol = `FP-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(5, '0')}`
	} else {
		newProtocol = `FP-${new Date().getFullYear()}-00001`
	}

	const atosDeFormato = dynamicData?.atosDeFormato
	const medidasAdotadas = dynamicData?.medidasAdotadas
	const demaisInformacoes = dynamicData?.demaisInformacoes

	const tempId = crypto.randomUUID()
	const newReport = await prisma.fiscalPrincipalReport.create({
		data: {
			licitacaoId: contract.licitacaoId,
			contratoId: baseData.contratoId,
			organizationId,
			fiscalContratoId: fiscalContrato.id,
			licitacaoModalidadeNumero:
				baseData.licitacaoModalidadeNumero || contract.displayLicitacao || '',
			contratoNumero: baseData.contratoNumero || contract.displayContrato || '',
			secretariaNome: baseData.secretariaNome || 'Não informada',
			periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
			periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
			contratada: baseData.contratada || 'Não informada',
			objeto: baseData.objeto || 'Não informado',
			atosDeFormato: atosDeFormato ? JSON.stringify(atosDeFormato) : null,
			medidasAdotadas: medidasAdotadas ? JSON.stringify(medidasAdotadas) : null,
			demaisInformacoes: (demaisInformacoes as string) || null,
			dynamicData: dynamicData ? JSON.stringify(dynamicData) : null,
			protocolo: newProtocol,
			assinaturaDigital: tempId,
		},
	})

	const updatedReport = await prisma.fiscalPrincipalReport.update({
		where: { id: newReport.id },
		data: { assinaturaDigital: simpleHash(newReport.id) },
	})

	// Dados da organização
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true, cidade: true },
	})

	// Fetch FormConfig
	const configs = await prisma.formConfig.findMany({
		where: {
			organizationId,
			reportType: 'FISCAL_PRINCIPAL',
			isActive: true,
		},
		orderBy: { order: 'asc' },
	})

	// Brasão
	const brasaoPath = path.join(process.cwd(), 'public', 'images', 'Brasao.png')
	let brasaoBase64 = ''
	try {
		const buf = fs.readFileSync(brasaoPath)
		brasaoBase64 = `data:image/png;base64,${buf.toString('base64')}`
	} catch {}

	// QR Code
	const siteUrl = process.env.LINK_URL ?? ''
	const verificationUrl = `${siteUrl}/verify-report/${updatedReport.assinaturaDigital}`
	const qrCodeUrl = await qrcode.toDataURL(verificationUrl)

	const reportData = {
		...updatedReport,
		user: { name: session.user.name },
		brasaoBase64,
		qrCodeUrl,
		protocolo: newProtocol,
		atosDeFormato: atosDeFormato || [],
		medidasAdotadas: medidasAdotadas || [],
		demaisInformacoes: demaisInformacoes || '',
		organizationName: organization?.name ?? 'Organização',
		organizationCidade: organization?.cidade ?? null,
		type: 'Relatório do Fiscal Tecnico',
		dataInicio: contract.dataInicio,
		dataFim: contract.dataFim,
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

	const reportsDir =
		process.env.REPORTS_DIR || path.join(process.cwd(), 'public', 'reports')
	if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

	const filePath = path.join(reportsDir, `${newProtocol}.pdf`)
	const writeStream = fs.createWriteStream(filePath)
	await new Promise<void>((resolve, reject) => {
		pdfStream.pipe(writeStream)
		pdfStream.on('end', () => resolve())
		pdfStream.on('error', reject)
	})

	return {
		error: null,
		data: {
			message: 'Relatório do Fiscal Tecnico gerado com sucesso!',
			filePath: `/api/reports/${newProtocol}.pdf`,
		},
	}
}
