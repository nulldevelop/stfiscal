'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, FileText, History } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportDetailModal } from '../../../historico-relatorios/_components/report-detail-modal'
import type {
	ReportType,
	ReportWithMeta,
} from '../../../historico-relatorios/_data-access/get-reports-by-empresa'

interface HistoryTabsProps {
	contrato: any
}

export function HistoryTabs({ contrato }: HistoryTabsProps) {
	const [selectedReport, setSelectedReport] = useState<ReportWithMeta | null>(
		null,
	)
	const [isReportModalOpen, setIsReportModalOpen] = useState(false)

	const reports: ReportWithMeta[] = [
		...(contrato.bensEServicosReports || []).map((r: any) => ({
			id: r.id,
			createdAt: r.createdAt,
			protocolo: r.protocolo,
			contratoNumero: r.contratoNumero,
			type: 'BENS_E_SERVICOS' as ReportType,
			title: `Relatório de Bens e Serviços #${r.protocolo}`,
			filePath: `/api/reports/${r.protocolo}.pdf`,
			fiscalNome:
				r.fiscalDoContrato?.user?.name ??
				r.fiscalDoContrato?.nome ??
				'Não identificado',
		})),
		...(contrato.transporteReports || []).map((r: any) => ({
			id: r.id,
			createdAt: r.createdAt,
			protocolo: r.protocolo,
			contratoNumero: r.contratoNumero,
			type: 'TRANSPORTE' as ReportType,
			title: `Relatório de Transporte #${r.protocolo}`,
			filePath: `/api/reports/${r.protocolo}.pdf`,
			fiscalNome:
				r.fiscalDoContrato?.user?.name ??
				r.fiscalDoContrato?.nome ??
				'Não identificado',
		})),
		...(contrato.obrasReports || []).map((r: any) => ({
			id: r.id,
			createdAt: r.createdAt,
			protocolo: r.protocolo,
			contratoNumero: r.contratoNumero,
			type: 'OBRAS' as ReportType,
			title: `Relatório de Obras #${r.protocolo}`,
			filePath: `/api/reports/${r.protocolo}.pdf`,
			fiscalNome:
				r.fiscalDoContrato?.user?.name ??
				r.fiscalDoContrato?.nome ??
				'Não identificado',
		})),
		...(contrato.terceirizacaoReports || []).map((r: any) => ({
			id: r.id,
			createdAt: r.createdAt,
			protocolo: r.protocolo,
			contratoNumero: r.contratoNumero,
			type: 'TERCEIRIZACAO' as ReportType,
			title: `Relatório de Terceirização #${r.protocolo}`,
			filePath: `/api/reports/${r.protocolo}.pdf`,
			fiscalNome:
				r.fiscalDoContrato?.user?.name ??
				r.fiscalDoContrato?.nome ??
				'Não identificado',
		})),
		...(contrato.fiscalPrincipalReports || []).map((r: any) => ({
			id: r.id,
			createdAt: r.createdAt,
			protocolo: r.protocolo,
			contratoNumero: r.contratoNumero,
			type: 'FISCAL_PRINCIPAL' as ReportType,
			title: `Relatório Final (Fiscal Tecnico) #${r.protocolo}`,
			filePath: `/api/reports/${r.protocolo}.pdf`,
			fiscalNome:
				r.fiscalDoContrato?.user?.name ??
				r.fiscalDoContrato?.nome ??
				'Não identificado',
		})),
	].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)

	const notifications = [
		...(contrato.entregaNotificacoes || []).map((n: any) => ({
			...n,
			type: 'Atraso/Falta Entrega',
		})),
		...(contrato.entregaIncompletaNotificacoes || []).map((n: any) => ({
			...n,
			type: 'Entrega Incompleta',
		})),
		...(contrato.notificacoesDesconformidade || []).map((n: any) => ({
			...n,
			type: 'Desconformidade',
		})),
		...(contrato.notificacoesFiscalTrabalhista || []).map((n: any) => ({
			...n,
			type: 'Fiscal/Trabalhista',
		})),
		...(contrato.assinaturasNotificacoes || []).map((n: any) => ({
			...n,
			type: 'Assinatura',
		})),
	].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)

	const handleReportClick = (report: ReportWithMeta) => {
		setSelectedReport(report)
		setIsReportModalOpen(true)
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<History className="h-5 w-5 text-muted-foreground" />
					Histórico de Atividades
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="reports" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="reports" className="flex items-center gap-2">
							<FileText className="h-4 w-4" /> Relatórios ({reports.length})
						</TabsTrigger>
						<TabsTrigger
							value="notifications"
							className="flex items-center gap-2"
						>
							<Bell className="h-4 w-4" /> Notificações ({notifications.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="reports" className="space-y-4">
						{reports.length > 0 ? (
							<div className="rounded-md border overflow-x-auto">
								<div className="min-w-[400px]">
									<div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium border-b">
										<div className="col-span-1">Data</div>
										<div className="col-span-1">Tipo</div>
										<div className="col-span-1 text-center">Protocolo</div>
										<div className="col-span-1 text-right">Ações</div>
									</div>
									<div className="divide-y">
										{reports.map((report: ReportWithMeta) => (
											<div
												key={report.id}
												className="grid grid-cols-4 p-3 text-sm items-center hover:bg-muted/30 transition-colors"
											>
												<div className="col-span-1 font-medium">
													{format(
														new Date(report.createdAt),
														'dd/MM/yyyy HH:mm',
														{ locale: ptBR },
													)}
												</div>
												<div className="col-span-1 text-xs">
													{report.type === 'BENS_E_SERVICOS' && 'Bens e Serviços'}
													{report.type === 'TRANSPORTE' && 'Transporte'}
													{report.type === 'OBRAS' && 'Obras'}
													{report.type === 'TERCEIRIZACAO' && 'Terceirização'}
													{report.type === 'FISCAL_PRINCIPAL' && 'Fiscal Tecnico'}
												</div>
												<div className="col-span-1 text-center font-mono text-xs">
													{report.protocolo}
												</div>
												<div className="col-span-1 text-right">
													<Button
														variant="ghost"
														onClick={() => handleReportClick(report)}
														className="text-green-600 hover:text-green-700 h-8 px-2 text-xs font-medium"
													>
														Ver Detalhes
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-10 border-2 border-dashed rounded-lg">
								<p className="text-muted-foreground text-sm">
									Nenhum relatório encontrado para este contrato.
								</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="notifications" className="space-y-4">
						{notifications.length > 0 ? (
							<div className="rounded-md border overflow-x-auto">
								<div className="min-w-[400px]">
									<div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium border-b">
										<div className="col-span-1">Data</div>
										<div className="col-span-2">Tipo / Motivo</div>
										<div className="col-span-1 text-right">Status</div>
									</div>
									<div className="divide-y">
										{notifications.map((notif: any) => (
											<div
												key={notif.id}
												className="grid grid-cols-4 p-3 text-sm items-center hover:bg-muted/30 transition-colors"
											>
												<div className="col-span-1 font-medium">
													{format(new Date(notif.createdAt), 'dd/MM/yyyy', {
														locale: ptBR,
													})}
												</div>
												<div className="col-span-2">
													<p className="font-medium text-red-600">{notif.type}</p>
													<p className="text-xs text-muted-foreground line-clamp-1">
														{notif.item ||
															notif.itemDesconformidade ||
															'Notificação enviada'}
													</p>
												</div>
												<div className="col-span-1 text-right">
													<Badge
														variant="secondary"
														className="text-[10px] uppercase"
													>
														Emitida
													</Badge>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-10 border-2 border-dashed rounded-lg">
								<p className="text-muted-foreground text-sm">
									Nenhuma notificação encontrada para este contrato.
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>

			{selectedReport && (
				<ReportDetailModal
					report={selectedReport}
					open={isReportModalOpen}
					onOpenChange={setIsReportModalOpen}
				/>
			)}
		</Card>
	)
}
