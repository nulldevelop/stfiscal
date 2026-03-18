'use server'

import type { z } from 'zod'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { formSchemaFiscalPrincipal } from './action-schema'

export async function saveFiscalPrincipalDraft(
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
			error: 'Apenas o Fiscal Tecnico pode criar rascunhos.',
			data: null,
		}
	}

	const validatedFields = formSchemaFiscalPrincipal.safeParse(values)
	if (!validatedFields.success) {
		return { error: 'Campos inválidos.', data: null }
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
		return { error: 'Você não é um fiscal deste contrato.', data: null }
	}

	const contract = await prisma.contrato.findUnique({
		where: { id: baseData.contratoId },
		select: {
			licitacaoId: true,
			displayContrato: true,
			displayLicitacao: true,
		},
	})

	if (!contract) return { error: 'Contrato não encontrado.', data: null }

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

	const newReport = await prisma.fiscalPrincipalReport.create({
		data: {
			licitacaoId: contract.licitacaoId,
			contratoId: baseData.contratoId,
			organizationId,
			fiscalContratoId: fiscalContrato.id,
			licitacaoModalidadeNumero: baseData.licitacaoModalidadeNumero || contract.displayLicitacao || '',
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
			assinaturaDigital: crypto.randomUUID(),
			status: 'RASCUNHO',
		},
	})

	return {
		error: null,
		data: {
			message: 'Rascunho salvo com sucesso!',
			reportId: newReport.id,
		},
	}
}
