'use client'

import { FileStack, FileText, MoreHorizontal, Pencil, Printer, Trash2, FileSearch } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { deleteFiscalAction } from '../_actions/delete-fiscal'
import type { FiscalData } from '../_data-access/get-fiscais'
import { getFiscais } from '../_data-access/get-fiscais'
import { FiscaisSkeleton } from './fiscais-skeleton'
import { maskCpf } from '@/utils/maskCpf'
import Link from 'next/link'

interface FiscaisTableProps {
	search: string
	page: number
	pageSize: number
	refreshKey: number
	triggerRefresh: () => void
}

export function FiscaisTable({ search, page, pageSize }: FiscaisTableProps) {
	const [data, setData] = useState<{ fiscais: FiscalData[]; total: number }>({
		fiscais: [],
		total: 0,
	})
	const [loading, setLoading] = useState(true)
	const [isExporting, startExport] = useTransition()

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const handleExportReport = (id: string) => {
		if (!id) {
			toast.error('ID do fiscal não encontrado.')
			return
		}
		// Abre a rota da API que gera, salva e serve o PDF em uma nova aba
		window.open(`/api/fiscais/${id}/report`, '_blank')
	}

	const loadFiscais = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getFiscais({ page, pageSize, search })
			setData(result)
		} catch {
			toast.error('Erro ao carregar fiscais')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search])

	useEffect(() => {
		loadFiscais()
	}, [loadFiscais])

	async function handleDelete(id: string) {
		try {
			const res = await deleteFiscalAction({ id })
			if (res?.success) {
				toast.success('Fiscal excluído')
				router.refresh()
				loadFiscais()
			} else if (res?.error) {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao excluir fiscal')
		}
	}

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const totalPages = Math.ceil(data.total / pageSize)

	if (loading) {
		return <FiscaisSkeleton />
	}

	return (
		<>
			<Card>
				<CardContent>
					{data.fiscais.length === 0 ? (
						<div className="py-4 text-center text-muted-foreground">
							Nenhum fiscal encontrado
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nome</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>CPF</TableHead>
										<TableHead>Matrícula</TableHead>
										<TableHead>Cargo</TableHead>
										<TableHead>Contato</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.fiscais.map((fiscal) => (
										<TableRow 
											key={fiscal.id}
											className="cursor-pointer hover:bg-accent/50 transition-colors"
											onClick={() => router.push(`/dashboard-gestor/fiscais/${fiscal.id}`)}
										>
											<TableCell className="font-medium">
												{fiscal.name}
											</TableCell>
											<TableCell>{fiscal.email}</TableCell>
											<TableCell>{maskCpf(fiscal.cpf || '')}</TableCell>
											<TableCell>{fiscal.matricula}</TableCell>
											<TableCell>{fiscal.cargo}</TableCell>
											<TableCell>{fiscal.contato || '-'}</TableCell>
											<TableCell>
												<Badge variant="secondary">Ativo</Badge>
											</TableCell>
											<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Abrir menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Ações</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link href={`/dashboard-gestor/fiscais/${fiscal.id}`}>
																<FileSearch className="mr-2 h-4 w-4" />
																<span>Ver Detalhes</span>
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																fiscal.userId &&
																handleExportReport(fiscal.userId)
															}
															disabled={isExporting || !fiscal.userId}
														>
															<Printer className="mr-2 h-4 w-4" />
															<span>
																{isExporting
																	? 'Gerando...'
																	: 'Exportar Relatório'}
															</span>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleDelete(fiscal.id)}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															<span>Excluir</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex items-center justify-between">
					<div className="text-xs text-muted-foreground">
						Mostrando <strong>{data.fiscais.length}</strong> de{' '}
						<strong>{data.total}</strong> fiscais
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
		</>
	)
}
