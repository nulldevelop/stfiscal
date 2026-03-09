'use client'

import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatData } from '@/utils/formatData'
import type { ReportWithDetails } from '../_data-access/get-reports-by-empresa'

interface ReportDetailModalProps {
	report: ReportWithDetails | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ReportDetailModal({
	report,
	open,
	onOpenChange,
}: ReportDetailModalProps) {
	if (!report) {
		return null
	}

	const details = [
		{ label: 'Tipo', value: report.type },
		{ label: 'Protocolo', value: report.protocolo },
		{ label: 'Número do Contrato', value: report.contratoNumero },
		{ label: 'Contratada', value: report.contratada },
		{ label: 'Objeto', value: report.objeto },
		{ label: 'Fiscal do Contrato', value: report.fiscalNome ?? 'Desconhecido' },
		{ label: 'Período Início', value: formatData(report.periodoInicio) },
		{ label: 'Período Fim', value: formatData(report.periodoFim) },
		{ label: 'Data de Criação', value: formatData(report.createdAt) },
	]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[90vh] min-w-5xl">
				<DialogHeader>
					<DialogTitle>Detalhes do Relatório: {report.type}</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Contrato: {report.contratoNumero} | Criado em:{' '}
						{formatData(report.createdAt)}
					</p>
				</DialogHeader>
				<ScrollArea className="max-h-[70vh]">
					<div className="space-y-3 p-4">
						{details.map(({ label, value }) => (
							<div
								key={label}
								className="grid grid-cols-1 gap-2 border-b pb-2 text-sm md:grid-cols-2"
							>
								<strong className="font-medium text-muted-foreground">
									{label}:
								</strong>
								<span className="wrap-break-word">
									{String(value ?? 'N/A')}
								</span>
							</div>
						))}
					</div>
				</ScrollArea>
				<DialogFooter className="sm:justify-end">
					{report.filePath && (
						<Button asChild>
							<a href={report.filePath} download>
								<DownloadIcon className="mr-2 h-4 w-4" />
								Baixar PDF
							</a>
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
