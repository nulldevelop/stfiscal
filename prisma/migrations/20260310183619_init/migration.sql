-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('OWNER', 'ADMIN', 'SUPORT', 'FISCAL_PRINCIPAL', 'FISCAL_SETORIAL', 'GESTOR_CONTRATOS', 'USER');

-- CreateEnum
CREATE TYPE "SituacaoLicitacao" AS ENUM ('AGUARDANDO', 'ANDAMENTO', 'CANCELADA', 'CONCLUIDA', 'SUSPENSA');

-- CreateEnum
CREATE TYPE "TipoLicitacao" AS ENUM ('CONCORRENCIA', 'TOMADA_DE_PRECO', 'CONVITE', 'PREGAO', 'LEILAO', 'INEXIGIBILIDADE', 'DISPENSA', 'OUTROS');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'DESACTIVE', 'TRIAL');

-- CreateEnum
CREATE TYPE "SituacaoFiscalTrabalhista" AS ENUM ('FISCAL', 'TRABALHISTA');

-- CreateEnum
CREATE TYPE "TipoNotificacaoRef" AS ENUM ('NOTIFICACAO', 'NOTIFICACAO_ENTREGA', 'NOTIFICACAO_ENTREGA_INCOMPLETA', 'NOTIFICACAO_FISCAL_TRABALHISTA', 'NOTIFICACAO_DESCONFORMIDADE');

-- CreateEnum
CREATE TYPE "TipoHistoricoNotificacao" AS ENUM ('COMENTARIO', 'ANEXO', 'ENVIO_EMAIL', 'RETORNO_FORNECEDOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "Cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "displayUsername" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "linkedAt" TIMESTAMP(3),
    "fiscalLinkedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "logo" TEXT,
    "cidade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "apiUrlContratos" TEXT,
    "apiUrlLicitacoes" TEXT,
    "apiUrlFiscais" TEXT,
    "apiUrlAditivos" TEXT,
    "autoLinkFiscais" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpFrom" TEXT,
    "notifyEmail" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncMessage" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'default@example.com',
    "role" "ROLES" NOT NULL DEFAULT 'FISCAL_SETORIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscalCpf" TEXT,
    "fiscalMatricula" TEXT,
    "fiscalCargo" TEXT,
    "fiscalContato" TEXT,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberPermission" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulo" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "endereco" TEXT,
    "telefone" TEXT,
    "representanteNome" TEXT,
    "representanteRg" TEXT,
    "representanteCpf" TEXT,
    "representanteTelefone" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licitacao" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "idOxy" TEXT,
    "numero" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "situacao" "SituacaoLicitacao" NOT NULL,
    "modalidade" "TipoLicitacao" NOT NULL,
    "dataPublicacao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "Licitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "organizationId" TEXT,
    "numero" INTEGER NOT NULL,
    "contratado" TEXT NOT NULL,
    "displayContrato" TEXT NOT NULL,
    "displayLicitacao" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "tipoAto" TEXT NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "objeto" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "nomeFiscal" TEXT,
    "idOxy" TEXT,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aditivo" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "dataPublicacao" TIMESTAMP(3),
    "dataTermino" TIMESTAMP(3),
    "valorAditivo" DOUBLE PRECISION,
    "motivacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aditivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empenho" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "historico" TEXT,
    "valorEmpenhado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorAnulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorLiquidado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorRetido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorAPagar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "origem" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empenho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalContrato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "portaria" TEXT,
    "matricula" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "contato" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaAtualizacao" TIMESTAMP(3),
    "status" "STATUS" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "FiscalContrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalContratoLink" (
    "id" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "dtinicio" TEXT NOT NULL,
    "dtfim" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalContratoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_fiscal" (
    "contratoId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "contrato_setorial" (
    "contratoId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BensEServicosReport" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "contratoId" TEXT,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "descricao" TEXT,
    "informacoes" TEXT,
    "reducaoGlosaObs" TEXT,
    "manutencaoCondicoesHabilitacao" TEXT NOT NULL,
    "manutencaoCondicoesHabilitacaoObs" TEXT,
    "certidaoDebitosFederais" TEXT NOT NULL,
    "certidaoDebitosEstadual" TEXT NOT NULL,
    "certidaoDebitosMunicipal" TEXT NOT NULL,
    "certidaoRegularidadeFGTS" TEXT NOT NULL,
    "certidaoNegativaDebitosTrabalhistas" TEXT NOT NULL,
    "regularidadeFiscalTrabalhistaObs" TEXT,
    "cumprimentoObrigacoes" TEXT NOT NULL,
    "cumprimentoObrigacoesObs" TEXT,
    "atendeChamados" TEXT NOT NULL,
    "atendeChamadosObs" TEXT,
    "prepostoAcessivel" TEXT NOT NULL,
    "prepostoAcessivelObs" TEXT,
    "recebeuNotificacao" TEXT NOT NULL,
    "recebeuNotificacaoObs" TEXT,
    "aberturaProcessoAdministrativo" TEXT,
    "aberturaProcessoAdministrativoObs" TEXT,
    "sofreuSancao" TEXT,
    "sofreuSancaoObs" TEXT,
    "realizaSubcontratacaoIlegal" TEXT NOT NULL,
    "realizaSubcontratacaoIlegalObs" TEXT,
    "subcontratadaCumpreObrigacoes" TEXT,
    "subcontratadaCumpreObrigacoesObs" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratada" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratadaObs" TEXT,
    "garantiaContratual" TEXT NOT NULL,
    "modalidadeGarantia" TEXT,
    "validadeGarantia" TEXT,
    "garantiaContratualObs" TEXT,
    "irregularidadesPendencias" TEXT,
    "providenciasAdotadas" TEXT,
    "resultados" TEXT,
    "informacoesAdicionais" TEXT,
    "dynamicData" TEXT,
    "protocolo" TEXT NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BensEServicosReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransporteReport" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "contratoId" TEXT,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "descricao" TEXT,
    "informacoes" TEXT,
    "reducaoGlosaObs" TEXT,
    "manutencaoCondicoesHabilitacao" TEXT NOT NULL,
    "manutencaoCondicoesHabilitacaoObs" TEXT,
    "certidaoDebitosFederais" TEXT NOT NULL,
    "certidaoDebitosEstadual" TEXT NOT NULL,
    "certidaoDebitosMunicipal" TEXT NOT NULL,
    "certidaoRegularidadeFGTS" TEXT NOT NULL,
    "certidaoNegativaDebitosTrabalhistas" TEXT NOT NULL,
    "regularidadeFiscalTrabalhistaObs" TEXT,
    "cumprimentoObrigacoes" TEXT NOT NULL,
    "cumprimentoObrigacoesObs" TEXT,
    "atendeChamados" TEXT NOT NULL,
    "atendeChamadosObs" TEXT,
    "prepostoAcessivel" TEXT NOT NULL,
    "prepostoAcessivelObs" TEXT,
    "veiculosBomEstado" TEXT NOT NULL,
    "veiculosBomEstadoObs" TEXT,
    "documentacaoVeiculosMotoristasRegular" TEXT NOT NULL,
    "documentacaoVeiculosMotoristasRegularObs" TEXT,
    "motoristasSegurosCorteses" TEXT NOT NULL,
    "motoristasSegurosCortesesObs" TEXT,
    "recebeuNotificacao" TEXT NOT NULL,
    "recebeuNotificacaoObs" TEXT,
    "aberturaProcessoAdministrativo" TEXT,
    "aberturaProcessoAdministrativoObs" TEXT,
    "sofreuSancao" TEXT,
    "sofreuSancaoObs" TEXT,
    "realizaSubcontratacaoIlegal" TEXT NOT NULL,
    "realizaSubcontratacaoIlegalObs" TEXT,
    "subcontratadaCumpreObrigacoes" TEXT,
    "subcontratadaCumpreObrigacoesObs" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratada" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratadaObs" TEXT,
    "garantiaContratual" TEXT NOT NULL,
    "modalidadeGarantia" TEXT,
    "validadeGarantia" TEXT,
    "garantiaContratualObs" TEXT,
    "irregularidadesPendencias" TEXT,
    "providenciasAdotadas" TEXT,
    "resultados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "informacoesAdicionais" TEXT,
    "dynamicData" TEXT,

    CONSTRAINT "TransporteReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObrasReport" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "descricao" TEXT,
    "manutencaoHabitacaoFiscalTrabalhista" TEXT NOT NULL,
    "manutencaoHabitacaoFiscalTrabalhistaObs" TEXT,
    "certidaoDebitosCreditosFederais" TEXT NOT NULL,
    "certidaoDebitosCreditosEstadual" TEXT NOT NULL,
    "certidaoDebitosCreditosMunicipal" TEXT NOT NULL,
    "certidaoRegularidadeFGTS" TEXT NOT NULL,
    "certidaoNegativaDebitosTrabalhistas" TEXT NOT NULL,
    "certificadosObs" TEXT,
    "controlePrazoExecucao" TEXT NOT NULL,
    "controlePrazoExecucaoObs" TEXT,
    "controleQualidadeMateriais" TEXT NOT NULL,
    "controleQualidadeMateriaisObs" TEXT,
    "controleQualidadeProjeto" TEXT NOT NULL,
    "controleQualidadeProjetoObs" TEXT,
    "controlePrevistoPercentual" TEXT,
    "controleExecutadoPercentual" TEXT,
    "controleControleQuantidadeObs" TEXT,
    "comprimentoObrigacoesContrato" TEXT NOT NULL,
    "comprimentoObrigacoesContratoObs" TEXT,
    "solicitacoesAtendidas" TEXT NOT NULL,
    "solicitacoesAtendidasObs" TEXT,
    "prepostoAcessivel" TEXT NOT NULL,
    "prepostoAcessivelObs" TEXT,
    "subcontratacaoIlegal" TEXT NOT NULL,
    "subcontratacaoIlegalObs" TEXT,
    "subcontratadaCumpreObrigacoes" TEXT NOT NULL,
    "subcontratadaCumpreObrigacoesObs" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratada" TEXT NOT NULL,
    "contratadaEncaminhaDocumentacaoSubcontratadaObs" TEXT,
    "houveAditivo" TEXT NOT NULL,
    "garantiaContratual" TEXT NOT NULL,
    "modalidadeGarantia" TEXT,
    "validadeGarantia" TEXT,
    "garantiaContratualObs" TEXT,
    "recebeuNotificacao" TEXT,
    "recebeuNotificacaoObs" TEXT,
    "sancoesAplicadas" TEXT,
    "sancoesAplicadasObs" TEXT,
    "aberturaProcessoAdministrativo" TEXT,
    "aberturaProcessoAdministrativoObs" TEXT,
    "sofreuSancao" TEXT,
    "sofreuSancaoObs" TEXT,
    "outrasIrregularidadesPendencias" TEXT,
    "outrasIrregularidadesPendenciasObs" TEXT,
    "providenciasAdotadas" TEXT,
    "providenciasAdotadasObs" TEXT,
    "resultados" TEXT,
    "resultadosObs" TEXT,
    "protocolo" TEXT NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "contratoId" TEXT,
    "informacoesAdicionais" TEXT,
    "dynamicData" TEXT,

    CONSTRAINT "ObrasReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalPrincipalReport" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL DEFAULT '',
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "atosDeFormato" TEXT,
    "medidasAdotadas" TEXT,
    "demaisInformacoes" TEXT,
    "dynamicData" TEXT,
    "protocolo" TEXT NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FiscalPrincipalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerceirizacaoReport" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "descricao" TEXT,
    "informacoes" TEXT,
    "reducaoGlosaObs" TEXT,
    "houveDescoberturaPosto" TEXT,
    "descoberturaLocal" TEXT,
    "descoberturaTempo" TEXT,
    "houveDescontoNota" TEXT,
    "descontoValor" TEXT,
    "descontoMotivoNão" TEXT,
    "manutencaoCondicoesHabilitacao" TEXT NOT NULL,
    "manutencaoCondicoesHabilitacaoObs" TEXT,
    "certidaoDebitosFederais" TEXT NOT NULL,
    "certidaoDebitosEstadual" TEXT NOT NULL,
    "certidaoDebitosMunicipal" TEXT NOT NULL,
    "certidaoRegularidadeFGTS" TEXT NOT NULL,
    "certidaoNegativaDebitosTrabalhistas" TEXT NOT NULL,
    "regularidadeFiscalTrabalhistaObs" TEXT,
    "cumprimentoObrigacoes" TEXT NOT NULL,
    "cumprimentoObrigacoesObs" TEXT,
    "atendeChamados" TEXT NOT NULL,
    "atendeChamadosObs" TEXT,
    "prepostoAcessivel" TEXT NOT NULL,
    "prepostoAcessivelObs" TEXT,
    "recebeuNotificacao" TEXT NOT NULL,
    "recebeuNotificacaoObs" TEXT,
    "aberturaProcessoAdministrativo" TEXT,
    "aberturaProcessoAdministrativoObs" TEXT,
    "sofreuSancao" TEXT,
    "sofreuSancaoObs" TEXT,
    "realizaSubcontratacaoIlegal" TEXT NOT NULL,
    "realizaSubcontratacaoIlegalObs" TEXT,
    "subcontratadaCumpreObrigacoes" TEXT,
    "subcontratadaCumpreObrigacoesObs" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratada" TEXT,
    "contratadaEncaminhaDocumentacaoSubcontratadaObs" TEXT,
    "garantiaContratual" TEXT NOT NULL,
    "modalidadeGarantia" TEXT,
    "validadeGarantia" TEXT,
    "garantiaContratualObs" TEXT,
    "irregularidadesPendencias" TEXT,
    "providenciasAdotadas" TEXT,
    "resultados" TEXT,
    "dynamicData" TEXT,
    "protocolo" TEXT NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerceirizacaoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TabelaAtraso" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "etapa" TEXT NOT NULL,
    "causa" TEXT NOT NULL,
    "reponsavel" TEXT NOT NULL,
    "providencias" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,
    "diasAtraso" INTEGER NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TabelaAtraso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableServicos" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "servico" TEXT NOT NULL,
    "ocorrencias" TEXT NOT NULL,
    "providencias" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,

    CONSTRAINT "TableServicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableMediacao" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "dataMediacao" TIMESTAMP(3) NOT NULL,
    "numeroMedicao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "valorPago" DECIMAL(65,30) NOT NULL,
    "numeroRecibo" TEXT NOT NULL,

    CONSTRAINT "TableMediacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableObrigacoes" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "descricao" TEXT NOT NULL,
    "dispositivoLegal" TEXT NOT NULL,
    "providencias" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,

    CONSTRAINT "TableObrigacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableAditivos" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "secretariaNome" TEXT NOT NULL,
    "licitacaoModalidadeNumero" TEXT NOT NULL,
    "contratoNumero" TEXT NOT NULL,
    "periodoAnalisadoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAnalisadoFim" TIMESTAMP(3) NOT NULL,
    "contratada" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "item" TEXT,
    "numero" TEXT NOT NULL,
    "dataPublicacao" TIMESTAMP(3) NOT NULL,
    "aditivoValorAcrecimoValor" DECIMAL(65,30),
    "aditivoValorAcrecimoPercent" DECIMAL(65,30),
    "aditivoValorSupressaoValor" DECIMAL(65,30),
    "aditivoValorSupressaoPercent" DECIMAL(65,30),
    "aditivoValorTotalValor" DECIMAL(65,30),
    "aditivoValorTotalPercent" DECIMAL(65,30),
    "aditivoPrazoAditivado" INTEGER,
    "aditivoPrazoTotal" INTEGER,

    CONSTRAINT "TableAditivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacoes" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "emailEnvio" TEXT,
    "dataAssinatura" TIMESTAMP(3),
    "prazo" INTEGER,
    "item" TEXT,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoEntrega" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroEmpenho" TEXT,
    "dataEmpenho" TIMESTAMP(3),
    "emailEmpenho" TEXT,
    "responsavelEmpenho" TEXT,
    "prazoEntrega" INTEGER,
    "dataCertidaoOcorrencia" TIMESTAMP(3),
    "prazoDefesa" INTEGER,
    "item" TEXT,
    "desconformidade" TEXT,

    CONSTRAINT "NotificacaoEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoEntregaIncompleta" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroEmpenho" TEXT,
    "dataEmpenho" TIMESTAMP(3),
    "emailEmpenho" TEXT,
    "responsavelEmpenho" TEXT,
    "prazoEntrega" INTEGER,
    "dataCertidaoOcorrencia" TIMESTAMP(3),
    "prazoDefesa" INTEGER,
    "item" TEXT,
    "desconformidade" TEXT,

    CONSTRAINT "NotificacaoEntregaIncompleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoFiscalTrabalhista" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certidaoNome" TEXT NOT NULL,
    "situacaoTipo" "SituacaoFiscalTrabalhista" NOT NULL,
    "prazo" INTEGER NOT NULL,

    CONSTRAINT "NotificacaoFiscalTrabalhista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoDesconformidade" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "assinaturaDigital" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroEmpenho" TEXT,
    "dataEmpenho" TIMESTAMP(3),
    "emailEmpenho" TEXT,
    "responsavelEmpenho" TEXT,
    "dataCertidaoOcorrencia" TIMESTAMP(3),
    "itemDesconformidade" TEXT NOT NULL,
    "prazoRegularizacao" INTEGER NOT NULL,

    CONSTRAINT "NotificacaoDesconformidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoHistorico" (
    "id" TEXT NOT NULL,
    "notificacaoId" TEXT NOT NULL,
    "tipoNotificacao" "TipoNotificacaoRef" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoHistoricoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "anexoPath" TEXT,
    "anexoNome" TEXT,
    "dataOcorrencia" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacaoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotacao" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "lotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_relatorio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validade" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "tipo_relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "description" TEXT,
    "before" TEXT,
    "after" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_sync_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalContratos" INTEGER,
    "totalFiscais" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_update" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetRoles" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_config" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "options" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisiblePrincipal" BOOLEAN NOT NULL DEFAULT true,
    "isVisibleSetorial" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLongText" BOOLEAN NOT NULL DEFAULT false,
    "hasObs" BOOLEAN NOT NULL DEFAULT false,
    "requiredObsValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cache_key_key" ON "Cache"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_cnpj_key" ON "organization"("cnpj");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "member"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "member_userId_organizationId_key" ON "member"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "MemberPermission_organizationId_idx" ON "MemberPermission"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberPermission_memberId_moduloId_key" ON "MemberPermission"("memberId", "moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "modulo_organizationId_key_key" ON "modulo"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Licitacao_numero_ano_modalidade_organizationId_key" ON "Licitacao"("numero", "ano", "modalidade", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_numero_tipoAto_exercicio_organizationId_key" ON "Contrato"("numero", "tipoAto", "exercicio", "organizationId");

-- CreateIndex
CREATE INDEX "aditivo_organizationId_idx" ON "aditivo"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "aditivo_contratoId_sequencia_key" ON "aditivo"("contratoId", "sequencia");

-- CreateIndex
CREATE INDEX "empenho_organizationId_idx" ON "empenho"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "empenho_contratoId_numero_exercicio_key" ON "empenho"("contratoId", "numero", "exercicio");

-- CreateIndex
CREATE INDEX "FiscalContrato_organizationId_idx" ON "FiscalContrato"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalContrato_cpf_organizationId_key" ON "FiscalContrato"("cpf", "organizationId");

-- CreateIndex
CREATE INDEX "FiscalContratoLink_contratoId_idx" ON "FiscalContratoLink"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalContratoLink_fiscalContratoId_contratoId_key" ON "FiscalContratoLink"("fiscalContratoId", "contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_fiscal_contratoId_key" ON "contrato_fiscal"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_setorial_contratoId_memberId_key" ON "contrato_setorial"("contratoId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "BensEServicosReport_assinaturaDigital_key" ON "BensEServicosReport"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "TransporteReport_assinaturaDigital_key" ON "TransporteReport"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "ObrasReport_assinaturaDigital_key" ON "ObrasReport"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPrincipalReport_assinaturaDigital_key" ON "FiscalPrincipalReport"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "TerceirizacaoReport_assinaturaDigital_key" ON "TerceirizacaoReport"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "Notificacoes_assinaturaDigital_key" ON "Notificacoes"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoEntrega_assinaturaDigital_key" ON "NotificacaoEntrega"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoEntregaIncompleta_assinaturaDigital_key" ON "NotificacaoEntregaIncompleta"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoFiscalTrabalhista_assinaturaDigital_key" ON "NotificacaoFiscalTrabalhista"("assinaturaDigital");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoDesconformidade_assinaturaDigital_key" ON "NotificacaoDesconformidade"("assinaturaDigital");

-- CreateIndex
CREATE INDEX "NotificacaoHistorico_notificacaoId_tipoNotificacao_idx" ON "NotificacaoHistorico"("notificacaoId", "tipoNotificacao");

-- CreateIndex
CREATE INDEX "NotificacaoHistorico_organizationId_idx" ON "NotificacaoHistorico"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "lotacao_name_key" ON "lotacao"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_relatorio_name_key" ON "tipo_relatorio"("name");

-- CreateIndex
CREATE INDEX "audit_log_organizationId_createdAt_idx" ON "audit_log"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "api_sync_log_organizationId_createdAt_idx" ON "api_sync_log"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "form_config_organizationId_idx" ON "form_config"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "form_config_reportType_fieldKey_organizationId_key" ON "form_config"("reportType", "fieldKey", "organizationId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPermission" ADD CONSTRAINT "MemberPermission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPermission" ADD CONSTRAINT "MemberPermission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPermission" ADD CONSTRAINT "MemberPermission_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulo" ADD CONSTRAINT "modulo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacao" ADD CONSTRAINT "Licitacao_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aditivo" ADD CONSTRAINT "aditivo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aditivo" ADD CONSTRAINT "aditivo_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empenho" ADD CONSTRAINT "empenho_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empenho" ADD CONSTRAINT "empenho_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalContrato" ADD CONSTRAINT "FiscalContrato_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalContrato" ADD CONSTRAINT "FiscalContrato_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalContratoLink" ADD CONSTRAINT "FiscalContratoLink_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalContratoLink" ADD CONSTRAINT "FiscalContratoLink_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_fiscal" ADD CONSTRAINT "contrato_fiscal_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_fiscal" ADD CONSTRAINT "contrato_fiscal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_setorial" ADD CONSTRAINT "contrato_setorial_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_setorial" ADD CONSTRAINT "contrato_setorial_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BensEServicosReport" ADD CONSTRAINT "BensEServicosReport_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BensEServicosReport" ADD CONSTRAINT "BensEServicosReport_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BensEServicosReport" ADD CONSTRAINT "BensEServicosReport_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BensEServicosReport" ADD CONSTRAINT "BensEServicosReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporteReport" ADD CONSTRAINT "TransporteReport_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporteReport" ADD CONSTRAINT "TransporteReport_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporteReport" ADD CONSTRAINT "TransporteReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporteReport" ADD CONSTRAINT "TransporteReport_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrasReport" ADD CONSTRAINT "ObrasReport_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrasReport" ADD CONSTRAINT "ObrasReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrasReport" ADD CONSTRAINT "ObrasReport_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrasReport" ADD CONSTRAINT "ObrasReport_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPrincipalReport" ADD CONSTRAINT "FiscalPrincipalReport_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPrincipalReport" ADD CONSTRAINT "FiscalPrincipalReport_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPrincipalReport" ADD CONSTRAINT "FiscalPrincipalReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPrincipalReport" ADD CONSTRAINT "FiscalPrincipalReport_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerceirizacaoReport" ADD CONSTRAINT "TerceirizacaoReport_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerceirizacaoReport" ADD CONSTRAINT "TerceirizacaoReport_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerceirizacaoReport" ADD CONSTRAINT "TerceirizacaoReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerceirizacaoReport" ADD CONSTRAINT "TerceirizacaoReport_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabelaAtraso" ADD CONSTRAINT "TabelaAtraso_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableServicos" ADD CONSTRAINT "TableServicos_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableMediacao" ADD CONSTRAINT "TableMediacao_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableObrigacoes" ADD CONSTRAINT "TableObrigacoes_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableAditivos" ADD CONSTRAINT "TableAditivos_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacoes" ADD CONSTRAINT "Notificacoes_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacoes" ADD CONSTRAINT "Notificacoes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacoes" ADD CONSTRAINT "Notificacoes_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntrega" ADD CONSTRAINT "NotificacaoEntrega_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntrega" ADD CONSTRAINT "NotificacaoEntrega_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntrega" ADD CONSTRAINT "NotificacaoEntrega_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntregaIncompleta" ADD CONSTRAINT "NotificacaoEntregaIncompleta_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntregaIncompleta" ADD CONSTRAINT "NotificacaoEntregaIncompleta_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoEntregaIncompleta" ADD CONSTRAINT "NotificacaoEntregaIncompleta_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoFiscalTrabalhista" ADD CONSTRAINT "NotificacaoFiscalTrabalhista_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoFiscalTrabalhista" ADD CONSTRAINT "NotificacaoFiscalTrabalhista_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoFiscalTrabalhista" ADD CONSTRAINT "NotificacaoFiscalTrabalhista_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoDesconformidade" ADD CONSTRAINT "NotificacaoDesconformidade_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoDesconformidade" ADD CONSTRAINT "NotificacaoDesconformidade_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoDesconformidade" ADD CONSTRAINT "NotificacaoDesconformidade_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoHistorico" ADD CONSTRAINT "NotificacaoHistorico_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoHistorico" ADD CONSTRAINT "NotificacaoHistorico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotacao" ADD CONSTRAINT "lotacao_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_relatorio" ADD CONSTRAINT "tipo_relatorio_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_sync_log" ADD CONSTRAINT "api_sync_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_update" ADD CONSTRAINT "system_update_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_config" ADD CONSTRAINT "form_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
