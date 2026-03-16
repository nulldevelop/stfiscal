import { Clock } from 'lucide-react'
import { getOverdueConfigs } from './_actions/overdue-config-actions'
import { OverdueConfigTable } from './_components/overdue-config-table'

export default async function OverdueConfigPage() {
	const result = await getOverdueConfigs()

	const configs = result.success ? result.data || [] : []

	return (
		<div className="flex flex-col gap-8 px-4 py-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
					<Clock className="h-5 w-5 text-muted-foreground" />
				</div>
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Configuracao de Vencimentos
					</h1>
					<p className="text-sm text-muted-foreground">
						Defina os prazos de vencimento (overdue) e alertas para cada tipo de
						relatorio.
					</p>
				</div>
			</div>

			{/* Info Card */}
			<div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
				<h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
					Como funciona?
				</h3>
				<ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
					<li>
						<strong>Dias Overdue:</strong> Apos esse periodo desde o fim do
						periodo analisado, o relatorio e considerado atrasado.
					</li>
					<li>
						<strong>Dias Alerta:</strong> Quantos dias antes do vencimento o
						sistema enviara alertas aos fiscais.
					</li>
					<li>
						<strong>Exemplo:</strong> Bens e Servicos com 30 dias overdue
						significa que apos 30 dias do fim do periodo analisado, o relatorio
						sera marcado como atrasado.
					</li>
				</ul>
			</div>

			{/* Table */}
			<OverdueConfigTable configs={configs} />
		</div>
	)
}
