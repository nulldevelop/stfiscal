'use client'

import {
	IconActivity,
	IconCirclePlus,
	IconEdit,
	IconTrash,
} from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentAuditLog {
	id: string
	action: 'CREATE' | 'UPDATE' | 'DELETE'
	entity: string
	entityName: string
	userName: string
	userEmail: string
	organizationName: string
	createdAt: Date
}

const actionConfig = {
	CREATE: {
		label: 'Criação',
		icon: IconCirclePlus,
		dot: 'bg-blue-500',
		badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
	},
	UPDATE: {
		label: 'Atualização',
		icon: IconEdit,
		dot: 'bg-blue-500',
		badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
	},
	DELETE: {
		label: 'Remoção',
		icon: IconTrash,
		dot: 'bg-red-500',
		badge: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400',
	},
} as const

function formatRelativeTime(date: Date) {
	const diff = Date.now() - new Date(date).getTime()
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) return 'agora'
	if (minutes < 60) return `${minutes}min atrás`
	if (hours < 24) return `${hours}h atrás`
	return `${days}d atrás`
}

export function RecentReportsList({ reports }: { reports: RecentAuditLog[] }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
						<IconActivity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
					</div>
					Atividade Recente
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				{reports.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
						<IconActivity className="mb-2 h-8 w-8 opacity-20" />
						<p className="text-sm">Nenhuma atividade registrada ainda.</p>
					</div>
				) : (
					<div className="relative">
						<div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
						<div className="space-y-4">
							{reports.map((log) => {
								const config = actionConfig[log.action]
								const Icon = config.icon
								return (
									<div key={log.id} className="relative flex gap-4">
										<div
											className={`relative z-10 mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-background ${config.dot}`}
										/>
										<div className="min-w-0 flex-1 pb-1">
											<div className="flex flex-wrap items-start justify-between gap-1">
												<div className="flex flex-wrap items-center gap-1.5">
													<span className="text-sm font-medium leading-tight">
														{log.entityName !== '-'
															? log.entityName
															: log.entity}
													</span>
													<span
														className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}
													>
														<Icon className="h-3 w-3" />
														{config.label}
													</span>
												</div>
												<span className="flex-shrink-0 text-xs text-muted-foreground">
													{formatRelativeTime(log.createdAt)}
												</span>
											</div>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{log.userName} · {log.organizationName}
											</p>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
