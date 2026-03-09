'use client'

import { IconEdit, IconLoader2, IconPlus, IconTrash } from '@tabler/icons-react'
import { useCallback, useEffect, useId, useState } from 'react'
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { createModule } from '../_actions/create-module'
import { deleteModule } from '../_actions/delete-module'
import { updateModule } from '../_actions/update-module'
import { getModules } from '../_data-access/get-modules'

type PermissionModule = {
	key: string
	memberCount: number
}

export function ModulesList() {
	const [modules, setModules] = useState<PermissionModule[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selectedModule, setSelectedModule] = useState<PermissionModule | null>(
		null,
	)
	const [saving, setSaving] = useState(false)
	const [key, setKey] = useState('')
	const keyId = useId()

	const loadModules = useCallback(async () => {
		setLoading(true)
		const result = await getModules()
		if (result.success && result.data) {
			setModules(result.data)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		loadModules()
	}, [loadModules])

	const openCreateDialog = () => {
		setSelectedModule(null)
		setKey('')
		setDialogOpen(true)
	}

	const openEditDialog = (mod: PermissionModule) => {
		setSelectedModule(mod)
		setKey(mod.key)
		setDialogOpen(true)
	}

	const openDeleteDialog = (mod: PermissionModule) => {
		setSelectedModule(mod)
		setDeleteDialogOpen(true)
	}

	const handleSave = async () => {
		if (!key.trim()) {
			toast.error('Chave é obrigatória')
			return
		}

		setSaving(true)

		if (selectedModule) {
			const result = await updateModule({
				oldKey: selectedModule.key,
				newKey: key,
			})
			if (result.success) {
				toast.success('Módulo atualizado')
				setDialogOpen(false)
				loadModules()
			} else {
				toast.error(result.error || 'Erro ao atualizar')
			}
		} else {
			const result = await createModule({ key })
			if (result.success) {
				toast.success('Módulo criado')
				setDialogOpen(false)
				loadModules()
			} else {
				toast.error(result.error || 'Erro ao criar')
			}
		}

		setSaving(false)
	}

	const handleDelete = async () => {
		if (!selectedModule) return

		const result = await deleteModule(selectedModule.key)
		if (result.success) {
			toast.success('Módulo excluído')
			setDeleteDialogOpen(false)
			setSelectedModule(null)
			loadModules()
		} else {
			toast.error(result.error || 'Erro ao excluir')
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
					<h1 className="text-2xl font-bold">Módulos de Permissão</h1>
					<p className="text-muted-foreground">
						Gerencie os módulos disponíveis para controle de permissões
					</p>
				</div>
				<Button onClick={openCreateDialog}>
					<IconPlus className="mr-2 h-4 w-4" />
					Novo Módulo
				</Button>
			</div>

			{modules.length === 0 ? (
				<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-12">
					<div className="text-center">
						<p className="text-muted-foreground">Nenhum módulo cadastrado</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={openCreateDialog}
						>
							<IconPlus className="mr-2 h-4 w-4" />
							Cadastrar primeiro módulo
						</Button>
					</div>
				</div>
			) : (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Chave</TableHead>
								<TableHead>Membros</TableHead>
								<TableHead className="w-24">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{modules.map((mod) => (
								<TableRow key={mod.key}>
									<TableCell>
										<code className="rounded  px-2 py-1 text-sm">
											{mod.key}
										</code>
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{mod.memberCount}</Badge>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditDialog(mod)}
											>
												<IconEdit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openDeleteDialog(mod)}
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

			{/* Dialog de criar/editar */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-2 py-4">
						<div className="grid gap-2">
							<Label htmlFor={keyId}>Chave</Label>
							<Input
								id={keyId}
								placeholder="Ex: championships"
								value={key}
								onChange={(e) => setKey(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								Identificador único usado internamente. Apenas letras
								minúsculas, números e hífens.
							</p>
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSave} disabled={saving}>
							{saving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
							{selectedModule ? 'Salvar' : 'Criar'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Dialog de confirmação de exclusão */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir módulo</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja excluir o módulo{' '}
							<strong>{selectedModule?.key}</strong>? Todas as permissões de
							membros associadas a este módulo também serão removidas.
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
