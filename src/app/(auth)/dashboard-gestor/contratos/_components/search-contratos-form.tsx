'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export function SearchContratosForm() {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const { replace } = useRouter()

	const handleSearch = useDebouncedCallback((term: string) => {
		const params = new URLSearchParams(searchParams)
		if (term) {
			params.set('search', term)
		} else {
			params.delete('search')
		}
		params.set('page', '1')
		replace(`${pathname}?${params.toString()}`)
	}, 300)

	const handlePageSizeChange = (pageSize: string) => {
		const params = new URLSearchParams(searchParams)
		params.set('pageSize', pageSize)
		params.set('page', '1')
		replace(`${pathname}?${params.toString()}`)
	}

	return (
		<div className="flex items-center space-x-4">
			<Input
				className="max-w-lg"
				defaultValue={searchParams.get('search') || ''}
				placeholder="Buscar..."
				onChange={(e) => handleSearch(e.target.value)}
			/>
			<Select
				defaultValue={searchParams.get('pageSize') || '10'}
				onValueChange={handlePageSizeChange}
			>
				<SelectTrigger className="w-45">
					<SelectValue placeholder="Itens por página" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="10">10 por página</SelectItem>
					<SelectItem value="20">20 por página</SelectItem>
					<SelectItem value="50">50 por página</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
