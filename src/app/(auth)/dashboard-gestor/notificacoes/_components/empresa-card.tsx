'use client'

import { Building2, ChevronDown, ChevronUp, FileText, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { EmpresaWithNotifications, NotificationWithHistorico } from '../_data-access/get-notifications-by-empresa'
import { NotificationItem } from './notification-item'

interface EmpresaCardProps {
	empresa: EmpresaWithNotifications
}

export function EmpresaCard({ empresa }: EmpresaCardProps) {
	const [isOpen, setIsOpen] = useState(false)

	const totalHistorico = empresa.notifications.reduce((acc, n) => acc + n.historicoCount, 0)

	return (
		<Card className="mb-4">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CardHeader className="pb-3">
					<CollapsibleTrigger asChild>
						<div className="flex cursor-pointer items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">{empresa.empresaNome}</CardTitle>
									<p className="text-muted-foreground text-sm">CNPJ: {empresa.empresaCnpj}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex gap-2">
									<Badge variant="secondary" className="gap-1">
										<FileText className="h-3 w-3" />
										{empresa.notifications.length} notificações
									</Badge>
									{totalHistorico > 0 && (
										<Badge variant="outline" className="gap-1">
											<MessageSquare className="h-3 w-3" />
											{totalHistorico} históricos
										</Badge>
									)}
								</div>
								<Button variant="ghost" size="sm">
									{isOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</CollapsibleTrigger>
				</CardHeader>
				<CollapsibleContent>
					<CardContent className="pt-0">
						<ScrollArea className={empresa.notifications.length > 5 ? "h-[400px] pr-4" : ""}>
							<div className="space-y-2">
								{empresa.notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
									/>
								))}
							</div>
						</ScrollArea>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	)
}
