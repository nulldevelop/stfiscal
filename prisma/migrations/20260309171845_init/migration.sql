-- CreateTable
CREATE TABLE `Cache` (
    `key` VARCHAR(191) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `Cache_key_key`(`key`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `username` VARCHAR(191) NULL,
    `displayUsername` TEXT NULL,
    `banned` BOOLEAN NULL DEFAULT false,
    `banReason` TEXT NULL,
    `banExpires` DATETIME(3) NULL,
    `linkedAt` DATETIME(3) NULL,
    `fiscalLinkedAt` DATETIME(3) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` TEXT NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `impersonatedBy` TEXT NULL,
    `activeOrganizationId` TEXT NULL,

    UNIQUE INDEX `session_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('ACTIVE', 'DESACTIVE', 'TRIAL') NOT NULL DEFAULT 'ACTIVE',
    `apiUrlContratos` TEXT NULL,
    `apiUrlLicitacoes` TEXT NULL,
    `apiUrlFiscais` TEXT NULL,
    `apiUrlAditivos` TEXT NULL,
    `autoLinkFiscais` BOOLEAN NOT NULL DEFAULT false,
    `smtpHost` VARCHAR(191) NULL,
    `smtpPort` INTEGER NULL DEFAULT 587,
    `smtpUser` VARCHAR(191) NULL,
    `smtpPass` TEXT NULL,
    `smtpFrom` VARCHAR(191) NULL,
    `notifyEmail` VARCHAR(191) NULL,
    `lastSyncAt` DATETIME(3) NULL,
    `lastSyncStatus` VARCHAR(191) NULL,
    `lastSyncMessage` TEXT NULL,

    UNIQUE INDEX `organization_slug_key`(`slug`),
    UNIQUE INDEX `organization_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL DEFAULT 'default@example.com',
    `role` ENUM('OWNER', 'ADMIN', 'SUPORT', 'FISCAL_PRINCIPAL', 'FISCAL_SETORIAL', 'GESTOR_CONTRATOS', 'USER') NOT NULL DEFAULT 'FISCAL_SETORIAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fiscalCpf` VARCHAR(191) NULL,
    `fiscalMatricula` VARCHAR(191) NULL,
    `fiscalCargo` VARCHAR(191) NULL,
    `fiscalContato` VARCHAR(191) NULL,

    INDEX `member_organizationId_fkey`(`organizationId`),
    UNIQUE INDEX `member_userId_organizationId_key`(`userId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemberPermission` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `moduloId` VARCHAR(191) NOT NULL,
    `canCreate` BOOLEAN NOT NULL DEFAULT false,
    `canRead` BOOLEAN NOT NULL DEFAULT true,
    `canUpdate` BOOLEAN NOT NULL DEFAULT false,
    `canDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MemberPermission_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `MemberPermission_memberId_moduloId_key`(`memberId`, `moduloId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modulo` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `modulo_organizationId_key_key`(`organizationId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `representanteNome` VARCHAR(191) NULL,
    `representanteRg` VARCHAR(191) NULL,
    `representanteCpf` VARCHAR(191) NULL,
    `representanteTelefone` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `empresas_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Licitacao` (
    `id` VARCHAR(191) NOT NULL,
    `entidade` TEXT NOT NULL,
    `objeto` TEXT NOT NULL,
    `idOxy` VARCHAR(191) NULL,
    `numero` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `situacao` ENUM('AGUARDANDO', 'ANDAMENTO', 'CANCELADA', 'CONCLUIDA', 'SUSPENSA') NOT NULL,
    `modalidade` ENUM('CONCORRENCIA', 'TOMADA_DE_PRECO', 'CONVITE', 'PREGAO', 'LEILAO', 'INEXIGIBILIDADE', 'DISPENSA', 'OUTROS') NOT NULL,
    `dataPublicacao` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `Licitacao_numero_ano_modalidade_organizationId_key`(`numero`, `ano`, `modalidade`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `numero` INTEGER NOT NULL,
    `contratado` VARCHAR(191) NOT NULL,
    `displayContrato` VARCHAR(191) NOT NULL,
    `displayLicitacao` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `tipoAto` VARCHAR(191) NOT NULL,
    `exercicio` INTEGER NOT NULL,
    `objeto` TEXT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `nomeFiscal` VARCHAR(191) NULL,
    `idOxy` VARCHAR(191) NULL,

    UNIQUE INDEX `Contrato_numero_tipoAto_exercicio_organizationId_key`(`numero`, `tipoAto`, `exercicio`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aditivo` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `sequencia` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `dataPublicacao` DATETIME(3) NULL,
    `dataTermino` DATETIME(3) NULL,
    `valorAditivo` DOUBLE NULL,
    `motivacao` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `aditivo_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `aditivo_contratoId_sequencia_key`(`contratoId`, `sequencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empenho` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `exercicio` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `fornecedor` VARCHAR(191) NOT NULL,
    `historico` TEXT NULL,
    `valorEmpenhado` DOUBLE NOT NULL DEFAULT 0,
    `valorAnulado` DOUBLE NOT NULL DEFAULT 0,
    `valorLiquidado` DOUBLE NOT NULL DEFAULT 0,
    `valorRetido` DOUBLE NOT NULL DEFAULT 0,
    `valorPago` DOUBLE NOT NULL DEFAULT 0,
    `valorAPagar` DOUBLE NOT NULL DEFAULT 0,
    `origem` VARCHAR(191) NOT NULL DEFAULT 'MANUAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `empenho_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `empenho_contratoId_numero_exercicio_key`(`contratoId`, `numero`, `exercicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiscalContrato` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `portaria` VARCHAR(191) NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `organizationId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimaAtualizacao` DATETIME(3) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',

    INDEX `FiscalContrato_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `FiscalContrato_cpf_organizationId_key`(`cpf`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiscalContratoLink` (
    `id` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `dtinicio` VARCHAR(191) NOT NULL,
    `dtfim` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FiscalContratoLink_contratoId_idx`(`contratoId`),
    UNIQUE INDEX `FiscalContratoLink_fiscalContratoId_contratoId_key`(`fiscalContratoId`, `contratoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contrato_fiscal` (
    `contratoId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `contrato_fiscal_contratoId_key`(`contratoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contrato_setorial` (
    `contratoId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `contrato_setorial_contratoId_memberId_key`(`contratoId`, `memberId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BensEServicosReport` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `descricao` TEXT NULL,
    `informacoes` TEXT NULL,
    `reducaoGlosaObs` TEXT NULL,
    `manutencaoCondicoesHabilitacao` VARCHAR(191) NOT NULL,
    `manutencaoCondicoesHabilitacaoObs` TEXT NULL,
    `certidaoDebitosFederais` VARCHAR(191) NOT NULL,
    `certidaoDebitosEstadual` VARCHAR(191) NOT NULL,
    `certidaoDebitosMunicipal` VARCHAR(191) NOT NULL,
    `certidaoRegularidadeFGTS` VARCHAR(191) NOT NULL,
    `certidaoNegativaDebitosTrabalhistas` VARCHAR(191) NOT NULL,
    `regularidadeFiscalTrabalhistaObs` TEXT NULL,
    `cumprimentoObrigacoes` VARCHAR(191) NOT NULL,
    `cumprimentoObrigacoesObs` TEXT NULL,
    `atendeChamados` VARCHAR(191) NOT NULL,
    `atendeChamadosObs` TEXT NULL,
    `prepostoAcessivel` VARCHAR(191) NOT NULL,
    `prepostoAcessivelObs` TEXT NULL,
    `recebeuNotificacao` VARCHAR(191) NOT NULL,
    `recebeuNotificacaoObs` TEXT NULL,
    `aberturaProcessoAdministrativo` TEXT NULL,
    `aberturaProcessoAdministrativoObs` TEXT NULL,
    `sofreuSancao` VARCHAR(191) NULL,
    `sofreuSancaoObs` TEXT NULL,
    `realizaSubcontratacaoIlegal` VARCHAR(191) NOT NULL,
    `realizaSubcontratacaoIlegalObs` TEXT NULL,
    `subcontratadaCumpreObrigacoes` VARCHAR(191) NULL,
    `subcontratadaCumpreObrigacoesObs` TEXT NULL,
    `contratadaEncaminhaDocumentacaoSubcontratada` VARCHAR(191) NULL,
    `contratadaEncaminhaDocumentacaoSubcontratadaObs` TEXT NULL,
    `garantiaContratual` VARCHAR(191) NOT NULL,
    `modalidadeGarantia` VARCHAR(191) NULL,
    `validadeGarantia` VARCHAR(191) NULL,
    `garantiaContratualObs` TEXT NULL,
    `irregularidadesPendencias` TEXT NULL,
    `providenciasAdotadas` TEXT NULL,
    `resultados` TEXT NULL,
    `informacoesAdicionais` TEXT NULL,
    `dynamicData` LONGTEXT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BensEServicosReport_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransporteReport` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `descricao` TEXT NULL,
    `informacoes` TEXT NULL,
    `reducaoGlosaObs` TEXT NULL,
    `manutencaoCondicoesHabilitacao` VARCHAR(191) NOT NULL,
    `manutencaoCondicoesHabilitacaoObs` TEXT NULL,
    `certidaoDebitosFederais` VARCHAR(191) NOT NULL,
    `certidaoDebitosEstadual` VARCHAR(191) NOT NULL,
    `certidaoDebitosMunicipal` VARCHAR(191) NOT NULL,
    `certidaoRegularidadeFGTS` VARCHAR(191) NOT NULL,
    `certidaoNegativaDebitosTrabalhistas` VARCHAR(191) NOT NULL,
    `regularidadeFiscalTrabalhistaObs` TEXT NULL,
    `cumprimentoObrigacoes` VARCHAR(191) NOT NULL,
    `cumprimentoObrigacoesObs` TEXT NULL,
    `atendeChamados` VARCHAR(191) NOT NULL,
    `atendeChamadosObs` TEXT NULL,
    `prepostoAcessivel` VARCHAR(191) NOT NULL,
    `prepostoAcessivelObs` TEXT NULL,
    `veiculosBomEstado` VARCHAR(191) NOT NULL,
    `veiculosBomEstadoObs` TEXT NULL,
    `documentacaoVeiculosMotoristasRegular` VARCHAR(191) NOT NULL,
    `documentacaoVeiculosMotoristasRegularObs` TEXT NULL,
    `motoristasSegurosCorteses` VARCHAR(191) NOT NULL,
    `motoristasSegurosCortesesObs` TEXT NULL,
    `recebeuNotificacao` VARCHAR(191) NOT NULL,
    `recebeuNotificacaoObs` TEXT NULL,
    `aberturaProcessoAdministrativo` TEXT NULL,
    `aberturaProcessoAdministrativoObs` TEXT NULL,
    `sofreuSancao` VARCHAR(191) NULL,
    `sofreuSancaoObs` TEXT NULL,
    `realizaSubcontratacaoIlegal` VARCHAR(191) NOT NULL,
    `realizaSubcontratacaoIlegalObs` TEXT NULL,
    `subcontratadaCumpreObrigacoes` VARCHAR(191) NULL,
    `subcontratadaCumpreObrigacoesObs` TEXT NULL,
    `contratadaEncaminhaDocumentacaoSubcontratada` VARCHAR(191) NULL,
    `contratadaEncaminhaDocumentacaoSubcontratadaObs` TEXT NULL,
    `garantiaContratual` VARCHAR(191) NOT NULL,
    `modalidadeGarantia` VARCHAR(191) NULL,
    `validadeGarantia` VARCHAR(191) NULL,
    `garantiaContratualObs` TEXT NULL,
    `irregularidadesPendencias` TEXT NULL,
    `providenciasAdotadas` TEXT NULL,
    `resultados` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `informacoesAdicionais` TEXT NULL,
    `dynamicData` LONGTEXT NULL,

    UNIQUE INDEX `TransporteReport_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ObrasReport` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `descricao` TEXT NULL,
    `manutencaoHabitacaoFiscalTrabalhista` VARCHAR(191) NOT NULL,
    `manutencaoHabitacaoFiscalTrabalhistaObs` TEXT NULL,
    `certidaoDebitosCreditosFederais` VARCHAR(191) NOT NULL,
    `certidaoDebitosCreditosEstadual` VARCHAR(191) NOT NULL,
    `certidaoDebitosCreditosMunicipal` VARCHAR(191) NOT NULL,
    `certidaoRegularidadeFGTS` VARCHAR(191) NOT NULL,
    `certidaoNegativaDebitosTrabalhistas` VARCHAR(191) NOT NULL,
    `certificadosObs` TEXT NULL,
    `controlePrazoExecucao` VARCHAR(191) NOT NULL,
    `controlePrazoExecucaoObs` TEXT NULL,
    `controleQualidadeMateriais` VARCHAR(191) NOT NULL,
    `controleQualidadeMateriaisObs` TEXT NULL,
    `controleQualidadeProjeto` VARCHAR(191) NOT NULL,
    `controleQualidadeProjetoObs` TEXT NULL,
    `controlePrevistoPercentual` VARCHAR(191) NULL,
    `controleExecutadoPercentual` VARCHAR(191) NULL,
    `controleControleQuantidadeObs` TEXT NULL,
    `comprimentoObrigacoesContrato` VARCHAR(191) NOT NULL,
    `comprimentoObrigacoesContratoObs` TEXT NULL,
    `solicitacoesAtendidas` VARCHAR(191) NOT NULL,
    `solicitacoesAtendidasObs` TEXT NULL,
    `prepostoAcessivel` VARCHAR(191) NOT NULL,
    `prepostoAcessivelObs` TEXT NULL,
    `subcontratacaoIlegal` VARCHAR(191) NOT NULL,
    `subcontratacaoIlegalObs` TEXT NULL,
    `subcontratadaCumpreObrigacoes` VARCHAR(191) NOT NULL,
    `subcontratadaCumpreObrigacoesObs` TEXT NULL,
    `contratadaEncaminhaDocumentacaoSubcontratada` VARCHAR(191) NOT NULL,
    `contratadaEncaminhaDocumentacaoSubcontratadaObs` TEXT NULL,
    `houveAditivo` VARCHAR(191) NOT NULL,
    `garantiaContratual` VARCHAR(191) NOT NULL,
    `modalidadeGarantia` VARCHAR(191) NULL,
    `validadeGarantia` VARCHAR(191) NULL,
    `garantiaContratualObs` TEXT NULL,
    `recebeuNotificacao` VARCHAR(191) NULL,
    `recebeuNotificacaoObs` TEXT NULL,
    `sancoesAplicadas` VARCHAR(191) NULL,
    `sancoesAplicadasObs` TEXT NULL,
    `aberturaProcessoAdministrativo` VARCHAR(191) NULL,
    `aberturaProcessoAdministrativoObs` TEXT NULL,
    `sofreuSancao` VARCHAR(191) NULL,
    `sofreuSancaoObs` TEXT NULL,
    `outrasIrregularidadesPendencias` TEXT NULL,
    `outrasIrregularidadesPendenciasObs` TEXT NULL,
    `providenciasAdotadas` TEXT NULL,
    `providenciasAdotadasObs` TEXT NULL,
    `resultados` TEXT NULL,
    `resultadosObs` TEXT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NULL,
    `informacoesAdicionais` TEXT NULL,
    `dynamicData` LONGTEXT NULL,

    UNIQUE INDEX `ObrasReport_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FiscalPrincipalReport` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL DEFAULT '',
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `atosDeFormato` LONGTEXT NULL,
    `medidasAdotadas` LONGTEXT NULL,
    `demaisInformacoes` TEXT NULL,
    `dynamicData` LONGTEXT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FiscalPrincipalReport_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TerceirizacaoReport` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `descricao` TEXT NULL,
    `informacoes` TEXT NULL,
    `reducaoGlosaObs` TEXT NULL,
    `houveDescoberturaPosto` VARCHAR(191) NULL,
    `descoberturaLocal` VARCHAR(191) NULL,
    `descoberturaTempo` VARCHAR(191) NULL,
    `houveDescontoNota` VARCHAR(191) NULL,
    `descontoValor` VARCHAR(191) NULL,
    `descontoMotivoNão` TEXT NULL,
    `manutencaoCondicoesHabilitacao` VARCHAR(191) NOT NULL,
    `manutencaoCondicoesHabilitacaoObs` TEXT NULL,
    `certidaoDebitosFederais` VARCHAR(191) NOT NULL,
    `certidaoDebitosEstadual` VARCHAR(191) NOT NULL,
    `certidaoDebitosMunicipal` VARCHAR(191) NOT NULL,
    `certidaoRegularidadeFGTS` VARCHAR(191) NOT NULL,
    `certidaoNegativaDebitosTrabalhistas` VARCHAR(191) NOT NULL,
    `regularidadeFiscalTrabalhistaObs` TEXT NULL,
    `cumprimentoObrigacoes` VARCHAR(191) NOT NULL,
    `cumprimentoObrigacoesObs` TEXT NULL,
    `atendeChamados` VARCHAR(191) NOT NULL,
    `atendeChamadosObs` TEXT NULL,
    `prepostoAcessivel` VARCHAR(191) NOT NULL,
    `prepostoAcessivelObs` TEXT NULL,
    `recebeuNotificacao` VARCHAR(191) NOT NULL,
    `recebeuNotificacaoObs` TEXT NULL,
    `aberturaProcessoAdministrativo` TEXT NULL,
    `aberturaProcessoAdministrativoObs` TEXT NULL,
    `sofreuSancao` VARCHAR(191) NULL,
    `sofreuSancaoObs` TEXT NULL,
    `realizaSubcontratacaoIlegal` VARCHAR(191) NOT NULL,
    `realizaSubcontratacaoIlegalObs` TEXT NULL,
    `subcontratadaCumpreObrigacoes` VARCHAR(191) NULL,
    `subcontratadaCumpreObrigacoesObs` TEXT NULL,
    `contratadaEncaminhaDocumentacaoSubcontratada` VARCHAR(191) NULL,
    `contratadaEncaminhaDocumentacaoSubcontratadaObs` TEXT NULL,
    `garantiaContratual` VARCHAR(191) NOT NULL,
    `modalidadeGarantia` VARCHAR(191) NULL,
    `validadeGarantia` VARCHAR(191) NULL,
    `garantiaContratualObs` TEXT NULL,
    `irregularidadesPendencias` TEXT NULL,
    `providenciasAdotadas` TEXT NULL,
    `resultados` TEXT NULL,
    `dynamicData` LONGTEXT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TerceirizacaoReport_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TabelaAtraso` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `etapa` TEXT NOT NULL,
    `causa` TEXT NOT NULL,
    `reponsavel` TEXT NOT NULL,
    `providencias` TEXT NOT NULL,
    `observacoes` TEXT NOT NULL,
    `diasAtraso` INTEGER NOT NULL,
    `percentual` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TableServicos` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `servico` TEXT NOT NULL,
    `ocorrencias` TEXT NOT NULL,
    `providencias` TEXT NOT NULL,
    `observacoes` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TableMediacao` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `dataMediacao` DATETIME(3) NOT NULL,
    `numeroMedicao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `dataPagamento` DATETIME(3) NOT NULL,
    `valorPago` DECIMAL(65, 30) NOT NULL,
    `numeroRecibo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TableObrigacoes` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `descricao` TEXT NOT NULL,
    `dispositivoLegal` TEXT NOT NULL,
    `providencias` TEXT NOT NULL,
    `observacoes` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TableAditivos` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `secretariaNome` VARCHAR(191) NOT NULL,
    `licitacaoModalidadeNumero` VARCHAR(191) NOT NULL,
    `contratoNumero` VARCHAR(191) NOT NULL,
    `periodoAnalisadoInicio` DATETIME(3) NOT NULL,
    `periodoAnalisadoFim` DATETIME(3) NOT NULL,
    `contratada` VARCHAR(191) NOT NULL,
    `objeto` TEXT NOT NULL,
    `item` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NOT NULL,
    `dataPublicacao` DATETIME(3) NOT NULL,
    `aditivoValorAcrecimoValor` DECIMAL(65, 30) NULL,
    `aditivoValorAcrecimoPercent` DECIMAL(65, 30) NULL,
    `aditivoValorSupressaoValor` DECIMAL(65, 30) NULL,
    `aditivoValorSupressaoPercent` DECIMAL(65, 30) NULL,
    `aditivoValorTotalValor` DECIMAL(65, 30) NULL,
    `aditivoValorTotalPercent` DECIMAL(65, 30) NULL,
    `aditivoPrazoAditivado` INTEGER NULL,
    `aditivoPrazoTotal` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacoes` (
    `id` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataEnvio` DATETIME(3) NOT NULL,
    `emailEnvio` VARCHAR(191) NULL,
    `dataAssinatura` DATETIME(3) NULL,
    `prazo` INTEGER NULL,
    `item` VARCHAR(191) NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Notificacoes_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoEntrega` (
    `id` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataEnvio` DATETIME(3) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `numeroEmpenho` VARCHAR(191) NULL,
    `dataEmpenho` DATETIME(3) NULL,
    `emailEmpenho` VARCHAR(191) NULL,
    `responsavelEmpenho` VARCHAR(191) NULL,
    `prazoEntrega` INTEGER NULL,
    `dataCertidaoOcorrencia` DATETIME(3) NULL,
    `prazoDefesa` INTEGER NULL,
    `item` VARCHAR(191) NULL,
    `desconformidade` TEXT NULL,

    UNIQUE INDEX `NotificacaoEntrega_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoEntregaIncompleta` (
    `id` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataEnvio` DATETIME(3) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `numeroEmpenho` VARCHAR(191) NULL,
    `dataEmpenho` DATETIME(3) NULL,
    `emailEmpenho` VARCHAR(191) NULL,
    `responsavelEmpenho` VARCHAR(191) NULL,
    `prazoEntrega` INTEGER NULL,
    `dataCertidaoOcorrencia` DATETIME(3) NULL,
    `prazoDefesa` INTEGER NULL,
    `item` VARCHAR(191) NULL,
    `desconformidade` TEXT NULL,

    UNIQUE INDEX `NotificacaoEntregaIncompleta_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoFiscalTrabalhista` (
    `id` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataEnvio` DATETIME(3) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `certidaoNome` VARCHAR(191) NOT NULL,
    `situacaoTipo` ENUM('FISCAL', 'TRABALHISTA') NOT NULL,
    `prazo` INTEGER NOT NULL,

    UNIQUE INDEX `NotificacaoFiscalTrabalhista_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoDesconformidade` (
    `id` VARCHAR(191) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `fiscalContratoId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataEnvio` DATETIME(3) NOT NULL,
    `assinaturaDigital` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `numeroEmpenho` VARCHAR(191) NULL,
    `dataEmpenho` DATETIME(3) NULL,
    `emailEmpenho` VARCHAR(191) NULL,
    `responsavelEmpenho` VARCHAR(191) NULL,
    `dataCertidaoOcorrencia` DATETIME(3) NULL,
    `itemDesconformidade` TEXT NOT NULL,
    `prazoRegularizacao` INTEGER NOT NULL,

    UNIQUE INDEX `NotificacaoDesconformidade_assinaturaDigital_key`(`assinaturaDigital`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoHistorico` (
    `id` VARCHAR(191) NOT NULL,
    `notificacaoId` VARCHAR(191) NOT NULL,
    `tipoNotificacao` ENUM('NOTIFICACAO', 'NOTIFICACAO_ENTREGA', 'NOTIFICACAO_ENTREGA_INCOMPLETA', 'NOTIFICACAO_FISCAL_TRABALHISTA', 'NOTIFICACAO_DESCONFORMIDADE') NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('COMENTARIO', 'ANEXO', 'ENVIO_EMAIL', 'RETORNO_FORNECEDOR', 'OUTRO') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `anexoPath` VARCHAR(191) NULL,
    `anexoNome` VARCHAR(191) NULL,
    `dataOcorrencia` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NotificacaoHistorico_notificacaoId_tipoNotificacao_idx`(`notificacaoId`, `tipoNotificacao`),
    INDEX `NotificacaoHistorico_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotacao` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `lotacao_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_relatorio` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validade` INTEGER NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tipo_relatorio_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `entity` TEXT NOT NULL,
    `entityId` TEXT NULL,
    `entityName` TEXT NULL,
    `userId` TEXT NOT NULL,
    `userName` TEXT NOT NULL,
    `userEmail` TEXT NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `before` LONGTEXT NULL,
    `after` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_organizationId_createdAt_idx`(`organizationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_sync_log` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `totalContratos` INTEGER NULL,
    `totalFiscais` INTEGER NULL,
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_sync_log_organizationId_createdAt_idx`(`organizationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_update` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `version` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `targetRoles` TEXT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_config` (
    `id` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `fieldKey` VARCHAR(191) NOT NULL,
    `label` TEXT NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL,
    `options` TINYTEXT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `isVisiblePrincipal` BOOLEAN NOT NULL DEFAULT true,
    `isVisibleSetorial` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `section` TEXT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isLongText` BOOLEAN NOT NULL DEFAULT false,
    `hasObs` BOOLEAN NOT NULL DEFAULT false,
    `requiredObsValue` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `form_config_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `form_config_reportType_fieldKey_organizationId_key`(`reportType`, `fieldKey`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberPermission` ADD CONSTRAINT `MemberPermission_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberPermission` ADD CONSTRAINT `MemberPermission_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberPermission` ADD CONSTRAINT `MemberPermission_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modulo` ADD CONSTRAINT `modulo_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas` ADD CONSTRAINT `empresas_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Licitacao` ADD CONSTRAINT `Licitacao_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo` ADD CONSTRAINT `aditivo_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo` ADD CONSTRAINT `aditivo_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empenho` ADD CONSTRAINT `empenho_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empenho` ADD CONSTRAINT `empenho_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalContrato` ADD CONSTRAINT `FiscalContrato_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalContrato` ADD CONSTRAINT `FiscalContrato_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalContratoLink` ADD CONSTRAINT `FiscalContratoLink_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalContratoLink` ADD CONSTRAINT `FiscalContratoLink_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato_fiscal` ADD CONSTRAINT `contrato_fiscal_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato_fiscal` ADD CONSTRAINT `contrato_fiscal_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato_setorial` ADD CONSTRAINT `contrato_setorial_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato_setorial` ADD CONSTRAINT `contrato_setorial_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BensEServicosReport` ADD CONSTRAINT `BensEServicosReport_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BensEServicosReport` ADD CONSTRAINT `BensEServicosReport_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BensEServicosReport` ADD CONSTRAINT `BensEServicosReport_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BensEServicosReport` ADD CONSTRAINT `BensEServicosReport_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransporteReport` ADD CONSTRAINT `TransporteReport_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransporteReport` ADD CONSTRAINT `TransporteReport_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransporteReport` ADD CONSTRAINT `TransporteReport_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransporteReport` ADD CONSTRAINT `TransporteReport_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasReport` ADD CONSTRAINT `ObrasReport_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasReport` ADD CONSTRAINT `ObrasReport_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasReport` ADD CONSTRAINT `ObrasReport_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasReport` ADD CONSTRAINT `ObrasReport_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalPrincipalReport` ADD CONSTRAINT `FiscalPrincipalReport_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalPrincipalReport` ADD CONSTRAINT `FiscalPrincipalReport_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalPrincipalReport` ADD CONSTRAINT `FiscalPrincipalReport_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FiscalPrincipalReport` ADD CONSTRAINT `FiscalPrincipalReport_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerceirizacaoReport` ADD CONSTRAINT `TerceirizacaoReport_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerceirizacaoReport` ADD CONSTRAINT `TerceirizacaoReport_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerceirizacaoReport` ADD CONSTRAINT `TerceirizacaoReport_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerceirizacaoReport` ADD CONSTRAINT `TerceirizacaoReport_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TabelaAtraso` ADD CONSTRAINT `TabelaAtraso_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TableServicos` ADD CONSTRAINT `TableServicos_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TableMediacao` ADD CONSTRAINT `TableMediacao_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TableObrigacoes` ADD CONSTRAINT `TableObrigacoes_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TableAditivos` ADD CONSTRAINT `TableAditivos_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacoes` ADD CONSTRAINT `Notificacoes_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacoes` ADD CONSTRAINT `Notificacoes_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacoes` ADD CONSTRAINT `Notificacoes_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntrega` ADD CONSTRAINT `NotificacaoEntrega_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntrega` ADD CONSTRAINT `NotificacaoEntrega_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntrega` ADD CONSTRAINT `NotificacaoEntrega_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntregaIncompleta` ADD CONSTRAINT `NotificacaoEntregaIncompleta_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntregaIncompleta` ADD CONSTRAINT `NotificacaoEntregaIncompleta_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoEntregaIncompleta` ADD CONSTRAINT `NotificacaoEntregaIncompleta_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoFiscalTrabalhista` ADD CONSTRAINT `NotificacaoFiscalTrabalhista_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoFiscalTrabalhista` ADD CONSTRAINT `NotificacaoFiscalTrabalhista_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoFiscalTrabalhista` ADD CONSTRAINT `NotificacaoFiscalTrabalhista_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoDesconformidade` ADD CONSTRAINT `NotificacaoDesconformidade_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoDesconformidade` ADD CONSTRAINT `NotificacaoDesconformidade_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoDesconformidade` ADD CONSTRAINT `NotificacaoDesconformidade_fiscalContratoId_fkey` FOREIGN KEY (`fiscalContratoId`) REFERENCES `FiscalContrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoHistorico` ADD CONSTRAINT `NotificacaoHistorico_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoHistorico` ADD CONSTRAINT `NotificacaoHistorico_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotacao` ADD CONSTRAINT `lotacao_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tipo_relatorio` ADD CONSTRAINT `tipo_relatorio_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_sync_log` ADD CONSTRAINT `api_sync_log_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_update` ADD CONSTRAINT `system_update_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_config` ADD CONSTRAINT `form_config_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
