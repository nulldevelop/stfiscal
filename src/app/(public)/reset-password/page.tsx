'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, 'A senha deve ter no mínimo 8 caracteres')
			.max(128, 'A senha deve ter no máximo 128 caracteres'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword'],
	})

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const token = searchParams.get('token')
	const error = searchParams.get('error')

	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(data: ResetPasswordInput) {
		if (!token) {
			toast.error('Token de redefinição não encontrado')
			return
		}

		try {
			setIsSubmitting(true)
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token,
			})

			if (result.error) {
				toast.error(result.error.message || 'Erro ao redefinir senha')
				setIsSubmitting(false)
				return
			}

			toast.success('Senha redefinida com sucesso!')
			router.push('/sign-in')
		} catch (err) {
			toast.error('Erro ao redefinir senha. Tente novamente.')
			setIsSubmitting(false)
		}
	}

	// Token inválido ou expirado
	if (error === 'INVALID_TOKEN') {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardContent className="flex flex-col items-center gap-4 p-6">
						<h1 className="text-xl font-bold text-destructive">
							Link Inválido ou Expirado
						</h1>
						<p className="text-center text-sm text-muted-foreground">
							O link de redefinição de senha é inválido ou expirou. Por favor,
							solicite um novo link.
						</p>
						<Button
							onClick={() => router.push('/forgot-password')}
							className="w-full"
						>
							Solicitar Novo Link
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Sem token
	if (!token) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardContent className="flex flex-col items-center gap-4 p-6">
						<h1 className="text-xl font-bold text-destructive">
							Token Não Encontrado
						</h1>
						<p className="text-center text-sm text-muted-foreground">
							Nenhum token foi encontrado. Use o link enviado para o seu e-mail.
						</p>
						<Button onClick={() => router.push('/sign-in')} className="w-full">
							Voltar para Login
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md border shadow-lg">
				<CardContent className="p-6">
					<div className="flex flex-col items-center gap-4">
						<h1 className="text-xl font-bold">Redefinir Senha</h1>
						<p className="text-center text-sm text-muted-foreground">
							Digite sua nova senha abaixo.
						</p>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex w-full flex-col gap-3"
							>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nova Senha</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Digite sua nova senha"
													disabled={isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirmar Senha</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Confirme sua nova senha"
													disabled={isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Redefinindo...
										</>
									) : (
										'Redefinir Senha'
									)}
								</Button>
							</form>
						</Form>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	)
}
