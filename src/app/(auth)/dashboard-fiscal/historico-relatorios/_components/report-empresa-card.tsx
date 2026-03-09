'use client'

import { Building2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type {
	EmpresaWithReports,
	ReportWithMeta,
} from '../_data-access/get-reports-by-empresa'
import { ReportItem } from './report-item'

interface ReportEmpresaCardProps {
	empresa: EmpresaWithReports
	onSelectReport: (report: ReportWithMeta) => void
}

export function ReportEmpresaCard({
	empresa,
	onSelectReport,
}: ReportEmpresaCardProps) {
	const [isOpen, setIsOpen] = useState(true)

	return (
		<Card className="mb-4">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CardHeader className="pb-3">
					<CollapsibleTrigger asChild>
						<div className="flex cursor-pointer items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">
										{empresa.empresaNome}
									</CardTitle>
									{empresa.empresaCnpj !== 'N/A' && (
										<p className="text-muted-foreground text-sm">
											CNPJ: {empresa.empresaCnpj}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Badge variant="secondary" className="gap-1">
									<FileText className="h-3 w-3" />
									{empresa.reports.length}{' '}
									{empresa.reports.length === 1 ? 'relatório' : 'relatórios'}
								</Badge>
								<Button variant="ghost" size="sm">
									{isOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</CollapsibleTrigger>
				</CardHeader>
				<CollapsibleContent>
					<CardContent className="pt-0">
						<div className="space-y-2">
							{empresa.reports.map((report) => (
								<ReportItem
									key={report.id}
									report={report}
									onClick={() => onSelectReport(report)}
								/>
							))}
						</div>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	)
}
