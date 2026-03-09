import { LoginForm } from './_components/login-form'
import { LoginHero } from './_components/login-hero'

export default function LoginPage() {
	return (
		<main className="flex h-screen overflow-hidden">
			{/* Left — Form */}
			<div className="flex h-full w-full flex-col lg:w-1/2">
				<LoginForm />
			</div>

			{/* Right — Hero */}
			<div className="hidden h-full lg:flex lg:w-1/2">
				<LoginHero />
			</div>
		</main>
	)
}
