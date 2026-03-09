'use client'

import { MoreHorizontal, Trash2, FileSearch } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
import { formatCnpj } from '@/utils/formatCNPJ'
import { formatCpf } from '@/utils/formatCpf'
import { getEmpresas, type EmpresasResponse } from '../_data-access/get-empresas'
import type { EmpresaDTO } from '../_data-access/types'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { EmpresasSkeleton } from './empresas-skeleton'
import Link from 'next/link'

interface EmpresasTableProps {
	search: string
	page: number
	pageSize: number
	refreshKey: number
	triggerRefresh: () => void
	onDataLoaded?: (stats: EmpresasResponse['stats']) => void
}

export function EmpresasTable({
	search,
	page,
	pageSize,
	onDataLoaded,
}: EmpresasTableProps) {
	const [data, setData] = useState<EmpresasResponse>({ 
		empresas: [], 
		total: 0, 
		stats: { total: 0, comRepresentante: 0, semRepresentante: 0 } 
	})
	const [loading, setLoading] = useState(true)
	const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaDTO | null>(
		null,
	)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const loadEmpresas = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getEmpresas({ page, pageSize, search })
			setData(result)
			if (onDataLoaded) onDataLoaded(result.stats)
		} catch {
			toast.error('Erro ao carregar empresas')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search, onDataLoaded])

	useEffect(() => {
		loadEmpresas()
	}, [loadEmpresas])

	const handleOpenDeleteDialog = (empresa: EmpresaDTO) => {
		setSelectedEmpresa(empresa)
		setIsDeleteDialogOpen(true)
	}

	const handleSuccess = () => {
		router.refresh()
		loadEmpresas()
	}

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const totalPages = Math.ceil(data.total / pageSize)

	if (loading) {
		return <EmpresasSkeleton />
	}

	return (
		<>
			<Card className='py-2'>
				<CardContent>
					<div className="relative w-full overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nome</TableHead>
									<TableHead>CNPJ</TableHead>
									<TableHead>Representante</TableHead>
									<TableHead>CPF Repr.</TableHead>
									<TableHead className="text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.empresas.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center">
											Nenhuma empresa encontrada
										</TableCell>
									</TableRow>
								) : (
									data.empresas.map((e) => (
										<TableRow 
											key={e.id}
											className="cursor-pointer hover:bg-accent/50 transition-colors"
											onClick={() => router.push(`/dashboard-gestor/empresas/${e.id}`)}
										>
											<TableCell className="font-medium">{e.name}</TableCell>
											<TableCell>{formatCnpj(e.cnpj)}</TableCell>
											<TableCell>{e.representanteNome || '-'}</TableCell>
											<TableCell>
												{e.representanteCpf ? formatCpf(e.representanteCpf) : '-'}
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
															<Link href={`/dashboard-gestor/empresas/${e.id}`}>
																<FileSearch className="mr-2 h-4 w-4" />
																Ver Detalhes
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleOpenDeleteDialog(e)}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Excluir
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
				<CardFooter className="flex items-center justify-between">
					<div className="text-xs text-muted-foreground">
						Mostrando <strong>{data.empresas.length}</strong> de{' '}
						<strong>{data.total}</strong> empresas
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
			<DeleteConfirmDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				empresaId={selectedEmpresa?.id || null}
				empresaNome={selectedEmpresa?.name || ''}
				onSuccess={handleSuccess}
			/>
		</>
	)
}
