import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { getAuth } from '@/lib/auth-actions'
import { getContratoDetails } from '../../_data-access/contracts/get-contratos'
import { ActionsCard } from './_components/actions-card'
import { ContractDetails } from './_components/contract-details'
import { HistoryTabs } from './_components/history-tabs'

interface ContratoPageProps {
	params: Promise<{ id: string }>
}

export default async function ContratoPage({ params }: ContratoPageProps) {
	const { id } = await params
	const { user, member } = await getAuth()

	if (!user) {
		return null
	}

	const contrato = await getContratoDetails(id)

	if (!contrato) {
		notFound()
	}

	return (
		<div className="space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<BackButton />
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Gerenciamento de Contrato
					</h1>
					<p className="text-muted-foreground">
						Acompanhe o histórico de relatórios e notificações deste contrato.
					</p>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 space-y-6">
					<ContractDetails contrato={contrato} />
					<HistoryTabs contrato={contrato} />
				</div>
				<div className="space-y-6">
					<ActionsCard contrato={contrato} userRole={member?.role} />
				</div>
			</div>
		</div>
	)
}
