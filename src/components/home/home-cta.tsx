import { IconArrowRight, IconShieldCheckFilled } from '@tabler/icons-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function HomeCta() {
	return (
		<section 
			id="sobre" 
			className="relative overflow-hidden flex flex-col items-center justify-center w-full py-24 sm:py-32"
		>
			{/* Container Escuro Forçado */}
			<div className="absolute inset-0 bg-slate-950" />

			{/* Texturas de fundo e Glow */}
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_60%)]" />

			<div className="relative mx-auto max-w-4xl px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
				
				<div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
					<IconShieldCheckFilled className="size-3.5" />
					Restrito a Servidores
				</div>

				<h2 className="font-display text-4xl font-black tracking-tight text-white sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400 fill-mode-both">
					Comece a fiscalizar <br className="hidden sm:block" />
					<span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/50">
						com segurança.
					</span>
				</h2>

				<p className="mx-auto mt-6 max-w-2xl text-base text-white/60 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600 fill-mode-both">
					Acesse o painel institucional para gerenciar seus contratos de forma auditável.
				</p>

				<div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-800 fill-mode-both">
					<Link
						href="/sign-in"
						className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-8 text-sm font-bold text-slate-950 shadow-lg shadow-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 active:scale-95"
					>
						Entrar no sistema
						<IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
				</div>

				{/* Trust Badges Compactas */}
				<div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
					<span>100% Rastreável</span>
					<span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
					<span>Lei 14.133</span>
					<span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
					<span>Audit Log</span>
				</div>

			</div>
		</section>
	)
}
