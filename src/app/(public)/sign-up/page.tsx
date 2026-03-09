import { RegisterForm } from './_components/register-form'
import { RegisterHero } from './_components/register-hero'

export default function RegisterPage() {
	return (
		<main className="flex h-screen overflow-hidden">
			{/* Left — Form */}
			<div className="flex h-full w-full flex-col lg:w-1/2">
				<RegisterForm />
			</div>

			{/* Right — Hero */}
			<div className="hidden h-full lg:flex lg:w-1/2">
				<RegisterHero />
			</div>
		</main>
	)
}
