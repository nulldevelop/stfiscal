'use client'

import { IconFileDescription, IconUsers } from '@tabler/icons-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const actions = [
	{
		icon: IconUsers,
		label: 'Membros',
		description: 'Gerenciar membros',
		href: '/dashboard-owner/settings',
	},
	{
		icon: IconFileDescription,
		label: 'Relatórios',
		description: 'Ver relatórios',
		href: '/dashboard-owner/',
	},
]

export function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Ações Rápidas</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 sm:grid-cols-2">
					{actions.map((action) => {
						const Icon = action.icon
						return (
							<Button
								key={action.label}
								variant="outline"
								className="h-auto flex-col items-start gap-2 p-4 text-left"
								asChild
							>
								<Link href={action.href}>
									<div className="rounded-lg  p-2">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<div className="font-semibold">{action.label}</div>
										<div className="text-xs text-muted-foreground">
											{action.description}
										</div>
									</div>
								</Link>
							</Button>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
