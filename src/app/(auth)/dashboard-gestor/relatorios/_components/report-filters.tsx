'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function ReportFilters() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const [search, setSearch] = useState(searchParams.get('search') || '')

	const updateFilters = (updates: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams)
		for (const [key, value] of Object.entries(updates)) {
			if (value) {
				params.set(key, value)
			} else {
				params.delete(key)
			}
		}
		router.replace(`${pathname}?${params.toString()}`)
	}

	const handleSearch = useDebouncedCallback((term: string) => {
		updateFilters({ search: term })
	}, 300)

	const clearFilters = () => {
		setSearch('')
		router.replace(pathname)
	}

	const hasFilters =
		searchParams.get('search') ||
		searchParams.get('startDate') ||
		searchParams.get('endDate')

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
			<div className="relative flex-1 max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					className="pl-9"
					value={search}
					placeholder="Buscar por empresa, contrato, fiscal..."
					onChange={(e) => {
						setSearch(e.target.value)
						handleSearch(e.target.value)
					}}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								'justify-start text-left font-normal w-60',
								!searchParams.get('startDate') && 'text-muted-foreground',
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{searchParams.get('startDate') ? (
								searchParams.get('endDate') ? (
									<>
										{format(
											new Date(searchParams.get('startDate')!),
											'dd/MM/yy',
										)}{' '}
										-{' '}
										{format(new Date(searchParams.get('endDate')!), 'dd/MM/yy')}
									</>
								) : (
									format(new Date(searchParams.get('startDate')!), 'PPP', {
										locale: ptBR,
									})
								)
							) : (
								<span>Filtrar por data</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="end">
						<Calendar
							initialFocus
							mode="range"
							defaultMonth={
								searchParams.get('startDate')
									? new Date(searchParams.get('startDate')!)
									: new Date()
							}
							selected={{
								from: searchParams.get('startDate')
									? new Date(searchParams.get('startDate')!)
									: undefined,
								to: searchParams.get('endDate')
									? new Date(searchParams.get('endDate')!)
									: undefined,
							}}
							onSelect={(range) => {
								updateFilters({
									startDate: range?.from ? range.from.toISOString() : null,
									endDate: range?.to ? range.to.toISOString() : null,
								})
							}}
							numberOfMonths={2}
							locale={ptBR}
						/>
					</PopoverContent>
				</Popover>

				{hasFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="h-9 px-2 lg:px-3"
					>
						Limpar
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
