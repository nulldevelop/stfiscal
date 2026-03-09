'use client'

import {
	IconCheck,
	IconDeviceFloppy,
	IconEdit,
	IconEye,
	IconLoader2,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
	type ModulePermission,
	updateMemberPermissions,
} from '../_actions/update-member-permissions'

type MemberPermission = {
	id: string
	modulo: {
		key: string
		name: string
	}
	canCreate: boolean
	canRead: boolean
	canUpdate: boolean
	canDelete: boolean
}

type Member = {
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

const ACTIONS = [
	{ key: 'canCreate', label: 'Criar', icon: IconPlus, color: 'text-green-600' },
	{ key: 'canRead', label: 'Ver', icon: IconEye, color: 'text-blue-600' },
	{
		key: 'canUpdate',
		label: 'Editar',
		icon: IconEdit,
		color: 'text-amber-600',
	},
	{
		key: 'canDelete',
		label: 'Excluir',
		icon: IconTrash,
		color: 'text-red-600',
	},
] as const

type PermissionCardProps = {
	member: Member
	modules: { key: string; label: string }[]
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

const ROLE_COLORS: Record<string, string> = {
	OWNER:
		'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800',
	ADMIN:
		'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800',
	SUPORT:
		'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800',
	FISCAL_PRINCIPAL:
		'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800',
	FISCAL_SETORIAL:
		'bg-teal-500/10 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-800',
	GESTOR_CONTRATOS:
		'bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-800',
	USER: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800',
}

export function PermissionCard({ member, modules }: PermissionCardProps) {
	const [permissions, setPermissions] = useState<
		Record<string, ModulePermission>
	>(() => {
		const initial: Record<string, ModulePermission> = {}
		for (const mod of modules) {
			const existing = member.permissions.find((p) => p.modulo.key === mod.key)
			initial[mod.key] = {
				module: mod.key,
				canCreate: existing?.canCreate ?? false,
				canRead: existing?.canRead ?? true,
				canUpdate: existing?.canUpdate ?? false,
				canDelete: existing?.canDelete ?? false,
			}
		}
		return initial
	})

	const [saving, setSaving] = useState(false)

	const handleToggle = (module: string, action: keyof ModulePermission) => {
		if (member.role === 'OWNER') return

		setPermissions((prev) => ({
			...prev,
			[module]: {
				...prev[module],
				[action]: !prev[module][action as keyof ModulePermission],
			},
		}))
	}

	const handleSave = async () => {
		setSaving(true)
		const result = await updateMemberPermissions(
			member.id,
			Object.values(permissions),
		)
		setSaving(false)

		if (result.success) {
			toast.success('Permissões atualizadas')
		} else {
			toast.error(result.error)
		}
	}

	const isOwner = member.role === 'OWNER'
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CardHeader className="pb-4">
					<CollapsibleTrigger className="w-full">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10 ring-2 ring-background">
									<AvatarImage src={member.user.image || ''} />
									<AvatarFallback className="bg-primary/10 font-semibold text-primary">
										{member.user.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 text-left">
									<p className="truncate font-semibold text-sm">
										{member.user.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{member.user.email}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className={`${ROLE_COLORS[member.role] ?? ROLE_COLORS.USER} font-medium`}
								>
									{ROLE_LABELS[member.role] ?? member.role}
								</Badge>
								{isOwner && (
									<Badge
										variant="secondary"
										className="bg-primary/10 text-primary"
									>
										<IconCheck className="mr-1 h-3 w-3" />
										Acesso Total
									</Badge>
								)}
							</div>
						</div>
					</CollapsibleTrigger>
				</CardHeader>

				<CollapsibleContent>
					<CardContent className="pt-0">
						{isOwner ? (
							<div className="rounded-lg border border-dashed /30 p-6 text-center">
								<IconCheck className="mx-auto h-8 w-8 text-primary mb-2" />
								<p className="text-sm font-medium">
									Proprietário da Organização
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Possui acesso completo a todos os módulos e funcionalidades
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{modules.map((mod) => (
									<div
										key={mod.key}
										className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5"
									>
										<div className="mb-3 flex items-center justify-between">
											<h4 className="font-semibold text-sm">{mod.label}</h4>
											<div className="flex gap-1">
												{ACTIONS.map((action) => {
													const isActive = permissions[mod.key]?.[
														action.key as keyof ModulePermission
													] as boolean
													return (
														<div
															key={action.key}
															className={`flex h-6 w-6 items-center justify-center rounded ${
																isActive
																	? 'bg-primary/10 text-primary'
																	: 'text-muted-foreground/30'
															}`}
															title={action.label}
														>
															<action.icon className="h-3.5 w-3.5" />
														</div>
													)
												})}
											</div>
										</div>
										<div className="grid grid-cols-2 gap-3">
											{ACTIONS.map((action) => (
												<div
													key={action.key}
													className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
												>
													<Label
														htmlFor={`${member.id}-${mod.key}-${action.key}`}
														className="flex items-center gap-2 text-sm font-medium cursor-pointer"
													>
														<action.icon
															className={`h-4 w-4 ${action.color}`}
														/>
														{action.label}
													</Label>
													<Switch
														id={`${member.id}-${mod.key}-${action.key}`}
														checked={
															permissions[mod.key]?.[
																action.key as keyof ModulePermission
															] as boolean
														}
														onCheckedChange={() =>
															handleToggle(
																mod.key,
																action.key as keyof ModulePermission,
															)
														}
													/>
												</div>
											))}
										</div>
									</div>
								))}
								<Button
									onClick={handleSave}
									disabled={saving}
									className="w-full"
									size="default"
								>
									{saving ? (
										<>
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
											Salvando Permissões...
										</>
									) : (
										<>
											<IconDeviceFloppy className="mr-2 h-4 w-4" />
											Salvar Permissões
										</>
									)}
								</Button>
							</div>
						)}
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	)
}
