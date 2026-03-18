import { getAuth } from '@/lib/auth-actions'
import { getContratoDetails } from '../_data-access/get-contrato-details'
import { getActiveFormConfig } from '../_data-access/get-form-config'
import { getBensEServicosReportById } from '../_data-access/get-drafts'
import { FiscalPrincipalReportForm } from '../fiscal-principal/_components/fiscal-principal-report-form'
import { BensEServicosReportForm } from './_components/bens-e-servicos-report-form'

interface BensEServicosReportPageProps {
	searchParams: Promise<{
		contratoId?: string
		draftId?: string
	}>
}

export default async function BensEServicosReportPage({
	searchParams,
}: BensEServicosReportPageProps) {
	const params = await searchParams
	const contratoId = params.contratoId
	const draftId = params.draftId

	const [initialContrato, formConfigResult, principalConfigResult, draftReport] =
		await Promise.all([
			contratoId ? getContratoDetails(contratoId) : null,
			getActiveFormConfig('BENS_SERVICOS'),
			getActiveFormConfig('FISCAL_PRINCIPAL'),
			draftId ? getBensEServicosReportById(draftId) : null,
		])

	const formConfig = formConfigResult.success ? formConfigResult.data : []
	const principalConfig = principalConfigResult.success ? principalConfigResult.data : []

	// Verifica se é o fiscal principal ESPECÍFICO deste contrato
	const isPrincipalDoContrato = initialContrato?.isPrincipalDoContrato === true

	if (isPrincipalDoContrato && contratoId) {
		return (
			<div className="container mx-auto space-y-6">
				<div className="mx-2 space-y-2">
					<h1 className="font-semibold text-2xl text-foreground">
						Relatório de Fiscalização – Fiscal Tecnico
					</h1>
					<p className="text-muted-foreground">
						ANEXO IV - Preencha o formulário final de fiscalização.
					</p>
				</div>

				<FiscalPrincipalReportForm
					contratoId={contratoId}
					formConfig={principalConfig}
				/>
			</div>
		)
	}

	return (
		<div className="container mx-auto space-y-6 pb-10">
			<div className="mx-2 space-y-2">
				<h1 className="font-semibold text-2xl text-foreground">
					Relatório de Fiscalização (Aquisição de bens e execução de serviços
					comuns)
				</h1>
				<p className="text-muted-foreground">
					ANEXO III - Preencha o formulário abaixo.
				</p>
			</div>

			<BensEServicosReportForm
				initialContrato={initialContrato}
				formConfig={formConfig}
				draftReport={draftReport}
			/>
		</div>
	)
}
