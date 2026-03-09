'use client'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useFieldArray } from 'react-hook-form'
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
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DynamicFormRenderer } from '../../_components/dynamic-form-renderer'
import { getLotacoes } from '../../_data-access/get-locacoes'
import type { ObrasReportFormValues } from '../_actions/action-schema'
import { createObrasReport } from '../_actions/create-obras-report'
import type { ObrasReportFormProps } from './types'
import { useObrasForm } from './use-obras-form'

export function ObrasReportForm({
	initialContrato,
	formConfig,
}: ObrasReportFormProps) {
	const [isPending, startTransition] = useTransition()
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lotacoes, setLotacoes] = useState<{ label: string; value: string }[]>(
		[],
	)
	const form = useObrasForm(formConfig)
	const router = useRouter()

	// Field arrays para as tabelas
	const tabelaAtrasosFields = useFieldArray({
		control: form.control,
		name: 'tabelaAtrasos',
	})
	const tabelaServicosFields = useFieldArray({
		control: form.control,
		name: 'tabelaServicos',
	})
	const tabelaMediacoesFields = useFieldArray({
		control: form.control,
		name: 'tabelaMediacoes',
	})
	const tabelaObrigacoesFields = useFieldArray({
		control: form.control,
		name: 'tabelaObrigacoes',
	})
	const tabelaAditivosFields = useFieldArray({
		control: form.control,
		name: 'tabelaAditivos',
	})

	useEffect(() => {
		getLotacoes().then((data) => {
			setLotacoes(data.map((l) => ({ label: l.name, value: l.name })))
		})
	}, [])

	useEffect(() => {
		if (initialContrato) {
			form.setValue('contratoId', initialContrato.id)
			form.setValue('objeto', initialContrato.objeto)
			form.setValue('contratada', initialContrato.contratado)
			form.setValue(
				'licitacaoModalidadeNumero',
				initialContrato.displayLicitacao,
			)
		}
	}, [initialContrato, form])

	// Campos extras da Seção 1 que vêm do FormConfig
	const section1ExtraConfigs = formConfig.filter(
		(c) =>
			c.isActive &&
			(c.section ?? '').match(/^1[\s\-]/) &&
			!['secretariaNome', 'periodoAnalisadoInicio', 'periodoAnalisadoFim'].includes(c.fieldKey),
	)

	// Seções 2+ vêm todas do FormConfig
	const otherConfigs = formConfig.filter(
		(c) => c.isActive && !(c.section ?? '').match(/^1[\s\-]/),
	)

	const onSubmit = (values: ObrasReportFormValues) => {
		startTransition(async () => {
			const result = await createObrasReport(values as any)
			if (!result.success) {
				toast.error(result.error)
			} else if (result.data?.filePath) {
				toast.success(result.data.message)
				const link = document.createElement('a')
				link.href = result.data.filePath
				link.download = result.data.filePath.split('/').pop() ?? 'relatorio.pdf'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				form.reset()
				setIsDialogOpen(false)
				router.push('/dashboard-fiscal/historico-relatorios')
			}
		})
	}

	const handleOpenDialog = () => {
		form.handleSubmit(() => {
			setIsDialogOpen(true)
		})()
	}

	const watchPrazo = form.watch('controlePrazoExecucao')
	const watchQualidadeMat = form.watch('controleQualidadeMateriais')
	const watchQualidadeProj = form.watch('controleQualidadeProjeto')
	const watchAditivo = form.watch('houveAditivo')
	const watchPreposto = form.watch('prepostoAcessivel')

	const renderTableAfterField = (fieldKey: string) => {
		// Tabela 1 - Atrasos
		if (
			fieldKey === 'controlePrazoExecucao' &&
			watchPrazo ===
				'Os prazos previstos no cronograma não vêm sendo respeitados'
		) {
			return (
				<Card className="border-2 border-orange-200 py-0">
					<CardHeader className="rounded-t-lg py-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold text-orange-800">
								TABELA 1 – ETAPAS EM ATRASO
							</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									tabelaAtrasosFields.append({
										item: '',
										etapa: '',
										causa: '',
										reponsavel: '',
										providencias: '',
										observacoes: '',
										diasAtraso: 0,
										percentual: 0,
									})
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Adicionar
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-3 space-y-4">
						{tabelaAtrasosFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-4 border rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 gap-3 pt-8"
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 text-destructive"
									onClick={() => tabelaAtrasosFields.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<FormField
									control={form.control}
									name={`tabelaAtrasos.${index}.etapa`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Etapa ou Serviço em Atraso
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaAtrasos.${index}.causa`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Causas do Atraso
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaAtrasos.${index}.reponsavel`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Responsável(is) pelo Atraso
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaAtrasos.${index}.providencias`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Providências Tomadas*
											</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Descrever a providência e o prazo estabelecido..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaAtrasos.${index}.observacoes`}
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel className="text-xs">Observações**</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Informar a folha do livro de ocorrência..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			)
		}

		// Tabela 2 - Qualidade / Projeto
		const showTable2 =
			watchQualidadeMat ===
				'As especificações técnicas dos materiais e serviços não vêm sendo respeitadas' ||
			watchQualidadeProj ===
				'O projeto foi alterado, sem a autorização da fiscalização'

		if (fieldKey === 'controleQualidadeProjeto' && showTable2) {
			return (
				<Card className="border-2 border-red-200 py-0">
					<CardHeader className="rounded-t-lg py-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold text-red-800 uppercase">
								TABELA 2 – SERVIÇOS OU MATERIAIS DIFERENTES
							</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									tabelaServicosFields.append({
										item: '',
										servico: '',
										ocorrencias: '',
										providencias: '',
										observacoes: '',
									})
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Adicionar
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-3 space-y-4">
						{tabelaServicosFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-4 border rounded-lg bg-background grid gap-3 pt-8"
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 text-destructive"
									onClick={() => tabelaServicosFields.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name={`tabelaServicos.${index}.servico`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">Serviço</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`tabelaServicos.${index}.ocorrencias`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">Ocorrência*</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Descrever a ocorrência e dispositivo desrespeitado..."
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name={`tabelaServicos.${index}.providencias`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Providências Tomadas**
											</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Descrever a providência e o prazo estabelecido..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaServicos.${index}.observacoes`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Observações***</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Informar a folha do livro de ocorrência..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			)
		}

		// Tabela 3 - Medições
		if (fieldKey === 'controleExecutadoPercentual') {
			return (
				<Card className="border-2 border-blue-200 py-0">
					<CardHeader className="rounded-t-lg py-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold text-blue-800">
								TABELA 3 – MEDIÇÕES E PAGAMENTOS
							</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									tabelaMediacoesFields.append({
										item: '',
										dataMediacao: '',
										numeroMedicao: '',
										valor: '',
										dataPagamento: '',
										valorPago: '',
										numeroRecibo: '',
									})
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Adicionar
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-3 space-y-4">
						{tabelaMediacoesFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-4 border rounded-lg bg-background pt-8"
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 text-destructive"
									onClick={() => tabelaMediacoesFields.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-3 border-r pr-4">
										<p className="text-[10px] font-bold uppercase text-muted-foreground">
											Medição
										</p>
										<FormField
											control={form.control}
											name={`tabelaMediacoes.${index}.numeroMedicao`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">N.º</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name={`tabelaMediacoes.${index}.dataMediacao`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">Período</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name={`tabelaMediacoes.${index}.valor`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">
														Valor (R$)
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
									<div className="md:col-span-2 space-y-3">
										<p className="text-[10px] font-bold uppercase text-muted-foreground">
											Pagamento
										</p>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<FormField
												control={form.control}
												name={`tabelaMediacoes.${index}.dataPagamento`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-[10px]">Data</FormLabel>
														<FormControl>
															<Input type="date" {...field} />
														</FormControl>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={`tabelaMediacoes.${index}.valorPago`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-[10px]">
															Valor (R$)
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={`tabelaMediacoes.${index}.numeroRecibo`}
												render={({ field }) => (
													<FormItem className="md:col-span-2">
														<FormLabel className="text-[10px]">
															N.º da nota fiscal
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)
		}

		// Tabela 4 - Obrigações
		if (
			fieldKey === 'prepostoAcessivel' &&
			(watchPreposto === 'Parcialmente' || watchPreposto === 'Não')
		) {
			return (
				<Card className="border-2 border-purple-200 py-0">
					<CardHeader className="rounded-t-lg py-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold text-purple-800">
								TABELA 4 – OBRIGAÇÕES DA CONTRATADA
							</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									tabelaObrigacoesFields.append({
										item: '',
										descricao: '',
										dispositivoLegal: '',
										providencias: '',
										observacoes: '',
									})
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Adicionar
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-3 space-y-4">
						{tabelaObrigacoesFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-4 border rounded-lg bg-background grid gap-3 pt-8"
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 text-destructive"
									onClick={() => tabelaObrigacoesFields.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name={`tabelaObrigacoes.${index}.descricao`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">
													Descrição do Ocorrido
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`tabelaObrigacoes.${index}.dispositivoLegal`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">
													Dispositivo Legal ou Contratual
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name={`tabelaObrigacoes.${index}.providencias`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">
												Providências Tomadas*
											</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Descrever a providência e o prazo estabelecido..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`tabelaObrigacoes.${index}.observacoes`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Observações**</FormLabel>
											<FormControl>
												<Textarea
													rows={2}
													{...field}
													placeholder="Informar a folha do livro de ocorrência..."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			)
		}

		// Tabela 5 - Aditivos
		if (fieldKey === 'houveAditivo' && watchAditivo === 'Sim') {
			return (
				<Card className="border-2 border-blue-200 py-0">
					<CardHeader className="rounded-t-lg py-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold text-blue-800">
								TABELA 5 – ADITIVOS
							</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									tabelaAditivosFields.append({
										item: '',
										numero: '',
										dataPublicacao: '',
										aditivoValorAcrecimoValor: '',
										aditivoValorSupressaoValor: '',
										aditivoPrazoTotal: '',
									})
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Adicionar
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-3 space-y-4">
						{tabelaAditivosFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-4 border rounded-lg bg-background pt-8 space-y-4"
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 text-destructive"
									onClick={() => tabelaAditivosFields.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name={`tabelaAditivos.${index}.numero`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">N.º</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`tabelaAditivos.${index}.dataPublicacao`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">
													Data publicação
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
									<div className="space-y-3">
										<p className="text-[10px] font-bold uppercase text-muted-foreground">
											Aditivo de valor
										</p>
										<FormField
											control={form.control}
											name={`tabelaAditivos.${index}.aditivoValorAcrecimoValor`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">
														Acréscimo (R$)
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name={`tabelaAditivos.${index}.aditivoValorSupressaoValor`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">
														Supressão (R$)
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
									<div className="space-y-3">
										<p className="text-[10px] font-bold uppercase text-muted-foreground">
											Aditivo de prazo
										</p>
										<FormField
											control={form.control}
											name={`tabelaAditivos.${index}.aditivoPrazoAditivado`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">
														Prazo aditivado (dias)
													</FormLabel>
													<FormControl>
														<Input type="number" {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name={`tabelaAditivos.${index}.aditivoPrazoTotal`}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[10px]">
														Prazo total (dias)
													</FormLabel>
													<FormControl>
														<Input type="number" {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)
		}
		return null
	}

	return (
		<Form {...form}>
			<form
				className="mx-2 space-y-12 pb-32"
				onSubmit={(e) => e.preventDefault()}
			>
				{/* SEÇÃO 1 - IDENTIFICAÇÃO DO CONTRATO */}
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-2">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
							1 - IDENTIFICAÇÃO DO CONTRATO
						</h3>
						<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
					</div>

					<Card className="border-none shadow-none bg-transparent">
						<CardContent className="space-y-5 p-0">
							<div className="grid grid-cols-1 gap-5 p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
								<FormField
									control={form.control}
									name="contratoId"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Contrato
											</FormLabel>
											<FormControl>
												<Input
													readOnly
													value={
														initialContrato
															? `${initialContrato.displayContrato} - ${initialContrato.contratado}`
															: 'Nenhum contrato selecionado'
													}
													className="bg-muted/50 border-none font-medium"
												/>
											</FormControl>
											<Input type="hidden" {...field} />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<FormField
										control={form.control}
										name="licitacaoModalidadeNumero"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													Licitação
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														readOnly
														value={
															initialContrato
																? `${initialContrato.displayLicitacao}`
																: 'Nenhum contrato selecionado'
														}
														className="bg-muted/50 border-none font-medium"
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="contratada"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													Contratada
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														readOnly
														className="bg-muted/50 border-none font-medium"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="objeto"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Objeto
											</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													readOnly
													className="bg-muted/50 border-none font-medium min-h-20 resize-none"
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 gap-5 md:grid-cols-3 border-t pt-5 mt-2">
									<FormField
										control={form.control}
										name="secretariaNome"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Secretaria
												</FormLabel>
												<FormControl>
													<Combobox
														options={lotacoes}
														value={field.value}
														onChange={field.onChange}
														placeholder="Selecione a secretaria"
														searchPlaceholder="Buscar secretaria..."
														emptyText="Nenhuma secretaria encontrada."
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="periodoAnalisadoInicio"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Período (Início)
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="periodoAnalisadoFim"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Período (Fim)
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Campos extras da Seção 1 vindos do FormConfig */}
							{section1ExtraConfigs.length > 0 && (
								<div className="pt-2">
									<DynamicFormRenderer
										form={form}
										configs={section1ExtraConfigs}
										lotacoes={lotacoes}
										flat
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* SEÇÕES DINÂMICAS COM INJEÇÃO DE TABELAS */}
				<DynamicFormRenderer
					form={form}
					lotacoes={lotacoes}
					configs={otherConfigs}
					renderAfterField={renderTableAfterField}
				/>

				<div className="fixed bottom-6 right-6 z-50">
					<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								onClick={handleOpenDialog}
								size="lg"
								className="font-bold gap-2 shadow-lg"
							>
								{isPending ? (
									<Loader2 className="animate-spin h-4 w-4" />
								) : (
									<PlusCircle className="h-4 w-4" />
								)}
								Finalizar Relatório de Obras
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Enviar Relatório?</AlertDialogTitle>
								<AlertDialogDescription>
									Certifique-se de que todas as informações e tabelas estão
									corretas. O documento não poderá ser editado após o envio.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Voltar</AlertDialogCancel>
								<AlertDialogAction
									disabled={isPending}
									onClick={(e) => {
										e.preventDefault()
										form.handleSubmit(onSubmit, () => {
											setIsDialogOpen(false)
										})()
									}}
								>
									{isPending ? 'Enviando...' : 'Confirmar e Enviar'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</form>
		</Form>
	)
}
