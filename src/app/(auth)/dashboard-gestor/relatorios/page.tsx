'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	Building2,
	Calendar as CalendarIcon,
	Download,
	ExternalLink,
	FileText,
	HardHat,
	PieChart,
	Truck,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportDetailModal } from './_components/report-detail-modal'
import { ReportEmpresaCard } from './_components/report-empresa-card'
import { ReportFilters } from './_components/report-filters'
import {
	getReportsData,
	type ReportsResponse,
	type ReportWithDetails,
} from './_data-access/get-reports-by-empresa'

function RelatoriosPageContent() {
	const searchParams = useSearchParams()
	const [data, setData] = useState<ReportsResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedReport, setSelectedReport] =
		useState<ReportWithDetails | null>(null)
	const [modalOpen, setModalOpen] = useState(false)

	const search = searchParams.get('search') || undefined
	const startDate = searchParams.get('startDate') || undefined
	const endDate = searchParams.get('endDate') || undefined

	useEffect(() => {
		async function loadReports() {
			setLoading(true)
			try {
				const result = await getReportsData({
					search,
					startDate,
					endDate,
				})
				setData(result)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		loadReports()
	}, [search, startDate, endDate])

	function handleSelectReport(report: ReportWithDetails) {
		setSelectedReport(report)
		setModalOpen(true)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-foreground">
						Acompanhamento de Relatórios
					</h1>
					<p className="text-muted-foreground text-sm">
						Gerencie e acompanhe o histórico de fiscalização por empresa ou data
					</p>
				</div>
			</div>

			{/* Estatísticas Rápidas */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-l-4 border-l-primary">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-primary/10 p-2 text-primary">
							<PieChart className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Total Geral
							</p>
							<p className="text-2xl font-bold">{data?.stats.total || 0}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-blue-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
							<FileText className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Bens e Serviços
							</p>
							<p className="text-2xl font-bold">
								{data?.stats.bensEServicos || 0}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-green-500/10 p-2 text-green-500">
							<Truck className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Transporte
							</p>
							<p className="text-2xl font-bold">
								{data?.stats.transporte || 0}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
							<HardHat className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Obras</p>
							<p className="text-2xl font-bold">{data?.stats.obras || 0}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<ReportFilters />

			<Tabs defaultValue="empresas" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="empresas" className="gap-2">
						<Building2 className="h-4 w-4" />
						Agrupado por Empresa
					</TabsTrigger>
					<TabsTrigger value="recentes" className="gap-2">
						<CalendarIcon className="h-4 w-4" />
						Relatórios Recentes
					</TabsTrigger>
				</TabsList>

				<TabsContent value="empresas">
					{loading ? (
						<div className="py-10 flex flex-col items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="mt-4 text-muted-foreground">
								Carregando relatórios...
							</p>
						</div>
					) : data?.groupedByEmpresa && data.groupedByEmpresa.length > 0 ? (
						<div className="space-y-4">
							{data.groupedByEmpresa.map((empresa) => (
								<ReportEmpresaCard
									key={empresa.empresaId}
									empresa={empresa}
									onSelectReport={handleSelectReport}
								/>
							))}
						</div>
					) : (
						<EmptyState />
					)}
				</TabsContent>

				<TabsContent value="recentes">
					{loading ? (
						<div className="py-10 flex flex-col items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="mt-4 text-muted-foreground">
								Carregando relatórios...
							</p>
						</div>
					) : data?.allReports && data.allReports.length > 0 ? (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Todos os Relatórios</CardTitle>
								<CardDescription>
									Exibindo relatórios por ordem cronológica decrescente
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.allReports.map((report) => (
										<div
											key={report.id}
											className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<Badge
														className={
															report.type === 'Bens e Serviços'
																? 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
																: report.type === 'Transporte'
																	? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
																	: 'bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
														}
													>
														{report.type}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{format(
															new Date(report.createdAt),
															"dd/MM/yyyy 'às' HH:mm",
															{
																locale: ptBR,
															},
														)}
													</span>
												</div>
												<h4 className="font-semibold text-base">
													{report.empresaNome}
												</h4>
												<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<FileText className="h-3 w-3" />
														Contrato: {report.contratoNumero}
													</span>
													<span>Protocolo: {report.protocolo}</span>
													<span>Fiscal: {report.fiscalNome}</span>
												</div>
											</div>
											<div className="flex items-center gap-2 self-start md:self-center">
												<Button
													variant="outline"
													size="sm"
													className="gap-2"
													onClick={() => handleSelectReport(report)}
												>
													<ExternalLink className="h-3.5 w-3.5" />
													Detalhes
												</Button>
												<Button size="sm" className="gap-2" asChild>
													<a href={report.filePath} download>
														<Download className="h-3.5 w-3.5" />
														PDF
													</a>
												</Button>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					) : (
						<EmptyState />
					)}
				</TabsContent>
			</Tabs>

			<ReportDetailModal
				report={selectedReport}
				open={modalOpen}
				onOpenChange={setModalOpen}
			/>
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
			<Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
			<h3 className="font-semibold text-lg text-foreground">
				Nenhum relatório encontrado
			</h3>
			<p className="text-muted-foreground text-sm">
				Tente ajustar os filtros ou o período selecionado.
			</p>
		</div>
	)
}

export default function RelatoriosPage() {
	return (
		<Suspense fallback={<div className="p-10">Carregando...</div>}>
			<RelatoriosPageContent />
		</Suspense>
	)
}
