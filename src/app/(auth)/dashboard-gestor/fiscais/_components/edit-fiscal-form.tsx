'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	Briefcase,
	CreditCard,
	Hash,
	Mail,
	Phone,
	Save,
	User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { extractCpf, formatCpf } from '@/utils/formatCpf'
import { extractPhoneNumber, formatPhone } from '@/utils/formatPhone'
import { maskCpf } from '@/utils/maskCpf'
// Importação direta da ação existente para reaproveitar lógica
import { updateFiscalAction } from '../_actions/fiscal-actions'

const formSchema = z.object({
	nome: z.string().min(2, 'Nome muito curto'),
	email: z.string().email('Email inválido'),
	cpf: z.string().min(14, 'CPF inválido'),
	matricula: z.string().min(1, 'Matrícula é obrigatória'),
	cargo: z.string().min(2, 'Cargo é obrigatório'),
	contato: z.string().optional(),
	ativo: z.boolean(),
})

export function EditFiscalForm({ fiscal }: { fiscal: any }) {
	const router = useRouter()
	const [isCpfFocused, setIsCpfFocused] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nome: fiscal.nome,
			email: fiscal.user?.email || fiscal.email || '',
			cpf: formatCpf(fiscal.cpf || ''),
			matricula: fiscal.matricula,
			cargo: fiscal.cargo,
			contato: formatPhone(fiscal.contato || ''),
			ativo: !!fiscal.ativo,
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!fiscal.userId) {
			toast.error(
				'Este fiscal não possui um usuário vinculado para atualização de perfil.',
			)
			return
		}

		try {
			const res = await updateFiscalAction({
				id: fiscal.userId,
				name: values.nome,
				email: values.email,
				cpf: extractCpf(values.cpf),
				matricula: values.matricula,
				cargo: values.cargo,
				contato: values.contato ? extractPhoneNumber(values.contato) : '',
			})

			if (res.success) {
				toast.success('Fiscal atualizado com sucesso')
				router.refresh()
			} else {
				toast.error(res.error || 'Erro ao atualizar')
			}
		} catch {
			toast.error('Erro ao atualizar fiscal')
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Coluna 1: Dados Pessoais */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 pb-2 border-b">
							<User className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-medium">Dados Pessoais</h3>
						</div>

						<FormField
							control={form.control}
							name="nome"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome Completo</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Ex: João Silva" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<div className="relative">
											<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												{...field}
												type="email"
												className="pl-9"
												placeholder="email@exemplo.com"
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="cpf"
								render={({ field }) => (
									<FormItem>
										<FormLabel>CPF</FormLabel>
										<FormControl>
											<div className="relative">
												<CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													{...field}
													value={
														isCpfFocused ? field.value : maskCpf(field.value)
													}
													className="pl-9"
													placeholder="000.000.000-00"
													onChange={(e) => {
														const formatted = formatCpf(e.target.value)
														field.onChange(formatted)
													}}
													onFocus={() => setIsCpfFocused(true)}
													onBlur={() => {
														field.onBlur()
														setIsCpfFocused(false)
													}}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contato"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contato</FormLabel>
										<FormControl>
											<div className="relative">
												<Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													{...field}
													className="pl-9"
													placeholder="(00) 00000-0000"
													onChange={(e) => {
														const formatted = formatPhone(e.target.value)
														field.onChange(formatted)
													}}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Coluna 2: Dados Profissionais e Status */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 pb-2 border-b">
							<Briefcase className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-medium">Informações Profissionais</h3>
						</div>

						<FormField
							control={form.control}
							name="cargo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cargo / Função</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Ex: Engenheiro Civil" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="matricula"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Matrícula</FormLabel>
									<FormControl>
										<div className="relative">
											<Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input {...field} className="pl-9" placeholder="000000" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="pt-4">
							<FormField
								control={form.control}
								name="ativo"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20 shadow-sm">
										<div className="space-y-0.5">
											<FormLabel className="text-base font-semibold">
												Status do Fiscal
											</FormLabel>
											<div className="text-sm text-muted-foreground">
												Ativar ou inativar o fiscal no sistema.
											</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-end pt-3 border-t">
					<Button
						type="submit"
						size="lg"
						className="gap-2 px-2 shadow-md"
						disabled={form.formState.isSubmitting}
					>
						<Save className="h-4 w-4" />
						{form.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
