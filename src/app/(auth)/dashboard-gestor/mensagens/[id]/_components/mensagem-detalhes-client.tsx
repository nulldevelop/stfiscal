/** biome-ignore-all lint/correctness/useExhaustiveDependencies: dev */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AlertCircle,
	Archive,
	ArrowLeft,
	Bell,
	Building2,
	CheckCheck,
	FileText,
	Loader2,
	Mail,
	MessageCircle,
	Send,
	User,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
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
	FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
	arquivarMensagemAction,
	marcarRespostaLidaAction,
	responderMensagemGestorAction,
} from '../../_actions/mensagem-actions'
import type { MensagemDetalhes } from '../../_data-access/get-mensagens'

const POLL_INTERVAL = 5000

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

const replySchema = z.object({
	conteudo: z.string().min(1, 'Digite uma mensagem').max(2000),
})
type ReplyForm = z.infer<typeof replySchema>

function Avatar({ nome, isGestor }: { nome: string; isGestor: boolean }) {
	const initials = nome
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0])
		.join('')
		.toUpperCase()
	return (
		<div
			className={cn(
				'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
				isGestor
					? 'bg-primary/10 text-primary'
					: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
			)}
		>
			{initials ||
				(isGestor ? (
					<Building2 className="h-4 w-4" />
				) : (
					<User className="h-4 w-4" />
				))}
		</div>
	)
}

interface Props {
	mensagem: MensagemDetalhes
}

export function MensagemDetalhesClient({ mensagem: inicial }: Props) {
	const router = useRouter()
	const mensagemId = inicial.id
	const [chat, setChat] = useState(inicial.chat)
	const [destinatarios, setDestinatarios] = useState(inicial.destinatarios)
	const [status, setStatus] = useState(inicial.status)
	const [isPending, startTransition] = useTransition()
	const bottomRef = useRef<HTMLDivElement>(null)
	const scrollAreaRef = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const isFirstRender = useRef(true)

	const scrollToBottom = useCallback((smooth = true) => {
		// Tenta via scrollIntoView no elemento âncora
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
			return
		}
		// Fallback: scroll direto no viewport do ScrollArea
		const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
			'[data-radix-scroll-area-viewport]',
		)
		if (viewport) {
			viewport.scrollTo({ top: viewport.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
		}
	}, [])

	const tipo = tipoConfig[inicial.tipo as keyof typeof tipoConfig]
	const TipoIcon = tipo?.icon || Mail
	const totalLidas = destinatarios.filter((d) => d.lida).length
	const respostasNovas = chat.filter(
		(e) => !e.doGestor && !e.lidaPeloRemetente,
	).length
	const totalMensagens = 1 + chat.length

	const form = useForm<ReplyForm>({
		resolver: zodResolver(replySchema),
		defaultValues: { conteudo: '' },
	})

	// Busca o chat atualizado via API route
	const fetchChat = useCallback(async () => {
		try {
			const res = await fetch(`/api/mensagens-gestor/${mensagemId}`)
			if (!res.ok) return
			const data: MensagemDetalhes = await res.json()
			setChat(data.chat)
			setDestinatarios(data.destinatarios)
			setStatus(data.status)
		} catch {
			// silencioso
		}
	}, [mensagemId])

	// Marcar respostas não lidas ao abrir — roda só uma vez ao montar
	useEffect(() => {
		const idsNaoLidas = inicial.chat
			.filter((e) => !e.doGestor && !e.lidaPeloRemetente)
			.map((e) => e.id)
		if (idsNaoLidas.length > 0) {
			marcarRespostaLidaAction(idsNaoLidas).catch(() => {})
		}
	}, [inicial.chat.filter])

	// Scroll na abertura inicial (sem animação para evitar flash) e após novas mensagens
	useEffect(() => {
		const smooth = !isFirstRender.current
		if (isFirstRender.current) {
			isFirstRender.current = false
		}
		scrollToBottom(smooth)
	}, [chat, scrollToBottom])

	// Polling — marca novas respostas de fiscais como lidas automaticamente
	useEffect(() => {
		const timer = setInterval(async () => {
			try {
				const res = await fetch(`/api/mensagens-gestor/${mensagemId}`)
				if (!res.ok) return
				const data: MensagemDetalhes = await res.json()

				const idsNaoLidas = data.chat
					.filter((e) => !e.doGestor && !e.lidaPeloRemetente)
					.map((e) => e.id)
				if (idsNaoLidas.length > 0) {
					marcarRespostaLidaAction(idsNaoLidas).catch(() => {})
				}

				setChat(data.chat)
				setDestinatarios(data.destinatarios)
				setStatus(data.status)
			} catch {
				// silencioso
			}
		}, POLL_INTERVAL)
		return () => clearInterval(timer)
	}, [mensagemId])

	function handleArquivar() {
		startTransition(async () => {
			const result = await arquivarMensagemAction(inicial.id)
			if (result.success) {
				toast.success('Mensagem arquivada')
				router.push('/dashboard-gestor/mensagens')
			} else {
				toast.error(result.error || 'Erro ao arquivar')
			}
		})
	}

	function onSubmit(data: ReplyForm) {
		startTransition(async () => {
			const result = await responderMensagemGestorAction({
				mensagemId: inicial.id,
				conteudo: data.conteudo,
			})
			if (result.success) {
				form.reset()
				await fetchChat()
			} else {
				toast.error(result.error || 'Erro ao enviar resposta')
			}
		})
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault()
			form.handleSubmit(onSubmit)()
		}
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col -mx-4 -my-2">
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3 shadow-sm">
				<div className="flex min-w-0 items-center gap-3">
					<Button variant="ghost" size="icon" className="shrink-0" asChild>
						<Link href="/dashboard-gestor/mensagens">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>

					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
						<Mail className="h-4 w-4 text-primary" />
					</div>

					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h1 className="truncate font-semibold text-sm leading-tight">
								{inicial.contrato
									? inicial.contrato.displayContrato
									: destinatarios.length === 1
										? destinatarios[0].fiscalContrato.nome
										: `${destinatarios.length} fiscais`}
							</h1>
							<Badge
								variant={tipo?.variant ?? 'default'}
								className="hidden shrink-0 items-center gap-1 sm:flex"
							>
								<TipoIcon className="h-3 w-3" />
								{tipo?.label ?? inicial.tipo}
							</Badge>
							{status === 'ARQUIVADA' && (
								<Badge variant="secondary" className="hidden shrink-0 sm:flex">
									Arquivada
								</Badge>
							)}
						</div>
						<p className="truncate text-muted-foreground text-xs">
							{inicial.assunto}
							<span className="mx-1 opacity-40">·</span>
							{totalMensagens} mensagem{totalMensagens !== 1 ? 's' : ''}
							<span className="mx-1 opacity-40">·</span>
							{respostasNovas > 0 ? (
								<span className="font-medium text-blue-600 dark:text-blue-400">
									{respostasNovas} nova{respostasNovas !== 1 ? 's' : ''}
								</span>
							) : (
								<span>sem novas respostas</span>
							)}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{/* Destinatários com tooltip */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="gap-1.5 text-muted-foreground text-xs"
							>
								<Users className="h-3.5 w-3.5" />
								<span>
									{totalLidas}/{destinatarios.length}
								</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-xs p-3">
							<p className="mb-2 font-semibold text-xs">
								{totalLidas} de {destinatarios.length} leram
							</p>
							<div className="space-y-1.5">
								{destinatarios.map((d) => (
									<div
										key={d.id}
										className="flex items-center justify-between gap-4 text-xs"
									>
										<span className="truncate">{d.fiscalContrato.nome}</span>
										{d.lida ? (
											<div className="flex shrink-0 items-center gap-1 text-green-500">
												<CheckCheck className="h-3 w-3" />
												<span className="text-[10px]">
													{d.lidaEm
														? format(new Date(d.lidaEm), 'dd/MM HH:mm', {
																locale: ptBR,
															})
														: 'lida'}
												</span>
											</div>
										) : (
											<span className="shrink-0 text-[10px] text-muted-foreground">
												não lida
											</span>
										)}
									</div>
								))}
							</div>
						</TooltipContent>
					</Tooltip>

					{/* Arquivar */}
					{status !== 'ARQUIVADA' && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleArquivar}
							disabled={isPending}
						>
							<Archive className="mr-1.5 h-3.5 w-3.5" />
							Arquivar
						</Button>
					)}

					{/* Data relativa */}
					<time
						className="hidden shrink-0 text-muted-foreground text-xs xl:block"
						title={format(
							new Date(inicial.createdAt),
							"dd/MM/yyyy 'às' HH:mm",
							{ locale: ptBR },
						)}
					>
						{formatDistanceToNow(new Date(inicial.createdAt), {
							addSuffix: true,
							locale: ptBR,
						})}
					</time>
				</div>
			</div>

			{/* ── Chat ───────────────────────────────────────────────────────── */}
			<ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 bg-muted/20">
				<div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
					{/* Mensagem original (gestor → direita) */}
					<div className="flex flex-row-reverse items-end gap-2">
						<Avatar nome={inicial.remetente.nome} isGestor={true} />
						<div className="flex max-w-[80%] flex-col items-end space-y-1">
							<div className="rounded-2xl rounded-br-sm bg-primary px-4 py-3 shadow-sm text-primary-foreground">
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{inicial.conteudo}
								</p>
							</div>
							<p className="pr-1 text-right text-[11px] text-muted-foreground">
								{inicial.remetente.nome}
								<span className="mx-1 opacity-40">·</span>
								{format(new Date(inicial.createdAt), "dd MMM 'às' HH:mm", {
									locale: ptBR,
								})}
								<CheckCheck className="ml-1 inline h-3 w-3 text-green-500" />
							</p>
						</div>
					</div>

					{/* Separador */}
					{chat.length > 0 && (
						<div className="flex items-center gap-3">
							<div className="h-px flex-1 bg-border" />
							<span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-0.5 text-[11px] text-muted-foreground shadow-sm">
								<MessageCircle className="h-3 w-3" />
								{chat.length} resposta{chat.length !== 1 ? 's' : ''}
							</span>
							<div className="h-px flex-1 bg-border" />
						</div>
					)}

					{/* Entradas do chat */}
					{chat.map((entry) => {
						const isGestor = entry.doGestor
						return (
							<div
								key={entry.id}
								className={cn(
									'flex items-end gap-2',
									isGestor && 'flex-row-reverse',
								)}
							>
								<Avatar nome={entry.autor.nome} isGestor={isGestor} />
								<div
									className={cn(
										'max-w-[80%] space-y-1',
										isGestor && 'flex flex-col items-end',
									)}
								>
									{!isGestor && (
										<p className="pl-1 text-[11px] font-medium text-muted-foreground">
											{entry.autor.nome}
											{entry.autor.cargo && (
												<span className="font-normal">
													{' '}
													· {entry.autor.cargo}
												</span>
											)}
										</p>
									)}
									<div
										className={cn(
											'px-4 py-3 shadow-sm',
											isGestor
												? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground'
												: 'rounded-2xl rounded-bl-sm bg-background ring-1 ring-border/60 text-foreground',
										)}
									>
									<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{entry.conteudo}
										</p>
									</div>
									<p
										className={cn(
											'flex items-center gap-1 text-[11px] text-muted-foreground',
											isGestor ? 'pr-1 flex-row-reverse' : 'pl-1',
										)}
									>
										{format(new Date(entry.createdAt), "dd MMM 'às' HH:mm", {
											locale: ptBR,
										})}
										{isGestor && (
											<CheckCheck className="h-3 w-3 text-green-500" />
										)}
									</p>
								</div>
							</div>
						)
					})}

					{/* Estado vazio */}
					{chat.length === 0 && (
						<div className="flex flex-col items-center gap-2 py-8 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<MessageCircle className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="font-medium text-sm text-foreground">
								Sem respostas ainda
							</p>
							<p className="text-muted-foreground text-xs">
								Os fiscais ainda não responderam esta mensagem.
							</p>
						</div>
					)}

					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* ── Input ──────────────────────────────────────────────────────── */}
			{status === 'ATIVA' ? (
				<div className="border-t bg-background px-4 py-3">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mx-auto flex max-w-2xl items-end gap-2"
						>
							<FormField
								control={form.control}
								name="conteudo"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Textarea
												{...field}
												ref={(el) => {
													field.ref(el)
													textareaRef.current = el
												}}
												placeholder="Escreva sua resposta… (Ctrl+Enter para enviar)"
												className="max-h-36 min-h-[2.75rem] resize-none rounded-2xl bg-muted/50 px-4 text-sm focus-visible:ring-1"
												rows={1}
												onKeyDown={handleKeyDown}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								size="icon"
								disabled={isPending}
								className="h-11 w-11 shrink-0 rounded-2xl"
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</Button>
						</form>
					</Form>
				</div>
			) : (
				<div className="border-t bg-muted/30 px-4 py-3">
					<p className="mx-auto max-w-2xl text-center text-muted-foreground text-xs">
						Esta mensagem foi arquivada e não aceita mais respostas.
					</p>
				</div>
			)}
		</div>
	)
}
