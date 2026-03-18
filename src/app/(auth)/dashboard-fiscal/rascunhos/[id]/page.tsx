/** biome-ignore-all lint/correctness/useExhaustiveDependencies: dev */
/** biome-ignore-all lint/suspicious/noImplicitAnyLet: dev */
'use client'

import {
	AlertTriangle,
	ArrowLeft,
	FileCheck,
	Loader2,
	Printer,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	getBensEServicosReportById,
	getObrasReportById,
	getTerceirizacaoReportById,
	getTransporteReportById,
} from '../../relatorios/_data-access/get-drafts'
import { finalizeBensEServicosReport } from '../../relatorios/bens-e-servicos/_actions/finalize-bens-e-servicos-report'
import { finalizeObrasReport } from '../../relatorios/obras/_actions/finalize-obras-report'
import { finalizeTransporteReport } from '../../relatorios/servicos-transporte/_actions/finalize-transporte-report'
import { finalizeTerceirizacaoReport } from '../../relatorios/terceirizacao/_actions/finalize-terceirizacao-report'

interface Props {
	params: Promise<{ id: string }>
}

type ReportType = 'TERCEIRIZACAO' | 'BENS_SERVICOS' | 'TRANSPORTE' | 'OBRAS'

const CONFIRMATION_TEXT = 'Estou ciente'

export default function RascunhoDetailPage({ params }: Props) {
	const [report, setReport] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [isPending, startTransition] = useTransition()
	const [reportId, setReportId] = useState<string>('')
	const [reportType, setReportType] = useState<ReportType>('TERCEIRIZACAO')
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [confirmationInput, setConfirmationInput] = useState('')

	const isConfirmationValid =
		confirmationInput.trim().toLowerCase() === CONFIRMATION_TEXT.toLowerCase()

	useEffect(() => {
		params.then((p) => {
			setReportId(p.id)
			loadReport(p.id)
		})
	}, [params])

	async function loadReport(id: string) {
		try {
			let data: any = await getTerceirizacaoReportById(id)
			if (data) {
				setReportType('TERCEIRIZACAO')
				setReport(data)
				setLoading(false)
				return
			}

			data = await getBensEServicosReportById(id)
			if (data) {
				setReportType('BENS_SERVICOS')
				setReport(data)
				setLoading(false)
				return
			}

			data = await getTransporteReportById(id)
			if (data) {
				setReportType('TRANSPORTE')
				setReport(data)
				setLoading(false)
				return
			}

			data = await getObrasReportById(id)
			if (data) {
				setReportType('OBRAS')
				setReport(data)
				setLoading(false)
				return
			}

			setReport(null)
		} catch (error) {
			console.error(error)
			toast.error('Erro ao carregar relatório')
		} finally {
			setLoading(false)
		}
	}

	function handleOpenConfirmDialog() {
		setConfirmationInput('')
		setShowConfirmDialog(true)
	}

	function handleFinalize() {
		setShowConfirmDialog(false)
		setConfirmationInput('')

		startTransition(async () => {
			let result
			switch (reportType) {
				case 'TERCEIRIZACAO':
					result = await finalizeTerceirizacaoReport({ reportId })
					break
				case 'BENS_SERVICOS':
					result = await finalizeBensEServicosReport({ reportId })
					break
				case 'TRANSPORTE':
					result = await finalizeTransporteReport({ reportId })
					break
				case 'OBRAS':
					result = await finalizeObrasReport({ reportId })
					break
			}

			if (!result?.success) {
				toast.error(result?.error || 'Erro ao finalizar relatório')
			} else if (result.data?.filePath) {
				toast.success(result.data.message)
				const link = document.createElement('a')
				link.href = result.data.filePath
				link.download = result.data.filePath.split('/').pop() ?? 'relatorio.pdf'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			}
		})
	}

	const reportTypeLabels: Record<ReportType, string> = {
		TERCEIRIZACAO: 'Terceirização de Mão de Obra',
		BENS_SERVICOS: 'Bens e Serviços',
		TRANSPORTE: 'Serviços de Transporte',
		OBRAS: 'Obras',
	}

	const reportTypePaths: Record<ReportType, string> = {
		TERCEIRIZACAO: 'terceirizacao',
		BENS_SERVICOS: 'bens-e-servicos',
		TRANSPORTE: 'servicos-transporte',
		OBRAS: 'obras',
	}

	const yesNoFields = [
		'manutencaoCondicoesHabilitacao',
		'certidaoDebitosFederais',
		'certidaoDebitosEstadual',
		'certidaoDebitosMunicipal',
		'certidaoRegularidadeFGTS',
		'certidaoNegativaDebitosTrabalhistas',
		'cumprimentoObrigacoes',
		'atendeChamados',
		'prepostoAcessivel',
		'recebeuNotificacao',
		'realizaSubcontratacaoIlegal',
		'houveDescoberturaPosto',
		'houveDescontoNota',
		'veiculosBomEstado',
		'documentacaoVeiculosMotoristasRegular',
		'motoristasSegurosCorteses',
		'solicitacoesAtendidas',
		'subcontratacaoIlegal',
		'houveAditivo',
		'subcontratadaCumpreObrigacoes',
		'contratadaEncaminhaDocumentacaoSubcontratada',
		'manutencaoHabitacaoFiscalTrabalhista',
		'certidaoDebitosCreditosFederais',
		'certidaoDebitosCreditosEstadual',
		'certidaoDebitosCreditosMunicipal',
		'controlePrazoExecucao',
		'controleQualidadeMateriais',
		'controleQualidadeProjeto',
	]

	const formatValue = (key: string, value: any): string => {
		if (value === null || value === undefined || value === '') return '-'
		if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
		if (yesNoFields.includes(key)) return value
		if (typeof value === 'object') return JSON.stringify(value)
		return String(value)
	}

	const SectionField = ({
		label,
		value,
		className = '',
	}: {
		label: string
		value: string
		className?: string
	}) => (
		<div className={`space-y-1 ${className}`}>
			<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
				{label}
			</p>
			<p className="text-sm leading-relaxed">{value}</p>
		</div>
	)

	const YesNoBadge = ({ value }: { value: string }) => {
		const variants: Record<
			string,
			'default' | 'destructive' | 'secondary' | 'outline'
		> = {
			Sim: 'default',
			Não: 'destructive',
			'Não se aplica': 'secondary',
		}
		return <Badge variant={variants[value] || 'outline'}>{value}</Badge>
	}

	const Section = ({
		title,
		children,
	}: {
		title: string
		children: React.ReactNode
	}) => (
		<div className="border rounded-lg overflow-hidden">
			<div className="bg-muted/50 px-4 py-2 border-b">
				<h3 className="font-semibold text-sm uppercase tracking-wider">
					{title}
				</h3>
			</div>
			<div className="p-4">{children}</div>
		</div>
	)

	if (loading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!report) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center">
				<p className="text-muted-foreground">Relatório não encontrado</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard-fiscal/rascunhos">Voltar</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto space-y-6 pb-24">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/dashboard-fiscal/rascunhos">
							<ArrowLeft className="h-5 w-5" />
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-2xl">
							Pré-visualização do Relatório
						</h1>
						<p className="text-muted-foreground">
							Protocolo: {report.protocolo} • {reportTypeLabels[reportType]}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-amber-500 border-amber-500">
						Rascunho
					</Badge>
				</div>
			</div>

			<div className="bg-white dark:bg-black border rounded-lg p-6 shadow-sm">
				<div className="text-center border-b pb-4 mb-6">
					<h2 className="font-bold text-lg uppercase">Prefeitura Municipal</h2>
					<p className="text-sm text-muted-foreground">
						Secretaria de Finanças
					</p>
					<h3 className="font-bold text-xl mt-4">RELATÓRIO DE FISCALIZAÇÃO</h3>
					<p className="text-sm">{reportTypeLabels[reportType]}</p>
				</div>

				<Section title="1. Identificação do Contrato">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<SectionField
							label="Secretaria"
							value={report.secretariaNome || '-'}
						/>
						<SectionField
							label="Licitação"
							value={report.licitacaoModalidadeNumero || '-'}
						/>
						<SectionField
							label="Contrato"
							value={report.contratoNumero || '-'}
						/>
						<SectionField label="Contratada" value={report.contratada || '-'} />
						<SectionField
							label="Período Analisado"
							value={`${report.periodoAnalisadoInicio ? new Date(report.periodoAnalisadoInicio).toLocaleDateString('pt-BR') : '-'} até ${report.periodoAnalisadoFim ? new Date(report.periodoAnalisadoFim).toLocaleDateString('pt-BR') : '-'}`}
						/>
						<SectionField
							label="Objeto"
							value={report.objeto || '-'}
							className="md:col-span-2"
						/>
					</div>
				</Section>

				<Section title="2. Regularidade Fiscal">
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'manutencaoCondicoesHabilitacao',
									report.manutencaoCondicoesHabilitacao,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Manutenção Condições Habilitação
							</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'certidaoDebitosFederais',
									report.certidaoDebitosFederais,
								)}
							/>
							<p className="text-xs text-muted-foreground">Débitos Federais</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'certidaoDebitosEstadual',
									report.certidaoDebitosEstadual,
								)}
							/>
							<p className="text-xs text-muted-foreground">Débitos Estadual</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'certidaoDebitosMunicipal',
									report.certidaoDebitosMunicipal,
								)}
							/>
							<p className="text-xs text-muted-foreground">Débitos Municipal</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'certidaoRegularidadeFGTS',
									report.certidaoRegularidadeFGTS,
								)}
							/>
							<p className="text-xs text-muted-foreground">FGTS</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'certidaoNegativaDebitosTrabalhistas',
									report.certidaoNegativaDebitosTrabalhistas,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Débitos Trabalhistas
							</p>
						</div>
					</div>
					{(report.regularidadeFiscalTrabalhistaObs ||
						report.certificadosObs) && (
						<div className="mt-4 pt-4 border-t">
							<SectionField
								label="Observações"
								value={
									report.regularidadeFiscalTrabalhistaObs ||
									report.certificadosObs ||
									'-'
								}
							/>
						</div>
					)}
				</Section>

				<Section title="3. Execução Contratual">
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'cumprimentoObrigacoes',
									report.cumprimentoObrigacoes,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Cumprimento Obrigações
							</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue('atendeChamados', report.atendeChamados)}
							/>
							<p className="text-xs text-muted-foreground">Atende Chamados</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'prepostoAcessivel',
									report.prepostoAcessivel,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Preposto Acessível
							</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'recebeuNotificacao',
									report.recebeuNotificacao,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Recebeu Notificação
							</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'realizaSubcontratacaoIlegal',
									report.realizaSubcontratacaoIlegal,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Subcontratação Ilegal
							</p>
						</div>
						<div className="space-y-2">
							<YesNoBadge
								value={formatValue(
									'garantiaContratual',
									report.garantiaContratual,
								)}
							/>
							<p className="text-xs text-muted-foreground">
								Garantia Contratual
							</p>
						</div>
					</div>
				</Section>

				{reportType === 'TERCEIRIZACAO' && (
					<Section title="4. Especificidades - Terceirização">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'houveDescoberturaPosto',
										report.houveDescoberturaPosto,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Houve Descobertura de Posto
								</p>
							</div>
							{report.houveDescoberturaPosto === 'Sim' && (
								<>
									<SectionField
										label="Local"
										value={report.descoberturaLocal || '-'}
									/>
									<SectionField
										label="Tempo"
										value={report.descoberturaTempo || '-'}
									/>
								</>
							)}
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'houveDescontoNota',
										report.houveDescontoNota,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Houve Desconto na Nota
								</p>
							</div>
							{report.houveDescontoNota === 'Sim' && (
								<SectionField
									label="Valor do Desconto"
									value={report.descontoValor || '-'}
								/>
							)}
							{report.houveDescontoNota === 'Não' && (
								<SectionField
									label="Motivo Não Desconto"
									value={report.descontoMotivoNão || '-'}
									className="col-span-2"
								/>
							)}
						</div>
					</Section>
				)}

				{reportType === 'TRANSPORTE' && (
					<Section title="4. Especificidades - Transporte">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'veiculosBomEstado',
										report.veiculosBomEstado,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Veículos em Bom Estado
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'documentacaoVeiculosMotoristasRegular',
										report.documentacaoVeiculosMotoristasRegular,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Documentação Regular
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'motoristasSegurosCorteses',
										report.motoristasSegurosCorteses,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Motoristas Seguros
								</p>
							</div>
						</div>
					</Section>
				)}

				{reportType === 'OBRAS' && (
					<Section title="4. Especificidades - Obras">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'controlePrazoExecucao',
										report.controlePrazoExecucao,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Controle Prazo Execução
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'controleQualidadeMateriais',
										report.controleQualidadeMateriais,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Controle Qualidade Materiais
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'controleQualidadeProjeto',
										report.controleQualidadeProjeto,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Controle Qualidade Projeto
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue('houveAditivo', report.houveAditivo)}
								/>
								<p className="text-xs text-muted-foreground">Houve Aditivo</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'subcontratacaoIlegal',
										report.subcontratacaoIlegal,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Subcontratação Ilegal
								</p>
							</div>
							<div className="space-y-2">
								<YesNoBadge
									value={formatValue(
										'solicitacoesAtendidas',
										report.solicitacoesAtendidas,
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Solicitações Atendidas
								</p>
							</div>
						</div>
					</Section>
				)}

				{(report.irregularidadesPendencias ||
					report.providenciasAdotadas ||
					report.resultados) && (
					<Section title="5. Irregularidades, Providências e Resultados">
						<div className="space-y-4">
							{report.irregularidadesPendencias && (
								<SectionField
									label="Irregularidades/Pendências"
									value={report.irregularidadesPendencias}
								/>
							)}
							{report.providenciasAdotadas && (
								<SectionField
									label="Providências Adotadas"
									value={report.providenciasAdotadas}
								/>
							)}
							{report.resultados && (
								<SectionField label="Resultados" value={report.resultados} />
							)}
						</div>
					</Section>
				)}

				{report.informacoesAdicionais && (
					<Section title="6. Informações Adicionais">
						<SectionField label="" value={report.informacoesAdicionais} />
					</Section>
				)}

				<div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
					<p>
						Este documento é uma pré-visualização do relatório de fiscalização.
					</p>
					<p>
						Ao finalizar, o documento será assinado digitalmente e
						disponibilizado para download.
					</p>
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-4">
				<div className="flex justify-between items-center container mx-auto">
					<Button variant="outline" asChild>
						<Link
							href={`/dashboard-fiscal/relatorios/${reportTypePaths[reportType]}?id=${report.contratoId}&draftId=${report.id}`}
						>
							Editar Rascunho
						</Link>
					</Button>
					<div className="flex gap-3">
						<Button variant="outline" onClick={() => window.print()}>
							<Printer className="mr-2 h-4 w-4" />
							Imprimir
						</Button>
						<Button onClick={handleOpenConfirmDialog} disabled={isPending}>
							{isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<FileCheck className="mr-2 h-4 w-4" />
							)}
							Finalizar e Gerar PDF
						</Button>
					</div>
				</div>
			</div>

			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
							<AlertTriangle className="h-7 w-7 text-amber-600" />
						</div>
						<AlertDialogTitle className="text-center">
							Confirmação de Finalização
						</AlertDialogTitle>
						<AlertDialogDescription className="text-center">
							<span className="block mb-4">
								Ao finalizar este relatório, o documento será{' '}
								<strong>assinado digitalmente</strong> e não poderá mais ser{' '}
								<strong>editado ou excluído</strong>.
							</span>
							<span className="block text-foreground font-medium">
								Esta ação é irreversível. Certifique-se de que todas as
								informações estão corretas antes de continuar.
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="space-y-3 py-4">
						<Label htmlFor="confirmation-input" className="text-sm font-medium">
							Digite{' '}
							<span className="font-bold text-primary">
								"{CONFIRMATION_TEXT}"
							</span>{' '}
							para confirmar:
						</Label>
						<Input
							id="confirmation-input"
							value={confirmationInput}
							onChange={(e) => setConfirmationInput(e.target.value)}
							placeholder={CONFIRMATION_TEXT}
							className="text-center"
							autoComplete="off"
						/>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmationInput('')}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleFinalize}
							disabled={!isConfirmationValid}
							className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<FileCheck className="mr-2 h-4 w-4" />
							Confirmar e Finalizar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
