'use server'

import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { formSchemaObras } from './action-schema'

import { withPermission } from '@/lib/permissions/with-permission'

export const saveObrasDraft = withPermission(
	'create',
	async (ctx, values: z.infer<typeof formSchemaObras>) => {
		const { userId, organizationId } = ctx

		const validatedFields = formSchemaObras.safeParse(values)
		if (!validatedFields.success) {
			return { success: false, error: 'Campos inválidos.' }
		}

		const baseData = validatedFields.data

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

		const lastReport = await prisma.obrasReport.findFirst({
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
			newProtocol = `OB-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(5, '0')}`
		} else {
			newProtocol = `OB-${new Date().getFullYear()}-00001`
		}

		const newReport = await prisma.obrasReport.create({
			data: {
				secretariaNome: baseData.secretariaNome || 'Não informada',
				licitacaoModalidadeNumero: contract.displayLicitacao,
				contratoNumero: contract.displayContrato,
				contratada: contract.contratado,
				objeto: contract.objeto || baseData.objeto || 'Não informado',
				manutencaoHabitacaoFiscalTrabalhista: (values as any).manutencaoHabitacaoFiscalTrabalhista || 'Sim',
				certidaoDebitosCreditosFederais: (values as any).certidaoDebitosCreditosFederais || 'Sim',
				certidaoDebitosCreditosEstadual: (values as any).certidaoDebitosCreditosEstadual || 'Sim',
				certidaoDebitosCreditosMunicipal: (values as any).certidaoDebitosCreditosMunicipal || 'Sim',
				certidaoRegularidadeFGTS: (values as any).certidaoRegularidadeFGTS || 'Sim',
				certidaoNegativaDebitosTrabalhistas: (values as any).certidaoNegativaDebitosTrabalhistas || 'Sim',
				controlePrazoExecucao: (values as any).controlePrazoExecucao || 'Sim',
				controleQualidadeMateriais: (values as any).controleQualidadeMateriais || 'Sim',
				controleQualidadeProjeto: (values as any).controleQualidadeProjeto || 'Sim',
				comprimentoObrigacoesContrato: (values as any).comprimentoObrigacoesContrato || 'Sim',
				solicitacoesAtendidas: (values as any).solicitacoesAtendidas || 'Sim',
				prepostoAcessivel: (values as any).prepostoAcessivel || 'Sim',
				subcontratacaoIlegal: (values as any).subcontratacaoIlegal || 'Não',
				subcontratadaCumpreObrigacoes: (values as any).subcontratadaCumpreObrigacoes || 'Não se aplica',
				contratadaEncaminhaDocumentacaoSubcontratada: (values as any).contratadaEncaminhaDocumentacaoSubcontratada || 'Não se aplica',
				houveAditivo: (values as any).houveAditivo || 'Não',
				garantiaContratual: (values as any).garantiaContratual || 'Não Previsto',
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
		log: 'OBRAS_DRAFT',
	},
)
