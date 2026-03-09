'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Eye, Loader2 } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import type { ContratoWithLicitacao } from '../../_components/types'
import { previewNotificacaoPdf } from '../_actions/preview-notificacao-pdf'
import {
	type NotificacaoEntregaInput,
	notificacaoEntregaSchema,
} from '../falta-atrasada/_actions/action-schema'

interface NotificacaoEntregaModalProps {
	contrato: ContratoWithLicitacao
	onConfirm: (payload: NotificacaoEntregaInput) => void
	isPdfPending: boolean
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function NotificacaoEntregaModal({
	contrato,
	onConfirm,
	isPdfPending,
	open,
	onOpenChange,
}: NotificacaoEntregaModalProps) {
	const form = useForm<NotificacaoEntregaInput>({
		resolver: zodResolver(notificacaoEntregaSchema),
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

	useEffect(() => {
		if (!open) {
			form.reset({
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
			})
		}
	}, [open, form, contrato.id, contrato.empresa])

	const [isPreviewPending, startPreviewTransition] = useTransition()

	const onSubmit = (values: NotificacaoEntregaInput) => {
		onConfirm(values)
	}

	const handlePreview = () => {
		const values = form.getValues()
		startPreviewTransition(async () => {
			const result = await previewNotificacaoPdf({
				tipo: 'entrega',
				dados: values,
			})
			if (result.success && result.pdfBase64) {
				const byteArray = Uint8Array.from(atob(result.pdfBase64), (c) =>
					c.charCodeAt(0),
				)
				const blob = new Blob([byteArray], { type: 'application/pdf' })
				const url = URL.createObjectURL(blob)
				window.open(url, '_blank')
			} else {
				toast.error('Erro ao gerar pré-visualização', {
					description: result.error,
				})
			}
		})
	}

	const showEmpresaSection =
		!contrato.empresa?.endereco ||
		!contrato.empresa?.representanteNome ||
		!contrato.empresa?.representanteCpf

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Gerar Notificacao de Atraso/Falta na Entrega
					</DialogTitle>
					<DialogDescription>
						Preencha os dados abaixo para gerar a notificacao para o contrato{' '}
						<strong>{contrato.numero}</strong>.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Secao: Dados do Empenho */}
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-muted-foreground border-b pb-2">
								Dados do Empenho
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="numeroEmpenho"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Numero do Empenho</FormLabel>
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
															date > new Date() || date < new Date('1900-01-01')
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
											<FormLabel>Email de Envio do Empenho</FormLabel>
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
												<Input placeholder="Ex: Joao da Silva" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Secao: Dados da Empresa */}
						{showEmpresaSection && (
							<div className="space-y-4">
								<h4 className="font-semibold text-sm text-muted-foreground border-b pb-2">
									Dados da Empresa Contratada
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="empresaEndereco"
										render={({ field }) => (
											<FormItem className="col-span-1 md:col-span-2">
												<FormLabel>Endereco da Empresa</FormLabel>
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
													<Input placeholder="Ex: Joao da Silva" {...field} />
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
													<Input placeholder="Ex: 123.456.789-00" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						)}

						{/* Secao: Dados da Notificacao */}
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-muted-foreground border-b pb-2">
								Dados da Notificacao
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
											<FormLabel>Itens faltantes:</FormLabel>
											<FormControl>
												<Input placeholder="Ex: CANETA, PAPEL..." {...field} />
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
											<FormLabel>Data da Certidao de Ocorrencia</FormLabel>
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
															date > new Date() || date < new Date('1900-01-01')
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
											className="h-24"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="ghost">
									Cancelar
								</Button>
							</DialogClose>
							<Button
								type="button"
								variant="outline"
								disabled={isPreviewPending || isPdfPending}
								onClick={handlePreview}
							>
								{isPreviewPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Eye className="mr-2 h-4 w-4" />
								)}
								Pré-visualizar
							</Button>
							<Button type="submit" disabled={isPdfPending || isPreviewPending}>
								{isPdfPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Gerar Notificacao
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
