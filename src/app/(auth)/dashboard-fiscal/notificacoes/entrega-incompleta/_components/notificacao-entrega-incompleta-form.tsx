'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { LivePdfPreview } from '../../_components/live-pdf-preview'
import {
	type NotificacaoEntregaIncompletaInput,
	notificacaoEntregaIncompletaSchema,
} from '../_actions/action-schema'
import { saveAndGenerateNotificacaoEntregaIncompleta } from '../_actions/create-notificacao-entrega-incompleta'

interface NotificacaoEntregaIncompletaFormProps {
	contrato: any
}

export function NotificacaoEntregaIncompletaForm({
	contrato,
}: NotificacaoEntregaIncompletaFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const form = useForm<NotificacaoEntregaIncompletaInput>({
		resolver: zodResolver(notificacaoEntregaIncompletaSchema),
		defaultValues: {
			contratoId: contrato.id,
			numeroEmpenho: '',
			dataEmpenho: undefined,
			emailEmpenho: '',
			responsavelEmpenho: '',
			prazoEntrega: undefined,
			dataCertidaoOcorrencia: undefined,
			prazoDefesa: undefined,
			item: '',
			desconformidade: '',
			empresaEndereco: contrato.empresa?.endereco || '',
			empresaRepresentanteNome: contrato.empresa?.representanteNome || '',
			empresaRepresentanteCpf: contrato.empresa?.representanteCpf || '',
		},
	})

	const onSubmit = (values: NotificacaoEntregaIncompletaInput) => {
		toast.info('Processando notificação e gerando PDF...')
		startTransition(async () => {
			const result = await saveAndGenerateNotificacaoEntregaIncompleta(values)
			if (!result.success) {
				toast.error('Erro ao gerar PDF', { description: result.error })
			} else {
				toast.success('Notificação gerada com sucesso!')
				window.open(result.data.filePath, '_blank')
				router.push(`/dashboard-fiscal/contrato/${contrato.id}`)
			}
		})
	}

	const showEmpresaSection =
		!contrato.empresa?.endereco ||
		!contrato.empresa?.representanteNome ||
		!contrato.empresa?.representanteCpf

	// Watch all values for the preview
	const formValues = form.watch()

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
			{/* Formulário */}
			<Card className="shadow-lg border-emerald-100 py-2">
				<CardContent className="">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Seção: Dados do Empenho */}
							<div className="space-y-4">
								<h4 className="font-semibold text-sm text-emerald-700 border-b border-emerald-100 pb-2">
									Dados do Empenho
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="numeroEmpenho"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Número do Empenho</FormLabel>
												<FormControl>
													<Input placeholder="Ex: 123/2025" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="dataEmpenho"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Data do Empenho</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full justify-start text-left font-normal',
																	!field.value && 'text-muted-foreground',
																)}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, 'PPP', { locale: ptBR })
																) : (
																	<span>Selecione uma data</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															disabled={(date) =>
																date > new Date() ||
																date < new Date('1900-01-01')
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="emailEmpenho"
										render={({ field }) => (
											<FormItem>
												<FormLabel>E-mail de Envio do Empenho</FormLabel>
												<FormControl>
													<Input placeholder="exemplo@email.com" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="responsavelEmpenho"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Aos cuidados de:</FormLabel>
												<FormControl>
													<Input placeholder="Ex: João da Silva" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Seção: Dados da Empresa */}
							{showEmpresaSection && (
								<div className="space-y-4">
									<h4 className="font-semibold text-sm text-emerald-700 border-b border-emerald-100 pb-2">
										Dados da Empresa Contratada
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="empresaEndereco"
											render={({ field }) => (
												<FormItem className="col-span-1 md:col-span-2">
													<FormLabel>Endereço da Empresa</FormLabel>
													<FormControl>
														<Input
															placeholder="Ex: Rua das Flores, 123, Centro - Cidade/UF"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
										<FormField
											control={form.control}
											name="empresaRepresentanteNome"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>Nome do Representante Legal</FormLabel>
													<FormControl>
														<Input placeholder="Ex: João da Silva" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="empresaRepresentanteCpf"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>CPF do Representante</FormLabel>
													<FormControl>
														<Input
															placeholder="Ex: 123.456.789-00"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							)}

							{/* Seção: Dados da Notificação */}
							<div className="space-y-4">
								<h4 className="font-semibold text-sm text-emerald-700 border-b border-emerald-100 pb-2">
									Dados da Notificação
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="prazoEntrega"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Prazo de Entrega (dias)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="Ex: 30"
														{...field}
														value={field.value ?? ''}
														onChange={(e) =>
															field.onChange(
																e.target.value
																	? parseInt(e.target.value, 10)
																	: undefined,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="item"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Item do Edital</FormLabel>
												<FormControl>
													<Input placeholder="Ex: 11.2" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="dataCertidaoOcorrencia"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Data da Certidão de Ocorrência</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full justify-start text-left font-normal',
																	!field.value && 'text-muted-foreground',
																)}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, 'PPP', { locale: ptBR })
																) : (
																	<span>Selecione uma data</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															disabled={(date) =>
																date > new Date() ||
																date < new Date('1900-01-01')
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="prazoDefesa"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Prazo para Defesa (dias)</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="Ex: 5"
														{...field}
														value={field.value ?? ''}
														onChange={(e) =>
															field.onChange(
																e.target.value
																	? parseInt(e.target.value, 10)
																	: undefined,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<FormField
								control={form.control}
								name="desconformidade"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Texto da Desconformidade</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Detalhes da desconformidade..."
												className="h-32"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-3 pt-4 border-t">
								<Button
									type="button"
									variant="ghost"
									onClick={() => router.back()}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isPending}>
									{isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Save className="mr-2 h-4 w-4" />
									)}
									Gerar Notificação Final
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Preview */}
			<div className="sticky top-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800">
							Visualização em Tempo Real
						</h3>
						<span className="text-xs text-muted-foreground  px-2 py-1 rounded-md">
							PDF Auto-gerado
						</span>
					</div>
					<LivePdfPreview tipo="entrega-incompleta" dados={formValues} />
				</div>
			</div>
		</div>
	)
}
