'use client'

import { Briefcase, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getContratos } from '../contratos/_data-access/get-contratos'

type ContratoListItem = Awaited<
	ReturnType<typeof getContratos>
>['contratos'][number]

export function RecentContracts() {
	const [contracts, setContracts] = useState<ContratoListItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			const result = await getContratos({ page: 1, pageSize: 5 })
			setContracts(result.contratos)
			setLoading(false)
		}
		load().catch(() => setLoading(false))
	}, [])

	return (
		<Card className="flex h-full flex-col">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Contratos Recentes</CardTitle>
					<CardDescription>
						Últimos contratos adicionados ao sistema
					</CardDescription>
				</div>
				<Link href="/dashboard-gestor/contratos">
					<Button variant="outline" size="sm">
						Ver todos
					</Button>
				</Link>
			</CardHeader>
			<CardContent className="flex-1">
				{loading ? (
					<div className="flex h-68 items-center justify-center">
						<p className="animate-pulse text-muted-foreground">Carregando...</p>
					</div>
				) : contracts.length > 0 ? (
					<ScrollArea className="h-68 overflow-y-auto pr-4">
						<div className="h-68">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b text-left text-muted-foreground">
										<th className="pb-2 font-medium">Contrato</th>
										<th className="pb-2 font-medium">Empresa</th>
										<th className="hidden pb-2 font-medium md:table-cell">
											Fiscal
										</th>
										<th className="pb-2 text-right font-medium">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{contracts.map((c) => (
										<tr key={c.id} className="group ">
											<td className="py-3">
												<div className="flex flex-col">
													<span className="font-medium">
														{c.displayContrato}
													</span>
													<span className="text-xs text-muted-foreground">
														{c.tipoAto}
													</span>
												</div>
											</td>
											<td className="py-3">
												<span className="text-muted-foreground">
													{c.empresa}
												</span>
											</td>
											<td className="hidden py-3 md:table-cell">
												{c.fiscais.length > 0 ? (
													<Badge variant="secondary" className="font-normal">
														{c.fiscais[0].name}
													</Badge>
												) : (
													<span className="text-xs italic text-muted-foreground">
														Não atribuído
													</span>
												)}
											</td>
											<td className="py-3 text-right">
												<Link href={`/dashboard-gestor/contratos/${c.id}`}>
													<Button variant="ghost" size="icon">
														<ChevronRight className="h-4 w-4" />
													</Button>
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</ScrollArea>
				) : (
					<div className="flex h-68 flex-col items-center justify-center gap-2">
						<Briefcase className="h-8 w-8 text-muted-foreground/50" />
						<p className="text-sm text-muted-foreground">
							Nenhum contrato cadastrado
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
