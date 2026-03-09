import { z } from 'zod'

export const atoDeFormacaoSchema = z.object({
	num: z.number(),
	atoPraticado: z.string().min(1, 'Descrição do ato é obrigatória'),
	data: z.string().min(1, 'Data é obrigatória'),
	identificouIrregularidade: z.string().min(1, 'Campo obrigatório'),
})

export const medidaAdotadaSchema = z.object({
	num: z.number(),
	irregularidade: z.string().min(1, 'Irregularidade é obrigatória'),
	medidasAdotadas: z.string().min(1, 'Medidas adotadas são obrigatórias'),
	data: z.string().min(1, 'Data é obrigatória'),
	problemaResolvido: z.string().min(1, 'Campo obrigatório'),
})

export const formSchemaFiscalPrincipal = z.object({
	contratoId: z.string().min(1, 'Contrato é obrigatório'),
	licitacaoModalidadeNumero: z.string().min(1, 'Campo obrigatório'),
	contratoNumero: z.string().min(1, 'Campo obrigatório'),
	secretariaNome: z.string().min(1, 'Campo obrigatório'),
	periodoAnalisadoInicio: z.string().min(1, 'Período de início é obrigatório'),
	periodoAnalisadoFim: z.string().min(1, 'Período de fim é obrigatório'),
	contratada: z.string().min(1, 'Campo obrigatório'),
	objeto: z.string().min(1, 'Campo obrigatório'),

	// Tabelas complexas
	atosDeFormato: z.array(atoDeFormacaoSchema).optional(),
	medidasAdotadas: z.array(medidaAdotadaSchema).optional(),
	demaisInformacoes: z.string().optional(),

	// Campos gatilho para visibilidade condicional
	garantiaContratual: z.string().optional(),
	modalidadeGarantia: z.string().optional(),
	validadeGarantia: z.string().optional(),
	recebeuNotificacao: z.string().optional(),
	aberturaProcessoAdministrativo: z.string().optional(),
	sofreuSancao: z.string().optional(),
	
	// Dados Dinâmicos
	dynamicData: z.record(z.string(), z.any()).optional(),
})

export type FiscalPrincipalReportFormValues = z.infer<
	typeof formSchemaFiscalPrincipal
>
