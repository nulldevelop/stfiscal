import type {
	Contrato,
	Empresas,
	Licitacao,
	TipoLicitacao,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { getContratoKey, getLicitacaoKey } from '../utils/helpers'

export type DbState = {
	empresasMap: Map<string, Empresas>
	licitacoesMap: Map<string, Licitacao>
	contratosMap: Map<string, Contrato>
}

export async function fetchDbState(
	organizationId: string,
	cnpjs: string[],
	licitacoesParaBuscar: Array<{
		numero: number
		ano: number
		modalidade: TipoLicitacao
	}>,
	contratosParaBuscar: Array<{
		numero: number
		tipoAto: string
		exercicio: number
	}>,
): Promise<DbState> {
	const [empresasDb, licitacoesDb, contratosDb] = await Promise.all([
		prisma.empresas.findMany({
			where: { cnpj: { in: cnpjs }, organizationId },
		}),
		prisma.licitacao.findMany({
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
		prisma.contrato.findMany({
			where: {
				organizationId,
				OR:
					contratosParaBuscar.length > 0
						? contratosParaBuscar.map((c) => ({
								numero: c.numero,
								tipoAto: c.tipoAto,
								exercicio: c.exercicio,
							}))
						: undefined,
			},
		}),
	])

	return {
		empresasMap: new Map(empresasDb.map((e) => [e.cnpj, e])),
		licitacoesMap: new Map(
			licitacoesDb.map((l) => [
				getLicitacaoKey(l.numero, l.ano, l.modalidade),
				l,
			]),
		),
		contratosMap: new Map(
			contratosDb.map((c) => [
				getContratoKey(c.numero, c.tipoAto, c.exercicio),
				c,
			]),
		),
	}
}
