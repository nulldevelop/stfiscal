'use client'

import { Loader2, Search, Trash2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { addMember } from '../_actions/add-member'
import { removeMember } from '../_actions/remove-member'
import { updateMemberRole } from '../_actions/update-member-role'
import type { MemberItem, Role } from '../_data-access/get-users-organization'

function getInitials(name: string) {
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0])
		.join('')
		.toUpperCase()
}

interface NonMemberItem {
	id: string
	name: string
	email: string
}

interface MembersProps {
	orgId: string
	initialMembers: MemberItem[]
	initialNonMembers: NonMemberItem[]
}

const roleLabels: Record<Role, string> = {
	OWNER: 'Dono',
	ADMIN: 'Administrador',
	SUPORT: 'Suporte',
	FISCAL_PRINCIPAL: 'Fiscal Tecnico',
	FISCAL_SETORIAL: 'Fiscal Administrativo',
	GESTOR_CONTRATOS: 'Gestor de Contratos',
	USER: 'Usuário',
}

const roleColor: Record<Role, string> = {
	OWNER: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
	ADMIN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
	SUPORT: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
	FISCAL_PRINCIPAL: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
	FISCAL_SETORIAL: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
	GESTOR_CONTRATOS: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
	USER: 'bg-muted text-muted-foreground',
}

export function Members({
	orgId: _orgId,
	initialMembers,
	initialNonMembers,
}: MembersProps) {
	const router = useRouter()
	const [members, setMembers] = useState(initialMembers)
	const [nonMembers, setNonMembers] = useState(initialNonMembers)
	const [open, setOpen] = useState(false)
	const [adding, setAdding] = useState<string | null>(null)
	const [removing, setRemoving] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState('')

	const filteredMembers = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return members
		return members.filter(
			(m) =>
				m.user.name.toLowerCase().includes(q) ||
				m.user.email.toLowerCase().includes(q),
		)
	}, [members, search])

	useEffect(() => {
		setMembers(initialMembers)
	}, [initialMembers])

	useEffect(() => {
		setNonMembers(initialNonMembers)
	}, [initialNonMembers])

	const handleRoleChange = async (memberId: string, newRole: Role) => {
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
		)
		try {
			const result = await updateMemberRole({ memberId, role: newRole })
			if (result.success) {
				toast.success('Papel atualizado com sucesso')
				router.refresh()
			} else {
				setMembers(initialMembers)
				setError(result.error || 'Erro ao alterar papel')
				toast.error(result.error || 'Erro ao alterar papel')
			}
		} catch (e) {
			setMembers(initialMembers)
			setError(e instanceof Error ? e.message : 'Erro ao alterar papel')
		}
	}

	const handleAddMember = async (userId: string) => {
		setAdding(userId)
		setError(null)
		try {
			const result = await addMember(userId, 'USER')
			if (result.success) {
				toast.success('Membro adicionado com sucesso')
				setOpen(false)
				router.refresh()
			} else {
				setError(result.error || 'Erro ao adicionar membro')
				toast.error(result.error || 'Erro ao adicionar membro')
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao adicionar membro')
		} finally {
			setAdding(null)
		}
	}

	const handleRemoveMember = async (memberId: string) => {
		setRemoving(memberId)
		const previousMembers = [...members]
		setMembers((prev) => prev.filter((m) => m.id !== memberId))
		try {
			const result = await removeMember(memberId)
			if (result.success) {
				toast.success('Membro removido com sucesso')
				router.refresh()
			} else {
				setMembers(previousMembers)
				setError(result.error || 'Erro ao remover membro')
				toast.error(result.error || 'Erro ao remover membro')
			}
		} catch (e) {
			setMembers(previousMembers)
			setError(e instanceof Error ? e.message : 'Erro ao remover membro')
		} finally {
			setRemoving(null)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{members.length} membro{members.length !== 1 ? 's' : ''} na
					organização
				</p>

				<Dialog onOpenChange={setOpen} open={open}>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline">
							<UserPlus className="mr-2 h-4 w-4" />
							Adicionar membro
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Adicionar Membro</DialogTitle>
						</DialogHeader>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<ul className="max-h-72 space-y-2 overflow-y-auto">
							{nonMembers.length === 0 && (
								<li className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
									<UserPlus className="h-8 w-8 opacity-30" />
									<p className="text-sm">
										Nenhum usuário disponível para adicionar.
									</p>
								</li>
							)}
							{nonMembers.map((user) => (
								<li
									className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
									key={user.id}
								>
									<Avatar className="h-8 w-8 shrink-0">
										<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
											{getInitials(user.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{user.name}</p>
										<p className="truncate text-muted-foreground text-xs">
											{user.email}
										</p>
									</div>
									<Button
										disabled={adding === user.id}
										onClick={() => handleAddMember(user.id)}
										size="sm"
										variant="outline"
									>
										{adding === user.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											'Adicionar'
										)}
									</Button>
								</li>
							))}
						</ul>
						<DialogClose asChild>
							<Button className="w-full" variant="outline">
								Fechar
							</Button>
						</DialogClose>
					</DialogContent>
				</Dialog>
			</div>

			{error && !open && (
				<div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
					{error}
				</div>
			)}

			{/* Campo de busca */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
				<Input
					placeholder="Buscar por nome ou e-mail..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* Lista com scroll */}
			<Card className="p-4">
				<ScrollArea className="h-100">
					<ul className="space-y-2 pr-3">
						{filteredMembers.length === 0 && (
							<li className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
								<Search className="h-6 w-6 opacity-30" />
								<p className="text-sm">Nenhum membro encontrado.</p>
							</li>
						)}
						{filteredMembers.map((member) => (
							<li
								className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/20"
								key={member.id}
							>
								<Avatar className="h-9 w-9 shrink-0">
									<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
										{getInitials(member.user.name)}
									</AvatarFallback>
								</Avatar>

								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="truncate font-semibold text-sm">
											{member.user.name}
										</p>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColor[member.role] ?? 'bg-muted text-muted-foreground'}`}
										>
											{roleLabels[member.role] ?? member.role}
										</span>
									</div>
									<p className="truncate text-muted-foreground text-xs">
										{member.user.email}
									</p>
								</div>

								<div className="ml-2 flex shrink-0 items-center gap-2">
									<Select
										defaultValue={member.role}
										onValueChange={(value) =>
											handleRoleChange(member.id, value as Role)
										}
									>
										<SelectTrigger className="h-8 w-44 text-xs">
											<SelectValue placeholder="Papel" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="OWNER">Dono</SelectItem>
											<SelectItem value="ADMIN">Administrador</SelectItem>
											<SelectItem value="FISCAL_PRINCIPAL">
												Fiscal Tecnico
											</SelectItem>
											<SelectItem value="FISCAL_SETORIAL">
												Fiscal Administrativo
											</SelectItem>
											<SelectItem value="GESTOR_CONTRATOS">
												Gestor de Contratos
											</SelectItem>
											<SelectItem value="SUPORT">Suporte</SelectItem>
											<SelectItem value="USER">Usuário</SelectItem>
										</SelectContent>
									</Select>

									<Button
										disabled={removing === member.id}
										onClick={() => handleRemoveMember(member.id)}
										size="icon"
										variant="ghost"
										className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
									>
										{removing === member.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
									</Button>
								</div>
							</li>
						))}
					</ul>
				</ScrollArea>
			</Card>
		</div>
	)
}
