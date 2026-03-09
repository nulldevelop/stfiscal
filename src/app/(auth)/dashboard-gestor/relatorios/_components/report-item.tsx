'use client'

import { Calendar, Download, FileText, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
	Transporte: {
		bg: 'bg-green-100 dark:bg-green-900/30',
		text: 'text-green-600 dark:text-green-400',
	},
	Obras: {
		bg: 'bg-purple-100 dark:bg-purple-900/30',
		text: 'text-purple-600 dark:text-purple-400',
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
				<div className={`flex h-8 w-8 items-center justify-center rounded ${colors.bg}`}>
					<FileText className={`h-4 w-4 ${colors.text}`} />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{report.type}</p>
						<Badge variant="outline" className="text-xs">
							Contrato {report.contratoNumero}
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
