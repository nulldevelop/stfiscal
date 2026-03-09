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
import { createContratoAction } from '../_actions/create-contrato'
import { getContratosFormData } from '../_data-access/get-form-data'

const schema = z.object({
	licitacaoId: z.string().min(1, 'Licitação é obrigatória'),
	empresaId: z.string().min(1, 'Empresa é obrigatória'),
	numero: z.number().int().positive('Número deve ser positivo'),
	contratado: z.string().min(1, 'Contratado é obrigatório'),
	displayContrato: z.string().min(1, 'Identificação do contrato é obrigatória'),
	displayLicitacao: z
		.string()
		.min(1, 'Identificação da licitação é obrigatória'),
	dataInicio: z.date({
		message: 'Data de início é obrigatória',
	}),
	dataFim: z.date({
		message: 'Data de fim é obrigatória',
	}),
	tipoAto: z.string().min(1, 'Tipo de ato é obrigatório'),
	exercicio: z.number().int().min(2000, 'Exercício inválido'),
	objeto: z.string().optional(),
	nomeFiscal: z.string().optional(),
})

interface CreateContratoFormProps {
	onSuccess?: () => void
}

export function CreateContratoForm({ onSuccess }: CreateContratoFormProps) {
	const [isPending, startTransition] = useTransition()
	const [formData, setFormData] = useState<{
		licitacoes: { id: string; label: string }[]
		empresas: { id: string; label: string; name: string }[]
	}>({ licitacoes: [], empresas: [] })

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			licitacaoId: '',
			empresaId: '',
			numero: 1,
			contratado: '',
			displayContrato: '',
			displayLicitacao: '',
			tipoAto: 'CONTRATO',
			exercicio: new Date().getFullYear(),
			objeto: '',
			nomeFiscal: '',
		},
	})

	useEffect(() => {
		getContratosFormData().then(setFormData)
	}, [])

	// Update displayLicitacao when licitacaoId changes
	useEffect(() => {
		const licitacaoId = form.watch('licitacaoId')
		if (licitacaoId) {
			const label = formData.licitacoes.find((l) => l.id === licitacaoId)?.label
			if (label) form.setValue('displayLicitacao', label)
		}
	}, [formData.licitacoes, form.setValue, form.watch])

	// Update contratado when empresaId changes
	useEffect(() => {
		const empresaId = form.watch('empresaId')
		if (empresaId) {
			const name = formData.empresas.find((e) => e.id === empresaId)?.name
			if (name) form.setValue('contratado', name)
		}
	}, [formData.empresas, form.setValue, form.watch])

	// Auto-fill displayContrato
	useEffect(() => {
		const numero = form.watch('numero')
		const exercicio = form.watch('exercicio')
		if (numero && exercicio) {
			form.setValue(
				'displayContrato',
				`${numero.toString().padStart(3, '0')}/${exercicio}`,
			)
		}
	}, [form.setValue, form.watch])

	async function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const res = await createContratoAction(values)

			if (res.success) {
				toast.success('Contrato criado com sucesso!')
				form.reset()
				onSuccess?.()
			} else {
				toast.error(res.error)
			}
		})
	}

	const licitacoesData = formData.licitacoes.map((l) => ({
		label: l.label,
		value: l.id,
	}))
	const empresasData = formData.empresas.map((e) => ({
		label: e.label,
		value: e.id,
	}))

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
					<FormField
						control={form.control}
						name="licitacaoId"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Licitação</FormLabel>
								<Combobox
									data={licitacoesData}
									type="licitação"
									value={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<ComboboxTrigger />
									</FormControl>
									<ComboboxContent>
										<ComboboxInput placeholder="Procurar licitação..." />
										<ComboboxList>
											<ComboboxEmpty>
												Nenhuma licitação encontrada.
											</ComboboxEmpty>
											<ComboboxGroup>
												{licitacoesData.map((l) => (
													<ComboboxItem key={l.value} value={l.value}>
														{l.label}
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
						name="empresaId"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Empresa Contratada</FormLabel>
								<Combobox
									data={empresasData}
									type="empresa"
									value={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<ComboboxTrigger />
									</FormControl>
									<ComboboxContent>
										<ComboboxInput placeholder="Procurar empresa..." />
										<ComboboxList>
											<ComboboxEmpty>Nenhuma empresa encontrada.</ComboboxEmpty>
											<ComboboxGroup>
												{empresasData.map((e) => (
													<ComboboxItem key={e.value} value={e.value}>
														{e.label}
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
						name="numero"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Número</FormLabel>
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
								<FormLabel>Exercício (Ano)</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="tipoAto"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Tipo de Ato</FormLabel>
								<FormControl>
									<Input placeholder="Ex: CONTRATO" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="displayContrato"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Identificação</FormLabel>
								<FormControl>
									<Input placeholder="Ex: 001/2024" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="dataInicio"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Data de Início</FormLabel>
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
													<span>Selecione</span>
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
						name="dataFim"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Data de Fim</FormLabel>
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
													<span>Selecione</span>
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
						name="objeto"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Objeto (Opcional)</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Descrição do objeto do contrato"
										className="min-h-20 resize-none"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-end pt-4">
					<Button
						type="submit"
						className="w-full md:w-auto min-w-37.5"
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							'Salvar Contrato'
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
