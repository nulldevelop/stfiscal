import { z } from 'zod'

export const formSchemaTerceirizacao = z.object({
	licitacaoModalidadeNumero: z.string().min(1, 'Campo obrigatório'),
	secretariaNome: z.string().min(1, 'Campo obrigatório'),
	contratoId: z.string().min(1, 'Campo obrigatório'),
	periodoAnalisadoInicio: z.string().min(1, 'Campo obrigatório'),
	periodoAnalisadoFim: z.string().min(1, 'Campo obrigatório'),
	contratada: z.string().min(1, 'Campo obrigatório'),
	objeto: z.string().min(1, 'Campo obrigatório'),

	// Campos gatilho para visibilidade condicional
	garantiaContratual: z.string().optional(),
	modalidadeGarantia: z.string().optional(),
	validadeGarantia: z.string().optional(),
	recebeuNotificacao: z.string().optional(),
	aberturaProcessoAdministrativo: z.string().optional(),
	sofreuSancao: z.string().optional(),

	// Campos específicos de Terceirização
	houveDescoberturaPosto: z.string().optional(),
	descoberturaLocal: z.string().optional(),
	descoberturaTempo: z.string().optional(),
	houveDescontoNota: z.string().optional(),
	descontoValor: z.string().optional(),
	descontoMotivoNão: z.string().optional(),

	dynamicData: z.record(z.string(), z.any()).optional(),
})

export type TerceirizacaoReportFormValues = z.infer<
	typeof formSchemaTerceirizacao
>
