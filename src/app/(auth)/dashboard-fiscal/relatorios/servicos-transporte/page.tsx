import { getAuth } from '@/lib/auth-actions'
import { getContratoDetails } from '../_data-access/get-contrato-details'
import { getActiveFormConfig } from '../_data-access/get-form-config'
import { FiscalPrincipalReportForm } from '../fiscal-principal/_components/fiscal-principal-report-form'
import { TransporteReportForm } from './_components/transporte-report-form'

interface TransporteReportPageProps {
	searchParams: Promise<{
		contratoId?: string
	}>
}

export default async function TransporteReportPage({
	searchParams,
}: TransporteReportPageProps) {
	const params = await searchParams
	const contratoId = params.contratoId

	const [initialContrato, formConfigResult, principalConfigResult] = await Promise.all([
		contratoId ? getContratoDetails(contratoId) : null,
		getActiveFormConfig('TRANSPORTE'),
		getActiveFormConfig('FISCAL_PRINCIPAL'),
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
		<div className="container mx-auto space-y-6">
			<div className="mx-2 space-y-2">
				<h1 className="font-semibold text-2xl text-foreground">
					Relatório de Fiscalização (Serviços de transporte)
				</h1>
				<p className="text-muted-foreground">Preencha o formulário abaixo.</p>
			</div>

			<TransporteReportForm
				initialContrato={initialContrato}
				formConfig={formConfig}
			/>
		</div>
	)
}
