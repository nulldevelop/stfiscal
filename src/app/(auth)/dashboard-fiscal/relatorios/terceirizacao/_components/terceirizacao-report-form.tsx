'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
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
import { handleFormValidationError } from '../../_utils/form-error-handler'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FormConfig } from '@/generated/prisma/client'
import { DynamicFormRenderer } from '../../_components/dynamic-form-renderer'
import { getLotacoes } from '../../_data-access/get-locacoes'
import {
	formSchemaTerceirizacao,
	type TerceirizacaoReportFormValues,
} from '../_actions/action-schema'
import { createTerceirizacaoReport } from '../_actions/create-terceirizacao-report'

interface Props {
	initialContrato: any
	formConfig: FormConfig[]
}

export function TerceirizacaoReportForm({
	initialContrato,
	formConfig,
}: Props) {
	const [isPending, startTransition] = useTransition()
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lotacoes, setLotacoes] = useState<{ label: string; value: string }[]>(
		[],
	)
	const router = useRouter()

	const form = useForm<TerceirizacaoReportFormValues>({
		resolver: zodResolver(formSchemaTerceirizacao),
		defaultValues: {
			contratoId: initialContrato?.id || '',
			licitacaoModalidadeNumero: initialContrato?.displayLicitacao || '',
			contratada: initialContrato?.contratado || '',
			objeto: initialContrato?.objeto || '',
			periodoAnalisadoInicio: '',
			periodoAnalisadoFim: '',
			secretariaNome: '',
			garantiaContratual: 'Não Previsto',
			recebeuNotificacao: 'Não',
			houveDescoberturaPosto: 'Não',
			houveDescontoNota: 'Não',
			dynamicData: {},
		},
	})

	useEffect(() => {
		getLotacoes().then((data) => {
			setLotacoes(data.map((l) => ({ label: l.name, value: l.name })))
		})
	}, [])

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

	const onSubmit = (values: TerceirizacaoReportFormValues) => {
		startTransition(async () => {
			const result = await createTerceirizacaoReport(values)
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

	// Gatilhos para campos específicos da Terceirização (além dos genéricos do renderer)
	const watchDescobertura = form.watch('houveDescoberturaPosto')
	const watchDesconto = form.watch('houveDescontoNota')

	const renderTerceirizacaoExtras = (fieldKey: string) => {
		// Campos dependentes de Descobertura
		if (fieldKey === 'houveDescoberturaPosto' && watchDescobertura === 'Sim') {
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
					<FormField
						control={form.control}
						name="descoberturaLocal"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-bold">
									Qual o local?
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="descoberturaTempo"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-bold">
									Quantos dias ou horas?
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
			)
		}

		// Campos dependentes de Desconto
		if (fieldKey === 'houveDescontoNota') {
			if (watchDesconto === 'Sim') {
				return (
					<div className="p-4 bg-muted/20 rounded-lg border-l-4 border-green-500">
						<FormField
							control={form.control}
							name="descontoValor"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-bold">
										Qual o valor? (R$)
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="0,00" />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				)
			}
			if (watchDesconto === 'Não') {
				return (
					<div className="p-4 bg-muted/20 rounded-lg border-l-4 border-red-500">
						<FormField
							control={form.control}
							name="descontoMotivoNão"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-bold">
										Por que não houve desconto?
									</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				)
			}
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

				{/* SEÇÕES DINÂMICAS COM INJEÇÃO DE CAMPOS ESPECÍFICOS */}
				<DynamicFormRenderer
					form={form}
					lotacoes={lotacoes}
					configs={otherConfigs}
					renderAfterField={renderTerceirizacaoExtras}
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
								Finalizar Relatório de Terceirização
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
										form.handleSubmit(
											onSubmit,
											(errors) => {
												handleFormValidationError(errors, form, () => {
													setIsDialogOpen(false)
												})
											},
										)()
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
