import Link from 'next/link'
import {
	IconArrowRight,
	IconShieldCheckFilled,
	IconBriefcase,
	IconFileText,
	IconCircleCheck,
	IconEye,
	IconChevronRight,
} from '@tabler/icons-react'

const metrics = [
	{
		icon: IconBriefcase,
		value: '142',
		label: 'Contratos',
		description: 'Sob fiscalização',
		color: 'from-green-500/20',
		iconColor: 'text-green-600 dark:text-green-500',
		iconBg: 'bg-green-500/15',
	},
	{
		icon: IconFileText,
		value: '28',
		label: 'Relatórios',
		description: 'Enviados este mês',
		color: 'from-blue-500/20',
		iconColor: 'text-blue-600 dark:text-blue-500',
		iconBg: 'bg-blue-500/15',
	},
	{
		icon: IconCircleCheck,
		value: 'Regular',
		label: 'Status Geral',
		description: 'Tudo em dia',
		color: 'from-purple-500/20',
		iconColor: 'text-purple-600 dark:text-purple-500',
		iconBg: 'bg-purple-500/15',
	},
]

const contracts = [
	{
		numero: '124/2024',
		contratado: 'Construtora Alpha Ltda',
		status: 'ok',
		label: 'Em dia',
	},
	{
		numero: '089/2024',
		contratado: 'Tech Solutions S.A.',
		status: 'warning',
		label: 'Pendente',
	},
]

export function HomeHero() {
	return (
		<section className="relative overflow-hidden bg-background px-6 pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-48">
			{/* Glow de fundo posicionado à esquerda */}
			<div className="absolute left-0 top-0 -translate-x-1/4 -translate-y-1/4 w-[800px] h-[600px] bg-primary/15 blur-[120px] rounded-full pointer-events-none opacity-50" />

			{/* Grid de fundo */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_30%,#000_60%,transparent_100%)] opacity-[0.1]" />

			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-8">

					{/* Conteúdo à Esquerda */}
					<div className="relative z-10 flex flex-col items-start text-left animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both">

						{/* Badge Compacta */}
						<div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary backdrop-blur-md animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
							<span className="relative flex size-1.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
								<span className="relative inline-flex size-1.5 rounded-full bg-primary" />
							</span>
							Plataforma de Nova Geração
						</div>

						{/* Headline Ajustada */}
						<h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
							Fiscalização de contratos{' '}
							<span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
								sem burocracia.
							</span>
						</h1>

						{/* Subheadline Ajustada */}
						<p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-in fade-in slide-in-from-left-8 duration-1000 delay-500 fill-mode-both">
							Sistema integrado para gestão, acompanhamento e fiscalização
							de contratos públicos. Tenha total transparência e conformidade em cada etapa do processo administrativo.
						</p>

						{/* Botões Compactos */}
						<div className="mt-8 flex items-center gap-3 animate-in fade-in slide-in-from-left-8 duration-1000 delay-700 fill-mode-both">
							<Link
								href="/sign-in"
								className="group flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
							>
								Acessar sistema
								<IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
							</Link>
							<Link
								href="#recursos"
								className="flex h-11 items-center rounded-full border border-border bg-card/50 px-6 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-300 hover:bg-accent active:scale-95"
							>
								Recursos
							</Link>
						</div>
					</div>

					{/* Mockup do Dashboard à Direita */}
					<div className="relative w-full animate-in fade-in slide-in-from-right-8 zoom-in-95 duration-1000 delay-1000 fill-mode-both scale-100 lg:scale-110 origin-center lg:origin-left">
						<div className="absolute inset-x-10 bottom-0 top-10 rounded-3xl bg-linear-to-b from-primary/5 to-transparent blur-3xl" />

						<div className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-black/10 overflow-hidden ring-1 ring-white/5">

							{/* Header do Mockup */}
							<div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-4 py-2">
								<div className="flex gap-1.2">
									<div className="size-2 rounded-full bg-red-400/60" />
									<div className="size-2 rounded-full bg-yellow-400/60" />
									<div className="size-2 rounded-full bg-green-400/60" />
								</div>
								<div className="flex h-5 flex-1 items-center justify-center rounded bg-background/40 max-w-40 mx-auto shadow-inner border border-border/20">
									<span className="text-[8px] font-medium text-muted-foreground/60 flex items-center gap-1">
										<IconShieldCheckFilled className="size-2 text-green-500/50" />
										stfiscal.gov.br
									</span>
								</div>
							</div>

							{/* Conteúdo do Mockup */}
							<div className="p-4 sm:p-5">
								{/* Métricas Compactas */}
								<div className="grid grid-cols-3 gap-2.5 mb-5">
									{metrics.map((m) => (
										<div key={m.label} className={`rounded-lg border border-border/40 p-2.5 bg-linear-to-br ${m.color} via-transparent to-transparent shadow-sm`}>
											<div className="flex items-center justify-between mb-1.5">
												<p className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground/80">{m.label}</p>
												<m.icon className={`size-3 ${m.iconColor}`} />
											</div>
											<p className="text-base font-bold tabular-nums text-foreground">{m.value}</p>
										</div>
									))}
								</div>

								{/* Lista Compacta */}
								<div className="flex flex-col gap-2.5">
									{contracts.map((c) => (
										<div key={c.numero} className="rounded-lg border border-border/40 bg-background/40 p-2.5 shadow-sm flex flex-col gap-1.5">
											<div className="flex items-center justify-between">
												<p className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground/80">Contrato {c.numero}</p>
												<span className={`rounded px-1.5 py-0.5 text-[7px] font-bold uppercase ${
													c.status === 'ok' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive'
												}`}>
													{c.label}
												</span>
											</div>
											<p className="text-[10px] font-semibold text-foreground line-clamp-1">{c.contratado}</p>
											<div className="flex h-6 items-center justify-between rounded border border-border px-2 text-[8px] font-bold text-muted-foreground bg-card/50">
												Gerenciar
												<IconChevronRight className="size-2.5" />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
