'use client'

import { Eye, MoreHorizontal, Trash2, FileSearch } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import { getLicitacoes, type LicitacoesResponse } from '../_data-access/get-licitacoes'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { LicitacoesSkeleton } from './licitacoes-skeleton'

interface LicitacaoDTO {
	id: string
	entidade: string
	objeto: string
	numero: number
	ano: number
	situacao: string
	modalidade: string
	dataPublicacao: string
}

interface LicitacoesTableProps {
	search: string
	page: number
	pageSize: number
	refreshKey: number
	triggerRefresh: () => void
	onDataLoaded?: (stats: LicitacoesResponse['stats']) => void
}

const MODALIDADE_MAP: Record<string, number> = {
	CONCORRENCIA: 1,
	TOMADA_DE_PRECO: 2,
	CONVITE: 3,
	PREGAO: 6,
	LEILAO: 5,
}

const MODALIDADE_LABEL: Record<string, string> = {
	CONCORRENCIA: 'Concorrência',
	TOMADA_DE_PRECO: 'Tomada de Preço',
	CONVITE: 'Convite',
	PREGAO: 'Pregão',
	LEILAO: 'Leilão',
}

const SITUACAO_DISPLAY: Record<string, string> = {
	ANDAMENTO: 'Vigente',
	AGUARDANDO: 'Aguardando',
	CANCELADA: 'Cancelada',
	CONCLUIDA: 'Concluída',
	SUSPENSA: 'Suspensa',
}

const SITUACAO_VARIANT: Record<
	string,
	'default' | 'secondary' | 'destructive' | 'outline'
> = {
	ANDAMENTO: 'default',
	AGUARDANDO: 'secondary',
	CANCELADA: 'destructive',
	CONCLUIDA: 'outline',
	SUSPENSA: 'secondary',
}

function normalizeName(name: string) {
	return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPortalUrl(licitacao: LicitacaoDTO) {
	const tipoLicitacao = MODALIDADE_MAP[licitacao.modalidade] || 6
	return `https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/licitacoes/detalhes?entidade=1&exercicio=${licitacao.ano}&tipoLicitacao=${tipoLicitacao}&licitacao=${licitacao.numero}`
}

export function LicitacoesTable({
	search,
	page,
	pageSize,
	onDataLoaded,
}: LicitacoesTableProps) {
	const [data, setData] = useState<LicitacoesResponse>({ 
		licitacoes: [], 
		total: 0, 
		stats: { total: 0, emAndamento: 0, concluidas: 0, outras: 0 } 
	})
	const [loading, setLoading] = useState(true)
	const [selectedLicitacao, setSelectedLicitacao] =
		useState<LicitacaoDTO | null>(null)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [objetoDialogText, setObjetoDialogText] = useState<string | null>(null)

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const loadLicitacoes = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getLicitacoes({ page, pageSize, search })
			setData(result)
			if (onDataLoaded) onDataLoaded(result.stats)
		} catch {
			toast.error('Erro ao carregar licitações')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search, onDataLoaded])

	useEffect(() => {
		loadLicitacoes()
	}, [loadLicitacoes])

	const handleOpenDeleteDialog = (licitacao: LicitacaoDTO) => {
		setSelectedLicitacao(licitacao)
		setIsDeleteDialogOpen(true)
	}

	const handleSuccess = () => {
		router.refresh()
		loadLicitacoes()
	}

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const totalPages = Math.ceil(data.total / pageSize)

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) {
			return text
		}
		return `${text.substring(0, maxLength)}...`
	}

	if (loading) {
		return <LicitacoesSkeleton />
	}

	return (
		<>
			<Card>
				<CardContent>
					<div className="relative w-full overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Número/Ano</TableHead>
									<TableHead>Modalidade</TableHead>
									<TableHead>Situação</TableHead>
									<TableHead>Entidade</TableHead>
									<TableHead>Objeto</TableHead>
									<TableHead className="text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.licitacoes.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center">
											Nenhuma licitação encontrada
										</TableCell>
									</TableRow>
								) : (
									data.licitacoes.map((r) => (
										<TableRow 
											key={r.id}
											className="cursor-pointer hover:bg-accent/50 transition-colors"
											onClick={() => router.push(`/dashboard-gestor/licitacoes/${r.id}`)}
										>
											<TableCell onClick={(e) => e.stopPropagation()}>
												<a
													href={getPortalUrl(r)}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-green-600 hover:underline"
												>
													{r.numero}/{r.ano}
													<Eye className="h-3 w-3" />
												</a>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{MODALIDADE_LABEL[r.modalidade] || r.modalidade}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge
													variant={SITUACAO_VARIANT[r.situacao] || 'secondary'}
												>
													{SITUACAO_DISPLAY[r.situacao] || r.situacao}
												</Badge>
											</TableCell>
											<TableCell>{normalizeName(r.entidade)}</TableCell>
											<TableCell onClick={(e) => e.stopPropagation()}>
												<button
													type="button"
													className="text-left text-blue-600 hover:underline cursor-pointer"
													onClick={() => setObjetoDialogText(r.objeto)}
												>
													{truncateText(r.objeto, 30)}
												</button>
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
															<Link href={`/dashboard-gestor/licitacoes/${r.id}`}>
																<FileSearch className="mr-2 h-4 w-4" />
																Ver Detalhes
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleOpenDeleteDialog(r)}
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
						Mostrando <strong>{data.licitacoes.length}</strong> de{' '}
						<strong>{data.total}</strong> licitações
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
			<Dialog
				open={objetoDialogText !== null}
				onOpenChange={(open) => {
					if (!open) setObjetoDialogText(null)
				}}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Objeto da Licitação</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-justify whitespace-pre-wrap">
						{objetoDialogText}
					</p>
				</DialogContent>
			</Dialog>
			<DeleteConfirmDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				licitacaoId={selectedLicitacao?.id || null}
				licitacaoNumero={
					selectedLicitacao
						? `${selectedLicitacao.numero}/${selectedLicitacao.ano}`
						: ''
				}
				onSuccess={handleSuccess}
			/>
		</>
	)
}
