/** biome-ignore-all lint/suspicious/noExplicitAny: dev */
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatData } from '@/utils/formatData'

type Notification = {
	id: string
	createdAt: Date
	type: string
	contratoNumero: number
	protocolo: string
	filePath: string
	[key: string]: any
}

interface NotificationsTableProps {
	notifications: Notification[]
	total: number
	page: number
	pageSize: number
}

export function NotificationsTable({
	notifications,
	total,
	page,
	pageSize,
}: NotificationsTableProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', String(newPage))
		router.replace(`${pathname}?${params.toString()}`)
	}

	const totalPages = Math.ceil(total / pageSize)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Histórico de Notificações Enviadas</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Protocolo</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Contrato</TableHead>
							<TableHead>Data de Envio</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{notifications.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									Nenhuma notificação encontrada.
								</TableCell>
							</TableRow>
						) : (
							notifications.map((notification) => (
								<TableRow key={notification.id}>
									<TableCell className="font-mono">
										{notification.protocolo}
									</TableCell>
									<TableCell>{notification.type}</TableCell>
									<TableCell>{notification.contratoNumero}</TableCell>
									<TableCell>{formatData(notification.createdAt)}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												window.open(notification.filePath, '_blank')
											}
										>
											Ver Detalhes
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<div className="text-xs text-muted-foreground">
					Mostrando <strong>{notifications.length}</strong> de{' '}
					<strong>{total}</strong> notificações
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page - 1)}
						disabled={page <= 1}
					>
						Anterior
					</Button>
					<span className="text-sm">
						Página {page} de {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page + 1)}
						disabled={page >= totalPages}
					>
						Próximo
					</Button>
				</div>
			</CardFooter>
		</Card>
	)
}
