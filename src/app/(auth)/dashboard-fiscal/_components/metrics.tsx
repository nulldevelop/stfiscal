import { AlertCircle, Briefcase, CheckCircle2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricsProps {
	totalContratos: number
	totalRelatoriosMes: number
	hasPendingReports: boolean
}

export function Metrics({
	totalContratos,
	totalRelatoriosMes,
	hasPendingReports,
}: MetricsProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4 md:px-0">
			<Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-green-500/10 via-background to-background">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 pt-3 px-3 md:px-6">
					<CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Contratos
					</CardTitle>
					<div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg shrink-0">
						<Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
					</div>
				</CardHeader>
				<CardContent className="px-3 md:px-6 pb-3 md:pb-6">
					<div className="text-xl md:text-3xl font-bold tracking-tight">
						{totalContratos}
					</div>
					<p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
						Sob sua fiscalização
					</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-blue-500/10 via-background to-background">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 pt-3 px-3 md:px-6">
					<CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Relatórios
					</CardTitle>
					<div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg shrink-0">
						<FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
					</div>
				</CardHeader>
				<CardContent className="px-3 md:px-6 pb-3 md:pb-6">
					<div className="text-xl md:text-3xl font-bold tracking-tight">
						{totalRelatoriosMes}
					</div>
					<p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
						Enviados este mês
					</p>
				</CardContent>
			</Card>

			<Card
				className={cn(
					'overflow-hidden border-none shadow-md bg-linear-to-br via-background to-background transition-all duration-300 col-span-2 md:col-span-1',
					hasPendingReports
						? 'from-red-500/10 dark:from-red-500/20'
						: 'from-purple-500/10 dark:from-purple-500/20',
				)}
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 pt-3 px-3 md:px-6">
					<CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Status Geral
					</CardTitle>
					<div
						className={cn(
							'p-1.5 md:p-2 rounded-lg shrink-0',
							hasPendingReports ? 'bg-red-500/10' : 'bg-purple-500/10',
						)}
					>
						{hasPendingReports ? (
							<AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600" />
						) : (
							<CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
						)}
					</div>
				</CardHeader>
				<CardContent className="px-3 md:px-6 pb-3 md:pb-6">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								'text-xl md:text-3xl font-bold tracking-tight transition-colors',
								hasPendingReports ? 'text-red-600' : 'text-foreground',
							)}
						>
							{hasPendingReports ? 'Irregular' : 'Regular'}
						</div>
					</div>
					<p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
						{hasPendingReports
							? 'Relatórios pendentes identificados'
							: 'Todas as obrigações estão em dia'}
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
