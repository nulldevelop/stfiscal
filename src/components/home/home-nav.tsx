import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export function HomeNav() {
	return (
		<div className="fixed left-0 right-0 top-0 z-50 mt-6 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700">
			<nav className="pointer-events-auto flex h-14 items-center justify-between gap-6 rounded-full border border-border/40 bg-background/60 px-4 pr-2 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20">
				
				{/* Logo */}
				<Link href="/" className="group flex items-center gap-2.5 pl-2">
					<div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-inner transition-transform group-hover:scale-105">
						<span className="font-display text-xs font-bold">ST</span>
					</div>
					<span className="font-display text-sm font-semibold tracking-tight text-foreground">
						Fiscalização
					</span>
				</Link>

				{/* Links */}
				<div className="hidden sm:flex items-center gap-1">
					{[{ label: 'Recursos', href: '#recursos' }, { label: 'Sobre', href: '#sobre' }].map((item) => (
						<Link
							key={item.label}
							href={item.href}
							className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 pl-2 sm:border-l sm:border-border/50">
					<ThemeToggle />
					<Link
						href="/sign-in"
						className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
					>
						Acessar
					</Link>
				</div>

			</nav>
		</div>
	)
}
