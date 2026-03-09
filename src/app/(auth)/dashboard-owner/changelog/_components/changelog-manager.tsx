/** biome-ignore-all lint/correctness/useUniqueElementIds: dev */
'use client'

import {
	IconEdit,
	IconLoader2,
	IconPlus,
	IconToggleLeft,
	IconToggleRight,
	IconTrash,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createSystemUpdate } from '../_actions/create-system-update'
import { deleteSystemUpdate } from '../_actions/delete-system-update'
import { toggleActiveSystemUpdate } from '../_actions/toggle-active-system-update'
import { updateSystemUpdate } from '../_actions/update-system-update'
import { getSystemUpdates } from '../_data-access/get-system-updates'

const ELIGIBLE_ROLES = [
	'OWNER',
	'ADMIN',
	'SUPORT',
	'FISCAL_SETORIAL',
	'GESTOR_CONTRATOS',
	'USER',
] as const
type EligibleRole = (typeof ELIGIBLE_ROLES)[number]

const ROLE_LABELS: Record<EligibleRole, string> = {
	OWNER: 'Dono',
	ADMIN: 'Gestor',
	SUPORT: 'Suporte',
	FISCAL_SETORIAL: 'Fiscal Administrativo',
	GESTOR_CONTRATOS: 'Gestor de Contratos',
	USER: 'Usuário',
}

type SystemUpdate = {
	id: string
	title: string
	description: string
	version: string | null
	isActive: boolean
	targetRoles: string | null
	createdAt: Date
	updatedAt: Date
}

function parseTargetRoles(raw: string | null): EligibleRole[] {
	if (!raw) return []
	try {
		const parsed = JSON.parse(raw)
		if (Array.isArray(parsed)) return parsed as EligibleRole[]
	} catch {}
	return []
}

function PublicoBadges({ targetRoles }: { targetRoles: string | null }) {
	const roles = parseTargetRoles(targetRoles)
	if (roles.length === 0) {
		return <Badge variant="outline">Todos</Badge>
	}
	return (
		<div className="flex flex-wrap gap-1">
			{roles.map((r) => (
				<Badge key={r} variant="secondary" className="text-xs">
					{ROLE_LABELS[r] ?? r}
				</Badge>
			))}
		</div>
	)
}

export function ChangelogManager() {
	const [updates, setUpdates] = useState<SystemUpdate[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selected, setSelected] = useState<SystemUpdate | null>(null)
	const [saving, setSaving] = useState(false)

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [version, setVersion] = useState('')
	const [isActive, setIsActive] = useState(true)
	const [targetRoles, setTargetRoles] = useState<EligibleRole[]>([])

	const loadUpdates = useCallback(async () => {
		setLoading(true)
		const result = await getSystemUpdates()
		if (result.success && result.data) {
			setUpdates(result.data as SystemUpdate[])
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		loadUpdates()
	}, [loadUpdates])

	const openCreateDialog = () => {
		setSelected(null)
		setTitle('')
		setDescription('')
		setVersion('')
		setIsActive(true)
		setTargetRoles([])
		setDialogOpen(true)
	}

	const openEditDialog = (update: SystemUpdate) => {
		setSelected(update)
		setTitle(update.title)
		setDescription(update.description)
		setVersion(update.version || '')
		setIsActive(update.isActive)
		setTargetRoles(parseTargetRoles(update.targetRoles))
		setDialogOpen(true)
	}

	const openDeleteDialog = (update: SystemUpdate) => {
		setSelected(update)
		setDeleteDialogOpen(true)
	}

	const toggleRole = (role: EligibleRole) => {
		setTargetRoles((prev) =>
			prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
		)
	}

	const handleSave = async () => {
		if (!title.trim() || !description.trim()) {
			toast.error('Título e descrição são obrigatórios')
			return
		}

		setSaving(true)

		if (selected) {
			const result = await updateSystemUpdate({
				id: selected.id,
				title,
				description,
				version: version || undefined,
				isActive,
				targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
			})
			if (result.success) {
				toast.success('Atualização salva')
				setDialogOpen(false)
				loadUpdates()
			} else {
				toast.error(result.error || 'Erro ao salvar')
			}
		} else {
			const result = await createSystemUpdate({
				title,
				description,
				version: version || undefined,
				isActive,
				targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
			})
			if (result.success) {
				toast.success('Atualização criada')
				setDialogOpen(false)
				loadUpdates()
			} else {
				toast.error(result.error || 'Erro ao criar')
			}
		}

		setSaving(false)
	}

	const handleDelete = async () => {
		if (!selected) return

		const result = await deleteSystemUpdate(selected.id)
		if (result.success) {
			toast.success('Atualização excluída')
			setDeleteDialogOpen(false)
			setSelected(null)
			loadUpdates()
		} else {
			toast.error(result.error || 'Erro ao excluir')
		}
	}

	const handleToggle = async (update: SystemUpdate) => {
		const result = await toggleActiveSystemUpdate(update.id)
		if (result.success) {
			toast.success(update.isActive ? 'Desativado' : 'Ativado')
			loadUpdates()
		} else {
			toast.error(result.error || 'Erro ao alternar status')
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Changelog do Sistema</h1>
					<p className="text-muted-foreground">
						Gerencie as atualizações e comunicados exibidos aos usuários
					</p>
				</div>
				<Button onClick={openCreateDialog}>
					<IconPlus className="mr-2 h-4 w-4" />
					Nova Atualização
				</Button>
			</div>

			{updates.length === 0 ? (
				<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6">
					<div className="text-center">
						<p className="text-muted-foreground">
							Nenhuma atualização cadastrada
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={openCreateDialog}
						>
							<IconPlus className="mr-2 h-4 w-4" />
							Criar primeira atualização
						</Button>
					</div>
				</div>
			) : (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Título</TableHead>
								<TableHead>Versão</TableHead>
								<TableHead>Público</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Data</TableHead>
								<TableHead className="w-32">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{updates.map((update) => (
								<TableRow key={update.id}>
									<TableCell className="font-medium">{update.title}</TableCell>
									<TableCell>
										{update.version ? (
											<code className="rounded px-2 py-1 text-sm">
												{update.version}
											</code>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell>
										<PublicoBadges targetRoles={update.targetRoles} />
									</TableCell>
									<TableCell>
										<Badge variant={update.isActive ? 'default' : 'secondary'}>
											{update.isActive ? 'Ativo' : 'Inativo'}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(update.createdAt).toLocaleDateString('pt-BR')}
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleToggle(update)}
												title={update.isActive ? 'Desativar' : 'Ativar'}
											>
												{update.isActive ? (
													<IconToggleRight className="h-4 w-4 text-green-600" />
												) : (
													<IconToggleLeft className="h-4 w-4 text-muted-foreground" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditDialog(update)}
											>
												<IconEdit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openDeleteDialog(update)}
											>
												<IconTrash className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Dialog criar/editar */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{selected ? 'Editar Atualização' : 'Nova Atualização'}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Título</Label>
							<Input
								id="title"
								placeholder="Ex: Novas funcionalidades de campeonato"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="version">Versão (opcional)</Label>
							<Input
								id="version"
								placeholder="Ex: v1.2.0"
								value={version}
								onChange={(e) => setVersion(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								placeholder="Descreva as mudanças desta atualização..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={6}
							/>
						</div>
						<div className="grid gap-2">
							<Label>
								Público-alvo{' '}
								<span className="text-muted-foreground font-normal text-xs">
									(nenhum = todos)
								</span>
							</Label>
							<div className="flex flex-wrap gap-3">
								{ELIGIBLE_ROLES.map((role) => (
									<div key={role} className="flex items-center gap-2">
										<Checkbox
											id={`role-${role}`}
											checked={targetRoles.includes(role)}
											onCheckedChange={() => toggleRole(role)}
										/>
										<Label
											htmlFor={`role-${role}`}
											className="cursor-pointer font-normal"
										>
											{ROLE_LABELS[role]}
										</Label>
									</div>
								))}
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Switch
								id="isActive"
								checked={isActive}
								onCheckedChange={setIsActive}
							/>
							<Label htmlFor="isActive">Ativo (visível para usuários)</Label>
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSave} disabled={saving}>
							{saving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
							{selected ? 'Salvar' : 'Criar'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Dialog confirmar exclusão */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir atualização</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja excluir{' '}
							<strong>&ldquo;{selected?.title}&rdquo;</strong>? Esta ação não
							pode ser desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Excluir
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
