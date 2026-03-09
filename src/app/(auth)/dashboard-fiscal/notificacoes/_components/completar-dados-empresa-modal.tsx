'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const dadosEmpresaSchema = z.object({
	empresaEndereco: z.string().min(1, 'Endereço da empresa é obrigatório'),
	empresaRepresentanteNome: z
		.string()
		.min(1, 'Nome do representante é obrigatório'),
	empresaRepresentanteCpf: z
		.string()
		.min(1, 'CPF do representante é obrigatório'),
})

export type DadosEmpresaFormValues = z.infer<typeof dadosEmpresaSchema>

interface CompletarDadosEmpresaModalProps {
	empresaNome: string
	empresaCnpj?: string
	displayContrato?: string
	displayLicitacao?: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (dados: DadosEmpresaFormValues) => void
	isPending?: boolean
	defaultValues?: Partial<DadosEmpresaFormValues>
}

export function CompletarDadosEmpresaModal({
	empresaNome,
	empresaCnpj,
	displayContrato,
	displayLicitacao,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
	defaultValues,
}: CompletarDadosEmpresaModalProps) {
	const form = useForm<DadosEmpresaFormValues>({
		resolver: zodResolver(dadosEmpresaSchema),
		defaultValues: {
			empresaEndereco: defaultValues?.empresaEndereco || '',
			empresaRepresentanteNome: defaultValues?.empresaRepresentanteNome || '',
			empresaRepresentanteCpf: defaultValues?.empresaRepresentanteCpf || '',
		},
	})

	const onSubmit = (values: DadosEmpresaFormValues) => {
		onConfirm(values)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Dados da Empresa Incompletos</DialogTitle>
					<DialogDescription>
						Os dados da empresa estão incompletos no sistema. Por favor,
						preencha as informações abaixo para gerar a notificação.
					</DialogDescription>
				</DialogHeader>

				{/* Seção: Identificação do Contrato */}
				{(displayContrato || displayLicitacao) && (
					<div className="space-y-3 rounded-lg /50 p-4">
						<h4 className="font-semibold text-sm text-muted-foreground">
							Identificação do Contrato
						</h4>
						<div className="grid grid-cols-1 gap-2 text-sm">
							{displayContrato && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Contrato:</span>
									<span className="font-medium">{displayContrato}</span>
								</div>
							)}
							{displayLicitacao && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Licitação:</span>
									<span className="font-medium">{displayLicitacao}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Seção: Dados da Empresa */}
				<div className="space-y-3 rounded-lg /50 p-4">
					<h4 className="font-semibold text-sm text-muted-foreground">
						Dados da Empresa
					</h4>
					<div className="grid grid-cols-1 gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Empresa:</span>
							<span className="font-medium">{empresaNome}</span>
						</div>
						{empresaCnpj && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">CNPJ:</span>
								<span className="font-medium">{empresaCnpj}</span>
							</div>
						)}
					</div>
				</div>

				<Separator />

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="empresaEndereco"
							render={({ field }) => (
								<FormItem>
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

						<FormField
							control={form.control}
							name="empresaRepresentanteNome"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome do Representante Legal</FormLabel>
									<FormControl>
										<Input placeholder="Ex: João da Silva" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="empresaRepresentanteCpf"
								render={({ field }) => (
									<FormItem>
										<FormLabel>CPF do Representante</FormLabel>
										<FormControl>
											<Input placeholder="Ex: 123.456.789-00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Confirmar Dados
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
