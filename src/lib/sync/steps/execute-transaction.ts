import type { Empresas, Licitacao } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { ContratoOxy } from '../api/oxy-api'
import {
	getContratoKey,
	getLicitacaoKey,
	getModalidade,
	parseLicitacaoDisplay,
} from '../utils/helpers'
import type { ContratoData, LicitacaoData } from '../utils/types'

export type TransactionResult = {
	contratosRecemCriados: Array<{
		id: string
		numero: number
		tipoAto: string
		exercicio: number
	}>
	contratosAtualizadosIds: Array<{
		contratoId: string
		numero: number
		tipoAto: string
		exercicio: number
	}>
}

export async function executeTransaction(
	organizationId: string,
	empresasToCreate: Map<
		string,
		{ name: string; cnpj: string; organizationId: string }
	>,
	licitacoesToCreate: Map<string, LicitacaoData>,
	licitacoesToUpdate: Map<string, LicitacaoData & { id: string }>,
	contratosToCreate: ContratoData[],
	contratosToUpdate: Array<ContratoData & { id: string }>,
	empresasMap: Map<string, Empresas>,
	licitacoesMap: Map<string, Licitacao>,
	apiLookup: Map<string, ContratoOxy>,
): Promise<TransactionResult> {
	console.log('[SYNC] Iniciando transação no banco de dados...')

	return prisma.$transaction(
		async (tx) => {
			if (empresasToCreate.size > 0) {
				console.log(`  Criando ${empresasToCreate.size} empresas...`)
				await tx.empresas.createMany({
					data: Array.from(empresasToCreate.values()),
					skipDuplicates: true,
				})
			}

			if (licitacoesToCreate.size > 0) {
				console.log(`  Criando ${licitacoesToCreate.size} licitações...`)
				await tx.licitacao.createMany({
					data: Array.from(licitacoesToCreate.values()),
					skipDuplicates: true,
				})
			}

			if (licitacoesToUpdate.size > 0) {
				console.log(`  Atualizando ${licitacoesToUpdate.size} licitações...`)
				await Promise.all(
					Array.from(licitacoesToUpdate.values()).map((data) => {
						const { id, ...updateData } = data
						return tx.licitacao.update({ where: { id }, data: updateData })
					}),
				)
			}

			// Recarrega empresas e licitações com IDs corretos (inclui as recém-criadas)
			const allCnpjs = [...empresasToCreate.keys(), ...empresasMap.keys()]
			const licitacoesParaBuscar = [
				...Array.from(licitacoesToCreate.values()),
				...Array.from(licitacoesToUpdate.values()),
				...Array.from(licitacoesMap.values()),
			]

			console.log('  Sincronizando IDs de empresas e licitações...')
			const [allEmpresas, allLicitacoes] = await Promise.all([
				tx.empresas.findMany({
					where: { cnpj: { in: allCnpjs }, organizationId },
				}),
				tx.licitacao.findMany({
					where: {
						organizationId,
						OR:
							licitacoesParaBuscar.length > 0
								? licitacoesParaBuscar.map((l) => ({
										numero: l.numero,
										ano: l.ano,
										modalidade: l.modalidade,
									}))
								: undefined,
					},
				}),
			])

			for (const e of allEmpresas) empresasMap.set(e.cnpj, e)
			for (const l of allLicitacoes)
				licitacoesMap.set(getLicitacaoKey(l.numero, l.ano, l.modalidade), l)

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
				const licitacao = licitacoesMap.get(
					getLicitacaoKey(licNum, licAno, modalidade),
				)
				const empresa = empresasMap.get(apiContrato.cnpjCpf)

				if (!licitacao || !empresa) continue

				finalContratosToCreate.push({
					...c,
					licitacaoId: licitacao.id,
					empresaId: empresa.id,
				})
			}

			if (finalContratosToCreate.length > 0) {
				console.log(`  Criando ${finalContratosToCreate.length} contratos...`)
				await tx.contrato.createMany({
					data: finalContratosToCreate,
					skipDuplicates: true,
				})
			}

			let contratosRecemCriados: TransactionResult['contratosRecemCriados'] = []
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
				console.log(`  Atualizando ${contratosToUpdate.length} contratos...`)
				await Promise.all(
					contratosToUpdate.map((c) => {
						const key = getContratoKey(c.numero, c.tipoAto, c.exercicio)
						const apiContrato = apiLookup.get(key)

						const updateData: Record<string, unknown> = {
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
								getLicitacaoKey(licNum, licAno, modalidade),
							)
							const empresa = empresasMap.get(apiContrato.cnpjCpf)

							if (licitacao) updateData.licitacaoId = licitacao.id
							if (empresa) updateData.empresaId = empresa.id
						}

						return tx.contrato.update({ where: { id: c.id }, data: updateData })
					}),
				)
			}

			console.log('[SYNC] Transação concluída com sucesso.')

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
