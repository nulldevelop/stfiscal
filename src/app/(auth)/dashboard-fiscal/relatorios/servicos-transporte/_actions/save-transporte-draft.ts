'use server'

import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { formSchemaTransporte } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const saveTransporteDraft = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaTransporte>) => {
		const { userId, organizationId } = ctx

		const validatedFields = formSchemaTransporte.safeParse(values)
		if (!validatedFields.success) {
			return { success: false, error: 'Campos inválidos.' }
		}

		const baseData = validatedFields.data

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

		const fiscalContrato = await prisma.fiscalContrato.findFirst({
			where: {
				userId,
				organizationId,
				contratos: { some: { contratoId: baseData.contratoId } },
			},
		})

		if (!fiscalContrato) {
			return { success: false, error: 'Você não é um fiscal vinculado a este contrato.' }
		}

		const contract = await prisma.contrato.findUnique({
			where: { id: baseData.contratoId },
			select: {
				licitacaoId: true,
				displayContrato: true,
				displayLicitacao: true,
				contratado: true,
				objeto: true,
			},
		})

		if (!contract) return { success: false, error: 'Contrato não encontrado.' }

		const lastReport = await prisma.transporteReport.findFirst({
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
			newProtocol = `TR-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(5, '0')}`
		} else {
			newProtocol = `TR-${new Date().getFullYear()}-00001`
		}

		const newReport = await prisma.transporteReport.create({
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
				veiculosBomEstado: (values as any).veiculosBomEstado || 'Sim',
				documentacaoVeiculosMotoristasRegular: (values as any).documentacaoVeiculosMotoristasRegular || 'Sim',
				motoristasSegurosCorteses: (values as any).motoristasSegurosCorteses || 'Sim',
				recebeuNotificacao: (values as any).recebeuNotificacao || 'Não',
				realizaSubcontratacaoIlegal: (values as any).realizaSubcontratacaoIlegal || 'Não',
				garantiaContratual: (values as any).garantiaContratual || 'Não Previsto',
				item: (values as any).item,
				descricao: (values as any).descricao,
				informacoes: (values as any).informacoes,
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
		log: 'TRANSPORTE_DRAFT',
	},
)
