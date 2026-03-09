import { ExternalLink, FileText, History, Info } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { EditLicitacaoForm } from '../_components/edit-licitacao-form'
import { LicitacaoContractsList } from '../_components/licitacao-contracts-list'
import { LicitacaoReportsList } from '../_components/licitacao-reports-list'
import { getLicitacaoDetails } from '../_data-access/get-licitacao-details'

interface PageProps {
	params: Promise<{ id: string }>
}

const MODALIDADE_MAP: Record<string, number> = {
	CONVITE: 1,
	TOMADA_DE_PRECO: 2,
	CONCORRENCIA: 3,
	CONCURSO: 4,
	LEILAO: 5,
	PREGAO: 6,
	DISPENSA: 7,
	INEXIGIBILIDADE: 9,
	RDC: 10,
	COMPRA_DIRETA: 13,
	LEI_13303: 14,
	CHAMAMENTO: 1001,
}

export default async function LicitacaoDetailsPage({ params }: PageProps) {
	const { id } = await params
	const licitacao = await getLicitacaoDetails(id)

	if (!licitacao) {
		notFound()
	}

	const tipoLicitacao = MODALIDADE_MAP[licitacao.modalidade] || 6
	const portalUrl = `https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/licitacoes/detalhes?entidade=1&exercicio=${licitacao.ano}&tipoLicitacao=${tipoLicitacao}&licitacao=${licitacao.numero}`

	return (
		<div className="flex flex-col gap-6 p-6 text-foreground">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<BackButton />
					<h1 className="text-3xl font-bold tracking-tight">
						Licitação {licitacao.numero}/{licitacao.ano}
					</h1>
					<Badge
						variant="outline"
						className="border-blue-500 text-blue-700 bg-blue-50"
					>
						{licitacao.modalidade}
					</Badge>
					<Badge variant="secondary">{licitacao.situacao}</Badge>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-blue-600"
									asChild
								>
									<a href={portalUrl} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="h-5 w-5" />
									</a>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Ver no Portal da Transparência</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<p className="text-muted-foreground line-clamp-2 max-w-3xl">
					{licitacao.objeto}
				</p>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-3 lg:w-125">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<Info className="h-4 w-4" /> Informações
					</TabsTrigger>
					<TabsTrigger value="contracts" className="flex items-center gap-2">
						<FileText className="h-4 w-4" /> Contratos
					</TabsTrigger>
					<TabsTrigger value="reports" className="flex items-center gap-2">
						<History className="h-4 w-4" /> Relatórios
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Editar Licitação</CardTitle>
						</CardHeader>
						<CardContent>
							<EditLicitacaoForm licitacao={licitacao} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="contracts" className="mt-6">
					<LicitacaoContractsList contracts={licitacao.Contratos} />
				</TabsContent>

				<TabsContent value="reports" className="mt-6">
					<LicitacaoReportsList reports={licitacao.bensEServicosReports} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
