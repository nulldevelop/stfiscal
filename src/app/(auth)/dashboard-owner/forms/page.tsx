import { FileSliders } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFormConfigs } from './_actions/form-config-actions'
import { FormConfigTable } from './_components/form-config-table'

const triggerClass =
	'relative h-11 rounded-none border-b-2 border-transparent px-4 font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'

export default async function FormsConfigPage() {
	const [
		bensEServicosRes,
		transporteRes,
		obrasRes,
		fiscalPrincipalRes,
		terceirizacaoRes,
	] = await Promise.all([
		getFormConfigs('BENS_SERVICOS'),
		getFormConfigs('TRANSPORTE'),
		getFormConfigs('OBRAS'),
		getFormConfigs('FISCAL_PRINCIPAL'),
		getFormConfigs('TERCEIRIZACAO'),
	])

	const bensEServicosConfigs = bensEServicosRes.success
		? bensEServicosRes.data || []
		: []
	const transporteConfigs = transporteRes.success
		? transporteRes.data || []
		: []
	const obrasConfigs = obrasRes.success ? obrasRes.data || [] : []
	const fiscalPrincipalConfigs = fiscalPrincipalRes.success
		? fiscalPrincipalRes.data || []
		: []
	const terceirizacaoConfigs = terceirizacaoRes.success
		? terceirizacaoRes.data || []
		: []

	return (
		<div className="flex flex-col gap-8 px-4 py-6">
			{/* Cabeçalho */}
			<div className="flex items-center gap-4">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
					<FileSliders className="h-5 w-5 text-muted-foreground" />
				</div>
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Parametrização de Formulários
					</h1>
					<p className="text-sm text-muted-foreground">
						Configure campos, visibilidade e regras de validação por relatório.
					</p>
				</div>
			</div>

			<Tabs defaultValue="bens-e-servicos" className="w-full">
				<div className="border-b mb-8 overflow-x-auto">
					<TabsList className="h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0 flex-nowrap whitespace-nowrap">
						<TabsTrigger value="bens-e-servicos" className={triggerClass}>
							Bens e Serviços
							<Badge
								variant="secondary"
								className="ml-2 px-1.5 py-0 text-[10px] font-bold"
							>
								{bensEServicosConfigs.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="transporte" className={triggerClass}>
							Transporte
							<Badge
								variant="secondary"
								className="ml-2 px-1.5 py-0 text-[10px] font-bold"
							>
								{transporteConfigs.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="obras" className={triggerClass}>
							Obras
							<Badge
								variant="secondary"
								className="ml-2 px-1.5 py-0 text-[10px] font-bold"
							>
								{obrasConfigs.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="fiscal-principal" className={triggerClass}>
							Fiscal Tecnico
							<Badge
								variant="secondary"
								className="ml-2 px-1.5 py-0 text-[10px] font-bold"
							>
								{fiscalPrincipalConfigs.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="terceirizacao" className={triggerClass}>
							Terceirização
							<Badge
								variant="secondary"
								className="ml-2 px-1.5 py-0 text-[10px] font-bold"
							>
								{terceirizacaoConfigs.length}
							</Badge>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="bens-e-servicos" className="mt-0">
					<FormConfigTable
						configs={bensEServicosConfigs}
						reportType="BENS_SERVICOS"
						description="Configure os campos do Anexo III — ative/desative e defina visibilidade por papel."
					/>
				</TabsContent>

				<TabsContent value="transporte" className="mt-0">
					<FormConfigTable
						configs={transporteConfigs}
						reportType="TRANSPORTE"
						description="Configure os campos do relatório de serviços de transporte."
					/>
				</TabsContent>

				<TabsContent value="obras" className="mt-0">
					<FormConfigTable
						configs={obrasConfigs}
						reportType="OBRAS"
						description="Configure os campos do relatório de execução de obras e medições."
					/>
				</TabsContent>

				<TabsContent value="fiscal-principal" className="mt-0">
					<FormConfigTable
						configs={fiscalPrincipalConfigs}
						reportType="FISCAL_PRINCIPAL"
						description="Configure os campos do Relatório do Fiscal Tecnico (Anexo IV)."
					/>
				</TabsContent>

				<TabsContent value="terceirizacao" className="mt-0">
					<FormConfigTable
						configs={terceirizacaoConfigs}
						reportType="TERCEIRIZACAO"
						description="Configure os campos do Relatório de Terceirização (Anexo XI)."
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}
