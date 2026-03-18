'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AlertCircle,
	Bell,
	Building2,
	Check,
	FileText,
	Inbox,
	Mail,
	MessageSquare,
	User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MensagemFiscalListItem } from '../_data-access/get-mensagens-fiscal'
import { marcarMensagemLidaAction } from '../_actions/mensagem-fiscal-actions'
import { MensagensFiscalPagination } from './mensagens-fiscal-pagination'

interface MensagensFiscalTableProps {
	search: string
	page: number
	pageSize: number
	lida: 'todas' | 'lidas' | 'nao_lidas'
	refreshKey: number
	triggerRefresh: () => void
}

const tipoConfig = {
	AVISO: { label: 'Aviso', variant: 'default' as const, icon: Bell },
	LEMBRETE: {
		label: 'Lembrete',
		variant: 'secondary' as const,
		icon: FileText,
	},
	COMUNICADO: { label: 'Comunicado', variant: 'outline' as const, icon: Mail },
	URGENTE: {
		label: 'Urgente',
		variant: 'destructive' as const,
		icon: AlertCircle,
	},
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function RemetenteAvatar({ mensagem }: { mensagem: MensagemFiscalListItem }) {
	const initials = mensagem.remetente.nome
		.split(' ')
		.slice(0, 2)
		.map((w: string) => w[0])
		.join('')
		.toUpperCase()

	if (mensagem.contratoDisplay) {
		return (
			<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
				<Building2 className="h-5 w-5" />
			</div>
		)
	}

	return (
		<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-sm font-bold dark:bg-slate-700 dark:text-slate-200">
			{initials || <User className="h-5 w-5" />}
		</div>
	)
}

export function MensagensFiscalTable({
	search,
	page,
	pageSize,
	lida,
	refreshKey,
	triggerRefresh,
}: MensagensFiscalTableProps) {
	const router = useRouter()
	const [mensagens, setMensagens] = useState<MensagemFiscalListItem[]>([])
	const [total, setTotal] = useState(0)
	const [naoLidas, setNaoLidas] = useState(0)
	const [loading, setLoading] = useState(true)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		async function loadMensagens() {
			setLoading(true)
			try {
				const params = new URLSearchParams({
					page: String(page),
					pageSize: String(pageSize),
					lida,
					...(search && { search }),
				})
				const res = await fetch(`/api/mensagens-fiscal?${params}`)
				if (!res.ok) throw new Error('Erro na requisição')
				const result = await res.json()
				setMensagens(result.mensagens)
				setTotal(result.total)
				setNaoLidas(result.naoLidas)
			} catch (error) {
				console.error('Erro ao carregar mensagens:', error)
				toast.error('Erro ao carregar mensagens')
			} finally {
				setLoading(false)
			}
		}

		loadMensagens()
	}, [page, pageSize, search, lida, refreshKey])

	const handleMarcarLida = (e: React.MouseEvent, mensagemId: string) => {
		e.stopPropagation()
		startTransition(async () => {
			const result = await marcarMensagemLidaAction(mensagemId)
			if (result.success) {
				toast.success('Mensagem marcada como lida')
				triggerRefresh()
			} else {
				toast.error(result.error || 'Erro ao marcar mensagem')
			}
		})
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-4 w-56" />
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{['sk-1', 'sk-2', 'sk-3', 'sk-4'].map((key) => (
							<div key={key} className="flex items-center gap-3 px-4 py-4">
								<Skeleton className="h-11 w-11 rounded-full shrink-0" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-48" />
									<Skeleton className="h-3 w-72" />
								</div>
								<Skeleton className="h-3 w-16 shrink-0" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	const totalPages = Math.ceil(total / pageSize)

	return (
		<Card className="overflow-hidden">
			<CardHeader className="border-b pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Caixa de Entrada</CardTitle>
						<CardDescription>
							{total === 0
								? 'Nenhuma mensagem encontrada'
								: `${total} mensagem${total !== 1 ? 's' : ''}`}
						</CardDescription>
					</div>
					{naoLidas > 0 && (
						<Badge variant="destructive">{naoLidas} não lida(s)</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="p-0">
				{mensagens.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
							<Inbox className="h-7 w-7 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium text-sm">Nenhuma mensagem</p>
							<p className="text-muted-foreground text-xs">
								Você não possui mensagens no momento.
							</p>
						</div>
					</div>
				) : (
					<>
						<ul className="divide-y">
							{mensagens.map((mensagem) => {
								const tipo =
									tipoConfig[mensagem.tipo as keyof typeof tipoConfig]
								const temRespostasNovas = mensagem.totalRespostas > 0

								return (
									<li
										key={mensagem.id}
										className={cn(
											'group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50',
											!mensagem.lida && 'bg-blue-50/40 dark:bg-blue-950/10',
										)}
										onClick={() =>
											router.push(
												`/dashboard-fiscal/mensagens/${mensagem.id}`,
											)
										}
									>
										{/* Avatar */}
										<RemetenteAvatar mensagem={mensagem} />

										{/* Corpo */}
										<div className="min-w-0 flex-1">
											{/* Linha 1: remetente + tempo */}
											<div className="flex items-baseline justify-between gap-2">
												<p
													className={cn(
														'truncate text-sm',
														!mensagem.lida
															? 'font-semibold text-foreground'
															: 'font-medium text-foreground',
													)}
												>
													{mensagem.remetente.nome}
												</p>
												<span className="shrink-0 text-[11px] text-muted-foreground">
													{formatDistanceToNow(
														new Date(mensagem.createdAt),
														{
															addSuffix: true,
															locale: ptBR,
														},
													)}
												</span>
											</div>

											{/* Linha 2: assunto + badges */}
											<div className="mt-0.5 flex items-center justify-between gap-2">
												<p className="line-clamp-1 flex-1 text-xs text-muted-foreground">
													{mensagem.assunto}
												</p>

												<div className="flex shrink-0 items-center gap-1.5">
													{/* Tipo */}
													<Badge
														variant={tipo?.variant || 'default'}
														className="hidden h-4 px-1.5 text-[10px] sm:flex"
													>
														{tipo?.label || mensagem.tipo}
													</Badge>

													{/* Respostas */}
													{temRespostasNovas && (
														<span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
															<MessageSquare className="h-3 w-3" />
															{mensagem.totalRespostas}
														</span>
													)}

													{/* Indicador não lida */}
													{!mensagem.lida && (
														<div className="h-2 w-2 rounded-full bg-blue-500" />
													)}
												</div>
											</div>

											{/* Linha 3: contrato (se houver) */}
											{mensagem.contratoDisplay && (
												<div className="mt-1 flex items-center gap-1">
													<Building2 className="h-3 w-3 shrink-0 text-muted-foreground/60" />
													<span className="truncate text-[11px] text-muted-foreground/80">
														{mensagem.contratoDisplay}
													</span>
												</div>
											)}
										</div>

										{/* Ação marcar lida — aparece no hover */}
										{!mensagem.lida && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												disabled={isPending}
												onClick={(e) => handleMarcarLida(e, mensagem.id)}
												title="Marcar como lida"
											>
												<Check className="h-4 w-4 text-muted-foreground" />
											</Button>
										)}
									</li>
								)
							})}
						</ul>

						{totalPages > 1 && (
							<div className="border-t px-4 py-3">
								<MensagensFiscalPagination
									currentPage={page}
									totalPages={totalPages}
									pageSize={pageSize}
								/>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
