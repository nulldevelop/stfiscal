import { FileStack } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuth } from '@/lib/auth-actions'
import { CompleteFiscalDataModal } from './_components/complete-fiscal-data-modal'
import { Metrics } from './_components/metrics'
import { getDashboardDataByFiscal } from './_data-access/contracts/get-contratos'
import { getFiscalInfo } from './_data-access/get-fiscal-info'
import { ContratosTable } from './contrato/_components/contratos-table'

export default async function DashboardFiscalPage() {
	const { user } = await getAuth()
	if (!user) {
		redirect('/')
	}

	const [dashboardData, fiscalInfo] = await Promise.all([
		getDashboardDataByFiscal(),
		getFiscalInfo(),
	])

	const { contratos, totalContratos, totalRelatoriosMes } = dashboardData

	const hasPendingReports = contratos.some((contrato) => {
		const lastReport = contrato.bensEServicosReports[0]
		if (!lastReport) return true
		const daysSinceLastReport = Math.floor(
			(Date.now() - new Date(lastReport.createdAt).getTime()) /
				(1000 * 60 * 60 * 24),
		)
		return daysSinceLastReport > 30
	})

	return (
		<div className="flex flex-col gap-8 pb-10">
			{fiscalInfo?.isIncomplete && (
				<CompleteFiscalDataModal fiscalInfo={fiscalInfo} />
			)}

			<header className="flex flex-col gap-2 px-4 md:px-0">
				<h1 className="text-3xl font-bold tracking-tight">
					Olá, {user.name?.split(' ')[0]}
				</h1>
				<p className="text-muted-foreground">
					Aqui está um resumo dos seus contratos e atividades de fiscalização.
				</p>
			</header>

			<Metrics
				totalContratos={totalContratos}
				totalRelatoriosMes={totalRelatoriosMes}
				hasPendingReports={hasPendingReports}
			/>

			<section className="space-y-4">
				<div className="flex items-center justify-between px-4 md:px-0">
					<div className="flex items-center gap-2">
						<FileStack className="h-5 w-5 text-muted-foreground" />
						<h2 className="text-xl font-bold tracking-tight">Meus Contratos</h2>
					</div>
					<div className="text-[10px] md:text-xs text-muted-foreground px-2 py-1 rounded-md border">
						{contratos.length} contrato(s)
					</div>
				</div>

				{contratos.length > 0 ? (
					<div>
						<ContratosTable contratos={contratos as any} />
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-20 text-center /30">
						<div className="p-4  rounded-full mb-4">
							<FileStack className="h-8 w-8 text-muted-foreground/50" />
						</div>
						<h3 className="font-semibold text-lg">Nenhum contrato ativo</h3>
						<p className="text-muted-foreground text-sm max-w-75 mt-2">
							Você ainda não foi vinculado a nenhum contrato. Entre em contato
							com o administrador caso isso seja um erro.
						</p>
					</div>
				)}
			</section>
		</div>
	)
}
