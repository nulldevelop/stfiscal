'use client'

import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function SearchMensagensFiscalForm() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
	const lidaValue = searchParams.get('lida') || 'todas'

	const createQueryString = useCallback(
		(params: Record<string, string | null>) => {
			const newSearchParams = new URLSearchParams(searchParams.toString())

			for (const [key, value] of Object.entries(params)) {
				if (value === null) {
					newSearchParams.delete(key)
				} else {
					newSearchParams.set(key, value)
				}
			}

			// Reset page when search changes
			if (params.search !== undefined || params.lida !== undefined) {
				newSearchParams.set('page', '1')
			}

			return newSearchParams.toString()
		},
		[searchParams],
	)

	const debouncedSearch = useDebouncedCallback((value: string) => {
		startTransition(() => {
			const query = createQueryString({ search: value || null })
			router.push(`${pathname}?${query}`)
		})
	}, 300)

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSearchValue(value)
		debouncedSearch(value)
	}

	const handleLidaChange = (value: string) => {
		startTransition(() => {
			const query = createQueryString({ lida: value, page: '1' })
			router.push(`${pathname}?${query}`)
		})
	}

	return (
		<div className="flex items-center gap-2">
			<div className="relative">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Buscar mensagens..."
					className="w-64 pl-9"
					value={searchValue}
					onChange={handleSearchChange}
					disabled={isPending}
				/>
			</div>
			<Select value={lidaValue} onValueChange={handleLidaChange} disabled={isPending}>
				<SelectTrigger className="w-36">
					<SelectValue placeholder="Filtrar" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="todas">Todas</SelectItem>
					<SelectItem value="nao_lidas">Não lidas</SelectItem>
					<SelectItem value="lidas">Lidas</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
