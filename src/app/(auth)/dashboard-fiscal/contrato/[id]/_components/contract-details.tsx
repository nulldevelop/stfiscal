import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Calendar, Eye, FileText, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContractDetailsProps {
	contrato: any
}

export function ContractDetails({ contrato }: ContractDetailsProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-xl font-bold flex items-center gap-2">
					<FileText className="h-5 w-5 text-green-600" />
					{contrato.displayContrato}
				</CardTitle>
				{contrato.idOxy && (
					<a
						href={`https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/contratos/detalhes?id=${contrato.idOxy}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-sm text-green-600 hover:underline"
					>
						Ver no Portal <Eye className="h-3 w-3" />
					</a>
				)}
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
							<Building2 className="h-4 w-4" /> Contratado
						</p>
						<p className="text-sm font-semibold">{contrato.contratado}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
							<Hash className="h-4 w-4" /> Licitação
						</p>
						<p className="text-sm font-semibold">{contrato.displayLicitacao}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
							<Calendar className="h-4 w-4" /> Período
						</p>
						<p className="text-sm">
							{format(new Date(contrato.dataInicio), 'dd/MM/yyyy', {
								locale: ptBR,
							})}{' '}
							à{' '}
							{format(new Date(contrato.dataFim), 'dd/MM/yyyy', {
								locale: ptBR,
							})}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
							Status
						</p>
						<Badge
							variant="outline"
							className="bg-green-50 text-green-700 border-green-200 uppercase"
						>
							{contrato.tipoAto || 'Contrato'}
						</Badge>
					</div>
					<div className="col-span-1 md:col-span-2 space-y-1 mt-2">
						<p className="text-sm font-medium text-muted-foreground">Objeto</p>
						<p className="text-sm leading-relaxed text-foreground">
							{contrato.objeto || contrato.licitacao?.objeto || 'Não informado'}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
