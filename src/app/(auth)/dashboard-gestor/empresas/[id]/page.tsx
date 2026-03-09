import { FileText, Info } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCnpj } from '@/utils/formatCNPJ'
import { EditEmpresaForm } from '../_components/edit-empresa-form'
import { EmpresaContractsList } from '../_components/empresa-contracts-list'
import { getEmpresaDetails } from '../_data-access/get-empresa-details'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function EmpresaDetailsPage({ params }: PageProps) {
	const { id } = await params
	const empresa = await getEmpresaDetails(id)

	if (!empresa) {
		notFound()
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<BackButton />
					<h1 className="text-3xl font-bold tracking-tight">{empresa.name}</h1>
				</div>
				<p className="text-muted-foreground">
					CNPJ: {formatCnpj(empresa.cnpj)}
				</p>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-2 lg:w-100">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<Info className="h-4 w-4" /> Informações
					</TabsTrigger>
					<TabsTrigger value="contracts" className="flex items-center gap-2">
						<FileText className="h-4 w-4" /> Contratos
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Editar Empresa</CardTitle>
						</CardHeader>
						<CardContent>
							<EditEmpresaForm empresa={empresa} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="contracts" className="mt-6">
					<EmpresaContractsList contracts={empresa.Contrato} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
