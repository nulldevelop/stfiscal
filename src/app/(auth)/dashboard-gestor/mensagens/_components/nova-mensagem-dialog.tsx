'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	AlertCircle,
	Bell,
	FileText,
	Loader2,
	Mail,
	Search,
	Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
} from '@/components/kibo-ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { criarMensagemAction } from '../_actions/mensagem-actions'
import {
	type ContratoComFiscaisItem,
	type FiscalAtivoItem,
	getContratosComFiscais,
	getFiscaisAtivos,
	getFiscaisPorContrato,
} from '../_data-access/get-fiscais-ativos'

const formSchema = z.object({
	assunto: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
	conteudo: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
	tipo: z.enum(['AVISO', 'LEMBRETE', 'COMUNICADO', 'URGENTE']),
	destinatariosIds: z
		.array(z.string())
		.min(1, 'Selecione pelo menos um destinatário'),
	contratoId: z.string().optional().nullable(),
})

type FormData = z.infer<typeof formSchema>

interface NovaMensagemDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

const tipoOptions = [
	{ value: 'COMUNICADO', label: 'Comunicado', icon: Mail },
	{ value: 'AVISO', label: 'Aviso', icon: Bell },
	{ value: 'LEMBRETE', label: 'Lembrete', icon: FileText },
	{ value: 'URGENTE', label: 'Urgente', icon: AlertCircle },
]

export function NovaMensagemDialog({
	open,
	onOpenChange,
	onSuccess,
}: NovaMensagemDialogProps) {
	const [isPending, startTransition] = useTransition()
	// Todos os fiscais ativos da organização
	const [fiscais, setFiscais] = useState<FiscalAtivoItem[]>([])
	// Fiscais do contrato selecionado (null = sem filtro)
	const [fiscaisContrato, setFiscaisContrato] = useState<FiscalAtivoItem[] | null>(null)
	const [contratos, setContratos] = useState<ContratoComFiscaisItem[]>([])
	const [searchFiscal, setSearchFiscal] = useState('')
	const [contratoSelecionado, setContratoSelecionado] = useState<string>('')
	const [loading, setLoading] = useState(true)

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			assunto: '',
			conteudo: '',
			tipo: 'COMUNICADO',
			destinatariosIds: [],
			contratoId: null,
		},
	})

	const selectedFiscais = form.watch('destinatariosIds')

	// Pool de fiscais conforme contrato selecionado
	const fiscaisPool = fiscaisContrato ?? fiscais

	// Fiscais filtrados por busca — derivado, sem setState
	const filteredFiscais = useMemo(() => {
		const term = searchFiscal.trim().toLowerCase()
		if (!term) return fiscaisPool
		return fiscaisPool.filter(
			(f) =>
				f.nome.toLowerCase().includes(term) ||
				f.cargo.toLowerCase().includes(term),
		)
	}, [fiscaisPool, searchFiscal])

	const loadData = useCallback(async () => {
		setLoading(true)
		try {
			const [fiscaisData, contratosData] = await Promise.all([
				getFiscaisAtivos(),
				getContratosComFiscais(),
			])
			setFiscais(fiscaisData)
			setContratos(contratosData)
		} catch (error) {
			console.error('Erro ao carregar dados:', error)
			toast.error('Erro ao carregar dados')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (open) loadData()
	}, [open, loadData])

	// Quando contrato muda: carrega fiscais e pré-seleciona
	useEffect(() => {
		if (!contratoSelecionado) {
			setFiscaisContrato(null)
			form.setValue('contratoId', null)
			return
		}

		let cancelled = false
		getFiscaisPorContrato(contratoSelecionado).then((lista) => {
			if (cancelled) return
			setFiscaisContrato(lista)
			form.setValue('destinatariosIds', lista.map((f) => f.id))
			form.setValue('contratoId', contratoSelecionado)
		})

		return () => {
			cancelled = true
		}
	}, [contratoSelecionado, form])

	function toggleFiscal(fiscalId: string) {
		const current = form.getValues('destinatariosIds')
		form.setValue(
			'destinatariosIds',
			current.includes(fiscalId)
				? current.filter((id) => id !== fiscalId)
				: [...current, fiscalId],
		)
	}

	async function onSubmit(data: FormData) {
		startTransition(async () => {
			const result = await criarMensagemAction(data)
			if (result.success) {
				toast.success('Mensagem enviada com sucesso!')
				resetState()
				onSuccess()
			} else {
				toast.error(result.error || 'Erro ao enviar mensagem')
			}
		})
	}

	function resetState() {
		form.reset()
		setContratoSelecionado('')
		setSearchFiscal('')
		setFiscaisContrato(null)
	}

	function handleClose() {
		if (!isPending) {
			resetState()
			onOpenChange(false)
		}
	}

	const contratosComboData = contratos.map((c) => ({
		value: c.id,
		label: c.displayContrato,
		sublabel: c.contratado,
	}))

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="flex max-h-[90vh] max-w-2xl min-w-175 flex-col gap-0 p-0">
				<DialogHeader className="px-6 pt-6 pb-4">
					<DialogTitle>Nova Mensagem</DialogTitle>
					<DialogDescription>
						Envie uma mensagem para os fiscais de contrato
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-1 flex-col overflow-hidden"
					>
						<ScrollArea className="flex-1 px-6">
							<div className="space-y-4 pb-4">

								{/* Tipo + Assunto */}
								<div className="grid grid-cols-3 gap-3">
									<FormField
										control={form.control}
										name="tipo"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tipo</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{tipoOptions.map((t) => (
															<SelectItem key={t.value} value={t.value}>
																<span className="flex items-center gap-2">
																	<t.icon className="h-4 w-4" />
																	{t.label}
																</span>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="assunto"
										render={({ field }) => (
											<FormItem className="col-span-2">
												<FormLabel>Assunto</FormLabel>
												<FormControl>
													<Input placeholder="Assunto da mensagem" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Conteúdo */}
								<FormField
									control={form.control}
									name="conteudo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mensagem</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Digite o conteúdo da mensagem..."
													className="min-h-24 resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator />

								{/* Destinatários */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm font-semibold">Destinatários</span>
										<Badge variant="secondary">
											{selectedFiscais.length} selecionado(s)
										</Badge>
									</div>

									{/* Filtro por contrato — Combobox kibo-ui */}
									<div className="space-y-1.5">
										<Label className="text-xs text-muted-foreground">
											Filtrar por contrato (opcional)
										</Label>
										<Combobox
											type="contrato"
											data={contratosComboData}
											value={contratoSelecionado}
											onValueChange={(v) =>
												setContratoSelecionado(v === contratoSelecionado ? '' : v)
											}
										>
											<ComboboxTrigger className="w-full justify-between font-normal">
												{contratoSelecionado
													? contratos.find((c) => c.id === contratoSelecionado)
															?.displayContrato
													: 'Todos os fiscais ativos'}
											</ComboboxTrigger>
											<ComboboxContent popoverOptions={{ align: 'start' }}>
												<ComboboxInput placeholder="Buscar contrato..." />
												<ComboboxList>
													<ComboboxEmpty>Nenhum contrato encontrado.</ComboboxEmpty>
													<ComboboxGroup>
														<ComboboxItem
															value="__todos__"
															onSelect={() => setContratoSelecionado('')}
														>
															Todos os fiscais ativos
														</ComboboxItem>
					{contratosComboData.map((c) => (
													<ComboboxItem
														key={c.value}
														value={c.value}
														keywords={[c.label, c.sublabel ?? ''].filter(Boolean)}
													>
														<span className="flex w-full items-center gap-2">
															<span className="min-w-0 flex-1">
																<span className="block truncate text-sm font-medium">
																	{c.label}
																</span>
																{c.sublabel && (
																	<span className="block truncate text-muted-foreground text-xs">
																		{c.sublabel}
																	</span>
																)}
															</span>
															<Badge variant="outline" className="shrink-0 text-xs">
																{contratos.find((x) => x.id === c.value)?.fiscaisCount}
															</Badge>
														</span>
													</ComboboxItem>
												))}
													</ComboboxGroup>
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
										{contratoSelecionado && (
											<FormDescription className="text-xs">
												Fiscais do contrato selecionados automaticamente.
											</FormDescription>
										)}
									</div>

									{/* Busca + ações rápidas */}
									<div className="flex items-center gap-2">
										<div className="relative flex-1">
											<Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Buscar fiscal..."
												className="h-8 pl-8 text-sm"
												value={searchFiscal}
												onChange={(e) => setSearchFiscal(e.target.value)}
											/>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-8 text-xs"
											onClick={() =>
												form.setValue(
													'destinatariosIds',
													filteredFiscais.map((f) => f.id),
												)
											}
										>
											<Users className="mr-1 h-3 w-3" />
											Todos
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-8 text-xs"
											onClick={() => form.setValue('destinatariosIds', [])}
										>
											Limpar
										</Button>
									</div>

									{/* Lista de fiscais — Label + Checkbox sem button aninhado */}
									<div className="rounded-md border">
										<ScrollArea className="h-44">
											<div className="p-1">
												{loading ? (
													<div className="flex items-center justify-center py-8">
														<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
													</div>
												) : filteredFiscais.length === 0 ? (
													<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
														<Users className="mb-1 h-6 w-6" />
														<p className="text-xs">Nenhum fiscal encontrado</p>
													</div>
												) : (
													filteredFiscais.map((fiscal) => (
														<Label
															key={fiscal.id}
															htmlFor={`fiscal-${fiscal.id}`}
															className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 hover:bg-muted"
														>
															<Checkbox
																id={`fiscal-${fiscal.id}`}
																checked={selectedFiscais.includes(fiscal.id)}
																onCheckedChange={() => toggleFiscal(fiscal.id)}
															/>
															<div className="min-w-0 flex-1">
																<p className="truncate text-sm font-medium leading-none">
																	{fiscal.nome}
																</p>
																<p className="mt-0.5 truncate text-xs text-muted-foreground">
																	{fiscal.cargo}
																</p>
															</div>
														</Label>
													))
												)}
											</div>
										</ScrollArea>
									</div>

									{/* Mensagem de erro do campo destinatariosIds */}
									<FormField
										control={form.control}
										name="destinatariosIds"
										render={() => (
											<FormItem className="space-y-0">
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</ScrollArea>

						<DialogFooter className="border-t px-6 py-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isPending || selectedFiscais.length === 0}
							>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enviando...
									</>
								) : selectedFiscais.length > 0 ? (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Enviar para {selectedFiscais.length} fiscal(is)
									</>
								) : (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Enviar Mensagem
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
