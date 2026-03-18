'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { MensagensFiscalSkeleton } from './_components/mensagens-fiscal-skeleton'
import { MensagensFiscalTable } from './_components/mensagens-fiscal-table'
import { SearchMensagensFiscalForm } from './_components/search-mensagens-fiscal-form'

function MensagensFiscalPageContent() {
	const searchParams = useSearchParams()
	const [refreshKey, setRefreshKey] = useState(0)

	const search = searchParams.get('search') || ''
	const page = Number(searchParams.get('page')) || 1
	const pageSize = Number(searchParams.get('pageSize')) || 10
	const lida = (searchParams.get('lida') as 'todas' | 'lidas' | 'nao_lidas') || 'todas'

	const triggerRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4 px-4">
				<h1 className="font-semibold text-2xl text-foreground">Mensagens Recebidas</h1>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SearchMensagensFiscalForm />
				</div>
			</div>
			<div className="mx-4">
				<MensagensFiscalTable
					search={search}
					page={page}
					pageSize={pageSize}
					lida={lida}
					refreshKey={refreshKey}
					triggerRefresh={triggerRefresh}
				/>
			</div>
		</div>
	)
}

export default function MensagensFiscalPage() {
	return (
		<Suspense fallback={<MensagensFiscalSkeleton />}>
			<MensagensFiscalPageContent />
		</Suspense>
	)
}
