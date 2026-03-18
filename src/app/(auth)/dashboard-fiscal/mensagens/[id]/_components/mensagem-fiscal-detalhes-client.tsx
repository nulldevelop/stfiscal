'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AlertCircle,
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
} from 'lucide-react'
import Link from 'next/link'
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
import { cn } from '@/lib/utils'
import {
	marcarMensagemLidaAction,
	responderMensagemAction,
} from '../../_actions/mensagem-fiscal-actions'
import type { MensagemFiscalDetalhes } from '../../_data-access/get-mensagens-fiscal'

const POLL_INTERVAL = 5000

const tipoConfig = {
	AVISO: { label: 'Aviso', variant: 'default' as const, icon: Bell },
	LEMBRETE: { label: 'Lembrete', variant: 'secondary' as const, icon: FileText },
	COMUNICADO: { label: 'Comunicado', variant: 'outline' as const, icon: Mail },
	URGENTE: { label: 'Urgente', variant: 'destructive' as const, icon: AlertCircle },
}

const replySchema = z.object({
	conteudo: z.string().min(1, 'Digite uma mensagem').max(2000),
})
type ReplyForm = z.infer<typeof replySchema>

function Avatar({ nome, isGestor }: { nome: string; isGestor: boolean }) {
	const initials = nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
	return (
		<div className={cn(
			'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
			isGestor
				? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
				: 'bg-primary/10 text-primary',
		)}>
			{initials || (isGestor ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />)}
		</div>
	)
}

interface Props {
	mensagem: MensagemFiscalDetalhes
}

export function MensagemFiscalDetalhesClient({ mensagem: inicial }: Props) {
	const [chat, setChat] = useState(inicial.chat)
	const [isPending, startTransition] = useTransition()
	const bottomRef = useRef<HTMLDivElement>(null)
	const isFirstRender = useRef(true)

	const tipo = tipoConfig[inicial.tipo as keyof typeof tipoConfig]
	const TipoIcon = tipo?.icon || Mail
	const totalMensagens = 1 + chat.length

	const form = useForm<ReplyForm>({
		resolver: zodResolver(replySchema),
		defaultValues: { conteudo: '' },
	})

	// Busca o chat atualizado via API route
	const fetchChat = useCallback(async () => {
		try {
			const res = await fetch(`/api/mensagens-fiscal/${inicial.id}`)
			if (!res.ok) return
			const data: MensagemFiscalDetalhes = await res.json()
			setChat(data.chat)
		} catch {
			// silencioso — não interrompe o UX
		}
	}, [inicial.id])

	// Marcar como lida ao abrir
	useEffect(() => {
		if (!inicial.lida) {
			marcarMensagemLidaAction(inicial.id).catch(() => {})
		}
	}, [inicial.id, inicial.lida])

	// Scroll sempre que o chat mudar (abertura inicial + novas mensagens + envio)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
		}
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [chat])

	// Polling
	useEffect(() => {
		const timer = setInterval(fetchChat, POLL_INTERVAL)
		return () => clearInterval(timer)
	}, [fetchChat])

	function onSubmit(data: ReplyForm) {
		startTransition(async () => {
			const result = await responderMensagemAction({
				mensagemId: inicial.id,
				conteudo: data.conteudo,
			})
			if (result.success) {
				form.reset()
				// Atualiza imediatamente após enviar
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
						<Link href="/dashboard-fiscal/mensagens">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>

					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
						<Building2 className="h-4 w-4 text-slate-500" />
					</div>

					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h1 className="truncate font-semibold text-sm leading-tight">
								{inicial.remetente.nome}
							</h1>
							<Badge variant={tipo?.variant ?? 'default'} className="hidden shrink-0 items-center gap-1 sm:flex">
								<TipoIcon className="h-3 w-3" />
								{tipo?.label ?? inicial.tipo}
							</Badge>
						</div>
						<p className="truncate text-muted-foreground text-xs">
							{inicial.assunto}
							{inicial.contrato && (
								<>
									<span className="mx-1 opacity-40">·</span>
									<span className="font-medium text-foreground/70">
										{inicial.contrato.displayContrato}
									</span>
								</>
							)}
							<span className="mx-1 opacity-40">·</span>
							{totalMensagens} mensagem{totalMensagens !== 1 ? 's' : ''}
						</p>
					</div>
				</div>

				<time
					className="hidden shrink-0 text-muted-foreground text-xs sm:block"
					title={format(new Date(inicial.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
				>
					{formatDistanceToNow(new Date(inicial.createdAt), { addSuffix: true, locale: ptBR })}
				</time>
			</div>

			{/* ── Chat ───────────────────────────────────────────────────────── */}
			<ScrollArea className="min-h-0 flex-1 bg-muted/20">
				<div className="mx-auto max-w-2xl space-y-6 px-4 py-6">

					{/* Mensagem original */}
					<div className="flex items-end gap-2">
						<Avatar nome={inicial.remetente.nome} isGestor={true} />
						<div className="max-w-[80%] space-y-1">
							<p className="pl-1 text-[11px] font-medium text-muted-foreground">
								{inicial.remetente.nome}
								<span className="font-normal"> · Administrador de Contratos</span>
							</p>
							<div className="rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm ring-1 ring-border/60">
								<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
									{inicial.conteudo}
								</p>
							</div>
							<p className="pl-1 text-[11px] text-muted-foreground">
								{format(new Date(inicial.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR })}
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

					{/* Respostas */}
					{chat.map((entry) => {
						const isGestor = entry.doGestor
						return (
							<div key={entry.id} className={cn('flex items-end gap-2', !isGestor && 'flex-row-reverse')}>
								<Avatar nome={entry.autor.nome} isGestor={isGestor} />
								<div className={cn('max-w-[80%] space-y-1', !isGestor && 'items-end flex flex-col')}>
									{isGestor && (
										<p className="pl-1 text-[11px] font-medium text-muted-foreground">
											{entry.autor.nome}
											<span className="font-normal"> · {entry.autor.cargo}</span>
										</p>
									)}
									<div className={cn(
										'px-4 py-3 shadow-sm',
										isGestor
											? 'rounded-2xl rounded-bl-sm bg-background ring-1 ring-border/60 text-foreground'
											: 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground',
									)}>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{entry.conteudo}
										</p>
									</div>
									<p className={cn(
										'flex items-center gap-1 text-[11px] text-muted-foreground',
										isGestor ? 'pl-1' : 'pr-1 flex-row-reverse',
									)}>
										{format(new Date(entry.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR })}
										{!isGestor && <CheckCheck className="h-3 w-3 text-green-500" />}
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
							<p className="font-medium text-sm text-foreground">Sem respostas ainda</p>
							<p className="text-muted-foreground text-xs">
								Envie uma mensagem abaixo para iniciar a conversa.
							</p>
						</div>
					)}

					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* ── Input ──────────────────────────────────────────────────────── */}
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
		</div>
	)
}
