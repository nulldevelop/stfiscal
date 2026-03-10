import Link from 'next/link'
import { IconShieldCheckFilled } from '@tabler/icons-react'

const nav = [
	{ label: 'Recursos', href: '#recursos' },
	{ label: 'Sobre', href: '#sobre' },
	{ label: 'Acessar', href: '/sign-in' },
]

export function HomeFooter() {
	return (
		<footer className="bg-slate-950">
			<div className="mx-auto max-w-5xl px-6">
				
				{/* Divisor superior sutil */}
				<div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

				<div className="flex flex-col items-center justify-between gap-8 py-12 sm:flex-row">
					
					{/* Logo */}
					<Link href="/" className="group flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-transform group-hover:scale-105">
							<span className="font-display text-xs font-bold">ST</span>
						</div>
						<span className="font-display text-sm font-semibold tracking-tight text-white/90">
							Fiscalização
						</span>
					</Link>

					{/* Links */}
					<nav className="flex items-center gap-6">
						{nav.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className="text-sm font-medium text-white/50 transition-colors hover:text-white"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pb-12 pt-8 sm:flex-row">
					<p className="text-xs text-white/40">
						© {new Date().getFullYear()} ST — Fiscalização de Contratos. Todos os direitos reservados.
					</p>
					<div className="flex items-center gap-1.5 text-xs font-medium text-white/30">
						<IconShieldCheckFilled className="size-3.5" />
						Uso institucional
					</div>
				</div>

			</div>
		</footer>
	)
}
