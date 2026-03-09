'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Plus, ScrollText } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { cn } from '@/lib/utils'
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
import { createAditivoAction } from '../_actions/create-aditivo'

const schema = z.object({
	contratoId: z.string().min(1, 'Contrato é obrigatório'),
	sequencia: z.number().int().min(1, 'Sequência deve ser pelo menos 1'),
	data: z.date({
		message: 'Data do aditivo é obrigatória',
	}),
	dataPublicacao: z.date().optional(),
	dataTermino: z.date().optional(),
	valorAditivo: z.number().optional(),
	motivacao: z.string().optional(),
})

interface Aditivo {
	id: string
	sequencia: number
	data: Date
	dataPublicacao: Date | null
	dataTermino: Date | null
	valorAditivo: number | null
	motivacao: string | null
}

interface AditivosManagerProps {
	contratoId: string
	aditivos: Aditivo[]
}

export function AditivosManager({ contratoId, aditivos }: AditivosManagerProps) {
	const [isPending, startTransition] = useTransition()
	const [isOpen, setIsOpen] = useState(false)

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			contratoId,
			sequencia: (aditivos[0]?.sequencia ?? 0) + 1,
			data: new Date(),
			valorAditivo: 0,
			motivacao: '',
		},
	})

	async function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const res = await createAditivoAction(values)

			if (res.success) {
				toast.success('Aditivo criado com sucesso!')
				form.reset({
					contratoId,
					sequencia: values.sequencia + 1,
					data: new Date(),
					valorAditivo: 0,
					motivacao: '',
				})
				setIsOpen(false)
			} else {
				toast.error(res.error)
			}
		})
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="flex items-center gap-2 text-base">
					<ScrollText className="h-4 w-4" />
					Aditivos do Contrato
				</CardTitle>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							<span>Novo Aditivo</span>
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Cadastrar Novo Aditivo</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
									<FormField
										control={form.control}
										name="sequencia"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Sequência (Nº)</FormLabel>
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
												<FormLabel>Data do Aditivo</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full pl-3 text-left font-normal',
																	!field.value && 'text-muted-foreground'
																)}
															>
																{field.value ? (
																	format(field.value, 'dd/MM/yyyy')
																) : (
																	<span>Selecione uma data</span>
																)}
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

									<FormField
										control={form.control}
										name="dataPublicacao"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Data de Publicação</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full pl-3 text-left font-normal',
																	!field.value && 'text-muted-foreground'
																)}
															>
																{field.value ? (
																	format(field.value, 'dd/MM/yyyy')
																) : (
																	<span>Selecione uma data</span>
																)}
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

									<FormField
										control={form.control}
										name="dataTermino"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Nova Vigência</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full pl-3 text-left font-normal',
																	!field.value && 'text-muted-foreground'
																)}
															>
																{field.value ? (
																	format(field.value, 'dd/MM/yyyy')
																) : (
																	<span>Selecione uma data</span>
																)}
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

									<FormField
										control={form.control}
										name="valorAditivo"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Valor do Aditivo</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0.00"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="motivacao"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Motivação</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Descreva a motivação"
														className="min-h-[80px] resize-none"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end pt-2">
									<Button type="submit" className="w-full md:w-auto min-w-[150px]" disabled={isPending}>
										{isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Salvando...
											</>
										) : (
											'Salvar Aditivo'
										)}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				{aditivos.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Nenhum aditivo cadastrado.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px]">Seq.</TableHead>
								<TableHead>Data</TableHead>
								<TableHead>Valor</TableHead>
								<TableHead>Nova Vigência</TableHead>
								<TableHead>Motivação</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{aditivos.map((a) => (
								<TableRow key={a.id} className="text-sm">
									<TableCell className="font-medium">#{a.sequencia}</TableCell>
									<TableCell>{format(new Date(a.data), 'dd/MM/yyyy')}</TableCell>
									<TableCell>
										{a.valorAditivo
											? new Intl.NumberFormat('pt-BR', {
													style: 'currency',
													currency: 'BRL',
											  }).format(a.valorAditivo)
											: '—'}
									</TableCell>
									<TableCell>
										{a.dataTermino
											? format(new Date(a.dataTermino), 'dd/MM/yyyy')
											: '—'}
									</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{a.motivacao || '—'}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}
