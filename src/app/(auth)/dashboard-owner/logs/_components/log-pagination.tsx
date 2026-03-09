'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

type LogPaginationProps = {
	page: number
	totalPages: number
	total: number
	pageSize: number
}

export function LogPagination({
	page,
	totalPages,
	total,
	pageSize,
}: LogPaginationProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	function goToPage(p: number) {
		const params = new URLSearchParams(searchParams.toString())
		params.set('page', String(p))
		startTransition(() => {
			router.push(`?${params.toString()}`)
		})
	}

	const from = (page - 1) * pageSize + 1
	const to = Math.min(page * pageSize, total)

	if (total === 0) return null

	return (
		<div className="flex items-center justify-between pt-2">
			<p className="text-sm text-muted-foreground">
				Mostrando{' '}
				<span className="font-medium">
					{from}–{to}
				</span>{' '}
				de <span className="font-medium">{total}</span> registros
			</p>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => goToPage(page - 1)}
					disabled={page <= 1 || isPending}
				>
					<IconChevronLeft className="h-4 w-4" />
				</Button>

				<span className="px-3 text-sm">
					{page} / {totalPages}
				</span>

				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => goToPage(page + 1)}
					disabled={page >= totalPages || isPending}
				>
					<IconChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
