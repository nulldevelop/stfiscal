import { FileText, FileWarning, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllDraftsByFiscal } from '../relatorios/_data-access/get-drafts'

interface DraftGroup {
	type: string
	reports: {
		id: string
		protocolo: string
		createdAt: Date
		updatedAt: Date
		periodoAnalisadoInicio: Date
		periodoAnalisadoFim: Date
		contrato: {
			displayContrato: string
			contratado: string
		}
	}[]
}

export default async function RascunhosPage() {
	const draftsData = await getAllDraftsByFiscal()

	const groups = Object.values(draftsData).filter(
		(group): group is DraftGroup => group.reports.length > 0,
	)

	const totalDrafts = groups.reduce(
		(acc, group) => acc + group.reports.length,
		0,
	)

	return (
		<div className="">
			<div className="mb-6">
				<h1 className="font-bold text-2xl text-foreground">Rascunhos</h1>
				<p className="text-muted-foreground">
					Visualize e gerencie seus relatórios em rascunho
				</p>
			</div>

			{groups.length > 0 ? (
				<div className="space-y-6">
					<div className="mb-4 flex items-center gap-4">
						<div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm">
							<FileWarning className="h-4 w-4 text-amber-500" />
							<span className="font-medium">{totalDrafts}</span>
							<span className="text-muted-foreground">
								{totalDrafts === 1 ? 'rascunho' : 'rascunhos'}
							</span>
						</div>
					</div>

					{groups.map((group) => (
						<Card key={group.type}>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">{group.type}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{group.reports.map((report) => (
										<Link
											key={report.id}
											href={`/dashboard-fiscal/rascunhos/${report.id}`}
											className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
										>
											<div className="flex items-center gap-3">
												<FileText className="h-5 w-5 text-muted-foreground" />
												<div>
													<p className="font-medium text-sm">
														{report.contrato.displayContrato}
													</p>
													<p className="text-xs text-muted-foreground">
														{report.contrato.contratado}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xs font-mono text-amber-600 font-medium">
													{report.protocolo}
												</p>
												<p className="text-xs text-muted-foreground">
													Período:{' '}
													{new Date(
														report.periodoAnalisadoInicio,
													).toLocaleDateString('pt-BR')}{' '}
													-{' '}
													{new Date(
														report.periodoAnalisadoFim,
													).toLocaleDateString('pt-BR')}
												</p>
												<p className="text-xs text-muted-foreground">
													Última alteração:{' '}
													{new Date(
														report.updatedAt || report.createdAt,
													).toLocaleString('pt-BR')}
												</p>
											</div>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-muted-foreground/30 border-dashed p-12 text-center">
					<FileWarning className="mb-4 h-12 w-12 text-muted-foreground/50" />
					<h3 className="font-semibold text-lg text-foreground">
						Nenhum rascunho encontrado
					</h3>
					<p className="text-muted-foreground text-sm">
						Você não tem relatórios em rascunho.
					</p>
					<Button asChild className="mt-4">
						<Link href="/dashboard-fiscal/relatorios">
							<Plus className="mr-2 h-4 w-4" />
							Criar novo relatório
						</Link>
					</Button>
				</div>
			)}
		</div>
	)
}
