'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
	formSchemaTransporte,
	type TransporteReportFormValues,
} from '../_actions/action-schema'

export type ExtendedTransporteValues = TransporteReportFormValues &
	Record<string, any>

export function useTransporteForm(dynamicConfigs?: any[]) {
	const defaultValues: any = {
		secretariaNome: '',
		licitacaoModalidadeNumero: '',
		contratoId: '',
		periodoAnalisadoInicio: '',
		periodoAnalisadoFim: '',
		contratada: '',
		objeto: '',
		manutencaoCondicoesHabilitacao: 'Sim',
		certidaoDebitosFederais: 'Sim',
		certidaoDebitosEstadual: 'Sim',
		certidaoDebitosMunicipal: 'Sim',
		certidaoRegularidadeFGTS: 'Sim',
		certidaoNegativaDebitosTrabalhistas: 'Sim',
		cumprimentoObrigacoes: 'Sim',
		atendeChamados: 'Sim',
		prepostoAcessivel: 'Sim',
		veiculosBomEstado: 'Sim',
		documentacaoVeiculosMotoristasRegular: 'Sim',
		motoristasSegurosCorteses: 'Sim',
		recebeuNotificacao: 'Não',
		aberturaProcessoAdministrativo: 'Não',
		sofreuSancao: 'Não',
		realizaSubcontratacaoIlegal: 'Não',
		subcontratadaCumpreObrigacoes: 'Não se aplica',
		contratadaEncaminhaDocumentacaoSubcontratada: 'Não se aplica',
		garantiaContratual: 'Não Previsto',
		modalidadeGarantia: '',
		validadeGarantia: '',
		dynamicData: {},
	}

	// Adiciona default values para campos dinâmicos customizados ou sobrepõe se vier do config
	if (dynamicConfigs) {
		for (const config of dynamicConfigs) {
			// Se o campo não tem valor default definido acima, ou se for customizado
			if (!(config.fieldKey in defaultValues) || config.fieldKey.startsWith('custom_')) {
				if (config.type === 'RADIO') {
					try {
						const opts = JSON.parse(config.options || '["Sim", "Não"]')
						defaultValues[config.fieldKey] = opts[0]
					} catch {
						defaultValues[config.fieldKey] = 'Sim'
					}
				} else {
					defaultValues[config.fieldKey] = ''
				}
			}
		}
	}

	const form = useForm<ExtendedTransporteValues>({
		resolver: zodResolver(formSchemaTransporte),
		defaultValues,
	})

	return form
}
