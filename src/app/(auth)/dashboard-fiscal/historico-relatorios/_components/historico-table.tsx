/** biome-ignore-all lint/suspicious/noExplicitAny: dev */
'use client'

import { DownloadIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatData } from '@/utils/formatData'

type Report = {
	id: string
	createdAt: Date
	type: string
	contratoNumero: string
	protocolo: string
	filePath: string
	[key: string]: any
}

interface HistoricoTableProps {
	reports: Report[]
	total: number
	page: number
	pageSize: number
}

export function HistoricoTable({
	reports,
	total,
	page,
	pageSize,
}: HistoricoTableProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const totalPages = Math.ceil(total / pageSize)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Histórico de Relatórios Enviados</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Protocolo</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Contrato</TableHead>
							<TableHead>Data de Envio</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reports.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									Nenhum relatório encontrado.
								</TableCell>
							</TableRow>
						) : (
							reports.map((report) => (
								<TableRow key={report.id}>
									<TableCell className="font-mono">
										{report.protocolo}
									</TableCell>
									<TableCell>{report.type}</TableCell>
									<TableCell>{report.contratoNumero}</TableCell>
									<TableCell>{formatData(report.createdAt)}</TableCell>
									<TableCell className="text-right">
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
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<div className="text-xs text-muted-foreground">
					Mostrando <strong>{reports.length}</strong> de{' '}
					<strong>{total}</strong> relatórios
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page - 1)}
						disabled={page <= 1}
					>
						Anterior
					</Button>
					<span className="text-sm">
						Página {page} de {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page + 1)}
						disabled={page >= totalPages}
					>
						Próximo
					</Button>
				</div>
			</CardFooter>
		</Card>
	)
}
