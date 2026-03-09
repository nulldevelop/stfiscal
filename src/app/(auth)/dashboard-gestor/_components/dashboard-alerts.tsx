'use client'

import {
	AlertCircle,
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	Info,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatData } from '@/utils/formatData'
import {
	type DashboardAlert,
	getDashboardAlerts,
} from '../_data-access/get-dashboard-alerts'

export function DashboardAlerts() {
	const [alerts, setAlerts] = useState<DashboardAlert[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			const result = await getDashboardAlerts()
			if (result.success && result.data) {
				setAlerts(result.data)
			}
			setLoading(false)
		}
		load().catch(() => setLoading(false))
	}, [])

	const getIcon = (type: string) => {
		switch (type) {
			case 'error':
				return <AlertCircle className="h-4 w-4 text-red-500" />
			case 'warning':
				return <AlertTriangle className="h-4 w-4 text-orange-500" />
			case 'success':
				return <CheckCircle className="h-4 w-4 text-green-500" />
			default:
				return <Info className="h-4 w-4 text-blue-500" />
		}
	}

	const getBgColor = (type: string) => {
		switch (type) {
			case 'error':
				return 'bg-red-500/10'
			case 'warning':
				return 'bg-orange-500/10'
			case 'success':
				return 'bg-green-500/10'
			default:
				return 'bg-blue-500/10'
		}
	}

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle>Alertas do Sistema</CardTitle>
			</CardHeader>
			<CardContent className="flex-1">
				{loading ? (
					<div className="flex h-68 items-center justify-center">
						<p className="animate-pulse text-muted-foreground text-sm">
							Carregando alertas...
						</p>
					</div>
				) : alerts.length > 0 ? (
					<ScrollArea className="h-68 overflow-y-auto pr-4">
						<div className="space-y-4">
							{alerts.map((alert) => (
								<div
									key={alert.id}
									className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
								>
									<div
										className={`mt-0.5 rounded-full p-1.5 ${getBgColor(alert.type)}`}
									>
										{getIcon(alert.type)}
									</div>
									<div className="flex-1 space-y-1">
										<p className="font-medium text-sm leading-none">
											{alert.title}
										</p>
										<p className="text-muted-foreground text-xs leading-relaxed">
											{alert.description}
										</p>
										<div className="flex items-center justify-between mt-2">
											<span className="text-[10px] text-muted-foreground uppercase">
												{formatData(alert.createdAt)}
											</span>
											{alert.link && (
												<Link href={alert.link}>
													<Button
														variant="link"
														size="sm"
														className="h-auto p-0 text-xs"
													>
														Ver <ArrowRight className="ml-1 h-3 w-3" />
													</Button>
												</Link>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				) : (
					<div className="flex h-68 flex-col items-center justify-center gap-2">
						<CheckCircle className="h-8 w-8 text-muted-foreground/30" />
						<p className="text-muted-foreground text-sm">
							Nenhum alerta pendente
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
