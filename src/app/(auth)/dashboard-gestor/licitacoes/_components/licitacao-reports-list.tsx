'use client'

import { FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

interface LicitacaoReportsListProps {
	reports: any[]
}

export function LicitacaoReportsList({ reports }: LicitacaoReportsListProps) {
	if (!reports.length) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					Nenhum relatório enviado para esta licitação.
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Histórico de Relatórios</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Protocolo</TableHead>
							<TableHead>Data</TableHead>
							<TableHead>Período</TableHead>
							<TableHead>Fiscal</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reports.map((report) => (
							<TableRow key={report.id}>
								<TableCell className="font-medium">{report.protocolo}</TableCell>
								<TableCell>
									{new Date(report.createdAt).toLocaleDateString('pt-BR')}
								</TableCell>
								<TableCell className="text-xs">
									{new Date(report.periodoAnalisadoInicio).toLocaleDateString('pt-BR')} - {new Date(report.periodoAnalisadoFim).toLocaleDateString('pt-BR')}
								</TableCell>
								<TableCell>{report.fiscalDoContrato?.nome || 'N/A'}</TableCell>
								<TableCell className="text-right">
									<Button variant="ghost" size="sm" asChild>
										<Link href={`/dashboard-gestor/relatorios/bens-servicos/${report.id}`}>
											<Eye className="h-4 w-4 mr-2" />
											Visualizar
										</Link>
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
