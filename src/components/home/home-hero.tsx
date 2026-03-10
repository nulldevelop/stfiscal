import Link from 'next/link'
import {
	IconArrowRight,
	IconShieldCheck,
	IconTrendingUp,
	IconAlertCircle,
	IconFileText,
} from '@tabler/icons-react'

const metrics = [
	{ icon: IconFileText,    value: '142', label: 'Contratos ativos',   trend: '+12 este mês' },
	{ icon: IconShieldCheck, value: '94%', label: 'Conformidade geral', trend: '↑ 3% vs. mês anterior' },
	{ icon: IconAlertCircle, value: '7',   label: 'Pendências abertas', trend: 'Requer atenção' },
	{ icon: IconTrendingUp,  value: '38',  label: 'Em fiscalização',    trend: 'Dentro do prazo' },
]

export function HomeHero() {
	return (
		<section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
			{/* Malha de pontos */}
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,oklch(0.88_0_0)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50 dark:bg-[radial-gradient(circle,oklch(0.28_0_0)_1px,transparent_1px)] dark:opacity-30" />
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,oklch(0.707_0.165_254.6/0.10),transparent_70%)]" />
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_40%_at_5%_80%,oklch(0.707_0.165_254.6/0.06),transparent_70%)]" />

			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:py-32">

				{/* Esquerda — copy */}
				<div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
					<div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
						<span className="relative flex size-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
							<span className="relative inline-flex size-2 rounded-full bg-primary" />
						</span>
						Gestão Pública Moderna
					</div>

					<h1 className="text-5xl font-black leading-[1.06] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-[4rem]">
						Fiscalização de{' '}
						<br />
						contratos públicos{' '}
						<br />
						<span className="text-primary">sem complicação.</span>
					</h1>

					<p className="mt-7 max-w-lg text-lg leading-[1.75] text-muted-foreground">
						Plataforma integrada para gestão, acompanhamento e fiscalização
						de contratos. Transparência total e conformidade legal em cada etapa.
					</p>

					<div className="mt-10 flex flex-wrap gap-4">
						<Link
							href="/sign-in"
							className="group inline-flex h-13 items-center gap-2.5 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-px active:scale-[0.97]"
						>
							Acessar o sistema
							<IconArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
						</Link>
						<Link
							href="#recursos"
							className="inline-flex h-13 items-center rounded-xl border border-border px-8 text-base font-semibold text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/6 hover:text-primary hover:-translate-y-px active:scale-[0.97]"
						>
							Ver recursos
						</Link>
					</div>

					<div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
						{['Dados protegidos', 'Auditoria completa', 'Conforme legislação'].map((item) => (
							<span key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
								<IconShieldCheck className="size-4 shrink-0 text-primary/70" />
								{item}
							</span>
						))}
					</div>
				</div>

				{/* Direita — painel */}
				<div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
					<div className="relative">
						<div className="absolute -inset-6 rounded-3xl bg-primary/5 blur-3xl dark:bg-primary/10" />

						<div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/30">
							{/* Header */}
							<div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
								<div className="flex items-center gap-2.5">
									<div className="size-2.5 rounded-full bg-primary" />
									<span className="text-sm font-semibold text-foreground">
										Dashboard — Fiscalização
									</span>
								</div>
								<span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
									Ao vivo
								</span>
							</div>

							{/* URL bar */}
							<div className="border-b border-border/50 bg-muted/20 px-6 py-2.5">
								<div className="flex h-7 items-center gap-2 rounded-md border border-border/60 bg-background px-3">
									<div className="size-2 rounded-full bg-green-400" />
									<span className="text-xs text-muted-foreground">
										stfiscal.gov.br/dashboard
									</span>
								</div>
							</div>

							{/* Métricas */}
							<div className="grid grid-cols-2 divide-x divide-y divide-border">
								{metrics.map((m) => (
									<div key={m.label} className="group flex flex-col gap-4 p-6 transition-colors hover:bg-primary/4">
										<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
											<m.icon className="size-5" />
										</div>
										<div>
											<p className="text-3xl font-black tabular-nums tracking-tight text-foreground transition-transform duration-200 group-hover:scale-105 origin-left">
												{m.value}
											</p>
											<p className="mt-1 text-sm font-medium text-muted-foreground">
												{m.label}
											</p>
											<p className="mt-1 text-xs text-primary/70">
												{m.trend}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* Footer */}
							<div className="border-t border-border bg-muted/20 px-6 py-3.5">
								<p className="text-xs text-muted-foreground">
									Atualizado agora mesmo · Dados em tempo real
								</p>
							</div>
						</div>
					</div>
				</div>

			</div>

			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
		</section>
	)
}
