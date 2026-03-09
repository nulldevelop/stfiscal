'use client'

import { IconCalendar, IconUser } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentMember {
	id: string
	name: string
	email: string
	image: string | null
	role: string
	organizationName: string
	createdAt: Date
}

const roleConfig: Record<string, { label: string; className: string }> = {
	OWNER: {
		label: 'Proprietário',
		className:
			'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0',
	},
	ADMIN: {
		label: 'Administrador',
		className:
			'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0',
	},
	GESTOR_CONTRATOS: {
		label: 'Gestor',
		className:
			'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0',
	},
	FISCAL_PRINCIPAL: {
		label: 'Fiscal Tecnico',
		className:
			'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0',
	},
	FISCAL_SETORIAL: {
		label: 'Fiscal Administrativo',
		className:
			'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-0',
	},
	USER: {
		label: 'Usuário',
		className:
			'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0',
	},
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function formatDate(date: Date) {
	return new Date(date).toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

export function RecentMembersList({ members }: { members: RecentMember[] }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
						<IconUser className="h-4 w-4 text-violet-600 dark:text-violet-400" />
					</div>
					Membros Recentes
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				{members.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
						<IconUser className="mb-2 h-8 w-8 opacity-20" />
						<p className="text-sm">Nenhum membro cadastrado ainda.</p>
					</div>
				) : (
					<div className="divide-y">
						{members.map((member) => {
							const role = roleConfig[member.role] ?? {
								label: member.role,
								className: 'border-0',
							}
							return (
								<div
									key={member.id}
									className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
								>
									<Avatar className="h-9 w-9 flex-shrink-0">
										<AvatarImage
											src={member.image ?? undefined}
											alt={member.name}
										/>
										<AvatarFallback className="text-xs font-semibold">
											{getInitials(member.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium leading-tight">
											{member.name}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{member.email}
										</p>
									</div>
									<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
										<Badge className={`text-xs font-medium ${role.className}`}>
											{role.label}
										</Badge>
										<span className="flex items-center gap-1 text-xs text-muted-foreground">
											<IconCalendar className="h-3 w-3" />
											{formatDate(member.createdAt)}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
