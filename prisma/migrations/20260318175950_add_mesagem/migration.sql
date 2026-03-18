-- CreateEnum
CREATE TYPE "StatusMensagem" AS ENUM ('ATIVA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "TipoMensagem" AS ENUM ('AVISO', 'LEMBRETE', 'COMUNICADO', 'URGENTE');

-- CreateTable
CREATE TABLE "mensagem_interna" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "contratoId" TEXT,
    "assunto" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "TipoMensagem" NOT NULL DEFAULT 'COMUNICADO',
    "status" "StatusMensagem" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensagem_interna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinatario_mensagem" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "fiscalContratoId" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinatario_mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resposta_mensagem" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "fiscalContratoId" TEXT,
    "autorGestorId" TEXT,
    "conteudo" TEXT NOT NULL,
    "lidaPeloRemetente" BOOLEAN NOT NULL DEFAULT false,
    "lidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resposta_mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensagem_interna_organizationId_idx" ON "mensagem_interna"("organizationId");

-- CreateIndex
CREATE INDEX "mensagem_interna_remetenteId_idx" ON "mensagem_interna"("remetenteId");

-- CreateIndex
CREATE INDEX "mensagem_interna_contratoId_idx" ON "mensagem_interna"("contratoId");

-- CreateIndex
CREATE INDEX "mensagem_interna_createdAt_idx" ON "mensagem_interna"("createdAt");

-- CreateIndex
CREATE INDEX "destinatario_mensagem_fiscalContratoId_idx" ON "destinatario_mensagem"("fiscalContratoId");

-- CreateIndex
CREATE INDEX "destinatario_mensagem_lida_idx" ON "destinatario_mensagem"("lida");

-- CreateIndex
CREATE UNIQUE INDEX "destinatario_mensagem_mensagemId_fiscalContratoId_key" ON "destinatario_mensagem"("mensagemId", "fiscalContratoId");

-- CreateIndex
CREATE INDEX "resposta_mensagem_mensagemId_idx" ON "resposta_mensagem"("mensagemId");

-- CreateIndex
CREATE INDEX "resposta_mensagem_fiscalContratoId_idx" ON "resposta_mensagem"("fiscalContratoId");

-- CreateIndex
CREATE INDEX "resposta_mensagem_autorGestorId_idx" ON "resposta_mensagem"("autorGestorId");

-- CreateIndex
CREATE INDEX "resposta_mensagem_createdAt_idx" ON "resposta_mensagem"("createdAt");

-- AddForeignKey
ALTER TABLE "mensagem_interna" ADD CONSTRAINT "mensagem_interna_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_interna" ADD CONSTRAINT "mensagem_interna_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_interna" ADD CONSTRAINT "mensagem_interna_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinatario_mensagem" ADD CONSTRAINT "destinatario_mensagem_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "mensagem_interna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinatario_mensagem" ADD CONSTRAINT "destinatario_mensagem_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resposta_mensagem" ADD CONSTRAINT "resposta_mensagem_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "mensagem_interna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resposta_mensagem" ADD CONSTRAINT "resposta_mensagem_fiscalContratoId_fkey" FOREIGN KEY ("fiscalContratoId") REFERENCES "FiscalContrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resposta_mensagem" ADD CONSTRAINT "resposta_mensagem_autorGestorId_fkey" FOREIGN KEY ("autorGestorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
