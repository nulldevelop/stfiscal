'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { createAditivoAction } from '../_actions/create-aditivo'
import { getAditivosFormData } from '../_data-access/get-form-data'

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

interface CreateAditivoFormProps {
	onSuccess?: () => void
}

export function CreateAditivoForm({ onSuccess }: CreateAditivoFormProps) {
	const [isPending, startTransition] = useTransition()
	const [formData, setFormData] = useState<{
		contratos: { id: string; label: string }[]
	}>({ contratos: [] })

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			contratoId: '',
			sequencia: 1,
			data: new Date(),
			valorAditivo: 0,
			motivacao: '',
		},
	})

	useEffect(() => {
		getAditivosFormData().then(setFormData)
	}, [])

	async function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const res = await createAditivoAction(values)

			if (res.success) {
				toast.success('Aditivo criado com sucesso!')
				form.reset()
				onSuccess?.()
			} else {
				toast.error(res.error)
			}
		})
	}

	const contratosData = formData.contratos.map((c) => ({
		label: c.label,
		value: c.id,
	}))

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
					<FormField
						control={form.control}
						name="contratoId"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Contrato</FormLabel>
								<Combobox
									data={contratosData}
									type="contrato"
									value={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<ComboboxTrigger />
									</FormControl>
									<ComboboxContent>
										<ComboboxInput placeholder="Procurar contrato..." />
										<ComboboxList>
											<ComboboxEmpty>Nenhum contrato encontrado.</ComboboxEmpty>
											<ComboboxGroup>
												{contratosData.map((c) => (
													<ComboboxItem key={c.value} value={c.value}>
														{c.label}
													</ComboboxItem>
												))}
											</ComboboxGroup>
										</ComboboxList>
									</ComboboxContent>
								</Combobox>
								<FormMessage />
							</FormItem>
						)}
					/>

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
													!field.value && 'text-muted-foreground',
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
													!field.value && 'text-muted-foreground',
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
													!field.value && 'text-muted-foreground',
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
							'Salvar Aditivo'
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
