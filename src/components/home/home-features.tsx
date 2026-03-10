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
			'Cadastre, acompanhe e fiscalize contratos com visibilidade total sobre prazos, valores e responsáveis.',
	},
	{
		icon: IconSearch,
		title: 'Fiscalização Ativa',
		description:
			'Registre ocorrências, notificações e relatórios de forma estruturada, rastreável e auditável.',
	},
	{
		icon: IconChartBar,
		title: 'Relatórios e Indicadores',
		description:
			'Painéis automáticos para acompanhamento de desempenho, prazos e conformidade contratual.',
	},
	{
		icon: IconUsers,
		title: 'Controle de Acesso',
		description:
			'Gestores, fiscais e administradores com permissões granulares e rastreabilidade de ações.',
	},
	{
		icon: IconLock,
		title: 'Segurança e Auditoria',
		description:
			'Audit log completo de todas as ações e autenticação robusta para conformidade institucional.',
	},
	{
		icon: IconBuildingBank,
		title: 'Conformidade Legal',
		description:
			'Estruturado conforme a legislação vigente de fiscalização de contratos da administração pública.',
	},
]

export function HomeFeatures() {
	return (
		<section id="recursos" className="py-32">
			<div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">

				{/* Header */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end lg:gap-20 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
							Funcionalidades
						</p>
						<h2 className="text-5xl font-black tracking-tight text-foreground leading-[1.08] sm:text-6xl">
							Tudo que a gestão{' '}
							<span className="text-primary">precisa.</span>
						</h2>
					</div>
					<p className="text-lg leading-relaxed text-muted-foreground lg:mb-2">
						Cada módulo foi pensado para o dia a dia da administração pública,
						com foco em rastreabilidade, conformidade e facilidade de uso.
					</p>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-1 gap-px rounded-2xl border border-border bg-border overflow-hidden sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
					{features.map((feature, i) => (
						<div
							key={feature.title}
							className="group relative flex flex-col gap-6 bg-card p-8 transition-all duration-300 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06]"
						>
							<span className="absolute right-6 top-6 text-xs font-bold tabular-nums text-border transition-colors duration-300 group-hover:text-primary/30">
								{String(i + 1).padStart(2, '0')}
							</span>

							<div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-primary transition-transform duration-300 origin-left group-hover:scale-x-100" />

							<div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary transition-all duration-300 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:scale-110">
								<feature.icon className="size-7" />
							</div>

							<div>
								<h3 className="text-lg font-bold text-foreground leading-snug mb-2.5">
									{feature.title}
								</h3>
								<p className="text-base leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>

			</div>
		</section>
	)
}
