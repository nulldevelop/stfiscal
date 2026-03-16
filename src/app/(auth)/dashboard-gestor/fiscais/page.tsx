'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { FiscaisPageActions } from './_components/fiscais-page-actions'
import { FiscaisSkeleton } from './_components/fiscais-skeleton'
import { MembersTable } from './_components/members-table'
import { SearchFiscaisForm } from './_components/search-fiscais-form'

function FiscaisPageContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [refreshKey, setRefreshKey] = useState(0)

	const search = searchParams.get('search') || ''
	const page = Number(searchParams.get('page')) || 1
	const pageSize = Number(searchParams.get('pageSize')) || 10

	const triggerRefresh = () => {
		router.refresh()
		setRefreshKey((prevKey) => prevKey + 1)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4 px-4">
				<h1 className="font-semibold text-2xl text-foreground">
					Vincular Membros a Contratos
				</h1>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SearchFiscaisForm />
					<FiscaisPageActions onSuccess={triggerRefresh} />
				</div>
			</div>
			<div className="mx-4">
				<MembersTable
					search={search}
					page={page}
					pageSize={pageSize}
					refreshKey={refreshKey}
					triggerRefresh={triggerRefresh}
				/>
			</div>
		</div>
	)
}

export default function FiscaisPage() {
	return (
		<Suspense fallback={<FiscaisSkeleton />}>
			<FiscaisPageContent />
		</Suspense>
	)
}
