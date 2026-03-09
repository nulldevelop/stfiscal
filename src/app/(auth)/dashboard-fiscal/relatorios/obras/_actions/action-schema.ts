import { z } from 'zod'

// Schema para Tabela 1 - Etapas em Atraso
export const tabelaAtrasoSchema = z.object({
	item: z.string().optional(),
	etapa: z.string().min(1, 'Campo obrigatório'),
	causa: z.string().min(1, 'Campo obrigatório'),
	reponsavel: z.string().min(1, 'Campo obrigatório'),
	providencias: z.string().min(1, 'Campo obrigatório'),
	observacoes: z.string().min(1, 'Campo obrigatório'),
	diasAtraso: z.number().optional().default(0),
	percentual: z.number().optional().default(0),
})

// Schema para Tabela 2 - Serviços ou Materiais
export const tabelaServicosSchema = z.object({
	item: z.string().optional(),
	servico: z.string().min(1, 'Campo obrigatório'),
	ocorrencias: z.string().min(1, 'Campo obrigatório'),
	providencias: z.string().min(1, 'Campo obrigatório'),
	observacoes: z.string().min(1, 'Campo obrigatório'),
})

// Schema para Tabela 3 - Medições e Pagamentos
export const tabelaMediacaoSchema = z.object({
	item: z.string().optional(),
	dataMediacao: z.string().min(1, 'Data obrigatória'),
	numeroMedicao: z.string().min(1, 'Campo obrigatório'),
	valor: z.string().min(1, 'Valor obrigatório'),
	dataPagamento: z.string().min(1, 'Data obrigatória'),
	valorPago: z.string().min(1, 'Valor obrigatório'),
	numeroRecibo: z.string().min(1, 'Campo obrigatório'),
})

// Schema para Tabela 4 - Obrigações
export const tabelaObrigacoesSchema = z.object({
	item: z.string().optional(),
	descricao: z.string().min(1, 'Campo obrigatório'),
	dispositivoLegal: z.string().min(1, 'Campo obrigatório'),
	providencias: z.string().min(1, 'Campo obrigatório'),
	observacoes: z.string().min(1, 'Campo obrigatório'),
})

// Schema para Tabela 5 - Aditivos
export const tabelaAditivosSchema = z.object({
	item: z.string().optional(),
	numero: z.string().min(1, 'Campo obrigatório'),
	dataPublicacao: z.string().min(1, 'Data obrigatória'),
	aditivoValorAcrecimoValor: z.string().optional(),
	aditivoValorAcrecimoPercent: z.string().optional(),
	aditivoValorSupressaoValor: z.string().optional(),
	aditivoValorSupressaoPercent: z.string().optional(),
	aditivoValorTotalValor: z.string().optional(),
	aditivoValorTotalPercent: z.string().optional(),
	aditivoPrazoAditivado: z.string().optional(),
	aditivoPrazoTotal: z.string().optional(),
})

export const formSchemaObras = z.object({
	licitacaoModalidadeNumero: z.string().min(1, 'Campo obrigatório'),
	secretariaNome: z.string().min(1, 'Campo obrigatório'),
	contratoId: z.string().min(1, 'Campo obrigatório'),
	periodoAnalisadoInicio: z.string().min(1, 'Campo obrigatório'),
	periodoAnalisadoFim: z.string().min(1, 'Campo obrigatório'),
	contratada: z.string().min(1, 'Campo obrigatório'),
	objeto: z.string().min(1, 'Campo obrigatório'),

	// Campos gatilho para tabelas (devem estar no schema para tipagem do watch)
	controlePrazoExecucao: z.string().optional(),
	controleQualidadeMateriais: z.string().optional(),
	controleQualidadeProjeto: z.string().optional(),
	houveAditivo: z.string().optional(),
	prepostoAcessivel: z.string().optional(),
	controleExecutadoPercentual: z.string().optional(),

	// Campos de rádio e observações
	manutencaoHabitacaoFiscalTrabalhista: z.string().optional(),
	manutencaoHabitacaoFiscalTrabalhistaObs: z.string().optional(),
	certidaoDebitosCreditosFederais: z.string().optional(),
	certidaoDebitosCreditosEstadual: z.string().optional(),
	certidaoDebitosCreditosMunicipal: z.string().optional(),
	certidaoRegularidadeFGTS: z.string().optional(),
	certidaoNegativaDebitosTrabalhistas: z.string().optional(),
	certificadosObs: z.string().optional(),
	controlePrazoExecucaoObs: z.string().optional(),
	controleQualidadeMateriaisObs: z.string().optional(),
	controleQualidadeProjetoObs: z.string().optional(),
	controlePrevistoPercentual: z.string().optional(),
	controleControleQuantidadeObs: z.string().optional(),
	comprimentoObrigacoesContrato: z.string().optional(),
	comprimentoObrigacoesContratoObs: z.string().optional(),
	solicitacoesAtendidas: z.string().optional(),
	solicitacoesAtendidasObs: z.string().optional(),
	prepostoAcessivelObs: z.string().optional(),
	subcontratacaoIlegal: z.string().optional(),
	subcontratacaoIlegalObs: z.string().optional(),
	subcontratadaCumpreObrigacoes: z.string().optional(),
	subcontratadaCumpreObrigacoesObs: z.string().optional(),
	contratadaEncaminhaDocumentacaoSubcontratada: z.string().optional(),
	contratadaEncaminhaDocumentacaoSubcontratadaObs: z.string().optional(),
	garantiaContratual: z.string().optional(),
	garantiaContratualObs: z.string().optional(),
	modalidadeGarantia: z.string().optional(),
	validadeGarantia: z.string().optional(),
	recebeuNotificacao: z.string().optional(),
	recebeuNotificacaoObs: z.string().optional(),
	sancoesAplicadas: z.string().optional(),
	sancoesAplicadasObs: z.string().optional(),
	aberturaProcessoAdministrativo: z.string().optional(),
	aberturaProcessoAdministrativoObs: z.string().optional(),
	sofreuSancao: z.string().optional(),
	sofreuSancaoObs: z.string().optional(),
	outrasIrregularidadesPendencias: z.string().optional(),
	outrasIrregularidadesPendenciasObs: z.string().optional(),
	providenciasAdotadas: z.string().optional(),
	providenciasAdotadasObs: z.string().optional(),
	resultados: z.string().optional(),
	resultadosObs: z.string().optional(),
	informacoesAdicionais: z.string().optional(),

	// Tabelas fixas com lógica de UI complexa
	tabelaAtrasos: z.array(tabelaAtrasoSchema).optional(),
	tabelaServicos: z.array(tabelaServicosSchema).optional(),
	tabelaMediacoes: z.array(tabelaMediacaoSchema).optional(),
	tabelaObrigacoes: z.array(tabelaObrigacoesSchema).optional(),
	tabelaAditivos: z.array(tabelaAditivosSchema).optional(),

	// Dados Dinâmicos (campos parametrizados extras)
	dynamicData: z.record(z.string(), z.any()).optional(),
})

export type ObrasReportFormValues = z.infer<typeof formSchemaObras>
