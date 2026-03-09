import type { Empresas, Licitacao } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { ContratoOxy } from '../api/oxy-api'
import {
	getContratoKey, getModalidade,
	parseLicitacaoDisplay
} from '../utils/helpers'
import type { ContratoData } from '../utils/types'

export async function createContrato(
	data: ContratoData & { licitacaoId: string; empresaId: string },
) {
	return prisma.contrato.create({
		data,
	})
}

export async function updateContrato(
	id: string,
	organizationId: string,
	data: Partial<ContratoData & { licitacaoId: string; empresaId: string }>,
) {
	return prisma.contrato.update({
		where: { id, organizationId },
		data,
	})
}

export async function deleteContrato(id: string, organizationId: string) {
	const [bensReportsCount, fiscaisCount, notificacoesCount] = await Promise.all(
		[
			prisma.bensEServicosReport.count({
				where: { contratoId: id, organizationId },
			}),
			prisma.fiscalContratoLink.count({
				where: { contratoId: id },
			}),
			prisma.notificacoes.count({
				where: { contratoId: id },
			}),
		],
	)

	const dependencias: string[] = []
	if (bensReportsCount > 0)
		dependencias.push(`${bensReportsCount} relatório(s)`)
	if (fiscaisCount > 0)
		dependencias.push(`${fiscaisCount} fiscal(is) vinculado(s)`)
	if (notificacoesCount > 0)
		dependencias.push(`${notificacoesCount} notificação(ões)`)

	if (dependencias.length > 0) {
		throw new Error(
			`Não é possível excluir este contrato pois ele possui: ${dependencias.join(', ')}.`,
		)
	}

	return prisma.contrato.delete({ where: { id, organizationId } })
}

export async function executeContratoTransaction(
	organizationId: string,
	contratosToCreate: ContratoData[],
	contratosToUpdate: Array<ContratoData & { id: string }>,
	empresasMap: Map<string, Empresas>,
	licitacoesMap: Map<string, Licitacao>,
	apiLookup: Map<string, ContratoOxy>,
) {
	return prisma.$transaction(
		async (tx) => {
			const finalContratosToCreate: Array<
				ContratoData & { licitacaoId: string; empresaId: string }
			> = []

			for (const c of contratosToCreate) {
				const key = getContratoKey(c.numero, c.tipoAto, c.exercicio)
				const apiContrato = apiLookup.get(key)
				if (!apiContrato) continue

				const { numero: licNum, ano: licAno } = parseLicitacaoDisplay(
					apiContrato.displayLicitacao,
					apiContrato.exercicioLicitacao,
				)
				const modalidade = getModalidade(apiContrato.descricaoTipoLicitacao)
				const licitacao = licitacoesMap.get(`${licNum}-${licAno}-${modalidade}`)
				const empresa = empresasMap.get(apiContrato.cnpjCpf)

				if (!licitacao || !empresa) continue

				finalContratosToCreate.push({
					...c,
					licitacaoId: licitacao.id,
					empresaId: empresa.id,
				})
			}

			if (finalContratosToCreate.length > 0) {
				await tx.contrato.createMany({
					data: finalContratosToCreate,
					skipDuplicates: true,
				})
			}

			let contratosRecemCriados: Array<{
				id: string
				numero: number
				tipoAto: string
				exercicio: number
			}> = []
			if (finalContratosToCreate.length > 0) {
				contratosRecemCriados = await tx.contrato.findMany({
					where: {
						organizationId,
						OR: finalContratosToCreate.map((c) => ({
							numero: c.numero,
							tipoAto: c.tipoAto,
							exercicio: c.exercicio,
						})),
					},
					select: { id: true, numero: true, tipoAto: true, exercicio: true },
				})
			}

			if (contratosToUpdate.length > 0) {
				await Promise.all(
					contratosToUpdate.map((c) => {
						const key = getContratoKey(c.numero, c.tipoAto, c.exercicio)
						const apiContrato = apiLookup.get(key)

						const updateData: Record<string, any> = {
							displayContrato: c.displayContrato,
							displayLicitacao: c.displayLicitacao,
							contratado: c.contratado,
							objeto: c.objeto,
							dataInicio: c.dataInicio,
							dataFim: c.dataFim,
							tipoAto: c.tipoAto,
							exercicio: c.exercicio,
							idOxy: c.idOxy,
						}

						if (apiContrato) {
							const { numero: licNum, ano: licAno } = parseLicitacaoDisplay(
								apiContrato.displayLicitacao,
								apiContrato.exercicioLicitacao,
							)
							const modalidade = getModalidade(
								apiContrato.descricaoTipoLicitacao,
							)
							const licitacao = licitacoesMap.get(
								`${licNum}-${licAno}-${modalidade}`,
							)
							const empresa = empresasMap.get(apiContrato.cnpjCpf)

							if (licitacao) updateData.licitacaoId = licitacao.id
							if (empresa) updateData.empresaId = empresa.id
						}

						return tx.contrato.update({ where: { id: c.id }, data: updateData })
					}),
				)
			}

			return {
				contratosRecemCriados,
				contratosAtualizadosIds: contratosToUpdate.map((c) => ({
					contratoId: c.id,
					numero: c.numero,
					tipoAto: c.tipoAto,
					exercicio: c.exercicio,
				})),
			}
		},
		{ maxWait: 20000, timeout: 90000 },
	)
}

export async function deactivateExpiredLinks(organizationId: string) {
	const vinculosExpirados = await prisma.fiscalContratoLink.findMany({
		where: {
			ativo: true,
			contrato: { dataFim: { lt: new Date() }, organizationId },
		},
		select: { id: true },
	})

	if (vinculosExpirados.length > 0) {
		await prisma.fiscalContratoLink.updateMany({
			where: { id: { in: vinculosExpirados.map((v) => v.id) } },
			data: { ativo: false },
		})
	}
	return vinculosExpirados.length
}
