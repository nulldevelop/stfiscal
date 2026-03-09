'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'

export function SearchNotificationsForm() {
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

	return (
		<Input
			className="max-w-lg"
			defaultValue={searchParams.get('search') || ''}
			placeholder="Buscar por tipo, item..."
			onChange={(e) => handleSearch(e.target.value)}
		/>
	)
}
