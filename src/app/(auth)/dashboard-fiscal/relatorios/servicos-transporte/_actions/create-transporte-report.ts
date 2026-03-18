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
import { formSchemaTransporte } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const createTransporteReport = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaTransporte>) => {
		const { userId, organizationId, userName } = ctx

		// 3. Validar campos do formulário
		const validatedFields = formSchemaTransporte.safeParse(values)

		if (!validatedFields.success) {
			console.log('Validation error:', validatedFields.error.format())
			return {
				success: false,
				error: 'Campos inválidos. Verifique o preenchimento.',
			}
		}

		const baseData = validatedFields.data

		// Captura campos dinâmicos e valida OBS obrigatórias
		const configs = await prisma.formConfig.findMany({
			where: { reportType: 'TRANSPORTE', organizationId },
		})

		const dynamicDataMerged: Record<string, any> = {
			...(baseData.dynamicData || {}),
		}
		const baseKeys = Object.keys(formSchemaTransporte.shape)

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
				error:
					'Você não é um fiscal deste contrato ou o vínculo não foi encontrado.',
			}
		}

		// 5. Buscar dados do contrato
		const contract = await prisma.contrato.findUnique({
			where: {
				id: baseData.contratoId,
			},
			select: {
				licitacaoId: true,
				displayContrato: true,
				displayLicitacao: true,
				numero: true,
				dataInicio: true,
				dataFim: true,
				objeto: true,
				contratado: true,
			},
		})

		if (!contract) {
			return {
				success: false,
				error: 'Contrato não encontrado.',
			}
		}

		// 6. Gerar número de protocolo
		const lastReport = await prisma.transporteReport.findFirst({
			where: {
				organizationId,
				createdAt: {
					gte: new Date(new Date().getFullYear(), 0, 1),
					lt: new Date(new Date().getFullYear() + 1, 0, 1),
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		let newProtocol: string

		if (lastReport?.protocolo) {
			const parts = lastReport.protocolo.split('-')
			const lastProtocolNumber = Number.parseInt(parts[parts.length - 1], 10)
			newProtocol = `TR-${new Date().getFullYear()}-${(lastProtocolNumber + 1)
				.toString()
				.padStart(5, '0')}`
		} else {
			newProtocol = `TR-${new Date().getFullYear()}-00001`
		}

		// 7. Criar relatório no banco
		const newReport = await prisma.transporteReport.create({
			data: {
				// Campos obrigatórios no banco que podem ser opcionais no Zod
				secretariaNome: baseData.secretariaNome || 'Não informada',
				licitacaoModalidadeNumero: contract.displayLicitacao,
				contratoNumero: contract.displayContrato,
				contratada: contract.contratado,
				objeto: contract.objeto || baseData.objeto || 'Não informado',

				// Radio fields obrigatórios no banco (fallbacks seguros)
				manutencaoCondicoesHabilitacao:
					(values as any).manutencaoCondicoesHabilitacao || 'Sim',
				certidaoDebitosFederais: (values as any).certidaoDebitosFederais || 'Sim',
				certidaoDebitosEstadual: (values as any).certidaoDebitosEstadual || 'Sim',
				certidaoDebitosMunicipal:
					(values as any).certidaoDebitosMunicipal || 'Sim',
				certidaoRegularidadeFGTS:
					(values as any).certidaoRegularidadeFGTS || 'Sim',
				certidaoNegativaDebitosTrabalhistas:
					(values as any).certidaoNegativaDebitosTrabalhistas || 'Sim',
				cumprimentoObrigacoes: (values as any).cumprimentoObrigacoes || 'Sim',
				atendeChamados: (values as any).atendeChamados || 'Sim',
				prepostoAcessivel: (values as any).prepostoAcessivel || 'Sim',
				veiculosBomEstado: (values as any).veiculosBomEstado || 'Sim',
				documentacaoVeiculosMotoristasRegular:
					(values as any).documentacaoVeiculosMotoristasRegular || 'Sim',
				motoristasSegurosCorteses:
					(values as any).motoristasSegurosCorteses || 'Sim',
				recebeuNotificacao: (values as any).recebeuNotificacao || 'Não',
				realizaSubcontratacaoIlegal:
					(values as any).realizaSubcontratacaoIlegal || 'Não',
				garantiaContratual: (values as any).garantiaContratual || 'Não Previsto',

				// Restante dos campos (observações, etc)
				item: (values as any).item,
				descricao: (values as any).descricao,
				informacoes: (values as any).informacoes,
				reducaoGlosaObs: (values as any).reducaoGlosaObs,
				manutencaoCondicoesHabilitacaoObs: (values as any)
					.manutencaoCondicoesHabilitacaoObs,
				regularidadeFiscalTrabalhistaObs: (values as any)
					.regularidadeFiscalTrabalhistaObs,
				cumprimentoObrigacoesObs: (values as any).cumprimentoObrigacoesObs,
				atendeChamadosObs: (values as any).atendeChamadosObs,
				prepostoAcessivelObs: (values as any).prepostoAcessivelObs,
				veiculosBomEstadoObs: (values as any).veiculosBomEstadoObs,
				documentacaoVeiculosMotoristasRegularObs: (values as any)
					.documentacaoVeiculosMotoristasRegularObs,
				motoristasSegurosCortesesObs: (values as any)
					.motoristasSegurosCortesesObs,
				recebeuNotificacaoObs: (values as any).recebeuNotificacaoObs,
				aberturaProcessoAdministrativo: (values as any)
					.aberturaProcessoAdministrativo,
				aberturaProcessoAdministrativoObs: (values as any)
					.aberturaProcessoAdministrativoObs,
				sofreuSancao: (values as any).sofreuSancao,
				sofreuSancaoObs: (values as any).sofreuSancaoObs,
				realizaSubcontratacaoIlegalObs: (values as any)
					.realizaSubcontratacaoIlegalObs,
				subcontratadaCumpreObrigacoes: (values as any)
					.subcontratadaCumpreObrigacoes,
				subcontratadaCumpreObrigacoesObs: (values as any)
					.subcontratadaCumpreObrigacoesObs,
				contratadaEncaminhaDocumentacaoSubcontratada: (values as any)
					.contratadaEncaminhaDocumentacaoSubcontratada,
				contratadaEncaminhaDocumentacaoSubcontratadaObs: (values as any)
					.contratadaEncaminhaDocumentacaoSubcontratadaObs,
				modalidadeGarantia: (values as any).modalidadeGarantia,
				validadeGarantia: (values as any).validadeGarantia,
				garantiaContratualObs: (values as any).garantiaContratualObs,
				irregularidadesPendencias: (values as any).irregularidadesPendencias,
				providenciasAdotadas: (values as any).providenciasAdotadas,
				resultados: (values as any).resultados,
				informacoesAdicionais: (values as any).informacoesAdicionais,

				// Campos de infraestrutura
				dynamicData: JSON.stringify(dynamicDataMerged),
				protocolo: newProtocol,
				assinaturaDigital: '',
				periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
				periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
				fiscalContratoId: fiscalContrato.id,
				organizationId: organizationId,
				licitacaoId: contract.licitacaoId,
				contratoId: baseData.contratoId,
			},
		})

		// 8. Atualizar assinatura digital
		const updatedReport = await prisma.transporteReport.update({
			where: { id: newReport.id },
			data: { assinaturaDigital: simpleHash(newReport.id) },
		})

		// 9. Carregar brasão e dados da organização
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { name: true, cidade: true, logo: true },
		})

		const brasaoPath = path.join(process.cwd(), 'public', 'imgs', 'Brasao.png')
		let brasaoBase64 = ''
		try {
			const brasaoBuffer = fs.readFileSync(brasaoPath)
			brasaoBase64 = `data:image/png;base64,${brasaoBuffer.toString('base64')}`
		} catch (readError) {
			console.error('Error reading Brasao.png for PDF:', readError)
		}

		// 10. Preparar dados para o PDF
		const reportData = {
			...updatedReport,
			user: { name: userName },
			type: 'Serviços de Transporte',
			dataInicio: contract.dataInicio,
			dataFim: contract.dataFim,
			configs,
			organizationName: organization?.name ?? 'Prefeitura Municipal',
			organizationCidade: organization?.cidade ?? null,
		}

		// 11. Gerar QR Code
		const siteUrl = process.env.LINK_URL ?? ''
		const verificationUrl = `${siteUrl}/verify-report/${updatedReport.assinaturaDigital}`
		const qrCodeUrl = await qrcode.toDataURL(verificationUrl)

		const reportDataWithQr = {
			...reportData,
			qrCodeUrl,
			protocolo: newProtocol,
			brasaoBase64,
		}

		// 14. Gerar PDF
		const pdfStream = await pdf
			.renderToStream(
				React.createElement(ReportPdf, {
					report: reportDataWithQr,
					siteUrl: siteUrl,
				}) as any,
			)
			.catch((err) => {
				console.error(err)
				return null
			})

		if (!pdfStream) {
			return {
				success: false,
				error: 'Falha ao gerar o PDF.',
			}
		}

		// 13. Salvar arquivo PDF
		const reportsDir =
			process.env.REPORTS_DIR || path.join(process.cwd(), 'storage', 'reports')
		if (!fs.existsSync(reportsDir)) {
			fs.mkdirSync(reportsDir, { recursive: true })
		}

		const filePath = path.join(reportsDir, `${newProtocol}.pdf`)
		const writeStream = fs.createWriteStream(filePath)

		await new Promise<void>((resolve, reject) => {
			pdfStream.pipe(writeStream)
			pdfStream.on('end', () => resolve())
			pdfStream.on('error', reject)
		})

		// 14. Retornar URL da API para servir o PDF
		const fileUrl = `/api/reports/${newProtocol}.pdf`

		return {
			success: true,
			data: {
				message: 'Relatório de Serviços de Transporte criado com sucesso!',
				filePath: fileUrl,
			},
		}
	},
	{
		module: 'fiscal-relatorios',
		log: 'TRANSPORTE_REPORT',
	},
)
