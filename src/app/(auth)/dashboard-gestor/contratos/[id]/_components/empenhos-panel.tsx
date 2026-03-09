'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	CalendarIcon,
	ChevronDown,
	ChevronUp,
	Globe,
	Loader2,
	Plus,
	Receipt,
	UserPen,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createEmpenhoAction } from '../_actions/create-empenho'
import { getEmpenhosByContrato } from '../_data-access/get-empenhos'

// --- Types ---

interface EmpenhoTotais {
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
}

interface EmpenhoApi {
	entidade: number
	empenho: number
	exercicio: number
	empenhoExercicio: string
	data: string
	fornecedor: number
	nome: string
	historico: string
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
}

interface EmpenhoManual {
	id: string
	numero: number
	exercicio: number
	data: Date
	fornecedor: string
	historico: string | null
	valorEmpenhado: number
	valorAnulado: number
	valorLiquidado: number
	valorRetido: number
	valorPago: number
	valorAPagar: number
	origem: string
}

// --- Schema ---

const schema = z.object({
	contratoId: z.string().min(1),
	numero: z.number().int().min(1, 'Número do empenho é obrigatório'),
	exercicio: z.number().int().min(2000, 'Exercício inválido'),
	data: z.date({ message: 'Data é obrigatória' }),
	fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
	historico: z.string().optional(),
	valorEmpenhado: z.number().min(0, 'Valor deve ser positivo'),
	valorAnulado: z.number().min(0),
	valorLiquidado: z.number().min(0),
	valorRetido: z.number().min(0),
	valorPago: z.number().min(0),
	valorAPagar: z.number().min(0),
})

// --- Helpers ---

function currency(value: number) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}

function fmtDate(date: string | Date) {
	return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

// --- Sub-components ---

function TotaisCards({ totais }: { totais: EmpenhoTotais }) {
	const items = [
		{ label: 'Empenhado', value: totais.valorEmpenhado, color: 'text-blue-600' },
		{ label: 'Liquidado', value: totais.valorLiquidado, color: 'text-amber-600' },
		{ label: 'Pago', value: totais.valorPago, color: 'text-green-600' },
		{ label: 'A Pagar', value: totais.valorAPagar, color: 'text-red-600' },
	]

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
			{items.map((item) => (
				<div
					key={item.label}
					className="rounded-lg border bg-card p-3 text-center"
				>
					<p className="text-xs text-muted-foreground">{item.label}</p>
					<p className={`text-sm font-semibold ${item.color}`}>
						{currency(item.value)}
					</p>
				</div>
			))}
		</div>
	)
}

// --- Unified row type ---

interface EmpenhoRow {
	key: string
	numero: number
	exercicio: number
	data: string | Date
	fornecedor: string
	historico: string | null
	valorEmpenhado: number
	valorPago: number
	valorAPagar: number
	origem: 'API' | 'MANUAL'
}

function mergeEmpenhos(
	api: EmpenhoApi[],
	manuais: EmpenhoManual[],
): EmpenhoRow[] {
	const rows: EmpenhoRow[] = []

	for (const e of api) {
		rows.push({
			key: `api-${e.empenho}-${e.exercicio}`,
			numero: e.empenho,
			exercicio: e.exercicio,
			data: e.data,
			fornecedor: e.nome,
			historico: e.historico,
			valorEmpenhado: e.valorEmpenhado,
			valorPago: e.valorPago,
			valorAPagar: e.valorAPagar,
			origem: 'API',
		})
	}

	for (const e of manuais) {
		rows.push({
			key: `manual-${e.id}`,
			numero: e.numero,
			exercicio: e.exercicio,
			data: e.data,
			fornecedor: e.fornecedor,
			historico: e.historico,
			valorEmpenhado: e.valorEmpenhado,
			valorPago: e.valorPago,
			valorAPagar: e.valorAPagar,
			origem: 'MANUAL',
		})
	}

	rows.sort((a, b) => {
		if (b.exercicio !== a.exercicio) return b.exercicio - a.exercicio
		return b.numero - a.numero
	})

	return rows
}

// --- Main Component ---

export function EmpenhosPanel({ contratoId }: { contratoId: string }) {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [totais, setTotais] = useState<EmpenhoTotais | null>(null)
	const [empenhosApi, setEmpenhosApi] = useState<EmpenhoApi[]>([])
	const [empenhosManuais, setEmpenhosManuais] = useState<EmpenhoManual[]>([])
	const [expanded, setExpanded] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			contratoId,
			numero: 0,
			exercicio: new Date().getFullYear(),
			data: new Date(),
			fornecedor: '',
			historico: '',
			valorEmpenhado: 0,
			valorAnulado: 0,
			valorLiquidado: 0,
			valorRetido: 0,
			valorPago: 0,
			valorAPagar: 0,
		},
	})

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const result = await getEmpenhosByContrato(contratoId)
			if (result.success) {
				setTotais(result.data.totais)
				setEmpenhosApi(result.data.empenhosApi)
				setEmpenhosManuais(result.data.empenhosManuais)
			} else {
				setError(result.error)
			}
		} catch {
			setError('Erro ao buscar empenhos.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [contratoId])

	async function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const res = await createEmpenhoAction(values)

			if (res.success) {
				toast.success('Empenho criado com sucesso!')
				form.reset({
					contratoId,
					numero: 0,
					exercicio: new Date().getFullYear(),
					data: new Date(),
					fornecedor: '',
					historico: '',
					valorEmpenhado: 0,
					valorAnulado: 0,
					valorLiquidado: 0,
					valorRetido: 0,
					valorPago: 0,
					valorAPagar: 0,
				})
				setIsOpen(false)
				load()
			} else {
				toast.error(res.error)
			}
		})
	}

	const allRows = mergeEmpenhos(empenhosApi, empenhosManuais)
	const totalCount = allRows.length

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="flex items-center gap-2 text-base">
					<Receipt className="h-4 w-4" />
					Empenhos
					{!loading && totalCount > 0 && (
						<Badge variant="secondary" className="text-xs">
							{totalCount}
						</Badge>
					)}
				</CardTitle>
				<div className="flex items-center gap-2">
					{totalCount > 0 && (
						<button
							type="button"
							onClick={() => setExpanded(!expanded)}
							className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							{expanded ? (
								<>
									Recolher <ChevronUp className="h-3 w-3" />
								</>
							) : (
								<>
									Expandir <ChevronDown className="h-3 w-3" />
								</>
							)}
						</button>
					)}
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								<span>Novo Empenho</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Cadastrar Novo Empenho</DialogTitle>
							</DialogHeader>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
										<FormField
											control={form.control}
											name="numero"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Nº Empenho</FormLabel>
													<FormControl>
														<Input type="number" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="exercicio"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Exercício</FormLabel>
													<FormControl>
														<Input type="number" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="data"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Data</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant="outline"
																	className={cn(
																		'w-full pl-3 text-left font-normal',
																		!field.value && 'text-muted-foreground',
																	)}
																>
																	{field.value
																		? format(field.value, 'dd/MM/yyyy')
																		: 'Selecione uma data'}
																	<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="fornecedor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Fornecedor</FormLabel>
												<FormControl>
													<Input placeholder="Nome / Razão Social" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="historico"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Histórico</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Descrição do empenho"
														className="min-h-[60px] resize-none"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
										<FormField
											control={form.control}
											name="valorEmpenhado"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Empenhado</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="valorLiquidado"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Liquidado</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="valorPago"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Pago</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="valorAnulado"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Anulado</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="valorRetido"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Retido</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="valorAPagar"
											render={({ field }) => (
												<FormItem>
													<FormLabel>A Pagar</FormLabel>
													<FormControl>
														<Input type="number" step="0.01" placeholder="0.00" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="flex justify-end pt-2">
										<Button
											type="submit"
											className="w-full md:w-auto min-w-[150px]"
											disabled={isPending}
										>
											{isPending ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Salvando...
												</>
											) : (
												'Salvar Empenho'
											)}
										</Button>
									</div>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{loading && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						<span className="ml-2 text-sm text-muted-foreground">
							Buscando empenhos...
						</span>
					</div>
				)}

				{error && (
					<p className="text-sm text-muted-foreground py-4">{error}</p>
				)}

				{!loading && !error && totalCount === 0 && (
					<p className="text-sm text-muted-foreground">
						Nenhum empenho encontrado.
					</p>
				)}

				{!loading && !error && totais && <TotaisCards totais={totais} />}

				{!loading && !error && expanded && totalCount > 0 && (
					<div className="mt-4 rounded-md border overflow-auto max-h-[500px]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">Origem</TableHead>
									<TableHead className="w-[90px]">Empenho</TableHead>
									<TableHead className="w-[70px]">Exerc.</TableHead>
									<TableHead className="w-[90px]">Data</TableHead>
									<TableHead>Fornecedor</TableHead>
									<TableHead className="text-right w-[120px]">Empenhado</TableHead>
									<TableHead className="text-right w-[120px]">Pago</TableHead>
									<TableHead className="text-right w-[120px]">A Pagar</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{allRows.map((e) => (
									<TableRow key={e.key}>
										<TableCell>
											{e.origem === 'API' ? (
												<span title="Portal de Transparência">
													<Globe className="h-3.5 w-3.5 text-blue-500" />
												</span>
											) : (
												<span title="Cadastro Manual">
													<UserPen className="h-3.5 w-3.5 text-orange-500" />
												</span>
											)}
										</TableCell>
										<TableCell className="font-medium">{e.numero}</TableCell>
										<TableCell>{e.exercicio}</TableCell>
										<TableCell>{e.data ? fmtDate(e.data) : '—'}</TableCell>
										<TableCell
											className="max-w-[250px] truncate"
											title={e.fornecedor}
										>
											{e.fornecedor}
										</TableCell>
										<TableCell className="text-right">
											{currency(e.valorEmpenhado)}
										</TableCell>
										<TableCell className="text-right text-green-600">
											{currency(e.valorPago)}
										</TableCell>
										<TableCell className="text-right text-red-600">
											{currency(e.valorAPagar)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
