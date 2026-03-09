import { notFound, redirect } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { getAuth } from '@/lib/auth-actions'
import {
	getContratoDetails,
	getDashboardDataByFiscal,
} from '../../_data-access/contracts/get-contratos'
import { ContractSelectionScreen } from '../_components/contract-selection-screen'
import { NotificacaoDesconformidadeForm } from './_components/notificacao-desconformidade-form'

interface NotificacaoDesconformidadePageProps {
	searchParams: Promise<{ contratoId?: string }>
}

export default async function NotificacaoDesconformidadePage({
	searchParams,
}: NotificacaoDesconformidadePageProps) {
	const { contratoId } = await searchParams
	const { user } = await getAuth()

	if (!user) {
		redirect('/')
	}

	if (!contratoId) {
		const { contratos } = await getDashboardDataByFiscal()
		return (
			<ContractSelectionScreen
				contratos={contratos as any}
				title="Notificação de Desconformidade"
				baseUrl="/dashboard-fiscal/notificacoes/desconformidade"
			/>
		)
	}

	const contrato = await getContratoDetails(contratoId)

	if (!contrato) {
		notFound()
	}

	return (
		<div className="space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<BackButton />
				<div>
					<h1 className="text-2xl font-bold tracking-tight ">
						Notificação de Desconformidade
					</h1>
					<p className="text-muted-foreground">
						Contrato {contrato.displayContrato} • {contrato.contratado}
					</p>
				</div>
			</div>

			<NotificacaoDesconformidadeForm contrato={contrato} />
		</div>
	)
}
