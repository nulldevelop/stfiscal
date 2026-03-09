import { getSession } from '@/lib/auth-actions'
import { DashboardAlerts } from './_components/dashboard-alerts'
import { Metrics } from './_components/metrics'
import { RecentContracts } from './_components/recent-contracts'

export default async function DashboardPage() {
	const session = await getSession()
	const userName = session?.user.name || 'Gestor'

	return (
		<div className="flex flex-col gap-8 px-4">
			<div className="flex flex-col gap-2 px-4 py-2">
				<h1 className="text-3xl font-bold text-foreground">
					Bem-vindo, {userName}
				</h1>
				<p className="text-muted-foreground">
					Aqui está o resumo atualizado da sua organização e atividades recentes
					do sistema.
				</p>
			</div>

			<Metrics />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 flex flex-col">
					<RecentContracts />
				</div>
				<div className="lg:col-span-1 flex flex-col">
					<DashboardAlerts />
				</div>
			</div>
		</div>
	)
}
