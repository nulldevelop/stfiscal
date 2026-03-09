'use client'

import { Loader2, Plus, PlusCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
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
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DynamicFormRenderer } from '../../_components/dynamic-form-renderer'
import { getLotacoes } from '../../_data-access/get-locacoes'
import { createFiscalPrincipalReport } from '../_actions/create-fiscal-principal-report'
import { getSetorialDataForContract } from '../_data-access/get-setorial-data'
import {
	type FiscalPrincipalReportFormValues,
	formSchemaFiscalPrincipal,
} from '../_actions/action-schema'
import type { FormConfig } from '@/generated/prisma/client'

interface Props {
	contratoId: string
	formConfig: FormConfig[]
}

export function FiscalPrincipalReportForm({ contratoId, formConfig }: Props) {
	const [isPending, startTransition] = useTransition()
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const router = useRouter()
	const [lotacoes, setLotacoes] = useState<{ label: string; value: string }[]>(
		[],
	)

	const form = useForm<FiscalPrincipalReportFormValues>({
		resolver: zodResolver(formSchemaFiscalPrincipal),
		defaultValues: {
			contratoId,
			licitacaoModalidadeNumero: '',
			contratoNumero: '',
			secretariaNome: '',
			periodoAnalisadoInicio: '',
			periodoAnalisadoFim: '',
			contratada: '',
			objeto: '',
			atosDeFormato: [{ num: 1, atoPraticado: '', data: '', identificouIrregularidade: 'Não' }],
			medidasAdotadas: [],
			demaisInformacoes: '',
			dynamicData: {},
		},
	})

	const atosField = useFieldArray({ control: form.control, name: 'atosDeFormato' })
	const medidasField = useFieldArray({ control: form.control, name: 'medidasAdotadas' })

	useEffect(() => {
		getLotacoes().then((data) => {
			setLotacoes(data.map((l) => ({ label: l.name, value: l.name })))
		})
	}, [])

	useEffect(() => {
		if (!contratoId) return
		getSetorialDataForContract(contratoId).then((data) => {
			if (!data) return
			form.setValue('licitacaoModalidadeNumero', data.licitacaoModalidadeNumero)
			form.setValue('contratoNumero', data.contratoNumero)
			form.setValue('contratada', data.contratada)
			form.setValue('objeto', data.objeto)
			if (data.atos.length > 0) {
				form.setValue('atosDeFormato', data.atos as any)
			}
			if (data.medidas.length > 0) {
				form.setValue('medidasAdotadas', data.medidas as any)
			}
		})
	}, [contratoId, form])

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

	const onSubmit = (values: FiscalPrincipalReportFormValues) => {
		startTransition(async () => {
			const result = await createFiscalPrincipalReport(values)
			if (result.error) {
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
														form.watch('contratoNumero')
															? `${form.watch('contratoNumero')} - ${form.watch('contratada')}`
															: 'Nenhum contrato selecionado'
													}
													className="bg-muted/50 border-none font-medium"
												/>
											</FormControl>
											<Input type="hidden" {...field} />
											<FormMessage />
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
														className="bg-muted/50 border-none font-medium"
													/>
												</FormControl>
												<FormMessage />
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
												<FormMessage />
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
											<FormMessage />
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
												<FormMessage />
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
												<FormMessage />
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
												<FormMessage />
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

				{/* SEÇÃO 2 – ATOS DE FISCALIZAÇÃO */}
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-2">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
							2 – ATOS DE FISCALIZAÇÃO
						</h3>
						<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
					</div>

					<div className="space-y-4">
						{atosField.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] grid grid-cols-1 md:grid-cols-[40px_1fr_150px_150px] gap-5 pt-10 md:pt-5"
							>
								<div className="absolute top-4 left-5 flex items-center gap-2">
									<div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
										{index + 1}
									</div>
								</div>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
									onClick={() => atosField.remove(index)}
									disabled={atosField.fields.length === 1}
								>
									<Trash2 className="h-4 w-4" />
								</Button>

								<div className="hidden md:block" />

								<FormField
									control={form.control}
									name={`atosDeFormato.${index}.atoPraticado`}
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
												Ato praticado
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Ex: Visita técnica ao local..."
													{...field}
													className="bg-muted/30 border-muted-foreground/20"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`atosDeFormato.${index}.data`}
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
												Data
											</FormLabel>
											<FormControl>
												<Input
													placeholder="dd/mm/aaaa"
													{...field}
													className="bg-muted/30 border-muted-foreground/20"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`atosDeFormato.${index}.identificouIrregularidade`}
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
												Irregularidade?
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Sim/Não"
													{...field}
													className="bg-muted/30 border-muted-foreground/20"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						))}

						<div className="flex justify-center pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									atosField.append({
										num: atosField.fields.length + 1,
										atoPraticado: '',
										data: '',
										identificouIrregularidade: 'Não',
									})
								}
								className="gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all rounded-xl px-8 py-6"
							>
								<PlusCircle className="h-5 w-5" />
								<span className="font-bold uppercase tracking-widest text-xs">
									Adicionar Novo Ato
								</span>
							</Button>
						</div>
					</div>
				</div>

				{/* SEÇÃO 3 – MEDIDAS ADOTADAS */}
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-2">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
							3 – MEDIDAS PARA SOLUÇÃO DE IRREGULARIDADES
						</h3>
						<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
					</div>

					<div className="space-y-4">
						{medidasField.fields.map((field, index) => (
							<div
								key={field.id}
								className="relative p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5 pt-10"
							>
								<div className="absolute top-4 left-5 flex items-center gap-2">
									<div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
										{index + 1}
									</div>
								</div>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
									onClick={() => medidasField.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<FormField
										control={form.control}
										name={`medidasAdotadas.${index}.irregularidade`}
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
													Irregularidade Identificada
												</FormLabel>
												<FormControl>
													<Textarea
														rows={2}
														placeholder="Descreva o problema..."
														{...field}
														className="bg-muted/30 border-muted-foreground/20 resize-none"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`medidasAdotadas.${index}.medidasAdotadas`}
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
													Medidas Adotadas
												</FormLabel>
												<FormControl>
													<Textarea
														rows={2}
														placeholder="O que foi feito..."
														{...field}
														className="bg-muted/30 border-muted-foreground/20 resize-none"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-4">
									<FormField
										control={form.control}
										name={`medidasAdotadas.${index}.data`}
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
													Data da Medida
												</FormLabel>
												<FormControl>
													<Input
														placeholder="dd/mm/aaaa"
														{...field}
														className="bg-muted/30 border-muted-foreground/20"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`medidasAdotadas.${index}.problemaResolvido`}
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
													Resolvido?
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Sim/Não"
														{...field}
														className="bg-muted/30 border-muted-foreground/20"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						))}

						<div className="flex justify-center pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									medidasField.append({
										num: medidasField.fields.length + 1,
										irregularidade: '',
										medidasAdotadas: '',
										data: '',
										problemaResolvido: 'Sim',
									})
								}
								className="gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all rounded-xl px-8 py-6"
							>
								<PlusCircle className="h-5 w-5" />
								<span className="font-bold uppercase tracking-widest text-xs">
									Adicionar Nova Medida
								</span>
							</Button>
						</div>
					</div>
				</div>

				{/* SEÇÃO 4 – DEMAIS INFORMAÇÕES */}
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-2">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
							4 – DEMAIS INFORMAÇÕES
						</h3>
						<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
					</div>

					<div className="p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
						<FormField
							control={form.control}
							name="demaisInformacoes"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											rows={4}
											placeholder="Informações complementares que julgar necessárias..."
											{...field}
											className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 min-h-32"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* SEÇÕES DINÂMICAS */}
				<DynamicFormRenderer
					form={form}
					configs={otherConfigs}
					lotacoes={lotacoes}
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
								Finalizar Relatório Principal
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Enviar Relatório?</AlertDialogTitle>
								<AlertDialogDescription>
									Certifique-se de que todas as informações estão corretas. O
									documento não poderá ser editado após o envio.
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
