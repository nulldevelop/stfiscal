import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export function HomeNav() {
	return (
		<header className="sticky top-0 z-50 animate-in fade-in slide-in-from-top-2 duration-500 fill-mode-both">
			<div className="h-[3px] bg-linear-to-r from-primary/40 via-primary to-primary/40" />

			<nav className="border-b border-border/50 bg-background/90 backdrop-blur-xl">
				<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">

					<Link href="/" className="group flex items-center gap-4">
						<div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary">
							<span className="text-sm font-black tracking-tight text-white">ST</span>
							<div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
						</div>
						<div className="hidden sm:block">
							<p className="text-base font-bold leading-none tracking-wide text-foreground">
								Sistema de Fiscalização
							</p>
							<p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
								Contratos Públicos
							</p>
						</div>
					</Link>

					<div className="flex items-center gap-3">
						<div className="hidden items-center gap-1 sm:flex">
							<Link
								href="#recursos"
								className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								Recursos
							</Link>
							<Link
								href="#sobre"
								className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								Sobre
							</Link>
						</div>

						<div className="mx-1 hidden h-5 w-px bg-border sm:block" />

						<ThemeToggle />

						<Link
							href="/sign-in"
							className="ml-1 inline-flex h-10 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
						>
							Acessar sistema
						</Link>
					</div>

				</div>
			</nav>
		</header>
	)
}
