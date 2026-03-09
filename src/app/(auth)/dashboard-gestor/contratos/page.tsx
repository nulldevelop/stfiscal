import { Suspense } from 'react'
import { ContratosPageActions } from './_components/contratos-page-actions'
import { ContratosTable } from './_components/contratos-table'
import { ImportProvider } from './_components/import-context'
import { SearchContratosForm } from './_components/search-contratos-form'
import { ContratosSkeleton } from './_components/contratos-skeleton'

interface ContratosPageProps {
	searchParams: Promise<{
		search?: string
		page?: string
		pageSize?: string
	}>
}

import { AddContratoDialog } from './_components/add-contrato-dialog'

export default async function ContratosPage({
	searchParams,
}: ContratosPageProps) {
	const params = await searchParams

	const search = params.search || ''
	const page = Number(params.page) || 1
	const pageSize = Number(params.pageSize) || 10

	return (
		<ImportProvider>
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-4 px-4">
					<h1 className="font-semibold text-2xl text-foreground">Contratos</h1>
					<div className="flex flex-1 items-center justify-end gap-4">
						<SearchContratosForm />
						<div className="flex items-center gap-2">
							<AddContratoDialog />
							<ContratosPageActions />
						</div>
					</div>
				</div>
				<div className="mx-2">
					<Suspense fallback={<ContratosSkeleton />}>
						<ContratosTable search={search} page={page} pageSize={pageSize} />
					</Suspense>
				</div>
			</div>
		</ImportProvider>
	)
}
