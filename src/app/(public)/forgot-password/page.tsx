'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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

const forgotPasswordSchema = z.object({
	email: z.string().email('E-mail inválido'),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [emailSent, setEmailSent] = useState(false)

	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	})

	async function onSubmit(data: ForgotPasswordInput) {
		try {
			setIsSubmitting(true)
			const result = await authClient.$fetch<{ status: boolean }>('/request-password-reset', {
				method: 'POST',
				body: {
					email: data.email,
					redirectTo: '/reset-password',
				},
			})

			if (result.error) {
				toast.error(
					result.error.message || 'Erro ao solicitar redefinição de senha',
				)
				setIsSubmitting(false)
				return
			}

			setEmailSent(true)
			toast.success('E-mail enviado com sucesso!')
		} catch (error) {
			toast.error('Erro ao processar solicitação. Tente novamente.')
			setIsSubmitting(false)
		}
	}

	if (emailSent) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardContent className="flex flex-col items-center gap-4 p-6">
						<h1 className="text-xl font-bold text-green-600">E-mail Enviado!</h1>
						<p className="text-center text-sm text-muted-foreground">
							Se o e-mail informado estiver cadastrado, você receberá um link
							para redefinir sua senha. Verifique sua caixa de entrada e spam.
						</p>
						<Link href="/sign-in" className="w-full">
							<Button variant="outline" className="w-full">
								Voltar para Login
							</Button>
						</Link>
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
						<h1 className="text-xl font-bold">Esqueceu sua senha?</h1>
						<p className="text-center text-sm text-muted-foreground">
							Digite seu e-mail e enviaremos um link para redefinir sua senha.
						</p>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex w-full flex-col gap-3"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>E-mail</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="seu@email.com"
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
											Enviando...
										</>
									) : (
										'Enviar Link'
									)}
								</Button>

								<Link
									href="/sign-in"
									className="text-center text-sm text-muted-foreground hover:underline"
								>
									Voltar para o login
								</Link>
							</form>
						</Form>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
