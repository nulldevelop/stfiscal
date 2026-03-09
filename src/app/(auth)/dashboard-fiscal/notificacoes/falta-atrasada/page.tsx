import { notFound, redirect } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { getAuth } from '@/lib/auth-actions'
import {
	getContratoDetails,
	getDashboardDataByFiscal,
} from '../../_data-access/contracts/get-contratos'
import { ContractSelectionScreen } from '../_components/contract-selection-screen'
import { NotificacaoEntregaForm } from './_components/notificacao-entrega-form'

interface NotificacaoEntregaPageProps {
	searchParams: Promise<{ contratoId?: string }>
}

export default async function NotificacaoEntregaPage({
	searchParams,
}: NotificacaoEntregaPageProps) {
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
				title="Notificação de Atraso ou Falta na Entrega"
				baseUrl="/dashboard-fiscal/notificacoes/falta-atrasada"
			/>
		)
	}

	const contrato = await getContratoDetails(contratoId)

	if (!contrato) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<BackButton />
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-green-800">
						Notificação de Atraso ou Falta na Entrega
					</h1>
					<p className="text-muted-foreground">
						Contrato {contrato.displayContrato} • {contrato.contratado}
					</p>
				</div>
			</div>

			<NotificacaoEntregaForm contrato={contrato} />
		</div>
	)
}
