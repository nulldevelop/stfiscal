'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AddAditivoDialog } from './_components/add-aditivo-dialog'
import { AditivosTable } from './_components/aditivos-table'
import { SearchAditivosForm } from './_components/search-aditivos-form'

export default function AditivosPage() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [refreshKey, setRefreshKey] = useState(0)

	const search = searchParams.get('search') || ''
	const page = Number(searchParams.get('page')) || 1
	const pageSize = Number(searchParams.get('pageSize')) || 10

	const triggerRefresh = () => {
		router.refresh()
		setRefreshKey((prev) => prev + 1)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4 px-4">
				<div>
					<h1 className="font-semibold text-2xl text-foreground">Aditivos</h1>
					<p className="text-muted-foreground text-sm">
						Gerencie os aditivos dos contratos da organização
					</p>
				</div>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SearchAditivosForm />
					<AddAditivoDialog onSuccess={triggerRefresh} />
				</div>
			</div>

			<div className="mx-4">
				<Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
					<AditivosTable
						search={search}
						page={page}
						pageSize={pageSize}
						refreshKey={refreshKey}
					/>
				</Suspense>
			</div>
		</div>
	)
}
