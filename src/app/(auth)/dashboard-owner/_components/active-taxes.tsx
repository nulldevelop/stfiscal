import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
	id: string
	name: string
	image: string
	contract: string
	contractStatus: 'active' | 'pending' | 'expired'
}

interface RecentUsersListProps {
	users?: User[]
	maxUsers?: number
}

export function RecentUsersList({ users, maxUsers = 5 }: RecentUsersListProps) {
	const defaultUsers: User[] = [
		{
			id: '1',
			name: 'Ana Silva',
			image: '/professional-woman-diverse.png',
			contract: 'Contrato Premium',
			contractStatus: 'active',
		},
		{
			id: '2',
			name: 'Carlos Santos',
			image: '/professional-man.jpg',
			contract: 'Contrato Básico',
			contractStatus: 'active',
		},
		{
			id: '3',
			name: 'Maria Oliveira',
			image: '/confident-business-woman.png',
			contract: 'Contrato Enterprise',
			contractStatus: 'pending',
		},
		{
			id: '4',
			name: 'João Pereira',
			image: '/confident-businessman.png',
			contract: 'Contrato Premium',
			contractStatus: 'active',
		},
		{
			id: '5',
			name: 'Fernanda Costa',
			image: '/professional-woman-smiling.png',
			contract: 'Contrato Básico',
			contractStatus: 'expired',
		},
	]

	const displayUsers = (users || defaultUsers).slice(0, maxUsers)

	const getStatusColor = (status: User['contractStatus']) => {
		switch (status) {
			case 'active':
				return 'bg-green-500/10 text-green-700 dark:text-green-400'
			case 'pending':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
			case 'expired':
				return 'bg-red-500/10 text-red-700 dark:text-red-400'
			default:
				return ' text-muted-foreground'
		}
	}

	const getStatusLabel = (status: User['contractStatus']) => {
		switch (status) {
			case 'active':
				return 'Ativo'
			case 'pending':
				return 'Pendente'
			case 'expired':
				return 'Expirado'
			default:
				return status
		}
	}

	const getInitials = (name: string) =>
		name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Últimos Usuários</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{displayUsers.map((user) => (
						<div
							className="flex items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:/50"
							key={user.id}
						>
							<Avatar className="h-12 w-12">
								<AvatarImage
									alt={user.name}
									src={user.image || '/placeholder.svg'}
								/>
								<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-1">
								<p className="font-medium leading-none">{user.name}</p>
								<p className="text-muted-foreground text-sm">{user.contract}</p>
							</div>
							<Badge
								className={getStatusColor(user.contractStatus)}
								variant="secondary"
							>
								{getStatusLabel(user.contractStatus)}
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
