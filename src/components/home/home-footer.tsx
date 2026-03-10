import Link from 'next/link'

const links = [
	{ label: 'Recursos', href: '#recursos' },
	{ label: 'Sobre', href: '#sobre' },
	{ label: 'Acessar', href: '/sign-in' },
]

export function HomeFooter() {
	return (
		<footer className="border-t border-border">
			<div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">

				<div className="flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
					<Link href="/" className="group flex items-center gap-3.5">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/15">
							<span className="text-sm font-black text-primary">ST</span>
						</div>
						<div>
							<p className="text-sm font-bold leading-none tracking-wide text-foreground">
								Sistema de Fiscalização
							</p>
							<p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
								Contratos Públicos
							</p>
						</div>
					</Link>

					<nav className="flex items-center gap-1">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div className="border-t border-border py-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} ST — Fiscalização de Contratos. Todos os direitos reservados.
					</p>
					<p className="text-sm text-muted-foreground">
						Uso restrito a servidores autorizados
					</p>
				</div>

			</div>
		</footer>
	)
}
