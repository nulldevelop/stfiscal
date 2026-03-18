'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { MensagensPageActions } from './_components/mensagens-page-actions'
import { MensagensSkeleton } from './_components/mensagens-skeleton'
import { MensagensTable } from './_components/mensagens-table'
import { SearchMensagensForm } from './_components/search-mensagens-form'

function MensagensPageContent() {
	const searchParams = useSearchParams()
	const [refreshKey, setRefreshKey] = useState(0)

	const search = searchParams.get('search') || ''
	const page = Number(searchParams.get('page')) || 1
	const pageSize = Number(searchParams.get('pageSize')) || 10
	const status = (searchParams.get('status') as 'ATIVA' | 'ARQUIVADA' | 'todas') || 'ATIVA'

	const triggerRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-semibold text-2xl text-foreground">Mensagens Internas</h1>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SearchMensagensForm />
					<MensagensPageActions onSuccess={triggerRefresh} />
				</div>
			</div>
			<div className="">
				<MensagensTable
					search={search}
					page={page}
					pageSize={pageSize}
					status={status}
					refreshKey={refreshKey}
					triggerRefresh={triggerRefresh}
				/>
			</div>
		</div>
	)
}

export default function MensagensPage() {
	return (
		<Suspense fallback={<MensagensSkeleton />}>
			<MensagensPageContent />
		</Suspense>
	)
}
