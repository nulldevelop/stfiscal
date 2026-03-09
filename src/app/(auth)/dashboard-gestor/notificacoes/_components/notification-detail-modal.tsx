/** biome-ignore-all lint/correctness/useExhaustiveDependencies:dev */
'use client'

import {
	Calendar,
	Download,
	ExternalLink,
	FileText,
	MessageSquare,
	Plus,
	User,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatData } from '@/utils/formatData'
import { getHistoricoByNotificacao } from '../_actions/historico-actions'
import type { NotificationWithHistorico } from '../_data-access/get-notifications-by-empresa'
import { AddHistoricoForm } from './add-historico-form'
import { HistoricoTimeline } from './historico-timeline'

interface NotificationDetailModalProps {
	notification: NotificationWithHistorico | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

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

export function NotificationDetailModal({
	notification,
	open,
	onOpenChange,
}: NotificationDetailModalProps) {
	const [historicos, setHistoricos] = useState<HistoricoItem[]>([])
	const [loading, setLoading] = useState(false)
	const [showAddForm, setShowAddForm] = useState(false)

	useEffect(() => {
		if (notification && open) {
			loadHistoricos()
		}
	}, [notification, open])

	async function loadHistoricos() {
		if (!notification) return

		setLoading(true)
		try {
			const res = await getHistoricoByNotificacao(
				notification.id,
				notification.tipoNotificacao,
			)
			if (res.success) {
				setHistoricos(res.data as HistoricoItem[])
			}
		} catch (error) {
			console.error('Erro ao carregar histórico:', error)
		} finally {
			setLoading(false)
		}
	}

	function handleHistoricoAdded() {
		loadHistoricos()
		setShowAddForm(false)
	}

	if (!notification) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<FileText className="h-5 w-5 text-primary" />
						{notification.title}
					</DialogTitle>
					<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mt-1">
						<span className="flex items-center gap-1.5">
							<Calendar className="h-4 w-4" />
							{formatData(notification.createdAt)}
						</span>
						<span className="flex items-center gap-1.5">
							<User className="h-4 w-4" />
							{notification.fiscalNome ?? 'Desconhecido'}
						</span>
						<Badge variant="secondary" className="font-medium">
							Contrato: {notification.contratoNumero}
						</Badge>
					</div>
				</DialogHeader>

				<Tabs
					defaultValue="historico"
					className="flex-1 flex flex-col mt-4 overflow-hidden"
				>
					<div className="px-6">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="historico" className="gap-2">
								<MessageSquare className="h-4 w-4" />
								Histórico ({historicos.length})
							</TabsTrigger>
							<TabsTrigger value="detalhes" className="gap-2">
								<FileText className="h-4 w-4" />
								Detalhes
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent
						value="historico"
						className="flex-1 flex flex-col mt-0 overflow-hidden outline-none"
					>
						<div className="px-6 py-4 border-b /30 flex items-center justify-between shrink-0">
							<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
								Acompanhamento do Processo
							</h3>
							<Button
								size="sm"
								onClick={() => setShowAddForm(!showAddForm)}
								variant={showAddForm ? 'outline' : 'default'}
								className="h-8"
							>
								{showAddForm ? (
									<>
										<X className="mr-1.5 h-3.5 w-3.5" />
										Cancelar
									</>
								) : (
									<>
										<Plus className="mr-1.5 h-3.5 w-3.5" />
										Novo Registro
									</>
								)}
							</Button>
						</div>

						<ScrollArea className="flex-1 px-6 py-4">
							<div className="space-y-6">
								{showAddForm && (
									<div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-200">
										<AddHistoricoForm
											notificacaoId={notification.id}
											tipoNotificacao={notification.tipoNotificacao}
											onSuccess={handleHistoricoAdded}
											onCancel={() => setShowAddForm(false)}
										/>
										<Separator className="mt-8" />
									</div>
								)}

								{loading ? (
									<div className="flex flex-col items-center justify-center py-20 gap-3">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										<p className="text-muted-foreground text-sm">
											Carregando histórico...
										</p>
									</div>
								) : historicos.length > 0 ? (
									<div className="pb-10">
										<HistoricoTimeline
											historicos={historicos}
											onDelete={loadHistoricos}
										/>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-20 text-center">
										<div className="rounded-full  p-4 mb-4">
											<MessageSquare className="h-8 w-8 text-muted-foreground/50" />
										</div>
										<p className="font-semibold text-base">
											Nenhum registro encontrado
										</p>
										<p className="text-muted-foreground text-sm max-w-[280px] mx-auto mt-1">
											Ainda não há interações registradas para esta notificação.
										</p>
									</div>
								)}
							</div>
						</ScrollArea>
					</TabsContent>

					<TabsContent
						value="detalhes"
						className="flex-1 flex flex-col mt-0 overflow-hidden outline-none"
					>
						<ScrollArea className="flex-1 p-6">
							<div className="space-y-8 max-w-2xl mx-auto">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
									<DetailItem
										label="Tipo de Notificação"
										value={notification.tipo}
									/>
									<DetailItem
										label="Data de Envio"
										value={formatData(notification.dataEnvio)}
									/>
									<DetailItem
										label="Número do Contrato"
										value={notification.contratoNumero}
									/>
									<DetailItem
										label="Fiscal Responsável"
										value={notification.fiscalNome ?? 'Não informado'}
									/>
									<div className="md:col-span-2">
										<DetailItem
											label="Assinatura Digital (Hash)"
											value={notification.assinaturaDigital}
											isMono
										/>
									</div>
								</div>

								{notification.filePath && (
									<div className="pt-6 border-t flex flex-col sm:flex-row gap-4">
										<Button asChild className="gap-2">
											<a href={notification.filePath} download>
												<Download className="h-4 w-4" />
												Baixar PDF Original
											</a>
										</Button>
										<Button variant="outline" asChild className="gap-2">
											<a
												href={notification.filePath}
												target="_blank"
												rel="noreferrer"
											>
												<ExternalLink className="h-4 w-4" />
												Visualizar em Nova Aba
											</a>
										</Button>
									</div>
								)}
							</div>
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}

function DetailItem({
	label,
	value,
	isMono,
}: {
	label: string
	value: string | number
	isMono?: boolean
}) {
	return (
		<div className="space-y-1.5">
			<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
				{label}
			</p>
			<p
				className={cn(
					'text-sm font-medium',
					isMono && 'font-mono  p-2 rounded-md break-all',
				)}
			>
				{value}
			</p>
		</div>
	)
}
