'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2, MapPin, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createLotacao } from '../_actions/create-lotacao'
import { deleteLotacao } from '../_actions/delete-lotacao'
import { getLotacoes } from '../_data-access/get-lotacoes'

const lotacaoSchema = z.object({
	name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
})

type LotacaoValues = z.infer<typeof lotacaoSchema>

interface Lotacao {
	id: string
	name: string
	createdAt: Date
}

interface Props {
	orgId: string
	initialLotacoes: Lotacao[]
}

export function LotacaoSettings({ orgId: _orgId, initialLotacoes }: Props) {
	const [lotacoes, setLotacoes] = useState<Lotacao[]>(initialLotacoes)
	const [isPending, startTransition] = useTransition()
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [search, setSearch] = useState('')

	const form = useForm<LotacaoValues>({
		resolver: zodResolver(lotacaoSchema),
		defaultValues: { name: '' },
	})

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return lotacoes
		return lotacoes.filter((l) => l.name.toLowerCase().includes(q))
	}, [lotacoes, search])

	const reload = useCallback(async () => {
		const result = await getLotacoes()
		if (result.success && result.data) {
			setLotacoes(result.data)
		}
	}, [])

	const onSubmit = (data: LotacaoValues) => {
		startTransition(async () => {
			try {
				const result = await createLotacao(data.name)
				if (result.success) {
					toast.success('Lotação criada com sucesso!')
					form.reset()
					await reload()
				} else {
					toast.error(result.error || 'Erro ao criar lotação')
				}
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Erro ao criar lotação')
			}
		})
	}

	const handleDelete = (lotacaoId: string) => {
		setDeletingId(lotacaoId)
		startTransition(async () => {
			try {
				const result = await deleteLotacao(lotacaoId)
				if (result.success) {
					toast.success('Lotação removida!')
					await reload()
				} else {
					toast.error(result.error || 'Erro ao remover lotação')
				}
			} catch {
				toast.error('Erro ao remover lotação')
			} finally {
				setDeletingId(null)
			}
		})
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[340px_1fr] text-foreground">

			{/* ── Formulário ── */}
			<div className="rounded-xl border bg-card">
				<div className="flex items-center gap-3 border-b px-5 py-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
						<Building2 className="h-4 w-4 text-primary" />
					</div>
					<div>
						<p className="text-sm font-semibold">Nova Lotação</p>
						<p className="text-xs text-muted-foreground">
							Secretaria ou departamento
						</p>
					</div>
				</div>

				<div className="p-5">
					<Form {...form}>
						<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Nome
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: Secretaria de Saúde"
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								className="w-full"
								disabled={isPending}
								type="submit"
							>
								{isPending && !deletingId ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cadastrando...
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										Cadastrar lotação
									</>
								)}
							</Button>
						</form>
					</Form>
				</div>

				{/* Dica */}
				<div className="border-t px-5 py-3">
					<p className="text-[11px] text-muted-foreground leading-relaxed">
						Lotações são usadas para organizar fiscais e relatórios por secretaria.
					</p>
				</div>
			</div>

			{/* ── Lista ── */}
			<div className="rounded-xl border bg-card">
				<div className="flex items-center justify-between gap-3 border-b px-5 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
							<MapPin className="h-4 w-4 text-primary" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<p className="text-sm font-semibold">Cadastradas</p>
								<Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
									{lotacoes.length}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">
								Passe o mouse para remover
							</p>
						</div>
					</div>
				</div>

				{/* Busca */}
				<div className="border-b px-5 py-3">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar lotação..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-8 pl-9 text-sm"
						/>
					</div>
				</div>

				{/* Lista com scroll */}
				<div className="p-3">
					{lotacoes.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<MapPin className="h-5 w-5 opacity-50" />
							</div>
							<div className="text-center">
								<p className="text-sm font-medium">Nenhuma lotação cadastrada</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									Use o formulário ao lado para começar.
								</p>
							</div>
						</div>
					) : filtered.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
							<Search className="h-5 w-5 opacity-30" />
							<p className="text-sm">Nenhum resultado para "{search}"</p>
						</div>
					) : (
						<ScrollArea className="h-[300px]">
							<ul className="space-y-1 pr-3">
								{filtered.map((lotacao, index) => (
									<li
										key={lotacao.id}
										className="group flex items-center justify-between rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-muted/30"
									>
										<div className="flex items-center gap-3 min-w-0">
											<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground bg-muted">
												{index + 1}
											</span>
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
												<MapPin className="h-3.5 w-3.5 text-primary" />
											</div>
											<span className="truncate text-sm font-medium">
												{lotacao.name}
											</span>
										</div>
										<Button
											disabled={deletingId === lotacao.id || isPending}
											onClick={() => handleDelete(lotacao.id)}
											size="icon"
											variant="ghost"
											className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
										>
											{deletingId === lotacao.id ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<Trash2 className="h-3.5 w-3.5" />
											)}
										</Button>
									</li>
								))}
							</ul>
						</ScrollArea>
					)}
				</div>
			</div>
		</div>
	)
}
