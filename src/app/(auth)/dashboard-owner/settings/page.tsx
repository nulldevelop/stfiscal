import { AlertCircle, Settings2 } from 'lucide-react'
import { SettingsPanel } from './_components/settings-panel'
import { getApiConfig } from './_data-access/get-api-config'
import { getSettingsData } from './_data-access/get-settings-data'

export default async function SettingsPage() {
	const [result, apiConfig] = await Promise.all([
		getSettingsData(),
		getApiConfig(),
	])

	if (!result.success || !result.data) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
				<AlertCircle className="h-5 w-5 shrink-0" />
				<p className="text-sm">
					Nenhuma organização ativa encontrada. Selecione ou crie uma
					organização.
				</p>
			</div>
		)
	}

	const data = result.data

	return (
		<div className="flex flex-col gap-8 px-4 py-6">
			{/* Cabeçalho */}
			<div className="flex items-center gap-4">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
					<Settings2 className="h-5 w-5 text-muted-foreground" />
				</div>
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Configurações
					</h1>
					<p className="text-sm text-muted-foreground">
						Gerenciando{' '}
						<span className="font-medium text-foreground">{data.name}</span>
					</p>
				</div>
			</div>

			<SettingsPanel
				orgId={data.id}
				defaultValues={{
					name: data.name,
					slug: data.slug,
					logo: data.logo,
					email: data.email,
					telefone: data.telefone,
					cnpj: data.cnpj,
					status: data.status,
					cidade: data.cidade,
				}}
				members={data.members}
				nonMembers={data.nonMembers}
				lotacoes={data.lotacoes}
				apiConfig={apiConfig}
			/>
		</div>
	)
}
