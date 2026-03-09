'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { IconFilter, IconX, IconLoader2 } from '@tabler/icons-react'

const ACTION_OPTIONS = [
	{ value: 'all', label: 'Todas as ações' },
	{ value: 'CREATE', label: 'Criação' },
	{ value: 'UPDATE', label: 'Edição' },
	{ value: 'DELETE', label: 'Exclusão' },
]

type LogFiltersProps = {
	entities: string[]
	currentAction?: string
	currentEntity?: string
}

export function LogFilters({
	entities,
	currentAction,
	currentEntity,
}: LogFiltersProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	function updateParam(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (value && value !== 'all') {
			params.set(key, value)
		} else {
			params.delete(key)
		}
		params.delete('page') 
		startTransition(() => {
			router.push(`?${params.toString()}`)
		})
	}

	function clearFilters() {
		startTransition(() => {
			router.push('?')
		})
	}

	const hasFilters = !!currentAction || !!currentEntity

	return (
		<div className="flex flex-wrap items-center gap-2 bg-muted/20 p-1.5 rounded-xl border border-border/50 shadow-sm">
			<div className="flex items-center gap-2 px-2 text-muted-foreground mr-1">
				{isPending ? (
					<IconLoader2 className="h-4 w-4 animate-spin text-primary" />
				) : (
					<IconFilter className="h-4 w-4" />
				)}
				<span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Filtrar por:</span>
			</div>

			<Select
				value={currentAction ?? 'all'}
				onValueChange={(v) => updateParam('action', v)}
				disabled={isPending}
			>
				<SelectTrigger className="h-9 w-[140px] bg-background border-none shadow-none focus:ring-1 focus:ring-primary/20 transition-all text-xs font-medium">
					<SelectValue placeholder="Ação" />
				</SelectTrigger>
				<SelectContent>
					{ACTION_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value} className="text-xs">
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="h-4 w-[1px] bg-border/60" />

			<Select
				value={currentEntity ?? 'all'}
				onValueChange={(v) => updateParam('entity', v)}
				disabled={isPending}
			>
				<SelectTrigger className="h-9 w-[160px] bg-background border-none shadow-none focus:ring-1 focus:ring-primary/20 transition-all text-xs font-medium">
					<SelectValue placeholder="Entidade" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all" className="text-xs">Todas as entidades</SelectItem>
					{entities.map((e) => (
						<SelectItem key={e} value={e} className="text-xs">
							{e}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{hasFilters && (
				<>
					<div className="h-4 w-[1px] bg-border/60" />
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						disabled={isPending}
						className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-1.5"
					>
						<IconX className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Limpar</span>
					</Button>
				</>
			)}
		</div>
	)
}
