import { Briefcase, ClipboardCheck, ClockAlert, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsProps {
	totalContratos: number
	totalRelatoriosMes: number
	relatoriosFeitos: number
	relatoriosPendentes: number
}

export function Metrics({
	totalContratos,
	totalRelatoriosMes,
	relatoriosFeitos,
	relatoriosPendentes,
}: MetricsProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
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

			<Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-emerald-500/10 via-background to-background">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 pt-3 px-3 md:px-6">
					<CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Relatórios Feitos
					</CardTitle>
					<div className="p-1.5 md:p-2 bg-emerald-500/10 rounded-lg shrink-0">
						<ClipboardCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
					</div>
				</CardHeader>
				<CardContent className="px-3 md:px-6 pb-3 md:pb-6">
					<div className="text-xl md:text-3xl font-bold tracking-tight text-emerald-600">
						{relatoriosFeitos}
					</div>
					<p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
						Em dia
					</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-orange-500/10 via-background to-background">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 pt-3 px-3 md:px-6">
					<CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Relatórios Pendentes
					</CardTitle>
					<div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg shrink-0">
						<ClockAlert className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />
					</div>
				</CardHeader>
				<CardContent className="px-3 md:px-6 pb-3 md:pb-6">
					<div className="text-xl md:text-3xl font-bold tracking-tight text-orange-600">
						{relatoriosPendentes}
					</div>
					<p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
						Atrasados +30 dias
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
