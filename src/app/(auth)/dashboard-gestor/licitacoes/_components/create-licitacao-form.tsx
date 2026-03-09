'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
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
import { SituacaoLicitacao, TipoLicitacao } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'
import { createLicitacaoAction } from '../_actions/create-licitacao'

const schema = z.object({
	entidade: z.string().min(1, 'Entidade é obrigatória'),
	objeto: z.string().min(1, 'Objeto é obrigatório'),
	numero: z.number().int().positive('Número deve ser positivo'),
	ano: z.number().int().min(2000, 'Ano inválido'),
	situacao: z.enum([
		SituacaoLicitacao.AGUARDANDO,
		SituacaoLicitacao.ANDAMENTO,
		SituacaoLicitacao.CANCELADA,
		SituacaoLicitacao.CONCLUIDA,
		SituacaoLicitacao.SUSPENSA,
	]),
	modalidade: z.enum([
		TipoLicitacao.CONCORRENCIA,
		TipoLicitacao.TOMADA_DE_PRECO,
		TipoLicitacao.CONVITE,
		TipoLicitacao.PREGAO,
		TipoLicitacao.LEILAO,
		TipoLicitacao.INEXIGIBILIDADE,
		TipoLicitacao.DISPENSA,
		TipoLicitacao.OUTROS,
	]),
	dataPublicacao: z.date({
		message: 'Data de publicação é obrigatória',
	}),
})

interface CreateLicitacaoFormProps {
	onSuccess?: () => void
}

export function CreateLicitacaoForm({ onSuccess }: CreateLicitacaoFormProps) {
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			entidade: '',
			objeto: '',
			numero: 1,
			ano: new Date().getFullYear(),
			situacao: SituacaoLicitacao.AGUARDANDO,
			modalidade: TipoLicitacao.PREGAO,
		},
	})

	async function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const res = await createLicitacaoAction(values)

			if (res.success) {
				toast.success('Licitação criada com sucesso!')
				form.reset()
				onSuccess?.()
			} else {
				toast.error(res.error)
			}
		})
	}

	const modalidades = Object.values(TipoLicitacao).map((m) => ({
		label: m,
		value: m,
	}))

	const situacoes = Object.values(SituacaoLicitacao).map((s) => ({
		label: s,
		value: s,
	}))

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
					<FormField
						control={form.control}
						name="entidade"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Entidade</FormLabel>
								<FormControl>
									<Input placeholder="Ex: Secretaria de Saúde" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="objeto"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Objeto</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Descrição detalhada do objeto"
										className="min-h-20 resize-none"
										{...field}
									/>
								</FormControl>
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
						name="ano"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Ano</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="modalidade"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Modalidade</FormLabel>
								<Combobox
									data={modalidades}
									type="modalidade"
									value={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<ComboboxTrigger />
									</FormControl>
									<ComboboxContent>
										<ComboboxInput placeholder="Procurar modalidade..." />
										<ComboboxList>
											<ComboboxEmpty>
												Nenhuma modalidade encontrada.
											</ComboboxEmpty>
											<ComboboxGroup>
												{modalidades.map((m) => (
													<ComboboxItem key={m.value} value={m.value}>
														{m.label}
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
						name="situacao"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Situação</FormLabel>
								<Combobox
									data={situacoes}
									type="situação"
									value={field.value}
									onValueChange={field.onChange}
								>
									<FormControl>
										<ComboboxTrigger />
									</FormControl>
									<ComboboxContent>
										<ComboboxInput placeholder="Procurar situação..." />
										<ComboboxList>
											<ComboboxEmpty>
												Nenhuma situação encontrada.
											</ComboboxEmpty>
											<ComboboxGroup>
												{situacoes.map((s) => (
													<ComboboxItem key={s.value} value={s.value}>
														{s.label}
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
						name="dataPublicacao"
						render={({ field }) => (
							<FormItem className="flex flex-col md:col-span-2">
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
							'Salvar Licitação'
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
