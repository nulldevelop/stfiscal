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
			'Registre ocorrências, notificações e relatórios de fiscalização de forma estruturada e rastreável.',
	},
	{
		icon: IconChartBar,
		title: 'Relatórios e Indicadores',
		description:
			'Painéis e relatórios automáticos para acompanhamento do desempenho e conformidade contratual.',
	},
	{
		icon: IconUsers,
		title: 'Controle de Acesso',
		description:
			'Perfis por papel — gestores, fiscais e administradores — com permissões granulares por módulo.',
	},
	{
		icon: IconLock,
		title: 'Segurança e Auditoria',
		description:
			'Registro completo de ações (audit log) e autenticação robusta para garantir conformidade.',
	},
	{
		icon: IconBuildingBank,
		title: 'Conformidade Legal',
		description:
			'Estruturado conforme as exigências da legislação vigente sobre fiscalização de contratos públicos.',
	},
]

export function HomeFeatures() {
	return (
		<section className="border-t border-border bg-secondary/20 py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Tudo que a gestão precisa
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Ferramentas completas para cada etapa do ciclo de vida dos contratos.
					</p>
				</div>

				<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md hover:shadow-primary/8"
						>
							<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
								<feature.icon className="size-5" />
							</div>
							<h3 className="mb-2 font-semibold text-foreground">
								{feature.title}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
