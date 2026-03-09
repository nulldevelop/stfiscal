'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type UseFormReturn, useForm } from 'react-hook-form'
import {
	formSchemaObras,
	type ObrasReportFormValues,
} from '../_actions/action-schema'

export function useObrasForm(dynamicConfigs?: any[]) {
	const defaultValues: any = {
		secretariaNome: '',
		licitacaoModalidadeNumero: '',
		contratoId: '',
		periodoAnalisadoInicio: '',
		periodoAnalisadoFim: '',
		contratada: '',
		objeto: '',
		manutencaoHabitacaoFiscalTrabalhista: 'Sim',
		certidaoDebitosCreditosFederais: 'Sim',
		certidaoDebitosCreditosEstadual: 'Sim',
		certidaoDebitosCreditosMunicipal: 'Sim',
		certidaoRegularidadeFGTS: 'Sim',
		certidaoNegativaDebitosTrabalhistas: 'Sim',
		controlePrazoExecucao:
			'A obra vem sendo executada de acordo com o cronograma físico-financeiro',
		controleQualidadeMateriais:
			'As especificações técnicas dos materiais e serviços vêm sendo respeitadas',
		controleQualidadeProjeto:
			'Os serviços vêm sendo executados de acordo com o projeto',
		comprimentoObrigacoesContrato: 'Sim',
		solicitacoesAtendidas: 'Sim',
		prepostoAcessivel: 'Sim',
		subcontratacaoIlegal: 'Não',
		subcontratadaCumpreObrigacoes: 'Não se aplica',
		contratadaEncaminhaDocumentacaoSubcontratada: 'Não se aplica',
		houveAditivo: 'Não',
		garantiaContratual: 'Não Previsto',
		recebeuNotificacao: 'Não',
		aberturaProcessoAdministrativo: 'Não',
		sofreuSancao: 'Não',
		controleExecutadoPercentual: '',
		tabelaAtrasos: [],
		tabelaServicos: [],
		tabelaMediacoes: [],
		tabelaObrigacoes: [],
		tabelaAditivos: [],
		dynamicData: {},
	}

	// Adiciona default values para campos dinâmicos
	if (dynamicConfigs) {
		for (const config of dynamicConfigs) {
			if (
				!(config.fieldKey in defaultValues) ||
				config.fieldKey.startsWith('custom_')
			) {
				if (config.type === 'RADIO') {
					try {
						const opts = JSON.parse(config.options || '["Sim", "Não"]')
						defaultValues[config.fieldKey] = opts[0]
					} catch {
						defaultValues[config.fieldKey] = 'Sim'
					}
				} else if (config.type === 'NUMBER') {
					defaultValues[config.fieldKey] = 0
				} else {
					defaultValues[config.fieldKey] = ''
				}
			}
		}
	}

	const form = useForm<ObrasReportFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(formSchemaObras) as any,
		defaultValues: defaultValues as ObrasReportFormValues,
	})

	return form as unknown as UseFormReturn<ObrasReportFormValues>
}
