import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	ArrowLeft,
	Building2,
	CalendarRange,
	Download,
	FileText,
	Gavel,
	ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AditivosManager } from './_components/aditivos-manager'
import { EmpenhosPanel } from './_components/empenhos-panel'
import { FiscaisManager } from './_components/fiscais-manager'
import { getContratoDetail } from './_data-access/get-contrato-detail'

interface Props {
	params: Promise<{ id: string }>
}

const MODALIDADE_LABEL: Record<string, string> = {
	PREGAO: 'Pregão',
	CONCORRENCIA: 'Concorrência',
	TOMADA_DE_PRECO: 'Tomada de Preço',
	CONVITE: 'Convite',
	LEILAO: 'Leilão',
	AGUARDANDO: 'Aguardando',
}

const SITUACAO_LABEL: Record<string, string> = {
	VIGENTE: 'Vigente',
	CONCLUIDA: 'Concluída',
	CANCELADA: 'Cancelada',
	SUSPENSA: 'Suspensa',
	AGUARDANDO: 'Aguardando',
	ANDAMENTO: 'Em Andamento',
}

function fmt(date: Date) {
	return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export default async function ContratoDetailPage({ params }: Props) {
	const { id } = await params
	const result = await getContratoDetail(id)

	if (!result.success) notFound()

	const c = result.data
	const hoje = new Date()
	const vencido = c.dataFim < hoje

	return (
		<div className="space-y-6 px-4 py-2">
			{/* Header */}
			<div className="flex items-center gap-2">
				<Link
					href="/dashboard-gestor/contratos"
					className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Contratos
				</Link>
				<Separator orientation="vertical" className="h-4" />
				<h1 className="text-2xl font-semibold text-foreground">
					Contrato {c.displayContrato}
				</h1>
				{vencido ? (
					<Badge variant="destructive">Vencido</Badge>
				) : (
					<Badge variant="default">Ativo</Badge>
				)}
			</div>

			<div className="grid grid-cols-1 gap-2">
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<FileText className="h-4 w-4" />
									Dados do Contrato
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<p className="text-muted-foreground">Número</p>
									<p className="font-medium">{c.displayContrato}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Tipo de Ato</p>
									<p className="font-medium">{c.tipoAto}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Exercício</p>
									<p className="font-medium">{c.exercicio}</p>
								</div>
								<div className="flex flex-col md:flex-row gap-2">
									<p className="text-muted-foreground">Início</p>
									<p className="font-medium">{fmt(c.dataInicio)}</p>
									<p className="text-muted-foreground ml-2">Fim</p>
									<p
										className={`font-medium ${vencido ? 'text-destructive' : ''}`}
									>
										{fmt(c.dataFim)}
									</p>
								</div>
								<div className="col-span-2 mt-2">
									<p className="text-muted-foreground">Objeto</p>
									<p className="font-medium leading-relaxed">
										{c.licitacao.objeto}
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<Gavel className="h-4 w-4" />
									Licitação
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div>
									<p className="text-muted-foreground">Número</p>
									<Link
										href={`/dashboard-gestor/licitacoes/${c.licitacao.id}`}
										className="font-medium text-primary hover:underline"
									>
										{c.displayLicitacao}
									</Link>
								</div>
								<div>
									<p className="text-muted-foreground">Modalidade</p>
									<p className="font-medium">
										{MODALIDADE_LABEL[c.licitacao.modalidade] ??
											c.licitacao.modalidade}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Situação</p>
									<Badge variant="outline">
										{SITUACAO_LABEL[c.licitacao.situacao] ??
											c.licitacao.situacao}
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Building2 className="h-4 w-4" />
								Empresa Contratada
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-2 text-sm">
							<div className="col-span-2">
								<p className="text-muted-foreground">Razão Social</p>
								<p className="font-medium">{c.empresa.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground">CNPJ</p>
								<p className="font-medium">{c.empresa.cnpj ?? '—'}</p>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{/* Relatórios */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<CalendarRange className="h-4 w-4" />
									Relatórios Recentes
								</CardTitle>
							</CardHeader>
							<CardContent>
								{(() => {
									const allReports = [
										...c.bensEServicosReports.map((r) => ({
											...r,
											cat: 'Bens e Serviços',
										})),
										...(c.licitacao?.transporteReports || []).map((r: any) => ({
											...r,
											cat: 'Transporte',
										})),
										...(c.licitacao?.obrasReports || []).map((r: any) => ({
											...r,
											cat: 'Obras',
										})),
									].sort(
										(a, b) =>
											new Date(b.createdAt).getTime() -
											new Date(a.createdAt).getTime(),
									)

									if (allReports.length === 0)
										return (
											<p className="text-sm text-muted-foreground">
												Nenhum relatório lançado.
											</p>
										)

									return (
										<div className="space-y-2">
											{allReports.slice(0, 10).map((r) => (
												<div
													key={r.id}
													className="flex items-center justify-between rounded border px-3 py-2 text-sm"
												>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium">{r.protocolo}</span>
															<Badge
																variant="outline"
																className="text-[10px] h-4 px-1"
															>
																{r.cat}
															</Badge>
														</div>
														<p className="text-[10px] text-muted-foreground mt-0.5">
															{fmt(r.createdAt)}
														</p>
													</div>
													<Link
														href={`/api/reports/${r.protocolo}.pdf`}
														target="_blank"
														className="text-primary hover:bg-accent p-2 rounded-full transition-colors"
														title="Download PDF"
													>
														<Download className="h-4 w-4" />
													</Link>
												</div>
											))}
										</div>
									)
								})()}
							</CardContent>
						</Card>

						{/* Notificações */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<ShieldCheck className="h-4 w-4" />
									Notificações Recentes
								</CardTitle>
							</CardHeader>
							<CardContent>
								{(() => {
									const allNotificacoes = [
										...c.assinaturasNotificacoes.map((n) => ({
											...n,
											cat: 'Geral',
										})),
										...c.entregaNotificacoes.map((n) => ({
											...n,
											cat: 'Entrega',
										})),
										...c.entregaIncompletaNotificacoes.map((n) => ({
											...n,
											cat: 'Entrega Incompleta',
										})),
										...c.notificacoesFiscalTrabalhista.map((n) => ({
											...n,
											cat: 'Fiscal/Trabalhista',
										})),
										...c.notificacoesDesconformidade.map((n) => ({
											...n,
											cat: 'Desconformidade',
										})),
									].sort(
										(a, b) =>
											new Date(b.createdAt).getTime() -
											new Date(a.createdAt).getTime(),
									)

									if (allNotificacoes.length === 0)
										return (
											<p className="text-sm text-muted-foreground">
												Nenhuma notificação emitida.
											</p>
										)

									return (
										<div className="space-y-2">
											{allNotificacoes.slice(0, 10).map((n) => (
												<div
													key={n.id}
													className="flex items-center justify-between rounded border px-3 py-2 text-sm"
												>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium">{n.tipo}</span>
															<Badge
																variant="outline"
																className="text-[10px] h-4 px-1"
															>
																{n.cat}
															</Badge>
														</div>
														<p className="text-[10px] text-muted-foreground mt-0.5">
															{fmt(n.dataEnvio)}
														</p>
													</div>
													<Link
														href={`/api/notifications/${n.assinaturaDigital}.pdf`}
														target="_blank"
														className="text-primary hover:bg-accent p-2 rounded-full transition-colors"
														title="Download PDF"
													>
														<Download className="h-4 w-4" />
													</Link>
												</div>
											))}
										</div>
									)
								})()}
							</CardContent>
						</Card>
					</div>

					<Card>
						<FiscaisManager
							contratoId={c.id}
							fiscalPrincipal={
								c.fiscalPrincipal
									? {
											id: c.fiscalPrincipal.member.user.id,
											memberId: c.fiscalPrincipal.member.id,
											name: c.fiscalPrincipal.member.user.name,
											cargo: c.fiscalPrincipal.member.fiscalCargo,
											matricula: c.fiscalPrincipal.member.fiscalMatricula,
										}
									: null
							}
							setoriais={c.setoriais.map((s) => ({
								id: s.member.user.id,
								memberId: s.member.id,
								name: s.member.user.name,
								cargo: s.member.fiscalCargo,
							}))}
						/>
					</Card>

					<EmpenhosPanel contratoId={c.id} />

					<AditivosManager contratoId={c.id} aditivos={c.aditivos} />
				</div>
			</div>
		</div>
	)
}
