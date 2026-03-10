import Link from 'next/link'
import { IconArrowRight, IconShieldCheck, IconBuildingBank } from '@tabler/icons-react'

const highlights = [
	'Acesso restrito a servidores autorizados',
	'Dados protegidos e criptografados',
	'Conformidade com legislação vigente',
]

export function HomeCta() {
	return (
		<section id="sobre" className="py-16 pb-32">
			<div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
				<div className="relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
					<div className="absolute inset-0 bg-linear-to-br from-primary via-primary/95 to-primary/80" />
					<div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
					<div className="absolute -right-24 -top-24 size-[500px] rounded-full bg-white/5 blur-3xl" />
					<div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5 blur-2xl" />

					<div className="relative grid grid-cols-1 gap-12 px-10 py-16 sm:px-16 sm:py-20 lg:grid-cols-5 lg:items-center lg:gap-20">

						<div className="lg:col-span-3">
							<div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
								<IconBuildingBank className="size-4" />
								Acesso institucional
							</div>

							<h2 className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
								Centralize a gestão de contratos com segurança.
							</h2>

							<p className="mt-5 text-lg leading-relaxed text-white/70">
								Uma plataforma robusta para a administração pública gerenciar,
								acompanhar e fiscalizar contratos com total rastreabilidade.
							</p>

							<ul className="mt-7 space-y-3">
								{highlights.map((item) => (
									<li key={item} className="flex items-center gap-3 text-base text-white/80">
										<IconShieldCheck className="size-5 shrink-0 text-white/60" />
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className="lg:col-span-2 lg:flex lg:justify-end">
							<div className="flex flex-col gap-4">
								<Link
									href="/sign-in"
									className="group inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-white px-10 text-base font-bold text-primary shadow-xl shadow-black/20 transition-all duration-200 hover:bg-white/95 hover:-translate-y-px hover:shadow-2xl hover:shadow-black/25 active:scale-[0.97]"
								>
									Entrar no sistema
									<IconArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
								</Link>
								<p className="text-center text-xs text-white/50">
									Somente para servidores autorizados
								</p>
							</div>
						</div>

					</div>
				</div>
			</div>
		</section>
	)
}
