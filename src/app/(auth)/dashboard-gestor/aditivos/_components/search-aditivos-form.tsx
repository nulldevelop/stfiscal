'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Input } from '@/components/ui/input'

export function SearchAditivosForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [text, setText] = useState(searchParams.get('search') || '')
	const [query] = useDebounce(text, 500)

	useEffect(() => {
		const params = new URLSearchParams(searchParams)
		if (query) {
			params.set('search', query)
		} else {
			params.delete('search')
		}
		params.set('page', '1')
		router.push(`?${params.toString()}`)
	}, [query, router, searchParams])

	return (
		<div className="relative w-full max-w-sm">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder="Buscar aditivos..."
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="pl-9 pr-9"
			/>
			{text && (
				<button
					type="button"
					onClick={() => setText('')}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	)
}
