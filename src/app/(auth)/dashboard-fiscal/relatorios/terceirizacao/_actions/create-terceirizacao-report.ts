'use server'

import fs from 'node:fs'
import path from 'node:path'
import pdf from '@react-pdf/renderer'
import qrcode from 'qrcode'
import React from 'react'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { ReportPdf } from '../_components/report-pdf'
import { formSchemaTerceirizacao } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const createTerceirizacaoReport = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaTerceirizacao>) => {
		const { userId, organizationId, userName } = ctx

		// 3. Validar campos do formulário
		const validatedFields = formSchemaTerceirizacao.safeParse(values)
		if (!validatedFields.success) return { success: false, error: 'Campos inválidos.' }

		const baseData = validatedFields.data

		// Captura campos dinâmicos e valida OBS obrigatórias
		const configs = await prisma.formConfig.findMany({
			where: { reportType: 'TERCEIRIZACAO', organizationId },
		})

		const dynamicDataMerged: Record<string, any> = {
			...(baseData.dynamicData || {}),
		}
		const baseKeys = Object.keys(formSchemaTerceirizacao.shape)

		for (const key in values) {
			if (
				key !== 'dynamicData' &&
				!baseKeys.includes(key) &&
				!key.endsWith('Obs')
			) {
				dynamicDataMerged[key] = (values as any)[key]
			}
		}

		// Validação dinâmica de OBS
		for (const config of configs) {
			if (config.hasObs && config.requiredObsValue) {
				const value = (values as any)[config.fieldKey]
				const obsValue = (values as any)[`${config.fieldKey}Obs`]

				let isRequired = false
				try {
					const triggers = JSON.parse(config.requiredObsValue)
					isRequired = Array.isArray(triggers)
						? triggers.includes(value)
						: triggers === value
				} catch {
					isRequired = value === config.requiredObsValue
				}

				if (isRequired && (!obsValue || obsValue.trim() === '')) {
					return {
						success: false,
						error: `O campo de observação para "${config.label}" é obrigatório quando a resposta é "${value}".`,
					}
				}
			}
		}

		// 4. Validar fiscal do contrato
		const fiscalContrato = await prisma.fiscalContrato.findFirst({
			where: {
				userId,
				organizationId,
				contratos: { some: { contratoId: baseData.contratoId } },
			},
		})

		if (!fiscalContrato) {
			return {
				success: false,
				error: 'Você não é um fiscal vinculado a este contrato.',
			}
		}

		// 5. Buscar dados do contrato
		const contract = await prisma.contrato.findUnique({
			where: { id: baseData.contratoId },
			select: {
				licitacaoId: true,
				displayContrato: true,
				displayLicitacao: true,
				contratado: true,
				objeto: true,
				dataInicio: true,
				dataFim: true,
			},
		})

		if (!contract) return { success: false, error: 'Contrato não encontrado.' }

		// 6. Gerar número de protocolo (sequencial para o ano)
		const lastReport = await prisma.terceirizacaoReport.findFirst({
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
			newProtocol = `TE-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(5, '0')}`
		} else {
			newProtocol = `TE-${new Date().getFullYear()}-00001`
		}

		// 7. Criar relatório no banco com fallbacks
		const newReport = await prisma.terceirizacaoReport.create({
			data: {
				secretariaNome: baseData.secretariaNome || 'Não informada',
				licitacaoModalidadeNumero: contract.displayLicitacao,
				contratoNumero: contract.displayContrato,
				contratada: contract.contratado,
				objeto: contract.objeto || baseData.objeto || 'Não informado',
				
				// Radio fields obrigatórios (Anexo XI)
				manutencaoCondicoesHabilitacao: (values as any).manutencaoCondicoesHabilitacao || 'Sim',
				certidaoDebitosFederais: (values as any).certidaoDebitosFederais || 'Sim',
				certidaoDebitosEstadual: (values as any).certidaoDebitosEstadual || 'Sim',
				certidaoDebitosMunicipal: (values as any).certidaoDebitosMunicipal || 'Sim',
				certidaoRegularidadeFGTS: (values as any).certidaoRegularidadeFGTS || 'Sim',
				certidaoNegativaDebitosTrabalhistas: (values as any).certidaoNegativaDebitosTrabalhistas || 'Sim',
				cumprimentoObrigacoes: (values as any).cumprimentoObrigacoes || 'Sim',
				atendeChamados: (values as any).atendeChamados || 'Sim',
				prepostoAcessivel: (values as any).prepostoAcessivel || 'Sim',
				recebeuNotificacao: (values as any).recebeuNotificacao || 'Não',
				realizaSubcontratacaoIlegal: (values as any).realizaSubcontratacaoIlegal || 'Não',
				garantiaContratual: (values as any).garantiaContratual || 'Não Previsto',

				// Dados específicos Terceirização
				houveDescoberturaPosto: (values as any).houveDescoberturaPosto || 'Não',
				descoberturaLocal: (values as any).descoberturaLocal,
				descoberturaTempo: (values as any).descoberturaTempo,
				houveDescontoNota: (values as any).houveDescontoNota || 'Não',
				descontoValor: (values as any).descontoValor,
				descontoMotivoNão: (values as any).descontoMotivoNão,

				// Restante das Obs e Ocorrências
				manutencaoCondicoesHabilitacaoObs: (values as any).manutencaoCondicoesHabilitacaoObs,
				regularidadeFiscalTrabalhistaObs: (values as any).regularidadeFiscalTrabalhistaObs,
				cumprimentoObrigacoesObs: (values as any).cumprimentoObrigacoesObs,
				atendeChamadosObs: (values as any).atendeChamadosObs,
				prepostoAcessivelObs: (values as any).prepostoAcessivelObs,
				recebeuNotificacaoObs: (values as any).recebeuNotificacaoObs,
				realizaSubcontratacaoIlegalObs: (values as any).realizaSubcontratacaoIlegalObs,
				garantiaContratualObs: (values as any).garantiaContratualObs,
				irregularidadesPendencias: (values as any).irregularidadesPendencias,
				providenciasAdotadas: (values as any).providenciasAdotadas,
				resultados: (values as any).resultados,

				dynamicData: JSON.stringify(dynamicDataMerged),
				protocolo: newProtocol,
				assinaturaDigital: '', // Será atualizada após o hash
				periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
				periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
				fiscalContratoId: fiscalContrato.id,
				organizationId: organizationId,
				licitacaoId: contract.licitacaoId,
				contratoId: baseData.contratoId,
			},
		})

		// 8. Atualizar assinatura digital (hash único)
		const updatedReport = await prisma.terceirizacaoReport.update({
			where: { id: newReport.id },
			data: { assinaturaDigital: simpleHash(newReport.id) },
		})

		// 9. Carregar brasão para o PDF
		const brasaoPath = path.join(process.cwd(), 'public', 'imgs', 'Brasao.png')
		let brasaoBase64 = ''
		try {
			const buf = fs.readFileSync(brasaoPath)
			brasaoBase64 = `data:image/png;base64,${buf.toString('base64')}`
		} catch (error) {
			console.warn('Brasão não encontrado, usando valor padrão:', error)
		}

		// 10. QR Code
		const siteUrl = process.env.LINK_URL ?? ''
		const verificationUrl = `${siteUrl}/verify-report/${updatedReport.assinaturaDigital}`
		const qrCodeUrl = await qrcode.toDataURL(verificationUrl)

		// 11. Dados da Organização para o cabeçalho
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { name: true, cidade: true },
		})

		const reportDataForPdf = {
			...updatedReport,
			user: { name: userName },
			type: 'Terceirização de Mão de Obra',
			dataInicio: contract.dataInicio,
			dataFim: contract.dataFim,
			qrCodeUrl,
			brasaoBase64,
			configs,
			organizationName: organization?.name ?? 'Prefeitura Municipal',
			organizationCidade: organization?.cidade ?? null,
		}

		// 12. Gerar PDF
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

		// 13. Salvar arquivo
		const reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'storage', 'reports')
		if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

		const filePath = path.join(reportsDir, `${newProtocol}.pdf`)
		const writeStream = fs.createWriteStream(filePath)
		await new Promise<void>((resolve, reject) => {
			pdfStream.pipe(writeStream)
			pdfStream.on('end', () => resolve())
			pdfStream.on('error', reject)
		})

		return {
			success: true,
			data: {
				message: 'Relatório de Terceirização criado com sucesso!',
				filePath: `/api/reports/${newProtocol}.pdf`,
			},
		}
	},
	{
		module: 'fiscal-relatorios',
		log: 'TERCEIRIZACAO_REPORT',
	},
)
