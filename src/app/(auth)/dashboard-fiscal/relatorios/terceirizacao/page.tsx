import { getAuth } from '@/lib/auth-actions'
import { getContratoDetails } from '../_data-access/get-contrato-details'
import { getActiveFormConfig } from '../_data-access/get-form-config'
import { getTerceirizacaoReportById } from '../_data-access/get-drafts'
import { FiscalPrincipalReportForm } from '../fiscal-principal/_components/fiscal-principal-report-form'
import { TerceirizacaoReportForm } from './_components/terceirizacao-report-form'

interface TerceirizacaoReportPageProps {
	searchParams: Promise<{
		contratoId?: string
		draftId?: string
	}>
}

export default async function TerceirizacaoReportPage({
	searchParams,
}: TerceirizacaoReportPageProps) {
	const params = await searchParams
	const contratoId = params.contratoId
	const draftId = params.draftId

	const [initialContrato, formConfigResult, principalConfigResult, draftReport] =
		await Promise.all([
			contratoId ? getContratoDetails(contratoId) : null,
			getActiveFormConfig('TERCEIRIZACAO'),
			getActiveFormConfig('FISCAL_PRINCIPAL'),
			draftId ? getTerceirizacaoReportById(draftId) : null,
		])

	const formConfig = formConfigResult.success ? formConfigResult.data : []
	const principalConfig = principalConfigResult.success
		? principalConfigResult.data
		: []

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
					Relatório de Fiscalização (Terceirização de mão de obra)
				</h1>
				<p className="text-muted-foreground">
					ANEXO XI - Preencha o formulário abaixo.
				</p>
			</div>

			<TerceirizacaoReportForm
				initialContrato={initialContrato}
				formConfig={formConfig}
				draftReport={draftReport}
			/>
		</div>
	)
}
