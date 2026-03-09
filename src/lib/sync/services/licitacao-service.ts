import { SituacaoLicitacao } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { LicitacaoOxy } from '../api/oxy-api'
import { getLicitacaoKey, getModalidade, getSituacao } from '../utils/helpers'
import type { LicitacaoData } from '../utils/types'

export async function createLicitacao(data: LicitacaoData) {
	return prisma.licitacao.create({
		data: {
			...data,
			situacao: data.situacao as never,
			modalidade: data.modalidade as never,
		},
	})
}

export async function updateLicitacao(
	id: string,
	organizationId: string,
	data: Partial<LicitacaoData>,
) {
	return prisma.licitacao.update({
		where: { id, organizationId },
		data: {
			...data,
			situacao: data.situacao as never,
			modalidade: data.modalidade as never,
		},
	})
}

export async function deleteLicitacao(id: string, organizationId: string) {
	// Verificar relacionamentos antes de excluir
	const [
		contratosCount,
		bensReportsCount,
		transporteReportsCount,
		obrasReportsCount,
	] = await Promise.all([
		prisma.contrato.count({
			where: { licitacaoId: id, organizationId },
		}),
		prisma.bensEServicosReport.count({
			where: { licitacaoId: id, organizationId },
		}),
		prisma.transporteReport.count({
			where: { licitacaoId: id, organizationId },
		}),
		prisma.obrasReport.count({
			where: { licitacaoId: id, organizationId },
		}),
	])

	const dependencias: string[] = []
	if (contratosCount > 0) dependencias.push(`${contratosCount} contrato(s)`)
	if (bensReportsCount > 0)
		dependencias.push(`${bensReportsCount} relatório(s) de bens e serviços`)
	if (transporteReportsCount > 0)
		dependencias.push(`${transporteReportsCount} relatório(s) de transporte`)
	if (obrasReportsCount > 0)
		dependencias.push(`${obrasReportsCount} relatório(s) de obras`)

	if (dependencias.length > 0) {
		throw new Error(
			`Não é possível excluir esta licitação pois ela está vinculada a: ${dependencias.join(', ')}.`,
		)
	}

	return prisma.licitacao.delete({ where: { id, organizationId } })
}

export async function syncLicitacoesFromApi(
	organizationId: string,
	licitacoesApi: LicitacaoOxy[],
) {
	const licitacoesDb = await prisma.licitacao.findMany({
		where: { organizationId },
		select: { id: true, numero: true, ano: true, modalidade: true },
	})

	const licitacoesMap = new Map(
		licitacoesDb.map((l) => [
			getLicitacaoKey(l.numero, l.ano, l.modalidade),
			l,
		]),
	)

	const licitacoesToCreate: LicitacaoData[] = []
	const licitacoesToUpdate: Array<LicitacaoData & { id: string }> = []

	for (const lApi of licitacoesApi) {
		const modalidade = getModalidade(lApi.descricao)
		const key = getLicitacaoKey(
			lApi.numeroLicitacao,
			lApi.exercicio,
			modalidade,
		)
		const situacao = getSituacao(lApi.situacao || lApi.tipoCancelamento)
		const data: LicitacaoData = {
			idOxy: lApi.idOxy,
			entidade: lApi.nomeEntidade || 'Não informado',
			objeto: lApi.objeto || 'Não informado',
			numero: lApi.numeroLicitacao,
			ano: lApi.exercicio,
			situacao,
			modalidade,
			dataPublicacao: new Date(lApi.dataPublicacao),
			organizationId,
		}

		const existing = licitacoesMap.get(key)
		if (existing) {
			licitacoesToUpdate.push({ ...data, id: existing.id })
		} else if (situacao === SituacaoLicitacao.ANDAMENTO) {
			// Apenas cadastra licitações vigentes/em andamento
			licitacoesToCreate.push(data)
		}
	}

	await prisma.$transaction(
		async (tx) => {
			if (licitacoesToCreate.length > 0) {
				await tx.licitacao.createMany({
					data: licitacoesToCreate,
					skipDuplicates: true,
				})
			}

			if (licitacoesToUpdate.length > 0) {
				for (const l of licitacoesToUpdate) {
					const { id, ...updateData } = l
					await tx.licitacao.update({
						where: { id },
						data: updateData,
					})
				}
			}
		},
		{ timeout: 60000 },
	)

	return {
		criadas: licitacoesToCreate.length,
		atualizadas: licitacoesToUpdate.length,
	}
}
