-- CreateTable
CREATE TABLE "report_overdue_config" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "diasOverdue" INTEGER NOT NULL DEFAULT 30,
    "diasAlerta" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "report_overdue_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_overdue_config_organizationId_idx" ON "report_overdue_config"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "report_overdue_config_reportType_organizationId_key" ON "report_overdue_config"("reportType", "organizationId");

-- AddForeignKey
ALTER TABLE "report_overdue_config" ADD CONSTRAINT "report_overdue_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
