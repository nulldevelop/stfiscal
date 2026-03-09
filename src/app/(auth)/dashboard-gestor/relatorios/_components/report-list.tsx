'use client'

import { DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatData } from '@/utils/formatData'

export type Report = {
	id: string
	createdAt: Date
	type: 'Bens e Serviços' | 'Transporte' | 'Obras'
	protocolo: string
	contratoNumero: number
	user: {
		name: string | null
	} | null
	dataInicio?: string | Date | null
	dataFim?: string | Date | null
	contratoTipoAto?: string
	contratado?: string
	assinaturaDigital?: string
	filePath?: string
}

interface ReportListProps {
	reports: Report[]
}

export function ReportList({ reports }: ReportListProps) {
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)

	const renderReportDetails = (report: Report) => {
		if (!report) {
			return null
		}

		const filteredEntries = Object.entries(report).filter(
			([key]) =>
				key !== 'id' &&
				key !== 'organizationId' &&
				key !== 'userId' &&
				key !== 'type' &&
				key !== 'createdAt' &&
				key !== 'updatedAt' &&
				key !== 'user' &&
				key !== 'assinaturaDigital',
		)

		return (
			<div className="space-y-3">
				<div className="grid grid-cols-1 gap-2 border-b pb-2 text-sm md:grid-cols-2">
					<strong className="font-medium text-muted-foreground capitalize">
						Criado por:
					</strong>
					<span className="wrap-break-word">
						{report.user?.name ?? 'Desconhecido'}
					</span>
				</div>
				{filteredEntries.map(([key, value]) => (
					<div
						className="grid grid-cols-1 gap-2 border-b pb-2 text-sm md:grid-cols-2"
						key={key}
					>
						<strong className="font-medium text-muted-foreground capitalize">
							{key.replace(/([A-Z])/g, ' $1').trim()}:
						</strong>
						<span className="wrap-break-word">
							{value instanceof Date
								? formatData(value)
								: String(value ?? 'Não Respondida')}
						</span>
					</div>
				))}
			</div>
		)
	}

	return (
		<Dialog onOpenChange={(isOpen) => !isOpen && setSelectedReport(null)}>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Tipo</TableHead>
						<TableHead>Contrato</TableHead>
						<TableHead>Protocolo</TableHead>
						<TableHead>Criado por</TableHead>
						<TableHead>Criado em</TableHead>
						<TableHead className="text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reports.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="h-24 text-center">
								Nenhum relatório encontrado.
							</TableCell>
						</TableRow>
					) : (
						reports.map((report) => (
							<TableRow key={report.id}>
								<TableCell>{report.type}</TableCell>
								<TableCell>{report.contratoNumero} - {report.contratado}</TableCell>
								<TableCell>{report.protocolo}</TableCell>
								<TableCell>{report.user?.name ?? 'Desconhecido'}</TableCell>
								<TableCell>{formatData(report.createdAt)}</TableCell>
								<TableCell className="flex justify-end gap-2">
									<DialogTrigger
										asChild
										onClick={() => setSelectedReport(report)}
									>
										<Button size="sm" variant="outline">
											Ver Detalhes
										</Button>
									</DialogTrigger>
									{report.filePath && (
										<Button size="sm" asChild>
											<a href={report.filePath} download>
												<DownloadIcon className="mr-2 h-4 w-4" />
												PDF
											</a>
										</Button>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{selectedReport && (
				<DialogContent className="w-[80vw] min-w-5xl">
					<DialogHeader>
						<DialogTitle>
							Detalhes do Relatório: {selectedReport.type}
						</DialogTitle>
						<p className="text-muted-foreground text-sm">
							Contrato: {selectedReport.contratoNumero} | Criado por:{' '}
							{selectedReport.user?.name ?? 'Desconhecido'} | Criado em:{' '}
							{formatData(selectedReport.createdAt)}
						</p>
					</DialogHeader>
					<ScrollArea className="max-h-[75vh] p-1">
						<div className="p-4">{renderReportDetails(selectedReport)}</div>
					</ScrollArea>
					<DialogFooter className="sm:justify-end">
						{selectedReport.filePath && (
							<Button asChild>
								<a href={selectedReport.filePath} download>
									<DownloadIcon className="mr-2 h-4 w-4" />
									Baixar PDF
								</a>
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			)}
		</Dialog>
	)
}
