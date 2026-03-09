'use client'

import { differenceInDays } from 'date-fns'
import { ChevronRight, Eye } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Contrato = {
	id: string
	fiscalContratoId: string
	numero: number
	displayContrato: string
	displayLicitacao: string
	contratado: string
	tipoAto: string | null
	idOxy: string | null
	licitacao: {
		objeto: string
		numero: number
		ano: number
		modalidade: string
	}
	bensEServicosReports: { createdAt: string | Date }[]
}

const MODALIDADE_MAP: Record<string, number> = {
	CONCORRENCIA: 1,
	TOMADA_DE_PRECO: 2,
	CONVITE: 3,
	PREGAO: 6,
	LEILAO: 5,
}

function getLicitacaoPortalUrl(contrato: Contrato) {
	const tipoLicitacao = MODALIDADE_MAP[contrato.licitacao.modalidade] || 6
	return `https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/licitacoes/detalhes?entidade=1&exercicio=${contrato.licitacao.ano}&tipoLicitacao=${tipoLicitacao}&licitacao=${contrato.licitacao.numero}`
}

interface ContratosTableProps {
	contratos: Contrato[]
}

export function ContratosTable({ contratos }: ContratosTableProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 px-4 md:px-0">
			{contratos.map((contrato) => {
				const lastReport = contrato.bensEServicosReports[0]
				const daysSinceLastReport = lastReport
					? differenceInDays(new Date(), new Date(lastReport.createdAt))
					: Infinity
				const isDue = daysSinceLastReport > 30

				return (
					<div
						key={contrato.id}
						className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
					>
						<div className="space-y-4">
							<div className="flex justify-between items-start gap-2">
								<div className="space-y-1 flex-1 min-w-0">
									<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
										Contrato
									</div>
									{contrato.idOxy ? (
										<a
											href={`https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/contratos/detalhes?id=${contrato.idOxy}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1.5 text-green-600 font-bold hover:underline"
										>
											<span className="truncate text-sm">
												{contrato.displayContrato}
											</span>
											<Eye className="h-3.5 w-3.5 shrink-0" />
										</a>
									) : (
										<span className="font-bold block truncate text-sm">
											{contrato.displayContrato}
										</span>
									)}
								</div>
								<div className="shrink-0">
									{isDue ? (
										<Badge variant="destructive" className="px-2 py-0.5">
											Pendente
										</Badge>
									) : (
										<Badge variant="secondary" className="px-2 py-0.5">
											Em dia
										</Badge>
									)}
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
									Contratado
								</div>
								<div className="text-sm font-semibold leading-tight line-clamp-2">
									{contrato.contratado}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 pt-1">
								<div className="space-y-1">
									<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
										Licitação
									</div>
									<a
										href={getLicitacaoPortalUrl(contrato)}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 text-xs text-green-600 hover:underline font-medium"
									>
										<span>{contrato.displayLicitacao}</span>
										<Eye className="h-3 w-3 shrink-0" />
									</a>
								</div>
								<div className="space-y-1">
									<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
										Objeto
									</div>
									<div
										className="text-xs text-muted-foreground line-clamp-3 italic leading-relaxed"
										title={contrato.licitacao.objeto}
									>
										"{contrato.licitacao.objeto}"
									</div>
								</div>
							</div>
						</div>

						<div className="pt-2">
							<Link
								href={`/dashboard-fiscal/contrato/${contrato.id}?fiscalContratoId=${contrato.fiscalContratoId}`}
								className={cn(
									buttonVariants({ variant: 'outline', size: 'default' }),
									'w-full justify-between hover:border-green-600 hover:text-green-600 hover:bg-green-50/50 group border-2 font-bold',
								)}
							>
								<span>Gerenciar Fiscalização</span>
								<ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</div>
					</div>
				)
			})}
		</div>
	)
}
