'use server'

import type { z } from 'zod'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { formSchemaBensEServicos } from './action-schema'

export const saveBensEServicosDraft = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaBensEServicos>) => {
		const { userId, organizationId } = ctx

		const validatedFields = formSchemaBensEServicos.safeParse(values)
		if (!validatedFields.success) {
			return { success: false, error: 'Campos inválidos.' }
		}

		const baseData = validatedFields.data

		const configs = await prisma.formConfig.findMany({
			where: { reportType: 'BENS_SERVICOS', organizationId },
		})

		const dynamicData: Record<string, any> = {
			...(baseData.dynamicData || {}),
		}
		const baseKeys = Object.keys(formSchemaBensEServicos.shape)

		for (const key in values) {
			if (
				key !== 'dynamicData' &&
				!baseKeys.includes(key) &&
				!key.endsWith('Obs')
			) {
				dynamicData[key] = (values as any)[key]
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
			},
		})

		if (!contract) return { success: false, error: 'Contrato não encontrado.' }

		const lastReport = await prisma.bensEServicosReport.findFirst({
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
			newProtocol = `BS-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(5, '0')}`
		} else {
			newProtocol = `BS-${new Date().getFullYear()}-00001`
		}

		const newReport = await prisma.bensEServicosReport.create({
			data: {
				secretariaNome: baseData.secretariaNome,
				licitacaoModalidadeNumero: String(contract.displayLicitacao),
				contratoNumero: String(contract.displayContrato),
				periodoAnalisadoInicio: new Date(baseData.periodoAnalisadoInicio),
				periodoAnalisadoFim: new Date(baseData.periodoAnalisadoFim),
				contratada: baseData.contratada,
				objeto: baseData.objeto,
				protocolo: newProtocol,
				assinaturaDigital: crypto.randomUUID(),
				organizationId: organizationId,
				fiscalContratoId: fiscalContrato.id,
				licitacaoId: contract.licitacaoId,
				contratoId: baseData.contratoId,
				manutencaoCondicoesHabilitacao:
					(values as any).manutencaoCondicoesHabilitacao || 'Não',
				certidaoDebitosFederais:
					(values as any).certidaoDebitosFederais || 'Não',
				certidaoDebitosEstadual:
					(values as any).certidaoDebitosEstadual || 'Não',
				certidaoDebitosMunicipal:
					(values as any).certidaoDebitosMunicipal || 'Não',
				certidaoRegularidadeFGTS:
					(values as any).certidaoRegularidadeFGTS || 'Não',
				certidaoNegativaDebitosTrabalhistas:
					(values as any).certidaoNegativaDebitosTrabalhistas || 'Não',
				cumprimentoObrigacoes: (values as any).cumprimentoObrigacoes || 'Não',
				atendeChamados: (values as any).atendeChamados || 'Não',
				prepostoAcessivel: (values as any).prepostoAcessivel || 'Não',
				recebeuNotificacao: (values as any).recebeuNotificacao || 'Não',
				realizaSubcontratacaoIlegal:
					(values as any).realizaSubcontratacaoIlegal || 'Não',
				garantiaContratual:
					(values as any).garantiaContratual || 'Não Previsto',
				item: (values as any).item,
				descricao: (values as any).descricao,
				informacoes: (values as any).informacoes,
				dynamicData: JSON.stringify(dynamicData),
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
		log: 'BENS_SERVICOS_DRAFT',
	},
)
