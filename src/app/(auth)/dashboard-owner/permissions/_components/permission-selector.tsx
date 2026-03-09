'use client'

import { IconDeviceFloppy, IconLock } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateMemberPermissions } from '../_actions/update-member-permissions'

type PermKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete'

interface MemberPermission {
	modulo: {
		key: string
		name: string
	}
	canCreate: boolean
	canRead: boolean
	canUpdate: boolean
	canDelete: boolean
}

interface Member {
	id: string
	role: string
	user: {
		id: string
		name: string
		email: string
		image: string | null
	}
	permissions: MemberPermission[]
}

interface Module {
	key: string
	label: string
}

interface PermissionSelectorProps {
	members: Member[]
	modules: Module[]
}

const ROLE_LABELS: Record<string, string> = {
	OWNER: 'Proprietário',
	ADMIN: 'Administrador',
	SUPORT: 'Suporte',
	FISCAL_PRINCIPAL: 'Fiscal Tecnico',
	FISCAL_SETORIAL: 'Fiscal Administrativo',
	GESTOR_CONTRATOS: 'Gestor de Contratos',
	USER: 'Usuário',
}

const PERMISSIONS: { key: PermKey; label: string; description: string }[] = [
	{
		key: 'canCreate',
		label: 'Criar',
		description: 'Permite criar novos registros',
	},
	{ key: 'canRead', label: 'Visualizar', description: 'Permite ver registros' },
	{
		key: 'canUpdate',
		label: 'Editar',
		description: 'Permite editar registros existentes',
	},
	{
		key: 'canDelete',
		label: 'Excluir',
		description: 'Permite remover registros',
	},
]

const DEFAULT_PERMS: Record<PermKey, boolean> = {
	canCreate: false,
	canRead: true,
	canUpdate: false,
	canDelete: false,
}

function getPermissionsFromMember(
	member: Member | undefined,
	moduleKey: string,
): Record<PermKey, boolean> {
	if (!member) return DEFAULT_PERMS
	const existing = member.permissions.find((p) => p.modulo.key === moduleKey)
	if (!existing) return DEFAULT_PERMS
	return {
		canCreate: existing.canCreate,
		canRead: existing.canRead,
		canUpdate: existing.canUpdate,
		canDelete: existing.canDelete,
	}
}

export function PermissionSelector({
	members,
	modules,
}: PermissionSelectorProps) {
	const router = useRouter()
	const [selectedMemberId, setSelectedMemberId] = useState('')
	const [selectedModule, setSelectedModule] = useState('')
	const [perms, setPerms] = useState<Record<PermKey, boolean>>(DEFAULT_PERMS)
	const [saving, setSaving] = useState(false)

	const selectedMember = members.find((m) => m.id === selectedMemberId)
	const selectedModuleObj = modules.find((m) => m.key === selectedModule)

	const handleMemberChange = (memberId: string) => {
		setSelectedMemberId(memberId)
		if (selectedModule) {
			const member = members.find((m) => m.id === memberId)
			setPerms(getPermissionsFromMember(member, selectedModule))
		}
	}

	const handleModuleChange = (moduleKey: string) => {
		setSelectedModule(moduleKey)
		if (selectedMemberId) {
			setPerms(getPermissionsFromMember(selectedMember, moduleKey))
		}
	}

	const handleSave = async () => {
		if (!selectedMemberId || !selectedModule) return
		setSaving(true)
		const result = await updateMemberPermissions(selectedMemberId, [
			{ module: selectedModule, ...perms },
		])
		setSaving(false)
		if (result.success) {
			toast.success('Permissões salvas!')
			router.refresh()
		} else {
			toast.error(result.error ?? 'Erro ao salvar permissões')
		}
	}

	const memberOptions = members.map((m) => ({
		value: m.id,
		label: m.user.name,
		description: m.user.email,
	}))

	const moduleOptions = modules.map((m) => ({
		value: m.key,
		label: m.label,
	}))

	const bothSelected = !!selectedMemberId && !!selectedModule
	const isOwner = selectedMember?.role === 'OWNER'

	return (
		<div className="space-y-6">
			{/* Seletores */}
			<div className="grid gap-2 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label className="text-sm font-medium">Membro</Label>
					<Combobox
						options={memberOptions}
						value={selectedMemberId}
						onChange={handleMemberChange}
						placeholder="Selecionar membro..."
						searchPlaceholder="Pesquisar por nome ou e-mail..."
						emptyText="Nenhum membro encontrado."
					/>
				</div>
				<div className="space-y-1.5">
					<Label className="text-sm font-medium">Módulo</Label>
					<Combobox
						options={moduleOptions}
						value={selectedModule}
						onChange={handleModuleChange}
						placeholder="Selecionar módulo..."
						searchPlaceholder="Pesquisar módulo..."
						emptyText="Nenhum módulo encontrado."
					/>
				</div>
			</div>

			{/* Painel de permissões */}
			{bothSelected && selectedMember ? (
				<Card>
					<CardHeader className="pb-4">
						<div className="flex flex-wrap items-center gap-3">
							<Avatar className="h-10 w-10 ring-2 ring-background">
								<AvatarImage src={selectedMember.user.image ?? ''} />
								<AvatarFallback className="bg-primary/10 font-semibold text-primary">
									{selectedMember.user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="truncate font-semibold">
										{selectedMember.user.name}
									</p>
									<Badge variant="outline" className="shrink-0 text-xs">
										{ROLE_LABELS[selectedMember.role] ?? selectedMember.role}
									</Badge>
								</div>
								<p className="truncate text-muted-foreground text-sm">
									{selectedMember.user.email}
								</p>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{selectedModuleObj?.label ?? selectedModule}
							</Badge>
						</div>
					</CardHeader>

					<CardContent>
						{isOwner ? (
							<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed /40 py-8 text-center transition-colors">
								<IconLock className="h-8 w-8 text-muted-foreground/40" />
								<p className="font-medium text-sm">
									Proprietário — Acesso Total
								</p>
								<p className="text-muted-foreground text-xs">
									As permissões do proprietário não podem ser alteradas.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid gap-3 sm:grid-cols-2">
									{PERMISSIONS.map(({ key, label, description }) => (
										<div
											key={key}
											className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 hover:/30 transition-colors duration-200"
										>
											<div className="min-w-0">
												<Label
													htmlFor={key}
													className="cursor-pointer font-medium text-sm"
												>
													{label}
												</Label>
												<p className="text-muted-foreground text-xs">
													{description}
												</p>
											</div>
											<Switch
												id={key}
												checked={perms[key]}
												onCheckedChange={(checked) =>
													setPerms((prev) => ({ ...prev, [key]: checked }))
												}
											/>
										</div>
									))}
								</div>

								<Button
									className="w-full"
									onClick={handleSave}
									disabled={saving}
								>
									<IconDeviceFloppy className="mr-2 h-4 w-4" />
									{saving ? 'Salvando...' : 'Salvar Permissões'}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed /20 py-16 text-center text-muted-foreground">
					<IconLock className="h-8 w-8 opacity-30" />
					<p className="font-medium">Selecione um membro e um módulo</p>
					<p className="text-sm">para configurar as permissões de acesso</p>
				</div>
			)}
		</div>
	)
}
