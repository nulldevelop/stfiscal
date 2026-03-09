import { LoginForm } from './_components/login-form'

export default function LoginPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center  p-6 md:p-10">
			<div className="absolute inset-0 bg-background/80"></div>

			<div className="relative w-full max-w-sm md:max-w-3xl">
				<LoginForm />
			</div>
		</div>
	)
}
