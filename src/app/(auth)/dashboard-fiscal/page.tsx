import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	FileStack,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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

	const {
		contratos,
		totalContratos,
		totalRelatoriosMes,
		relatoriosFeitos,
		relatoriosPendentes,
	} = dashboardData

	const hasPendingReports = relatoriosPendentes > 0

	const contratosPendentes = contratos.filter((contrato) => {
		const lastReport = contrato.bensEServicosReports[0]
		if (!lastReport) return true
		const daysSinceLastReport = Math.floor(
			(Date.now() - new Date(lastReport.createdAt).getTime()) /
				(1000 * 60 * 60 * 24),
		)
		return daysSinceLastReport > 30
	})

	const contratosEmDia = contratos.filter((contrato) => {
		const lastReport = contrato.bensEServicosReports[0]
		if (!lastReport) return false
		const daysSinceLastReport = Math.floor(
			(Date.now() - new Date(lastReport.createdAt).getTime()) /
				(1000 * 60 * 60 * 24),
		)
		return daysSinceLastReport <= 30
	})

	return (
		<div className="flex flex-col gap-8 pb-10">
			{fiscalInfo?.isIncomplete && (
				<CompleteFiscalDataModal fiscalInfo={fiscalInfo} />
			)}

			<header className="flex flex-col gap-2 px-4 md:px-0">
				<div className="flex items-center gap-3 flex-wrap">
					<h1 className="text-3xl font-bold tracking-tight">
						Olá, {user.name?.split(' ')[0]}
					</h1>
					{hasPendingReports && (
						<Badge variant="destructive" className="text-xs gap-1.5 py-1 px-3">
							<AlertCircle className="h-3.5 w-3.5" />
							Irregular - Relatórios pendentes
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground">
					Aqui está um resumo dos seus contratos e atividades de fiscalização.
				</p>
			</header>

			<Metrics
				totalContratos={totalContratos}
				totalRelatoriosMes={totalRelatoriosMes}
				relatoriosFeitos={relatoriosFeitos}
				relatoriosPendentes={relatoriosPendentes}
			/>

			<section className="space-y-4">
				{contratos.length > 0 ? (
					<div className="space-y-6">
						{contratosPendentes.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center gap-2 px-4 md:px-0">
									<AlertTriangle className="h-5 w-5 text-orange-600" />
									<h2 className="text-xl font-bold tracking-tight text-orange-600">
										Contratos Pendentes
									</h2>
									<Badge variant="destructive" className="ml-2">
										{contratosPendentes.length}
									</Badge>
								</div>
								<ContratosTable contratos={contratosPendentes as any} />
							</div>
						)}

						{contratosPendentes.length > 0 && contratosEmDia.length > 0 && (
							<Separator className="my-6" />
						)}

						{contratosEmDia.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center gap-2 px-4 md:px-0">
									<CheckCircle className="h-5 w-5 text-emerald-600" />
									<h2 className="text-xl font-bold tracking-tight text-emerald-600">
										Contratos em Dia
									</h2>
									<Badge variant="secondary" className="ml-2">
										{contratosEmDia.length}
									</Badge>
								</div>
								<ContratosTable contratos={contratosEmDia as any} />
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-20 text-center">
						<div className="p-4 rounded-full mb-4">
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
