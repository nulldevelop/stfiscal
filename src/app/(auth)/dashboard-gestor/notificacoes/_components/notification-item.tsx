'use client'

import { Calendar, Download, FileText, MessageSquare, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatData } from '@/utils/formatData'
import type { NotificationWithHistorico } from '../_data-access/get-notifications-by-empresa'

interface NotificationItemProps {
	notification: NotificationWithHistorico
}

export function NotificationItem({ notification }: NotificationItemProps) {
	return (
		<div
			className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
		>
			<div className="flex items-center gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100 dark:bg-orange-900/30">
					<FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
				</div>
				<div>
					<p className="font-medium text-sm">{notification.title}</p>
					<div className="flex items-center gap-3 text-muted-foreground text-xs">
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{formatData(notification.createdAt)}
						</span>
						<span className="flex items-center gap-1">
							<User className="h-3 w-3" />
							{notification.fiscalNome ?? 'Desconhecido'}
						</span>
						<span>Contrato: {notification.contratoNumero}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{notification.historicoCount > 0 && (
					<Badge variant="outline" className="gap-1">
						<MessageSquare className="h-3 w-3" />
						{notification.historicoCount}
					</Badge>
				)}
				<Button variant="outline" size="sm" asChild>
					<Link href={`/dashboard-gestor/notificacoes/${notification.tipoNotificacao}/${notification.id}`}>
						Ver Histórico
					</Link>
				</Button>
				{notification.filePath && (
					<Button size="sm" asChild>
						<a href={notification.filePath} download>
							<Download className="mr-1 h-3 w-3" />
							PDF
						</a>
					</Button>
				)}
			</div>
		</div>
	)
}
