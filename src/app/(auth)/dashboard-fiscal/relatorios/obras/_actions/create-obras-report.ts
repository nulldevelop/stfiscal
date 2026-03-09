'use server'

import fs from 'node:fs'
import path from 'node:path'
import pdf from '@react-pdf/renderer'
import qrcode from 'qrcode'
import React from 'react'
import type { z } from 'zod'
import { Prisma } from '@/generated/prisma/client'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { ReportPdf } from '../_components/report-pdf'
import { formSchemaObras } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const createObrasReport = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaObras>) => {
		const { userId, organizationId, userName } = ctx

		// 3. Validar campos do formulário
		const validatedFields = formSchemaObras.safeParse(values)

		if (!validatedFields.success) {
			return {
				success: false,
				error: 'Campos inválidos.',
			}
		}

		const baseData = validatedFields.data

		// Captura campos dinâmicos e valida OBS obrigatórias
		const configs = await prisma.formConfig.findMany({
			where: { reportType: 'OBRAS', organizationId },
		})

		const dynamicDataMerged: Record<string, any> = {
			...(baseData.dynamicData || {}),
		}
		const baseKeys = Object.keys(formSchemaObras.shape)

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

		// 5. Buscar dados da organização e do contrato
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { name: true, cidade: true },
		})

		const contract = await prisma.contrato.findUnique({
			where: {
				id: baseData.contratoId,
			},
			select: {
				licitacaoId: true,
				numero: true,
				displayContrato: true,
				displayLicitacao: true,
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
		const lastReport = await prisma.obrasReport.findFirst({
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
			newProtocol = `OB-${new Date().getFullYear()}-${(lastProtocolNumber + 1)
				.toString()
				.padStart(5, '0')}`
		} else {
			newProtocol = `OB-${new Date().getFullYear()}-00001`
		}

		// 7. Separar tabelas do relatório principal
		const {
			tabelaAtrasos,
			tabelaServicos,
			tabelaMediacoes,
			tabelaObrigacoes,
			tabelaAditivos,
		} = baseData

		// 8. Criar relatório no banco
		const newReport = await prisma.obrasReport.create({
			data: {
				// Campos obrigatórios no banco que podem ser opcionais no Zod
				secretariaNome: baseData.secretariaNome || 'Não informada',
				licitacaoModalidadeNumero: contract.displayLicitacao,
				contratoNumero: contract.displayContrato,
				contratada: contract.contratado,
				objeto: contract.objeto || baseData.objeto || 'Não informado',

				// Radio fields obrigatórios no banco (fallbacks seguros)
				manutencaoHabitacaoFiscalTrabalhista:
					(values as any).manutencaoHabitacaoFiscalTrabalhista || 'Sim',
				certidaoDebitosCreditosFederais:
					(values as any).certidaoDebitosCreditosFederais || 'Sim',
				certidaoDebitosCreditosEstadual:
					(values as any).certidaoDebitosCreditosEstadual || 'Sim',
				certidaoDebitosCreditosMunicipal:
					(values as any).certidaoDebitosCreditosMunicipal || 'Sim',
				certidaoRegularidadeFGTS:
					(values as any).certidaoRegularidadeFGTS || 'Sim',
				certidaoNegativaDebitosTrabalhistas:
					(values as any).certidaoNegativaDebitosTrabalhistas || 'Sim',
				controlePrazoExecucao:
					(values as any).controlePrazoExecucao ||
					'A obra vem sendo executada de acordo com o cronograma físico-financeiro',
				controleQualidadeMateriais:
					(values as any).controleQualidadeMateriais ||
					'As especificações técnicas dos materiais e serviços vêm sendo respeitadas',
				controleQualidadeProjeto:
					(values as any).controleQualidadeProjeto ||
					'Os serviços vêm sendo executados de acordo com o projeto',
				comprimentoObrigacoesContrato:
					(values as any).comprimentoObrigacoesContrato || 'Sim',
				solicitacoesAtendidas: (values as any).solicitacoesAtendidas || 'Sim',
				prepostoAcessivel: (values as any).prepostoAcessivel || 'Sim',
				subcontratacaoIlegal: (values as any).subcontratacaoIlegal || 'Não',
				subcontratadaCumpreObrigacoes:
					(values as any).subcontratadaCumpreObrigacoes || 'Não se aplica',
				contratadaEncaminhaDocumentacaoSubcontratada:
					(values as any).contratadaEncaminhaDocumentacaoSubcontratada ||
					'Não se aplica',
				houveAditivo: (values as any).houveAditivo || 'Não',
				garantiaContratual: (values as any).garantiaContratual || 'Não Previsto',

				// Restante dos campos (observações, etc)
				manutencaoHabitacaoFiscalTrabalhistaObs: (values as any)
					.manutencaoHabitacaoFiscalTrabalhistaObs,
				certificadosObs: (values as any).certificadosObs,
				controlePrazoExecucaoObs: (values as any).controlePrazoExecucaoObs,
				controleQualidadeMateriaisObs: (values as any)
					.controleQualidadeMateriaisObs,
				controleQualidadeProjetoObs: (values as any).controleQualidadeProjetoObs,
				controlePrevistoPercentual: (values as any).controlePrevistoPercentual,
				controleExecutadoPercentual: (values as any).controleExecutadoPercentual,
				controleControleQuantidadeObs: (values as any)
					.controleControleQuantidadeObs,
				comprimentoObrigacoesContratoObs: (values as any)
					.comprimentoObrigacoesContratoObs,
				solicitacoesAtendidasObs: (values as any).solicitacoesAtendidasObs,
				prepostoAcessivelObs: (values as any).prepostoAcessivelObs,
				subcontratacaoIlegalObs: (values as any).subcontratacaoIlegalObs,
				subcontratadaCumpreObrigacoesObs: (values as any)
					.subcontratadaCumpreObrigacoesObs,
				contratadaEncaminhaDocumentacaoSubcontratadaObs: (values as any)
					.contratadaEncaminhaDocumentacaoSubcontratadaObs,
				garantiaContratualObs: (values as any).garantiaContratualObs,
				recebeuNotificacao: (values as any).recebeuNotificacao,
				recebeuNotificacaoObs: (values as any).recebeuNotificacaoObs,
				sancoesAplicadas: (values as any).sancoesAplicadas,
				sancoesAplicadasObs: (values as any).sancoesAplicadasObs,
				aberturaProcessoAdministrativo: (values as any)
					.aberturaProcessoAdministrativo,
				aberturaProcessoAdministrativoObs: (values as any)
					.aberturaProcessoAdministrativoObs,
				sofreuSancao: (values as any).sofreuSancao,
				sofreuSancaoObs: (values as any).sofreuSancaoObs,
				outrasIrregularidadesPendencias: (values as any)
					.outrasIrregularidadesPendencias,
				outrasIrregularidadesPendenciasObs: (values as any)
					.outrasIrregularidadesPendenciasObs,
				providenciasAdotadas: (values as any).providenciasAdotadas,
				providenciasAdotadasObs: (values as any).providenciasAdotadasObs,
				resultados: (values as any).resultados,
				resultadosObs: (values as any).resultadosObs,
				informacoesAdicionais: (values as any).informacoesAdicionais,
				modalidadeGarantia: (values as any).modalidadeGarantia,
				validadeGarantia: (values as any).validadeGarantia,

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

		// 9. Atualizar assinatura digital
		const updatedReport = await prisma.obrasReport.update({
			where: { id: newReport.id },
			data: { assinaturaDigital: simpleHash(newReport.id) },
		})

		// 10. Salvar tabelas relacionadas
		const commonTableData = {
			secretariaNome: baseData.secretariaNome || 'Não informada',
			licitacaoModalidadeNumero: contract.displayLicitacao,
			contratoNumero: String(contract.displayContrato),
			periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
			periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
			contratada: contract.contratado,
			objeto: contract.objeto || baseData.objeto || 'Não informado',
			licitacaoId: contract.licitacaoId,
		}

		// Salvar TabelaAtrasos
		if (tabelaAtrasos && tabelaAtrasos.length > 0) {
			await prisma.tabelaAtraso.createMany({
				data: tabelaAtrasos.map((item) => ({
					...commonTableData,
					item: item.item || null,
					etapa: item.etapa,
					causa: item.causa,
					reponsavel: item.reponsavel,
					providencias: item.providencias,
					observacoes: item.observacoes,
					diasAtraso: item.diasAtraso,
					percentual: item.percentual,
				})),
			})
		}

		// Salvar TableServicos
		if (tabelaServicos && tabelaServicos.length > 0) {
			await prisma.tableServicos.createMany({
				data: tabelaServicos.map((item) => ({
					...commonTableData,
					item: item.item || null,
					servico: item.servico,
					ocorrencias: item.ocorrencias,
					providencias: item.providencias,
					observacoes: item.observacoes,
				})),
			})
		}

		// Salvar TableMediacao
		if (tabelaMediacoes && tabelaMediacoes.length > 0) {
			await prisma.tableMediacao.createMany({
				data: tabelaMediacoes.map((item) => ({
					...commonTableData,
					item: item.item || null,
					dataMediacao: new Date(item.dataMediacao),
					numeroMedicao: item.numeroMedicao,
					valor: new Prisma.Decimal(
						String(item.valor)
							.replace(/[^\d,.-]/g, '')
							.replace(',', '.'),
					),
					dataPagamento: new Date(item.dataPagamento),
					valorPago: new Prisma.Decimal(
						String(item.valorPago)
							.replace(/[^\d,.-]/g, '')
							.replace(',', '.'),
					),
					numeroRecibo: item.numeroRecibo,
				})),
			})
		}

		// Salvar TableObrigacoes
		if (tabelaObrigacoes && tabelaObrigacoes.length > 0) {
			await prisma.tableObrigacoes.createMany({
				data: tabelaObrigacoes.map((item) => ({
					...commonTableData,
					item: item.item || null,
					descricao: item.descricao,
					dispositivoLegal: item.dispositivoLegal,
					providencias: item.providencias,
					observacoes: item.observacoes,
				})),
			})
		}

		// Salvar TableAditivos
		if (tabelaAditivos && tabelaAditivos.length > 0) {
			await prisma.tableAditivos.createMany({
				data: tabelaAditivos.map((item) => ({
					...commonTableData,
					item: item.item || null,
					numero: item.numero,
					dataPublicacao: new Date(item.dataPublicacao),
					aditivoValorAcrecimoValor: item.aditivoValorAcrecimoValor
						? new Prisma.Decimal(
								String(item.aditivoValorAcrecimoValor)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoValorAcrecimoPercent: item.aditivoValorAcrecimoPercent
						? new Prisma.Decimal(
								String(item.aditivoValorAcrecimoPercent)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoValorSupressaoValor: item.aditivoValorSupressaoValor
						? new Prisma.Decimal(
								String(item.aditivoValorSupressaoValor)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoValorSupressaoPercent: item.aditivoValorSupressaoPercent
						? new Prisma.Decimal(
								String(item.aditivoValorSupressaoPercent)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoValorTotalValor: item.aditivoValorTotalValor
						? new Prisma.Decimal(
								String(item.aditivoValorTotalValor)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoValorTotalPercent: item.aditivoValorTotalPercent
						? new Prisma.Decimal(
								String(item.aditivoValorTotalPercent)
									.replace(/[^\d,.-]/g, '')
									.replace(',', '.'),
							)
						: null,
					aditivoPrazoAditivado: item.aditivoPrazoAditivado
						? Number.parseInt(String(item.aditivoPrazoAditivado), 10)
						: null,
					aditivoPrazoTotal: item.aditivoPrazoTotal
						? Number.parseInt(String(item.aditivoPrazoTotal), 10)
						: null,
				})),
			})
		}

		// 11. Carregar brasão
		const brasaoPath = path.join(process.cwd(), 'public', 'imgs', 'Brasao.png')
		let brasaoBase64 = ''
		try {
			const brasaoBuffer = fs.readFileSync(brasaoPath)
			brasaoBase64 = `data:image/png;base64,${brasaoBuffer.toString('base64')}`
		} catch (readError) {
			console.error('Error reading Brasao.png for PDF:', readError)
		}

		// 12. Preparar dados para o PDF
		const reportDataForPdf = {
			...updatedReport,
			user: { name: userName },
			type: 'Obras',
			dataInicio: contract.dataInicio,
			dataFim: contract.dataFim,
			configs,
			organizationCidade: organization?.cidade ?? null,
		}

		// 13. Gerar QR Code
		const siteUrl = `${process.env.LINK_URL}`
		const verificationUrl = `${siteUrl}/verify-report/${updatedReport.assinaturaDigital}`
		const qrCodeUrl = await qrcode.toDataURL(verificationUrl)

		const reportDataWithQr = {
			...reportDataForPdf,
			qrCodeUrl,
			protocolo: newProtocol,
			brasaoBase64,
			organizationName: organization?.name ?? 'Organização',
			tabelaAtrasos: tabelaAtrasos || [],
			tabelaServicos: tabelaServicos || [],
			tabelaMediacoes: tabelaMediacoes || [],
			tabelaObrigacoes: tabelaObrigacoes || [],
			tabelaAditivos: tabelaAditivos || [],
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

		// 15. Salvar arquivo PDF
		const reportsDir =
			process.env.REPORTS_DIR || path.join(process.cwd(), 'public', 'reports')
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

		// 16. Retornar URL da API para servir o PDF
		const fileUrl = `/api/reports/${newProtocol}.pdf`

		return {
			success: true,
			data: {
				message: 'Relatório de Obras criado com sucesso!',
				filePath: fileUrl,
			},
		}
	},
	{
		module: 'fiscal-relatorios',
		log: 'OBRAS_REPORT',
	},
)
