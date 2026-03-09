'use client'

import {
	ArrowLeft,
	Building2,
	Calendar,
	Clock,
	Download,
	FileText,
	MessageSquare,
	Plus,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { TipoNotificacaoRef } from '@/generated/prisma/client'
import { formatData } from '@/utils/formatData'
import { exportNotificacaoCompleta } from '../_actions/export-notificacao-completa'
import { getHistoricoByNotificacao } from '../_actions/historico-actions'
import { AddHistoricoForm } from '../_components/add-historico-form'
import {
	type HistoricoItem,
	HistoricoTimeline,
} from '../_components/historico-timeline'
import {
	getNotificationById,
	type NotificationWithHistorico,
} from '../_data-access/get-notifications-by-empresa'

export default function NotificationDetailsPage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const id = params.id as string
	const tipoNotificacao = searchParams.get('type') as TipoNotificacaoRef

	const [notification, setNotification] =
		useState<NotificationWithHistorico | null>(null)
	const [historicos, setHistoricos] = useState<HistoricoItem[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddForm, setShowAddForm] = useState(false)
	const [isExporting, startExport] = useTransition()

	const loadData = useCallback(async () => {
		setLoading(true)
		try {
			const [notifData, histData] = await Promise.all([
				getNotificationById(id, tipoNotificacao),
				getHistoricoByNotificacao(id, tipoNotificacao),
			])
			setNotification(notifData)
			if (histData.success) {
				setHistoricos(histData.data as HistoricoItem[])
			}
		} catch (error) {
			console.error('Erro ao carregar dados:', error)
		} finally {
			setLoading(false)
		}
	}, [id, tipoNotificacao])

	useEffect(() => {
		if (id && tipoNotificacao) {
			loadData()
		}
	}, [id, tipoNotificacao, loadData])

	function handleHistoricoAdded() {
		loadData()
		setShowAddForm(false)
	}

	const handleExportPDF = () => {
		if (!notification || !tipoNotificacao) return

		startExport(async () => {
			const result = await exportNotificacaoCompleta(id, tipoNotificacao)

			if (result.success && result.filePath) {
				toast.success('PDF completo gerado com sucesso!')
				const link = document.createElement('a')
				link.href = result.filePath
				link.download = result.filename || 'notificacao_completa.pdf'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			} else {
				toast.error(result.error || 'Erro ao gerar PDF completo')
			}
		})
	}

	if (loading) {
		return (
			<div className="flex h-100 flex-col items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				<p className="mt-4 text-muted-foreground">Carregando detalhes...</p>
			</div>
		)
	}

	if (!notification) {
		return (
			<div className="flex h-100 flex-col items-center justify-center text-center">
				<FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
				<h2 className="font-semibold text-xl">Notificação não encontrada</h2>
				<p className="mb-4 text-muted-foreground">
					O registro solicitado não foi encontrado ou você não tem permissão
					para acessá-lo.
				</p>
				<Button asChild>
					<Link href="/dashboard-fiscal/historico-notificacoes">
						Voltar para o histórico
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="-ml-2 h-8 px-2"
						>
							<Link href="/dashboard-fiscal/historico-notificacoes">
								<ArrowLeft className="mr-1 h-4 w-4" />
								Voltar
							</Link>
						</Button>
					</div>
					<h1 className="font-bold text-2xl tracking-tight">
						{notification.title}
					</h1>
					<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
						<span className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							{formatData(notification.createdAt)}
						</span>
						<span className="flex items-center gap-1">
							<Badge variant="outline" className="font-normal">
								Contrato {notification.contratoNumero}
							</Badge>
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={handleExportPDF}
						className="gap-2"
						disabled={isExporting}
					>
						{isExporting ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
								Gerando...
							</>
						) : (
							<>
								<Download className="h-4 w-4" />
								Exportar Dados (PDF)
							</>
						)}
					</Button>
				</div>
			</div>

			<Separator />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Coluna Principal: Histórico */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<MessageSquare className="h-5 w-5 text-primary" />
								Acompanhamento e Histórico
							</CardTitle>
							<Button
								size="sm"
								onClick={() => setShowAddForm(!showAddForm)}
								variant={showAddForm ? 'outline' : 'default'}
							>
								<Plus className="mr-1 h-4 w-4" />
								{showAddForm ? 'Cancelar' : 'Novo Registro'}
							</Button>
						</CardHeader>
						<CardContent className="space-y-6">
							{showAddForm && (
								<div className="rounded-lg border bg-muted/30 p-4">
									<AddHistoricoForm
										notificacaoId={notification.id}
										tipoNotificacao={notification.tipoNotificacao}
										onSuccess={handleHistoricoAdded}
										onCancel={() => setShowAddForm(false)}
									/>
								</div>
							)}

							<div className="min-h-75">
								{historicos.length > 0 ? (
									<HistoricoTimeline
										historicos={historicos}
										onDelete={loadData}
									/>
								) : (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<div className="mb-4 rounded-full bg-muted p-3">
											<MessageSquare className="h-6 w-6 text-muted-foreground" />
										</div>
										<h3 className="font-medium text-lg">Nenhum registro</h3>
										<p className="mx-auto max-w-62.5 text-muted-foreground text-sm">
											Ainda não há registros de acompanhamento para esta
											notificação.
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Coluna Lateral: Detalhes/Metadata */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Informações Gerais</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-0.5">
										<p className="text-muted-foreground text-xs uppercase tracking-wider">
											Tipo de Notificação
										</p>
										<p className="font-medium text-sm">{notification.tipo}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-0.5">
										<p className="text-muted-foreground text-xs uppercase tracking-wider">
											Fiscal Responsável
										</p>
										<p className="font-medium text-sm">
											{notification.fiscalNome ?? 'Não informado'}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-0.5">
										<p className="text-muted-foreground text-xs uppercase tracking-wider">
											Data de Envio
										</p>
										<p className="font-medium text-sm">
											{formatData(notification.dataEnvio)}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-0.5">
										<p className="text-muted-foreground text-xs uppercase tracking-wider">
											Assinatura Digital
										</p>
										<p className="break-all font-mono font-medium text-[10px]">
											{notification.assinaturaDigital}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							<div className="pt-2">
								<p className="mb-2 text-muted-foreground text-xs uppercase tracking-wider">
									Arquivos Originais
								</p>
								{notification.filePath && (
									<Button
										variant="outline"
										className="w-full justify-start gap-2"
										asChild
									>
										<a href={notification.filePath} download>
											<Download className="h-4 w-4" />
											Baixar PDF Original
										</a>
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
