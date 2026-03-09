'use client'

import { Calendar, Download, File, Hash, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatData } from '@/utils/formatData'
import type {
	ReportType,
	ReportWithMeta,
} from '../_data-access/get-reports-by-empresa'

interface ReportDetailModalProps {
	report: ReportWithMeta | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

const typeDisplay: Record<ReportType, { label: string; className: string }> = {
	BENS_E_SERVICOS: {
		label: 'Bens e Serviços',
		className:
			'border-green-600 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
	},
	TRANSPORTE: {
		label: 'Transporte',
		className:
			'border-blue-600 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	},
	OBRAS: {
		label: 'Obras',
		className:
			'border-purple-600 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	},
	TERCEIRIZACAO: {
		label: 'Terceirização',
		className:
			'border-orange-600 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
	},
	FISCAL_PRINCIPAL: {
		label: 'Fiscal Tecnico',
		className:
			'border-red-600 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	},
}

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType
	label: string
	value: React.ReactNode
}) {
	return (
		<div className="flex items-start">
			<div className="flex w-40 items-center gap-2 text-muted-foreground">
				<Icon className="h-4 w-4" />
				<span className="font-medium">{label}</span>
			</div>
			<div className="flex-1 font-mono text-sm">{value}</div>
		</div>
	)
}

export function ReportDetailModal({
	report,
	open,
	onOpenChange,
}: ReportDetailModalProps) {
	if (!report) {
		return null
	}

	const displayInfo = typeDisplay[report.type]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						{report.title}
						<Badge variant="outline" className={displayInfo.className}>
							{displayInfo.label}
						</Badge>
					</DialogTitle>
					<DialogDescription>
						Detalhes completos do relatório fiscal.
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<div className="space-y-4 py-4">
					<InfoRow icon={Hash} label="Protocolo" value={report.protocolo} />
					<InfoRow
						icon={Calendar}
						label="Data de Emissão"
						value={formatData(report.createdAt)}
					/>
					<InfoRow
						icon={File}
						label="Nº do Contrato"
						value={report.contratoNumero}
					/>
					<InfoRow
						icon={User}
						label="Fiscal Responsável"
						value={report.fiscalNome ?? 'Não identificado'}
					/>
				</div>
				<Separator />
				<div className="flex justify-end pt-2">
					<Button asChild>
						<a href={report.filePath} download>
							<Download className="mr-2 h-4 w-4" />
							Baixar PDF
						</a>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
