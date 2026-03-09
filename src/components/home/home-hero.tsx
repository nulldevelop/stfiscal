import Link from 'next/link'
import { Button } from '@/components/ui/button'

const stats = [
	{ label: 'Contratos ativos', value: '142' },
	{ label: 'Em fiscalização', value: '38' },
	{ label: 'Notificações', value: '7' },
	{ label: 'Conformidade', value: '94%' },
]

export function HomeHero() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.546_0.245_262/0.12),transparent)]" />
			<div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

			<div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
						<span className="size-1.5 rounded-full bg-primary" />
						Gestão pública moderna
					</div>

					<h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						Fiscalização de contratos{' '}
						<span className="text-primary">sem complexidade</span>
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
						Plataforma integrada para gestão, acompanhamento e fiscalização de
						contratos públicos. Mais transparência, rastreabilidade e controle
						em cada etapa.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-2">
						<Button
							asChild
							size="lg"
							className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/20"
						>
							<Link href="/sign-in">Acessar o sistema</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="h-12 rounded-xl px-8 text-base"
						>
							<Link href="#recursos">Conhecer recursos</Link>
						</Button>
					</div>
				</div>

				{/* Preview card */}
				<div className="mx-auto mt-16 max-w-4xl">
					<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
						<div className="flex items-center gap-1.5 border-b border-border bg-secondary/50 px-4 py-3">
							<span className="size-3 rounded-full bg-destructive/60" />
							<span className="size-3 rounded-full bg-yellow-400/60" />
							<span className="size-3 rounded-full bg-green-400/60" />
							<span className="ml-3 text-xs text-muted-foreground">
								stfiscal.gov.br/dashboard
							</span>
						</div>
						<div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
							{stats.map((stat) => (
								<div key={stat.label} className="px-6 py-8 text-center">
									<p className="text-2xl font-bold text-primary">
										{stat.value}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{stat.label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
