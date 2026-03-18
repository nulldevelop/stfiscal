'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface MensagensFiscalPaginationProps {
	currentPage: number
	totalPages: number
	pageSize: number
}

export function MensagensFiscalPagination({
	currentPage,
	totalPages,
	pageSize,
}: MensagensFiscalPaginationProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const goToPage = (page: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('page', page.toString())
		params.set('pageSize', pageSize.toString())
		router.push(`${pathname}?${params.toString()}`)
	}

	type PageItem =
		| { type: 'page'; value: number }
		| { type: 'ellipsis'; key: string }

	const getVisiblePages = (): PageItem[] => {
		const maxVisible = 5

		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => ({
				type: 'page' as const,
				value: i + 1,
			}))
		}

		const items: PageItem[] = []

		items.push({ type: 'page', value: 1 })

		if (currentPage > 3) {
			items.push({ type: 'ellipsis', key: 'ellipsis-start' })
		}

		const start = Math.max(2, currentPage - 1)
		const end = Math.min(totalPages - 1, currentPage + 1)

		for (let i = start; i <= end; i++) {
			items.push({ type: 'page', value: i })
		}

		if (currentPage < totalPages - 2) {
			items.push({ type: 'ellipsis', key: 'ellipsis-end' })
		}

		if (totalPages > 1) {
			items.push({ type: 'page', value: totalPages })
		}

		return items
	}

	return (
		<div className="flex items-center justify-center gap-1">
			<Button
				variant="outline"
				size="icon"
				onClick={() => goToPage(currentPage - 1)}
				disabled={currentPage <= 1}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{getVisiblePages().map((item) =>
				item.type === 'ellipsis' ? (
					<Button key={item.key} variant="ghost" size="icon" disabled>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				) : (
					<Button
						key={item.value}
						variant={item.value === currentPage ? 'default' : 'outline'}
						size="icon"
						onClick={() => goToPage(item.value)}
					>
						{item.value}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={() => goToPage(currentPage + 1)}
				disabled={currentPage >= totalPages}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	)
}
