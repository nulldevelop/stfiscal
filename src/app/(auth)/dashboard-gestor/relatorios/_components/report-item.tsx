'use client'

import { AlertTriangle, Calendar, Clock, Download, FileText, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatData } from '@/utils/formatData'
import type { ReportWithDetails } from '../_data-access/get-reports-by-empresa'

interface ReportItemProps {
	report: ReportWithDetails
	onClick: () => void
}

const typeColors: Record<string, { bg: string; text: string }> = {
	'Bens e Serviços': {
		bg: 'bg-blue-100 dark:bg-blue-900/30',
		text: 'text-blue-600 dark:text-blue-400',
	},
	'Bens e Servicos': {
		bg: 'bg-blue-100 dark:bg-blue-900/30',
		text: 'text-blue-600 dark:text-blue-400',
	},
	Transporte: {
		bg: 'bg-green-100 dark:bg-green-900/30',
		text: 'text-green-600 dark:text-green-400',
	},
	Obras: {
		bg: 'bg-purple-100 dark:bg-purple-900/30',
		text: 'text-purple-600 dark:text-purple-400',
	},
	Terceirizacao: {
		bg: 'bg-orange-100 dark:bg-orange-900/30',
		text: 'text-orange-600 dark:text-orange-400',
	},
	'Terceirização': {
		bg: 'bg-orange-100 dark:bg-orange-900/30',
		text: 'text-orange-600 dark:text-orange-400',
	},
	'Fiscal Tecnico': {
		bg: 'bg-indigo-100 dark:bg-indigo-900/30',
		text: 'text-indigo-600 dark:text-indigo-400',
	},
}

function OverdueBadge({ overdueInfo }: { overdueInfo?: ReportWithDetails['overdueInfo'] }) {
	if (!overdueInfo) return null

	const { status, diasRestantes } = overdueInfo

	if (status === 'ok') {
		return null // Não mostra badge quando está ok
	}

	if (status === 'overdue') {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge variant="destructive" className="text-xs gap-1">
							<AlertTriangle className="h-3 w-3" />
							Atrasado
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p className="text-xs">Atrasado ha {Math.abs(diasRestantes)} dias</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	}

	if (status === 'warning') {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge variant="outline" className="text-xs gap-1 bg-amber-50 text-amber-700 border-amber-200">
							<Clock className="h-3 w-3" />
							Vence em {diasRestantes}d
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p className="text-xs">Vence em {diasRestantes} dias</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	}

	return null
}

export function ReportItem({ report, onClick }: ReportItemProps) {
	const colors = typeColors[report.type] ?? {
		bg: 'bg-gray-100 dark:bg-gray-900/30',
		text: 'text-gray-600 dark:text-gray-400',
	}

	return (
		<div className={`flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 ${report.overdueInfo?.status === 'overdue' ? 'border-l-4 border-l-red-500' : report.overdueInfo?.status === 'warning' ? 'border-l-4 border-l-amber-500' : ''}`}>
			<div className="flex items-center gap-3">
				<div className={`flex h-8 w-8 items-center justify-center rounded ${colors.bg}`}>
					<FileText className={`h-4 w-4 ${colors.text}`} />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{report.type}</p>
						<Badge variant="outline" className="text-xs">
							Contrato {report.contratoNumero}
						</Badge>
						<OverdueBadge overdueInfo={report.overdueInfo} />
					</div>
					<div className="flex items-center gap-3 text-muted-foreground text-xs">
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{formatData(report.createdAt)}
						</span>
						<span className="flex items-center gap-1">
							<User className="h-3 w-3" />
							{report.fiscalNome ?? 'Desconhecido'}
						</span>
						<span>Protocolo: {report.protocolo}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onClick}>
					Ver Detalhes
				</Button>
				{report.filePath && (
					<Button size="sm" asChild>
						<a href={report.filePath} download>
							<Download className="mr-1 h-3 w-3" />
							PDF
						</a>
					</Button>
				)}
			</div>
		</div>
	)
}
