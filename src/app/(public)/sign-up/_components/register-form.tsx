'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Hash, Mail, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BackButton } from '@/components/shared/back-button'
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
import { authClient, signInGoogle, signInMicrosoft } from '@/lib/auth-client'

import { cpfSignUpAction } from '../_actions/cpf-signup'
import { signUpSchemas } from '../_validations/sign-up-schema'
import { formatCpf } from '@/utils/formatCpf'

type Method = 'email' | 'username' | 'cpf'

type FormData = {
	name: string
	identifier: string
	email: string
	password: string
	confirmPassword: string
}

const methods: {
	key: Method
	label: string
	icon: React.ReactNode
	placeholder: string
	inputType: string
	inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}[] = [
	{
		key: 'email',
		label: 'E-mail',
		icon: <Mail className="size-4" />,
		placeholder: 'seu@email.com',
		inputType: 'email',
	},
	{
		key: 'username',
		label: 'Username',
		icon: <User className="size-4" />,
		placeholder: 'seu_usuario',
		inputType: 'text',
	},
	{
		key: 'cpf',
		label: 'CPF',
		icon: <Hash className="size-4" />,
		placeholder: '000.000.000-00',
		inputType: 'text',
		inputMode: 'numeric',
	},
]

const inputClass =
	'h-9 rounded-lg border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground lg:h-10'

export function RegisterForm() {
	const router = useRouter()
	const [method, setMethod] = useState<Method>('email')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [serverError, setServerError] = useState<string | null>(null)

	const methodRef = useRef(method)
	methodRef.current = method

	const form = useForm<FormData>({
		resolver: (data, ctx, opts) =>
			zodResolver(signUpSchemas[methodRef.current])(data, ctx, opts),
		defaultValues: {
			name: '',
			identifier: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	const {
		formState: { isSubmitting },
	} = form

	const cpfSignUp = useMutation({
		mutationFn: cpfSignUpAction,
		onSuccess: (result) => {
			if (result.error) {
				setServerError(result.error)
				return
			}
			router.push('/auth/callback')
		},
		onError: () => setServerError('Erro ao cadastrar. Tente novamente.'),
	})

	function handleMethodChange(next: Method) {
		setMethod(next)
		setServerError(null)
		form.reset()
	}

	async function onSubmit(data: FormData) {
		setServerError(null)

		if (method === 'email') {
			const { error } = await authClient.signUp.email({
				email: data.identifier,
				password: data.password,
				name: data.name,
				callbackURL: '/auth/callback',
			})
			if (error) {
				setServerError(
					error.code === 'USER_ALREADY_EXISTS'
						? 'Este e-mail já está em uso.'
						: 'Erro ao cadastrar. Tente novamente.',
				)
				return
			}
			router.push('/auth/callback')
			return
		}

		if (method === 'username') {
			const { error } = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
				username: data.identifier,
				callbackURL: '/auth/callback',
			})
			if (error) {
				setServerError(
					error.code === 'USER_ALREADY_EXISTS'
						? 'Este e-mail ou username já está em uso.'
						: 'Erro ao cadastrar. Tente novamente.',
				)
				return
			}
			router.push('/auth/callback')
			return
		}

		// method === 'cpf'
		cpfSignUp.mutate({
			cpf: data.identifier.replace(/\D/g, ''),
			email: data.email,
			name: data.name,
			password: data.password,
		})
	}

	const currentMethod = methods.find((m) => m.key === method) ?? methods[0]
	const showEmailField = method === 'username' || method === 'cpf'
	const isPending = isSubmitting || cpfSignUp.isPending

	return (
		<div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto px-6 py-3 lg:py-6">
			<div className="w-full max-w-sm">
				{/* Brand */}
				<div className="mb-6">
					<BackButton />
					<h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
						Criar sua Conta
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Insira seus dados para realizar o cadastro
					</p>
				</div>

				{/* Method tabs */}
				<div className="mb-3 flex gap-1 rounded-lg bg-secondary p-1">
					{methods.map((m) => (
						<button
							key={m.key}
							type="button"
							onClick={() => handleMethodChange(m.key)}
							className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
								method === m.key
									? 'bg-primary text-primary-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							{m.icon}
							<span>{m.label}</span>
						</button>
					))}
				</div>

				{/* Form */}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-2"
					>
						{/* Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm">Nome completo</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Seu nome"
											disabled={isPending}
											className={inputClass}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Identifier (email | username | cpf) */}
						<FormField
							control={form.control}
							name="identifier"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm">
										{currentMethod.label}
									</FormLabel>
									<FormControl>
										<Input
											type={currentMethod.inputType}
											inputMode={currentMethod.inputMode}
											placeholder={currentMethod.placeholder}
											disabled={isPending}
											className={inputClass}
											{...field}
											onChange={(e) => {
												if (method === 'cpf') {
													field.onChange(formatCpf(e.target.value))
												} else {
													field.onChange(e)
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* E-mail (only for username and cpf methods) */}
						{showEmailField && (
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm">E-mail</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="seu@email.com"
												disabled={isPending}
												className={inputClass}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Password */}
						<div className="flex flex-col md:flex-row gap-2">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm">Senha</FormLabel>
										<div className="relative">
											<FormControl>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder="Digite sua senha"
													disabled={isPending}
													className={`${inputClass} pr-10`}
													{...field}
												/>
											</FormControl>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
												aria-label={
													showPassword ? 'Ocultar senha' : 'Mostrar senha'
												}
											>
												{showPassword ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Confirm Password */}
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm">Confirmar senha</FormLabel>
										<div className="relative">
											<FormControl>
												<Input
													type={showConfirm ? 'text' : 'password'}
													placeholder="Repita sua senha"
													disabled={isPending}
													className={`${inputClass} pr-10`}
													{...field}
												/>
											</FormControl>
											<button
												type="button"
												onClick={() => setShowConfirm(!showConfirm)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
												aria-label={
													showConfirm ? 'Ocultar senha' : 'Mostrar senha'
												}
											>
												{showConfirm ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{serverError && (
							<p className="text-sm font-medium text-destructive">
								{serverError}
							</p>
						)}

						<Button
							type="submit"
							disabled={isPending}
							className="h-10 w-full rounded-lg font-semibold shadow-sm shadow-primary/20"
						>
							{isPending ? 'Cadastrando...' : 'Criar conta'}
						</Button>
					</form>
				</Form>

				{/* Already have account */}
				<p className="mt-3 text-center text-sm text-muted-foreground">
					Já tem uma conta?{' '}
					<Link
						href="/sign-in"
						className="font-medium text-primary transition-colors hover:text-primary/80"
					>
						Entrar
					</Link>
				</p>

				{/* Divider */}
				<div className="relative my-3 lg:my-4">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs">
						<span className="bg-background px-3 text-muted-foreground">
							ou continue com
						</span>
					</div>
				</div>

				{/* Social Buttons */}
				<div className="grid grid-cols-3 gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={isPending}
						className="h-10 rounded-lg border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80"
					>
						<Image
							src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
							alt="Gov.br"
							width={48}
							height={16}
							className="shrink-0"
						/>
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={signInGoogle}
						disabled={isPending}
						className="h-10 rounded-lg border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80"
					>
						<svg
							className="size-4 shrink-0"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={signInMicrosoft}
						disabled={isPending}
						className="h-10 rounded-lg border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80"
					>
						<svg
							className="mr-1.5 size-4 shrink-0"
							viewBox="0 0 23 23"
							aria-hidden="true"
						>
							<path fill="#f35325" d="M1 1h10v10H1z" />
							<path fill="#81bc06" d="M12 1h10v10H12z" />
							<path fill="#05a6f0" d="M1 12h10v10H1z" />
							<path fill="#ffba08" d="M12 12h10v10H12z" />
						</svg>
						Microsoft
					</Button>
				</div>
			</div>
		</div>
	)
}
