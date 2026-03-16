'use server'

import { getCurrentOrganizationId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface VincularContratoParams {
	memberId: string
	contratoId: string
	tipo: 'PRINCIPAL' | 'SETORIAL'
}

export async function vincularContratoAction({
	memberId,
	contratoId,
	tipo,
}: VincularContratoParams) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { success: false, error: 'Organização não encontrada' }
	}

	try {
		// Verificar se o member existe
		const member = await prisma.member.findUnique({
			where: { id: memberId },
			include: { user: true },
		})

		if (!member) {
			return { success: false, error: 'Membro não encontrado' }
		}

		// Verificar se o contrato existe
		const contrato = await prisma.contrato.findUnique({
			where: { id: contratoId },
			include: { fiscalPrincipal: true },
		})

		if (!contrato) {
			return { success: false, error: 'Contrato não encontrado' }
		}

		if (tipo === 'PRINCIPAL') {
			// Verificar se já tem fiscal principal
			if (contrato.fiscalPrincipal) {
				return {
					success: false,
					error: 'Este contrato já possui um fiscal principal',
				}
			}

			// Criar vínculo como fiscal principal
			await prisma.contratoFiscal.create({
				data: {
					contratoId,
					memberId,
				},
			})

			// Atualizar role do member para FISCAL_PRINCIPAL se for FISCAL_SETORIAL
			if (member.role === 'FISCAL_SETORIAL') {
				await prisma.member.update({
					where: { id: memberId },
					data: { role: 'FISCAL_PRINCIPAL' },
				})
			}
		} else {
			// Verificar se já está vinculado como setorial
			const existingSetorial = await prisma.contratoSetorial.findUnique({
				where: {
					contratoId_memberId: {
						contratoId,
						memberId,
					},
				},
			})

			if (existingSetorial) {
				return {
					success: false,
					error: 'Este membro já está vinculado como fiscal setorial deste contrato',
				}
			}

			// Criar vínculo como fiscal setorial
			await prisma.contratoSetorial.create({
				data: {
					contratoId,
					memberId,
				},
			})
		}

		// ========================================
		// CRIAR FiscalContrato e FiscalContratoLink
		// Para manter consistência com o fluxo automático
		// ========================================
		if (member.user) {
			// Criar ou buscar FiscalContrato
			let fiscalContrato = await prisma.fiscalContrato.findFirst({
				where: {
					userId: member.user.id,
					organizationId,
				},
			})

			if (!fiscalContrato) {
				// Criar FiscalContrato com dados do member/user
				fiscalContrato = await prisma.fiscalContrato.create({
					data: {
						nome: member.user.name || member.user.email || 'Sem nome',
						cpf: member.fiscalCpf || '',
						matricula: member.fiscalMatricula || '',
						cargo:
							member.fiscalCargo ||
							(tipo === 'PRINCIPAL' ? 'FISCAL TECNICO' : 'FISCAL SETORIAL'),
						contato: member.fiscalContato,
						organizationId,
						userId: member.user.id,
						ativo: true,
					},
				})
			}

			// Criar FiscalContratoLink se não existir
			await prisma.fiscalContratoLink.upsert({
				where: {
					fiscalContratoId_contratoId: {
						fiscalContratoId: fiscalContrato.id,
						contratoId,
					},
				},
				create: {
					fiscalContratoId: fiscalContrato.id,
					contratoId,
					dtinicio: new Date().toISOString(),
					ativo: true,
				},
				update: {
					ativo: true,
				},
			})
		}

		revalidatePath('/dashboard-gestor/fiscais')
		revalidatePath('/dashboard-gestor/contratos')

		return {
			success: true,
			message: `Membro vinculado como Fiscal ${tipo === 'PRINCIPAL' ? 'Principal' : 'Setorial'} com sucesso!`,
		}
	} catch (error) {
		console.error('Erro ao vincular contrato:', error)
		return { success: false, error: 'Erro ao vincular contrato' }
	}
}

export async function desvincularContratoAction({
	memberId,
	contratoId,
	tipo,
}: VincularContratoParams) {
	const organizationId = await getCurrentOrganizationId()
	if (!organizationId) {
		return { success: false, error: 'Organização não encontrada' }
	}

	try {
		// Buscar o member para obter o userId
		const member = await prisma.member.findUnique({
			where: { id: memberId },
			select: { userId: true },
		})

		if (tipo === 'PRINCIPAL') {
			await prisma.contratoFiscal.delete({
				where: { contratoId },
			})
		} else {
			await prisma.contratoSetorial.delete({
				where: {
					contratoId_memberId: {
						contratoId,
						memberId,
					},
				},
			})
		}

		// ========================================
		// DESATIVAR FiscalContratoLink
		// Para manter consistência com o fluxo automático
		// ========================================
		if (member?.userId) {
			const fiscalContrato = await prisma.fiscalContrato.findFirst({
				where: {
					userId: member.userId,
					organizationId,
				},
			})

			if (fiscalContrato) {
				// Desativar o link ao invés de deletar (manter histórico)
				await prisma.fiscalContratoLink.updateMany({
					where: {
						fiscalContratoId: fiscalContrato.id,
						contratoId,
					},
					data: {
						ativo: false,
						dtfim: new Date().toISOString(),
					},
				})
			}
		}

		revalidatePath('/dashboard-gestor/fiscais')
		revalidatePath('/dashboard-gestor/contratos')

		return { success: true, message: 'Vínculo removido com sucesso!' }
	} catch (error) {
		console.error('Erro ao desvincular contrato:', error)
		return { success: false, error: 'Erro ao desvincular contrato' }
	}
}
