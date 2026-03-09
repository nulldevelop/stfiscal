'use client'

import { ExternalLink, FileSearch } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface EmpresaContractsListProps {
	contracts: any[]
}

export function EmpresaContractsList({ contracts }: EmpresaContractsListProps) {
	if (!contracts.length) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					Nenhum contrato vinculado a esta empresa.
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Contratos Ativos e Histórico</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-full max-h-125 overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
							<TableRow>
								<TableHead>Contrato</TableHead>
								<TableHead>Licitação</TableHead>
								<TableHead>Vigência</TableHead>
								<TableHead>Fiscal Tecnico</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contracts.map((c) => {
								const fiscal =
									c.fiscalPrincipal?.member?.user?.name || 'Não atribuído'

								return (
									<TableRow key={c.id}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{c.displayContrato}
												{c.idOxy && (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6"
																	asChild
																>
																	<a
																		href={`https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/contratos/detalhes?id=${c.idOxy}`}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		<ExternalLink className="h-3 w-3" />
																	</a>
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																Ver no Portal da Transparência
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											</div>
										</TableCell>
										<TableCell>{c.displayLicitacao}</TableCell>
										<TableCell>
											{new Date(c.dataInicio).toLocaleDateString('pt-BR')} -{' '}
											{new Date(c.dataFim).toLocaleDateString('pt-BR')}
										</TableCell>
										<TableCell>
											<Badge
												variant={c.fiscalPrincipal ? 'default' : 'secondary'}
											>
												{fiscal}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="sm" asChild>
												<Link href={`/dashboard-gestor/contratos/${c.id}`}>
													<FileSearch className="h-4 w-4 mr-2" />
													Detalhes
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
