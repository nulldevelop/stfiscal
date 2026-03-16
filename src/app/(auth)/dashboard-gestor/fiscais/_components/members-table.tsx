'use client'

import { FileStack, Link2, MoreHorizontal, UserCheck } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
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
import type { MemberData } from '../_data-access/get-members'
import { getMembers } from '../_data-access/get-members'
import { FiscaisSkeleton } from './fiscais-skeleton'
import { VincularContratoModal } from './vincular-contrato-modal'
import { maskCpf } from '@/utils/maskCpf'

interface MembersTableProps {
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

export function MembersTable({
	search,
	page,
	pageSize,
	triggerRefresh,
}: MembersTableProps) {
	const [data, setData] = useState<{ members: MemberData[]; total: number }>({
		members: [],
		total: 0,
	})
	const [loading, setLoading] = useState(true)
	const [selectedMember, setSelectedMember] = useState<MemberData | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const loadMembers = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getMembers({ page, pageSize, search })
			setData(result)
		} catch {
			toast.error('Erro ao carregar membros')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search])

	useEffect(() => {
		loadMembers()
	}, [loadMembers])

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const handleVincular = (member: MemberData) => {
		setSelectedMember(member)
		setIsModalOpen(true)
	}

	const handleModalSuccess = () => {
		setIsModalOpen(false)
		setSelectedMember(null)
		loadMembers()
		triggerRefresh()
	}

	const totalPages = Math.ceil(data.total / pageSize)

	if (loading) {
		return <FiscaisSkeleton />
	}

	return (
		<>
			<Card>
				<CardContent>
					{data.members.length === 0 ? (
						<div className="py-4 text-center text-muted-foreground">
							Nenhum membro encontrado
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nome</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Perfil</TableHead>
										<TableHead>CPF</TableHead>
										<TableHead>Matrícula</TableHead>
										<TableHead>Cargo</TableHead>
										<TableHead>Contratos</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.members.map((member) => (
										<TableRow key={member.id}>
											<TableCell className="font-medium">
												{member.name}
											</TableCell>
											<TableCell>{member.email}</TableCell>
											<TableCell>
												<Badge variant="outline">
													{roleLabels[member.role] || member.role}
												</Badge>
											</TableCell>
											<TableCell>
												{member.fiscalCpf ? maskCpf(member.fiscalCpf) : '-'}
											</TableCell>
											<TableCell>{member.fiscalMatricula || '-'}</TableCell>
											<TableCell>{member.fiscalCargo || '-'}</TableCell>
											<TableCell>
												{member.contratosCount > 0 ? (
													<Badge variant="secondary" className="gap-1">
														<FileStack className="h-3 w-3" />
														{member.contratosCount}
													</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell className="text-right">
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
														<DropdownMenuItem
															onClick={() => handleVincular(member)}
														>
															<Link2 className="mr-2 h-4 w-4" />
															<span>Vincular a Contrato</span>
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
						Mostrando <strong>{data.members.length}</strong> de{' '}
						<strong>{data.total}</strong> membros
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
