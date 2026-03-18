/** biome-ignore-all lint/a11y/useSemanticElements: dev */
'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AlertCircle,
	Archive,
	Bell,
	Building2,
	CheckCheck,
	FileText,
	Mail,
	MessageSquare,
	Users,
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
import { arquivarMensagemAction } from '../_actions/mensagem-actions'
import type { MensagemListItem } from '../_data-access/get-mensagens'
import { MensagensPagination } from './mensagens-pagination'

interface MensagensTableProps {
	search: string
	page: number
	pageSize: number
	status: 'ATIVA' | 'ARQUIVADA' | 'todas'
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
function ConversaAvatar({ mensagem }: { mensagem: MensagemListItem }) {
	// Para 1 destinatário: iniciais do nome; para múltiplos ou com contrato: ícone
	if (mensagem.totalDestinatarios === 1 && mensagem.destinatariosNomes[0]) {
		const initials = mensagem.destinatariosNomes[0]
			.split(' ')
			.slice(0, 2)
			.map((w: string) => w[0])
			.join('')
			.toUpperCase()
		return (
			<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-sm font-bold dark:bg-slate-700 dark:text-slate-200">
				{initials}
			</div>
		)
	}
	return (
		<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
			{mensagem.contratoDisplay ? (
				<Building2 className="h-5 w-5" />
			) : (
				<Users className="h-5 w-5" />
			)}
		</div>
	)
}

// ─── Formata nomes dos destinatários ─────────────────────────────────────────
function formatarDestinatarios(nomes: string[]): string {
	if (nomes.length === 0) return 'Sem destinatários'
	if (nomes.length === 1) return nomes[0]
	if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`
	return `${nomes[0]}, ${nomes[1]} e mais ${nomes.length - 2}`
}

export function MensagensTable({
	search,
	page,
	pageSize,
	status,
	refreshKey,
	triggerRefresh,
}: MensagensTableProps) {
	const router = useRouter()
	const [mensagens, setMensagens] = useState<MensagemListItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		async function loadMensagens() {
			setLoading(true)
			try {
				const params = new URLSearchParams({
					page: String(page),
					pageSize: String(pageSize),
					status,
					...(search && { search }),
				})
				const res = await fetch(`/api/mensagens-gestor?${params}`)
				if (!res.ok) throw new Error('Erro na requisição')
				const result = await res.json()
				setMensagens(result.mensagens)
				setTotal(result.total)
			} catch (error) {
				console.error('Erro ao carregar mensagens:', error)
				toast.error('Erro ao carregar mensagens')
			} finally {
				setLoading(false)
			}
		}
		loadMensagens()
	}, [page, pageSize, search, status])

	const handleArquivar = (e: React.MouseEvent, mensagemId: string) => {
		e.stopPropagation()
		startTransition(async () => {
			const result = await arquivarMensagemAction(mensagemId)
			if (result.success) {
				toast.success('Mensagem arquivada com sucesso')
				triggerRefresh()
			} else {
				toast.error(result.error || 'Erro ao arquivar mensagem')
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
				<CardTitle className="text-base">Mensagens Enviadas</CardTitle>
				<CardDescription>
					{total === 0
						? 'Nenhuma mensagem encontrada'
						: `${total} mensagem${total !== 1 ? 's' : ''}`}
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">
				{mensagens.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
							<MessageSquare className="h-7 w-7 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium text-sm">Nenhuma mensagem</p>
							<p className="text-muted-foreground text-xs">
								Envie uma nova mensagem para os fiscais.
							</p>
						</div>
					</div>
				) : (
					<>
						<ul className="divide-y">
							{mensagens.map((mensagem) => {
								const tipo =
									tipoConfig[mensagem.tipo as keyof typeof tipoConfig]
								const temRespostasNovas = mensagem.respostasNaoLidas > 0

								return (
									<li key={mensagem.id}>
										<div
											role="button"
											tabIndex={0}
											className={cn(
												'group flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
												temRespostasNovas &&
													'bg-blue-50/40 dark:bg-blue-950/10',
											)}
											onClick={() =>
												router.push(
													`/dashboard-gestor/mensagens/${mensagem.id}`,
												)
											}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault()
													router.push(
														`/dashboard-gestor/mensagens/${mensagem.id}`,
													)
												}
											}}
										>
											{/* Avatar */}
											<ConversaAvatar mensagem={mensagem} />

											{/* Corpo */}
											<div className="min-w-0 flex-1">
												{/* Linha 1: destinatários + tempo */}
												<div className="flex items-baseline justify-between gap-2">
													<p
														className={cn(
															'truncate text-sm',
															temRespostasNovas
																? 'font-semibold text-foreground'
																: 'font-medium text-foreground',
														)}
													>
														{formatarDestinatarios(mensagem.destinatariosNomes)}
													</p>
													<span className="shrink-0 text-[11px] text-muted-foreground">
														{formatDistanceToNow(new Date(mensagem.createdAt), {
															addSuffix: true,
															locale: ptBR,
														})}
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

														{/* Lidas */}
														<span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
															<CheckCheck
																className={cn(
																	'h-3 w-3',
																	mensagem.totalLidas ===
																		mensagem.totalDestinatarios
																		? 'text-green-500'
																		: 'text-muted-foreground/50',
																)}
															/>
															{mensagem.totalLidas}/
															{mensagem.totalDestinatarios}
														</span>

														{/* Respostas novas */}
														{temRespostasNovas ? (
															<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
																{mensagem.respostasNaoLidas}
															</span>
														) : mensagem.totalRespostas > 0 ? (
															<span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
																<MessageSquare className="h-3 w-3" />
																{mensagem.totalRespostas}
															</span>
														) : null}
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

											{/* Ação arquivar — aparece no hover */}
											{mensagem.status === 'ATIVA' && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
													disabled={isPending}
													onClick={(e) => handleArquivar(e, mensagem.id)}
													title="Arquivar"
												>
													<Archive className="h-4 w-4 text-muted-foreground" />
												</Button>
											)}

											{/* Destinatários — ícone sempre visível */}
											<div className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
												<Users className="h-3.5 w-3.5" />
												{mensagem.totalDestinatarios}
											</div>
										</div>
									</li>
								)
							})}
						</ul>

						{totalPages > 1 && (
							<div className="border-t px-4 py-3">
								<MensagensPagination
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
