import {
	IconBuildingBank,
	IconChartBar,
	IconFileCheck,
	IconLock,
	IconSearch,
	IconUsers,
} from '@tabler/icons-react'

const features = [
	{
		icon: IconFileCheck,
		title: 'Gestão de Contratos',
		description:
			'Cadastre, acompanhe e fiscalize contratos com visibilidade total.',
		className: 'md:col-span-2',
	},
	{
		icon: IconSearch,
		title: 'Fiscalização Ativa',
		description:
			'Registre ocorrências e notificações.',
		className: 'md:col-span-1',
	},
	{
		icon: IconChartBar,
		title: 'Indicadores',
		description:
			'Painéis automáticos de desempenho.',
		className: 'md:col-span-1',
	},
	{
		icon: IconUsers,
		title: 'Controle de Acesso',
		description:
			'Permissões granulares para fiscais.',
		className: 'md:col-span-2',
	},
	{
		icon: IconLock,
		title: 'Segurança',
		description:
			'Audit log completo e autenticação robusta.',
		className: 'md:col-span-2',
	},
	{
		icon: IconBuildingBank,
		title: 'Conformidade',
		description:
			'Nova lei de licitações.',
		className: 'md:col-span-1',
	},
]

export function HomeFeatures() {
	return (
		<section id="recursos" className="relative bg-background py-24 sm:py-32">
			<div className="mx-auto max-w-5xl px-6 w-full">
				
				{/* Header Compacto */}
				<div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
					<h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both leading-[1.1]">
						Tudo que a gestão precisa.
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400 fill-mode-both">
						Módulos focados em conformidade e simplicidade de uso.
					</p>
				</div>

				{/* Bento Grid Compacto com Animação em Cascata */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-min">
					{features.map((feature, i) => (
						<div
							key={feature.title}
							style={{ "--delay": `${600 + i * 100}ms` } as React.CSSProperties}
							className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-500 hover:border-primary/30 hover:bg-accent/30 hover:shadow-lg hover:shadow-primary/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both duration-1000 ${feature.className}`}
						>
							{/* Injetando o delay via classe dinâmica ou estilo inline para evitar repetição massiva de código */}
							<div className="absolute inset-0 bg-transparent" style={{ animationDelay: `var(--delay)` }} />
							
							<div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: `var(--delay)` }}>
								<div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border transition-colors group-hover:bg-primary group-hover:ring-primary">
									<feature.icon className="size-5 text-primary transition-colors group-hover:text-primary-foreground" stroke={1.5} />
								</div>
								<h3 className="mb-1 text-base font-bold text-foreground">
									{feature.title}
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>

							{/* Gradiente de fundo sutil */}
							<div className="absolute -bottom-12 -right-12 size-24 bg-primary/10 blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
						</div>
					))}
				</div>

			</div>
		</section>
	)
}
