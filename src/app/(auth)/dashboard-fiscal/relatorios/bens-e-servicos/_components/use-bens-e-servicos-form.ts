'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
	type BensEServicosReportFormValues,
	formSchemaBensEServicos,
} from '../_actions/action-schema'

export type ExtendedBensEServicosValues = BensEServicosReportFormValues &
	Record<string, any>

export function useBensEServicosForm(dynamicConfigs?: any[]) {
	const defaultValues: any = {
		secretariaNome: '',
		informacoesAdicionais: '',
		licitacaoModalidadeNumero: '',
		contratoId: '',
		periodoAnalisadoInicio: '',
		periodoAnalisadoFim: '',
		contratada: '',
		objeto: '',
		manutencaoCondicoesHabilitacao: 'Sim',
		aberturaProcessoAdministrativo: 'Não',
		sofreuSancao: 'Não',
		regularidadeFiscalTrabalhista: 'Sim',
		certidaoDebitosFederais: 'Sim',
		certidaoDebitosEstadual: 'Sim',
		certidaoDebitosMunicipal: 'Sim',
		certidaoRegularidadeFGTS: 'Sim',
		certidaoNegativaDebitosTrabalhistas: 'Sim',
		cumprimentoObrigacoes: 'Sim',
		atendeChamados: 'Sim',
		prepostoAcessivel: 'Sim',
		recebeuNotificacao: 'Não',
		realizaSubcontratacaoIlegal: 'Não',
		subcontratadaCumpreObrigacoes: 'Sim',
		subcontratadaDocumentacaoCompleta: 'Não se aplica',
		garantiaContratual: 'Não Previsto',
		modalidadeGarantia: '',
		validadeGarantia: '',
		dynamicData: {},
	}

	// Adiciona default values para campos dinâmicos (custom_ e campos de schema não inicializados)
	if (dynamicConfigs) {
		for (const config of dynamicConfigs) {
			if (!(config.fieldKey in defaultValues)) {
				defaultValues[config.fieldKey] =
					config.type === 'RADIO'
						? (config.options ? JSON.parse(config.options)[0] : 'Sim')
						: ''
			}
		}
	}

	const form = useForm<ExtendedBensEServicosValues>({
		resolver: zodResolver(formSchemaBensEServicos),
		defaultValues,
	})

	return form
}
