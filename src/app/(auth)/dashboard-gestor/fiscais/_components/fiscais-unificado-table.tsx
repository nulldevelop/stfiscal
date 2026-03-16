'use client'

import {
	AlertCircle,
	CheckCircle2,
	FileSearch,
	FileStack,
	Link2,
	MoreHorizontal,
	Printer,
	UserCheck,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	getFiscaisUnificado,
	type FiscalUnificado,
} from '../_data-access/get-fiscais-unificado'
import { FiscaisSkeleton } from './fiscais-skeleton'
import { VincularContratoModal } from './vincular-contrato-modal'
import { maskCpf } from '@/utils/maskCpf'
import type { MemberData } from '../_data-access/get-members'

interface FiscaisUnificadoTableProps {
	search: string
	page: number
	pageSize: number
	refreshKey: number
	triggerRefresh: () => void
}

const roleLabels: Record<string, string> = {
	OWNER: 'Owner',
	ADMIN: 'Administrador',
	GESTOR_CONTRATOS: 'Gestor',
	FISCAL_PRINCIPAL: 'Fiscal Principal',
	FISCAL_SETORIAL: 'Fiscal Setorial',
}

type FilterType = 'all' | 'members' | 'fiscais' | 'pending'

export function FiscaisUnificadoTable({
	search,
	page,
	pageSize,
	triggerRefresh,
}: FiscaisUnificadoTableProps) {
	const [data, setData] = useState<{
		fiscais: FiscalUnificado[]
		total: number
		stats: { totalMembers: number; totalFiscalContrato: number; totalPending: number }
	}>({
		fiscais: [],
		total: 0,
		stats: { totalMembers: 0, totalFiscalContrato: 0, totalPending: 0 },
	})
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState<FilterType>('all')
	const [selectedMember, setSelectedMember] = useState<MemberData | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isExporting, startExport] = useTransition()

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const loadFiscais = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getFiscaisUnificado({ page, pageSize, search, filter })
			setData(result)
		} catch {
			toast.error('Erro ao carregar fiscais')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search, filter])

	useEffect(() => {
		loadFiscais()
	}, [loadFiscais])

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const handleVincular = (fiscal: FiscalUnificado) => {
		if (!fiscal.memberId) {
			toast.error('Este fiscal não possui um member vinculado')
			return
		}
		// Converter para MemberData para o modal
		const memberData: MemberData = {
			id: fiscal.memberId,
			userId: fiscal.userId || '',
			name: fiscal.nome,
			email: fiscal.email,
			role: fiscal.role || 'FISCAL_SETORIAL',
			fiscalCpf: fiscal.cpf,
			fiscalMatricula: fiscal.matricula,
			fiscalCargo: fiscal.cargo,
			fiscalContato: fiscal.contato,
			createdAt: fiscal.createdAt,
			contratosCount: fiscal.contratosCount,
		}
		setSelectedMember(memberData)
		setIsModalOpen(true)
	}

	const handleModalSuccess = () => {
		setIsModalOpen(false)
		setSelectedMember(null)
		loadFiscais()
		triggerRefresh()
	}

	const handleExportReport = (userId: string) => {
		if (!userId) {
			toast.error('ID do fiscal não encontrado.')
			return
		}
		window.open(`/api/fiscais/${userId}/report`, '_blank')
	}

	const handleRowClick = (fiscal: FiscalUnificado) => {
		// Navegar usando fiscalContratoId ou oderId
		const id = fiscal.fiscalContratoId || fiscal.userId
		if (id) {
			router.push(`/dashboard-gestor/fiscais/${id}`)
		}
	}

	const getSourceBadge = (source: FiscalUnificado['source']) => {
		switch (source) {
			case 'both':
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Badge variant="default" className="gap-1">
									<CheckCircle2 className="h-3 w-3" />
									Completo
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Possui Member e FiscalContrato vinculados</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)
			case 'member':
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
									<Users className="h-3 w-3" />
									Apenas Member
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Possui apenas Member, sem FiscalContrato</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)
			case 'fiscalContrato':
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
									<UserCheck className="h-3 w-3" />
									Apenas Fiscal
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Possui apenas FiscalContrato, sem Member</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)
		}
	}

	const totalPages = Math.ceil(data.total / pageSize)

	if (loading) {
		return <FiscaisSkeleton />
	}

	return (
		<>
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex gap-4 text-sm">
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 rounded-full bg-primary" />
								<span>Completos: {data.stats.totalFiscalContrato}</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 rounded-full bg-amber-500" />
								<span>Pendentes: {data.stats.totalPending}</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 rounded-full bg-blue-500" />
								<span>Total Members: {data.stats.totalMembers}</span>
							</div>
						</div>
						<Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
							<TabsList>
								<TabsTrigger value="all">Todos</TabsTrigger>
								<TabsTrigger value="pending">Pendentes</TabsTrigger>
								<TabsTrigger value="fiscais">Com Perfil</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					{data.fiscais.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							{filter === 'pending'
								? 'Nenhum membro pendente de vinculação'
								: 'Nenhum fiscal encontrado'}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nome</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Perfil</TableHead>
										<TableHead>CPF</TableHead>
										<TableHead>Matrícula</TableHead>
										<TableHead>Cargo</TableHead>
										<TableHead>Contratos</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.fiscais.map((fiscal) => (
										<TableRow
											key={fiscal.id}
											className="cursor-pointer hover:bg-accent/50 transition-colors"
											onClick={() => handleRowClick(fiscal)}
										>
											<TableCell className="font-medium">
												{fiscal.nome}
											</TableCell>
											<TableCell>{fiscal.email || '-'}</TableCell>
											<TableCell>{getSourceBadge(fiscal.source)}</TableCell>
											<TableCell>
												{fiscal.role ? (
													<Badge variant="outline">
														{roleLabels[fiscal.role] || fiscal.role}
													</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>
												{fiscal.cpf ? maskCpf(fiscal.cpf) : '-'}
											</TableCell>
											<TableCell>{fiscal.matricula || '-'}</TableCell>
											<TableCell>{fiscal.cargo || '-'}</TableCell>
											<TableCell>
												{fiscal.contratosCount > 0 ? (
													<Badge variant="secondary" className="gap-1">
														<FileStack className="h-3 w-3" />
														{fiscal.contratosCount}
													</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell
												className="text-right"
												onClick={(e) => e.stopPropagation()}
											>
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
														{(fiscal.fiscalContratoId || fiscal.userId) && (
															<DropdownMenuItem asChild>
																<Link
																	href={`/dashboard-gestor/fiscais/${fiscal.fiscalContratoId || fiscal.userId}`}
																>
																	<FileSearch className="mr-2 h-4 w-4" />
																	<span>Ver Detalhes</span>
																</Link>
															</DropdownMenuItem>
														)}
														{fiscal.memberId && (
															<DropdownMenuItem
																onClick={() => handleVincular(fiscal)}
															>
																<Link2 className="mr-2 h-4 w-4" />
																<span>Vincular a Contrato</span>
															</DropdownMenuItem>
														)}
														{fiscal.userId && (
															<DropdownMenuItem
																onClick={() =>
																	handleExportReport(fiscal.userId!)
																}
																disabled={isExporting}
															>
																<Printer className="mr-2 h-4 w-4" />
																<span>
																	{isExporting
																		? 'Gerando...'
																		: 'Exportar Relatório'}
																</span>
															</DropdownMenuItem>
														)}
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
						<strong>{data.total}</strong> registros
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
							Página {page} de {totalPages || 1}
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

			<VincularContratoModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				member={selectedMember}
				onSuccess={handleModalSuccess}
			/>
		</>
	)
}
