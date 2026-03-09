'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, ArrowRight, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { getLicitacaoPortalUrl } from '@/lib/get-licitacao-url'
import { getContratos } from '../_data-access/get-contratos'
import { useImport } from './import-context'
import { ContratosSkeleton } from './contratos-skeleton'

export interface ContratoRow {
	id: string
	numero: number
	contratado: string
	displayLicitacao: string
	displayContrato: string
	tipoAto: string | null
	empresa: string
	licitacao: number
	licitacaoAno: number
	dataInicio: Date
	dataFim: Date
	licitacaoModalidade: string
	nomeFiscal: string | null
	idOxy: string | null
	fiscais: { id: string; name: string }[]
	isOverdue: boolean
}

interface ContratosTableProps {
	search: string
	page: number
	pageSize: number
}

export function ContratosTable({
	search,
	page,
	pageSize,
}: ContratosTableProps) {
	const { isImporting } = useImport()
	const [data, setData] = useState<{
		contratos: ContratoRow[]
		total: number
	}>({ contratos: [], total: 0 })
	const [loading, setLoading] = useState(true)

	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()

	const loadContratos = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getContratos({ page, pageSize, search })
			setData(result)
		} catch {
			toast.error('Erro ao carregar contratos')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search])

	useEffect(() => {
		loadContratos().catch(() => toast.error('Erro ao carregar contratos'))
	}, [loadContratos])

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
		return <ContratosSkeleton />
	}

	return (
		<Card className="w-full relative overflow-hidden py-2">

			{isImporting && (
				<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-xs transition-all duration-300">
					<div className="flex flex-col items-center gap-4 p-6 bg-card border rounded-xl shadow-lg animate-in fade-in zoom-in duration-300">
						<Loader2 className="h-10 w-10 animate-spin text-primary" />
						<div className="text-center space-y-1">
							<p className="font-semibold text-lg">Importando contratos</p>
							<p className="text-sm text-muted-foreground animate-pulse">
								Sincronizando com a API Oxy...
							</p>
						</div>
					</div>
				</div>
			)}

			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Licitação</TableHead>
								<TableHead>Tipo Ato</TableHead>
								<TableHead>Contratado</TableHead>
								<TableHead className="hidden md:table-cell text-center">Início</TableHead>
								<TableHead className="hidden md:table-cell text-center">Fim</TableHead>
								<TableHead className="table-cell md:hidden text-center">Vigência</TableHead>
								<TableHead>Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										Carregando...
									</TableCell>
								</TableRow>
							) : data.contratos.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										Nenhum contrato encontrado
									</TableCell>
								</TableRow>
							) : (
								data.contratos.map((r) => (
									<TableRow 
										key={r.id}
										className={`cursor-pointer hover:bg-accent/50 transition-colors ${r.isOverdue ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}
										onClick={() => router.push(`/dashboard-gestor/contratos/${r.id}`)}
									>
										<TableCell>
											<div className="flex items-center gap-1">
												<span className="font-medium text-primary hover:underline">
													{r.displayContrato}
												</span>
												{r.isOverdue && (
													<Badge variant="destructive" className="gap-1">
														<AlertTriangle className="h-3 w-3" />
														Atrasado
													</Badge>
												)}
											</div>
										</TableCell>

										{/* Licitacao */}
										<TableCell onClick={(e) => e.stopPropagation()}>
											<a
												href={getLicitacaoPortalUrl(r)}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-1 text-green-600 hover:underline"
											>
												{r.displayLicitacao}
												<Eye className="h-3 w-3" />
											</a>
										</TableCell>

										<TableCell>
											{r.tipoAto ? (
												<Badge>{r.tipoAto}</Badge>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>

										{/* Contratado */}
										<TableCell>
											{r.contratado}
										</TableCell>

										{/* Vigencia Inicio (Desktop) */}
										<TableCell className="hidden md:table-cell text-center whitespace-nowrap">
											{format(new Date(r.dataInicio), 'dd/MM/yyyy', {
												locale: ptBR,
											})}
										</TableCell>

										{/* Vigencia Fim (Desktop) */}
										<TableCell className="hidden md:table-cell text-center whitespace-nowrap">
											{format(new Date(r.dataFim), 'dd/MM/yyyy', {
												locale: ptBR,
											})}
										</TableCell>

										{/* Vigencia Mobile */}
										<TableCell className="table-cell md:hidden text-center">
											<div className="flex flex-col text-xs">
												<span>
													{format(new Date(r.dataInicio), 'dd/MM/yyyy', {
														locale: ptBR,
													})}
												</span>
												<span className="text-muted-foreground">até</span>
												<span>
													{format(new Date(r.dataFim), 'dd/MM/yyyy', {
														locale: ptBR,
													})}
												</span>
											</div>
										</TableCell>

										<TableCell onClick={(e) => e.stopPropagation()}>
											<Button size="icon" variant="ghost" asChild>
												<Link href={`/dashboard-gestor/contratos/${r.id}`}>
													<ArrowRight className="h-4 w-4" />
												</Link>
											</Button>
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
					Mostrando <strong>{data.contratos.length}</strong> de{' '}
					<strong>{data.total}</strong> contratos
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
