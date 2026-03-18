'use server'

import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ReportPdf } from '../_components/report-pdf'
import { formSchemaTerceirizacao } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const saveTerceirizacaoDraft = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaTerceirizacao>) => {
		const { userId, organizationId, userName } = ctx

		const validatedFields = formSchemaTerceirizacao.safeParse(values)
		if (!validatedFields.success) return { success: false, error: 'Campos inválidos.' }

		const baseData = validatedFields.data

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

		const newReport = await prisma.terceirizacaoReport.create({
			data: {
				secretariaNome: baseData.secretariaNome || 'Não informada',
				licitacaoModalidadeNumero: contract.displayLicitacao,
				contratoNumero: contract.displayContrato,
				contratada: contract.contratado,
				objeto: contract.objeto || baseData.objeto || 'Não informado',

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

				houveDescoberturaPosto: (values as any).houveDescoberturaPosto || 'Não',
				descoberturaLocal: (values as any).descoberturaLocal,
				descoberturaTempo: (values as any).descoberturaTempo,
				houveDescontoNota: (values as any).houveDescontoNota || 'Não',
				descontoValor: (values as any).descontoValor,
				descontoMotivoNão: (values as any).descontoMotivoNão,

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
				assinaturaDigital: crypto.randomUUID(),
				periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
				periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
				fiscalContratoId: fiscalContrato.id,
				organizationId: organizationId,
				licitacaoId: contract.licitacaoId,
				contratoId: baseData.contratoId,
				status: 'RASCUNHO',
			},
		})

		return {
			success: true,
			data: {
				message: 'Rascunho salvo com sucesso!',
				reportId: newReport.id,
			},
		}
	},
	{
		module: 'fiscal-relatorios',
		log: 'TERCEIRIZACAO_DRAFT',
	},
)
