-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('RASCUNHO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "BensEServicosReport" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "FiscalPrincipalReport" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "ObrasReport" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "TerceirizacaoReport" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "TransporteReport" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO';
