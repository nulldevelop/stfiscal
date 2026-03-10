'use client'

import {
	IconBuildingBank,
	IconFileDescription,
	IconShield,
	IconUsers,
} from '@tabler/icons-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricsData {
	organizationsTotal: number
	membersTotal: number
	contratosTotal: number
	fiscaisAtivos: number
}

const getMetrics = (data: MetricsData) => [
	{
		label: 'Organizações',
		value: data.organizationsTotal,
		description: 'cadastradas no sistema',
		icon: IconBuildingBank,
		iconColor: 'text-blue-600 dark:text-blue-400',
		iconBg: 'bg-blue-50 dark:bg-blue-950/60',
		borderColor: 'border-l-blue-500',
	},
	{
		label: 'Membros',
		value: data.membersTotal,
		description: 'usuários cadastrados',
		icon: IconUsers,
		iconColor: 'text-violet-600 dark:text-violet-400',
		iconBg: 'bg-violet-50 dark:bg-violet-950/60',
		borderColor: 'border-l-violet-500',
	},
	{
		label: 'Contratos',
		value: data.contratosTotal,
		description: 'registrados',
		icon: IconFileDescription,
		iconColor: 'text-amber-600 dark:text-amber-400',
		iconBg: 'bg-amber-50 dark:bg-amber-950/60',
		borderColor: 'border-l-amber-500',
	},
	{
		label: 'Fiscais Ativos',
		value: data.fiscaisAtivos,
		description: 'em atuação',
		icon: IconShield,
		iconColor: 'text-emerald-600 dark:text-emerald-400',
		iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
		borderColor: 'border-l-emerald-500',
	},
]

export function Metrics({ data }: { data: MetricsData }) {
	const metrics = getMetrics(data)

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{metrics.map((m) => {
				const Icon = m.icon
				return (
					<Card
						key={m.label}
						className={`border-l-4 ${m.borderColor} transition-shadow hover:shadow-md`}
					>
						<CardContent className="p-5">
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-col gap-1">
									<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										{m.label}
									</span>
									<span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
										{m.value.toLocaleString('pt-BR')}
									</span>
									<span className="text-xs text-muted-foreground">
										{m.description}
									</span>
								</div>
								<div
									className={`flex-shrink-0 rounded-xl p-2.5 ${m.iconBg}`}
								>
									<Icon className={`h-5 w-5 ${m.iconColor}`} />
								</div>
							</div>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
