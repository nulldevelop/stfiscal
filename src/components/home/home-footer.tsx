import Link from 'next/link'

export function HomeFooter() {
	return (
		<footer className="border-t border-border bg-secondary/30">
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 items-center justify-center rounded-md bg-primary">
							<span className="text-xs font-bold text-primary-foreground">ST</span>
						</div>
						<span className="text-sm font-medium text-foreground">
							Fiscalização de Contratos
						</span>
					</div>

					<nav className="flex items-center gap-5 text-sm text-muted-foreground">
						<Link href="#recursos" className="transition-colors hover:text-foreground">
							Recursos
						</Link>
						<Link href="#sobre" className="transition-colors hover:text-foreground">
							Sobre
						</Link>
						<Link href="/sign-in" className="transition-colors hover:text-foreground">
							Acessar
						</Link>
					</nav>
				</div>

				<div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} ST — Fiscalização de Contratos. Todos os
					direitos reservados.
				</div>
			</div>
		</footer>
	)
}
