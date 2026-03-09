'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AlertTriangle,
	Building2,
	Calendar as CalendarIcon,
	Download,
	ExternalLink,
	FileText,
	History,
	Mail,
} from 'lucide-react'
import Link from 'next/link'
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
import { EmpresaCard } from './_components/empresa-card'
import { NotificationFilters } from './_components/notification-filters'
import {
	getNotificationsData,
	type NotificationsResponse
} from './_data-access/get-notifications-by-empresa'

function NotificacoesPageContent() {
	const searchParams = useSearchParams()
	const [data, setData] = useState<NotificationsResponse | null>(null)
	const [loading, setLoading] = useState(true)

	const search = searchParams.get('search') || undefined
	const startDate = searchParams.get('startDate') || undefined
	const endDate = searchParams.get('endDate') || undefined

	useEffect(() => {
		async function loadNotifications() {
			setLoading(true)
			try {
				const result = await getNotificationsData({
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
		loadNotifications()
	}, [search, startDate, endDate])

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-foreground">
						Acompanhamento de Notificações
					</h1>
					<p className="text-muted-foreground text-sm">
						Gerencie e acompanhe o histórico de comunicações enviadas aos
						fornecedores
					</p>
				</div>
			</div>

			{/* Estatísticas Rápidas */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card className="border-l-4 border-l-primary">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-primary/10 p-2 text-primary">
							<Mail className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Total</p>
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
							<p className="text-sm font-medium text-muted-foreground">Geral</p>
							<p className="text-2xl font-bold">{data?.stats.geral || 0}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-green-500/10 p-2 text-green-500">
							<FileText className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Entrega
							</p>
							<p className="text-2xl font-bold">{data?.stats.entrega || 0}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-orange-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
							<AlertTriangle className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Fiscal
							</p>
							<p className="text-2xl font-bold">
								{data?.stats.fiscalTrabalhista || 0}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-red-500">
					<CardContent className="p-4 flex items-center gap-4">
						<div className="rounded-full bg-red-500/10 p-2 text-red-500">
							<AlertTriangle className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Desconf.
							</p>
							<p className="text-2xl font-bold">
								{data?.stats.desconformidade || 0}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<NotificationFilters />

			<Tabs defaultValue="empresas" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="empresas" className="gap-2">
						<Building2 className="h-4 w-4" />
						Agrupado por Empresa
					</TabsTrigger>
					<TabsTrigger value="recentes" className="gap-2">
						<CalendarIcon className="h-4 w-4" />
						Notificações Recentes
					</TabsTrigger>
				</TabsList>

				<TabsContent value="empresas">
					{loading ? (
						<div className="py-10 flex flex-col items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="mt-4 text-muted-foreground">
								Carregando notificações...
							</p>
						</div>
					) : data?.groupedByEmpresa && data.groupedByEmpresa.length > 0 ? (
						<div className="space-y-4">
							{data.groupedByEmpresa.map((empresa) => (
								<EmpresaCard key={empresa.empresaId} empresa={empresa} />
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
								Carregando notificações...
							</p>
						</div>
					) : data?.allNotifications && data.allNotifications.length > 0 ? (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Todas as Notificações</CardTitle>
								<CardDescription>
									Exibindo notificações por ordem cronológica decrescente
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.allNotifications.map((notification) => (
										<div
											key={`${notification.id}-${notification.tipoNotificacao}`}
											className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs">
														{notification.tipoNotificacao.replace(/_/g, ' ')}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{format(
															new Date(notification.createdAt),
															"dd/MM/yyyy 'às' HH:mm",
															{
																locale: ptBR,
															},
														)}
													</span>
												</div>
												<h4 className="font-semibold text-base">
													{notification.empresaNome}
												</h4>
												<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<FileText className="h-3 w-3" />
														Contrato: {notification.contratoNumero}
													</span>
													<span className="flex items-center gap-1 text-primary">
														<History className="h-3 w-3" />
														Histórico: {notification.historicoCount}
													</span>
													<span>Fiscal: {notification.fiscalNome}</span>
												</div>
											</div>
											<div className="flex items-center gap-2 self-start md:self-center">
												<Button
													variant="outline"
													size="sm"
													className="gap-2"
													asChild
												>
													<Link
														href={`/dashboard-gestor/notificacoes/${notification.tipoNotificacao}/${notification.id}`}
													>
														<ExternalLink className="h-3.5 w-3.5" />
														Ver Histórico
													</Link>
												</Button>
												<Button size="sm" className="gap-2" asChild>
													<a href={notification.filePath} download>
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
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
			<Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
			<h3 className="font-semibold text-lg text-foreground">
				Nenhuma notificação encontrada
			</h3>
			<p className="text-muted-foreground text-sm">
				Tente ajustar os filtros ou o período selecionado.
			</p>
		</div>
	)
}

export default function NotificacoesPage() {
	return (
		<Suspense fallback={<div className="p-10">Carregando...</div>}>
			<NotificacoesPageContent />
		</Suspense>
	)
}
