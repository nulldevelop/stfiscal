'use client'

import { Bell, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface FiscalNotificationsListProps {
	notifications: any[]
}

export function FiscalNotificationsList({ notifications }: FiscalNotificationsListProps) {
	if (!notifications.length) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					Nenhuma notificação registrada por este fiscal.
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Histórico de Notificações</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tipo</TableHead>
							<TableHead>Data</TableHead>
							<TableHead>Contrato</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{notifications.map((notif) => (
							<TableRow key={notif.id}>
								<TableCell className="font-medium">
									{notif.tipo}
								</TableCell>
								<TableCell>
									{new Date(notif.dataEnvio).toLocaleDateString('pt-BR')}
								</TableCell>
								<TableCell>ID: {notif.contratoId.substring(0, 8)}...</TableCell>
								<TableCell className="text-right">
									<Button variant="ghost" size="sm" asChild>
										<Link href={`/dashboard-gestor/notificacoes/${notif.id}`}>
											<Eye className="h-4 w-4 mr-2" />
											Detalhes
										</Link>
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
