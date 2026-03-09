import { Bell, Briefcase, FileText, User as UserIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditFiscalForm } from '../_components/edit-fiscal-form'
import { FiscalContractsList } from '../_components/fiscal-contracts-list'
import { FiscalNotificationsList } from '../_components/fiscal-notifications-list'
import { FiscalReportsList } from '../_components/fiscal-reports-list'
import { getFiscalDetails } from '../_data-access/get-fiscal-details'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function FiscalDetailsPage({ params }: PageProps) {
	const { id } = await params
	const fiscal = await getFiscalDetails(id)

	if (!fiscal) {
		notFound()
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<BackButton />
					<h1 className="text-3xl font-bold tracking-tight">{fiscal.nome}</h1>
					<Badge variant={fiscal.ativo ? 'default' : 'secondary'}>
						{fiscal.ativo ? 'Ativo' : 'Inativo'}
					</Badge>
				</div>
				<p className="text-muted-foreground flex items-center gap-2">
					<Briefcase className="h-4 w-4" /> {fiscal.cargo} • {fiscal.matricula}
				</p>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-4 lg:w-130">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<UserIcon className="h-4 w-4" /> Perfil
					</TabsTrigger>
					<TabsTrigger value="contracts" className="flex items-center gap-2">
						<FileText className="h-4 w-4" /> Contratos
					</TabsTrigger>
					<TabsTrigger value="reports" className="flex items-center gap-2">
						<FileText className="h-4 w-4" /> Relatórios
					</TabsTrigger>
					<TabsTrigger
						value="notifications"
						className="flex items-center gap-2"
					>
						<Bell className="h-4 w-4" /> Notificações
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Informações do Fiscal</CardTitle>
						</CardHeader>
						<CardContent>
							<EditFiscalForm fiscal={fiscal} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="contracts" className="mt-6">
					<FiscalContractsList
						fiscalId={fiscal.id}
						fiscalUserId={fiscal.userId}
						initialContracts={fiscal.contratos}
					/>
				</TabsContent>

				<TabsContent value="reports" className="mt-6">
					<FiscalReportsList reports={fiscal.bensEServicosReports} />
				</TabsContent>

				<TabsContent value="notifications" className="mt-6">
					<FiscalNotificationsList notifications={fiscal.notificacoes} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
