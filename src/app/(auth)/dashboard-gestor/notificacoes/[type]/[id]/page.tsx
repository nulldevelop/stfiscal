'use client'

import {
	ArrowLeft,
	Download,
	ExternalLink,
	FileText,
	History,
	MessageSquare,
	Plus,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { TipoNotificacaoRef } from '@/generated/prisma/client'
import { formatData } from '@/utils/formatData'
import { getHistoricoByNotificacao } from '../../_actions/historico-actions'
import { AddHistoricoForm } from '../../_components/add-historico-form'
import { HistoricoTimeline } from '../../_components/historico-timeline'
import {
	getNotificationById,
	type NotificationDetail,
} from '../../_data-access/get-notification-by-id'

interface HistoricoItem {
	id: string
	tipo: string
	titulo: string
	descricao: string | null
	anexoPath: string | null
	anexoNome: string | null
	createdAt: Date
	user: { name: string | null }
}

export default function NotificationHistoryPage() {
	const params = useParams()
	const router = useRouter()
	const id = params.id as string
	const type = params.type as TipoNotificacaoRef

	const [notification, setNotification] = useState<NotificationDetail | null>(
		null,
	)
	const [historicos, setHistoricos] = useState<HistoricoItem[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddForm, setShowAddForm] = useState(false)

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			try {
				const [notifData, histData] = await Promise.all([
					getNotificationById(id, type),
					getHistoricoByNotificacao(id, type),
				])

				if (!notifData) {
					router.push('/dashboard-gestor/notificacoes')
					return
				}

				setNotification(notifData)
				if (histData.success) {
					setHistoricos(histData.data as HistoricoItem[])
				}
			} catch (error) {
				console.error('Erro ao carregar dados da notificação:', error)
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [id, type, router])

	async function refreshHistorico() {
		try {
			const res = await getHistoricoByNotificacao(id, type)
			if (res.success) {
				setHistoricos(res.data as HistoricoItem[])
			}
		} catch (error) {
			console.error('Erro ao recarregar histórico:', error)
		}
	}

	function handleHistoricoAdded() {
		refreshHistorico()
		setShowAddForm(false)
	}

	if (loading) return <HistorySkeleton />

	if (!notification) return null

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard-gestor/notificacoes">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Histórico da Notificação
					</h1>
					<p className="text-muted-foreground">
						Acompanhe todas as interações e documentos deste processo
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Coluna de Informações da Notificação */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<FileText className="h-5 w-5 text-primary" />
								Dados Principais
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<DetailItem label="Empresa" value={notification.empresaNome} />
							<DetailItem label="Tipo" value={notification.tipo} />
							<DetailItem
								label="Data de Envio"
								value={formatData(notification.dataEnvio)}
							/>
							<DetailItem
								label="Fiscal Responsável"
								value={notification.fiscalNome ?? 'Não informado'}
							/>
							<DetailItem
								label="Contrato"
								value={notification.contratoNumero}
							/>

							<div className="pt-4 border-t space-y-3">
								<Button className="w-full justify-start gap-2" asChild>
									<a href={notification.filePath} download>
										<Download className="h-4 w-4" />
										Baixar Notificação (PDF)
									</a>
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start gap-2"
									asChild
								>
									<a
										href={notification.filePath}
										target="_blank"
										rel="noreferrer"
									>
										<ExternalLink className="h-4 w-4" />
										Visualizar Original
									</a>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<History className="h-5 w-5 text-primary" />
								Resumo
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Total de Interações
								</span>
								<span className="font-bold">{historicos.length}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Última Atualização
								</span>
								<span className="font-medium">
									{historicos.length > 0
										? formatData(historicos[0].createdAt)
										: formatData(notification.createdAt)}
								</span>
							</div>
							<Badge variant="outline" className="w-full justify-center py-1">
								{notification.tipoNotificacao.replace(/_/g, ' ')}
							</Badge>
						</CardContent>
					</Card>
				</div>

				{/* Coluna da Timeline */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="h-full flex flex-col min-h-150">
						<CardHeader className="flex flex-row items-center justify-between border-b pb-4">
							<div className="space-y-1">
								<CardTitle className="text-lg flex items-center gap-2">
									<MessageSquare className="h-5 w-5 text-primary" />
									Linha do Tempo
								</CardTitle>
							</div>
							<Button
								size="sm"
								onClick={() => setShowAddForm(!showAddForm)}
								variant={showAddForm ? 'outline' : 'default'}
								className="gap-2"
							>
								{showAddForm ? (
									<>
										<X className="h-4 w-4" />
										Cancelar
									</>
								) : (
									<>
										<Plus className="h-4 w-4" />
										Novo Registro
									</>
								)}
							</Button>
						</CardHeader>
						<CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
							{showAddForm && (
								<div className="p-6 /30 border-b animate-in fade-in slide-in-from-top-2 duration-200">
									<AddHistoricoForm
										notificacaoId={id}
										tipoNotificacao={type}
										onSuccess={handleHistoricoAdded}
										onCancel={() => setShowAddForm(false)}
									/>
								</div>
							)}

							<ScrollArea className="flex-1 p-6">
								{historicos.length > 0 ? (
									<HistoricoTimeline
										historicos={historicos}
										onDelete={refreshHistorico}
									/>
								) : (
									<div className="flex flex-col items-center justify-center py-20 text-center">
										<div className="rounded-full  p-4 mb-4">
											<MessageSquare className="h-8 w-8 text-muted-foreground/50" />
										</div>
										<p className="font-semibold text-lg">
											Nenhum registro encontrado
										</p>
										<p className="text-muted-foreground text-sm max-w-75 mx-auto mt-2">
											Ainda não há interações ou documentos registrados para
											esta notificação. Comece clicando em "Novo Registro".
										</p>
									</div>
								)}
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

function DetailItem({
	label,
	value,
}: {
	label: string
	value: string | number
}) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</p>
			<p className="text-sm font-medium">{value}</p>
		</div>
	)
}

function HistorySkeleton() {
	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="space-y-6">
					<Skeleton className="h-100 w-full" />
					<Skeleton className="h-50 w-full" />
				</div>
				<div className="lg:col-span-2">
					<Skeleton className="h-150 w-full" />
				</div>
			</div>
		</div>
	)
}
