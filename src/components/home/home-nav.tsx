import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeNav() {
	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link
					href="/"
					className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary">
						<span className="text-sm font-bold text-primary-foreground">ST</span>
					</div>
					<span className="font-semibold text-foreground">
						Fiscalização de Contratos
					</span>
				</Link>

				<nav className="hidden items-center gap-6 sm:flex">
					<Link
						href="#recursos"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Recursos
					</Link>
					<Link
						href="#sobre"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Sobre
					</Link>
					<Button asChild size="sm" className="rounded-lg">
						<Link href="/sign-in">Acessar sistema</Link>
					</Button>
				</nav>

				<div className="sm:hidden">
					<Button asChild size="sm" className="rounded-lg">
						<Link href="/sign-in">Acessar</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
