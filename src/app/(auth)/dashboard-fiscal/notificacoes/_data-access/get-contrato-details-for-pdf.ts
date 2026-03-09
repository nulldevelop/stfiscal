'use server'

import { getAuth } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'

export interface DadosEmpresaFaltantes {
	endereco: boolean
	representanteNome: boolean
	representanteRg: boolean
	representanteCpf: boolean
}

export interface ContratoPdfDataResult {
	empresaId: string
	portaria?: string
	gestorNome: string
	gestorPortaria: string
	empresaNome: string
	empresaCnpj: string
	empresaEndereco: string
	empresaRepresentanteNome: string
	empresaRepresentanteRg: string
	empresaRepresentanteCpf: string
	licitacaoModalidade: string
	licitacaoNumero: number
	licitacaoObjeto: string
	licitacaoDataPublicacao: Date
	contratoNumero: number
	contratoIdExterno: string
	displayContrato: string
	displayLicitacao: string
	secretariaNome: string
	dataAtual: Date
	dadosFaltantes: DadosEmpresaFaltantes
	temDadosFaltantes: boolean
}

export async function getContratoDetailsForPdf(contratoId: string) {
	if (!contratoId) {
		return { error: 'ID do contrato não fornecido.' }
	}

	try {
		const { user } = await getAuth()
		if (!user) {
			return { error: 'Usuário não autenticado.' }
		}

		const contrato = await prisma.contrato.findUnique({
			where: { id: contratoId },
			include: {
				fiscais: {
					include: {
						fiscalContrato: { select: { portaria: true } },
					},
					take: 1,
				},
				empresa: true,
				licitacao: true,
				Organization: {
					select: {
						name: true,
					},
				},
			},
		})

		if (!contrato) {
			return { error: 'Contrato não encontrado.' }
		}

		// Verifica quais dados da empresa estão faltando
		const dadosFaltantes: DadosEmpresaFaltantes = {
			endereco: !contrato.empresa.endereco,
			representanteNome: !contrato.empresa.representanteNome,
			representanteRg: !contrato.empresa.representanteRg,
			representanteCpf: !contrato.empresa.representanteCpf,
		}

		const temDadosFaltantes = Object.values(dadosFaltantes).some(
			(faltante) => faltante,
		)

		const pdfData: ContratoPdfDataResult = {
			empresaId: contrato.empresaId,
			gestorNome: user.name,
			gestorPortaria: contrato.fiscais?.[0]?.fiscalContrato?.portaria || '',
			empresaNome: contrato.empresa.name,
			empresaCnpj: contrato.empresa.cnpj,
			empresaEndereco: contrato.empresa.endereco || '',
			empresaRepresentanteNome: contrato.empresa.representanteNome || '',
			empresaRepresentanteRg: contrato.empresa.representanteRg || '',
			empresaRepresentanteCpf: contrato.empresa.representanteCpf || '',
			licitacaoModalidade: contrato.licitacao.modalidade,
			licitacaoNumero: contrato.licitacao.numero,
			licitacaoObjeto: contrato.licitacao.objeto,
			licitacaoDataPublicacao: contrato.licitacao.dataPublicacao,

			// Contrato info
			contratoNumero: contrato.numero,
			contratoIdExterno: contrato.id.substring(0, 7).toUpperCase(),
			displayContrato: contrato.displayContrato,
			displayLicitacao: contrato.displayLicitacao,

			// Secretaria
			secretariaNome:
				contrato.Organization?.name || 'Secretaria não encontrada',

			// Current Date
			dataAtual: new Date(),

			// Dados faltantes
			dadosFaltantes,
			temDadosFaltantes,
		}

		return { data: pdfData }
	} catch (error) {
		console.error('Erro ao buscar detalhes do contrato:', error)
		return { error: 'Erro ao buscar detalhes do contrato.' }
	}
}

export type ContratoPdfData = Awaited<
	ReturnType<typeof getContratoDetailsForPdf>
>['data']
