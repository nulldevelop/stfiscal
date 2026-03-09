'use client'

import { Calendar, Download, FileText, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatData } from '@/utils/formatData'
import type {
	ReportType,
	ReportWithMeta,
} from '../_data-access/get-reports-by-empresa'

interface ReportItemProps {
	report: ReportWithMeta
	onClick: () => void
}

const typeColors: Record<ReportType, { bg: string; text: string }> = {
	BENS_E_SERVICOS: {
		bg: 'bg-green-100 dark:bg-green-900/30',
		text: 'text-green-600 dark:text-green-400',
	},
	TRANSPORTE: {
		bg: 'bg-blue-100 dark:bg-blue-900/30',
		text: 'text-blue-600 dark:text-blue-400',
	},
	OBRAS: {
		bg: 'bg-purple-100 dark:bg-purple-900/30',
		text: 'text-purple-600 dark:text-purple-400',
	},
	TERCEIRIZACAO: {
		bg: 'bg-orange-100 dark:bg-orange-900/30',
		text: 'text-orange-600 dark:text-orange-400',
	},
	FISCAL_PRINCIPAL: {
		bg: 'bg-red-100 dark:bg-red-900/30',
		text: 'text-red-600 dark:text-red-400',
	},
}

export function ReportItem({ report, onClick }: ReportItemProps) {
	const colors = typeColors[report.type] ?? {
		bg: 'bg-gray-100 dark:bg-gray-900/30',
		text: 'text-gray-600 dark:text-gray-400',
	}

	return (
		<div className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
			<div className="flex items-center gap-3">
				<div
					className={`flex h-8 w-8 items-center justify-center rounded ${colors.bg}`}
				>
					<FileText className={`h-4 w-4 ${colors.text}`} />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{report.title}</p>
						<Badge variant="outline" className="text-xs">
							Contrato {report.contratoNumero}
						</Badge>
						<Badge variant="secondary" className="text-xs">
							Protocolo: {report.protocolo}
						</Badge>
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
