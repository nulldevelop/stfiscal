'use client'

import { IconEye, IconHistory, IconInfoCircle, IconArrowRight } from '@tabler/icons-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

type LogDetailDialogProps = {
	before?: string | null
	after?: string | null
	entityName?: string | null
	entityId?: string | null
	action?: string | null
}

export function LogDetailDialog({
	before,
	after,
	entityName,
	entityId,
	action,
}: LogDetailDialogProps) {
	const [open, setOpen] = useState(false)

	if (!before && !after) return null

	function prettyJson(raw: string | null | undefined) {
		if (!raw) return null
		try {
			const parsed = JSON.parse(raw)
			return JSON.stringify(parsed, null, 2)
		} catch {
			return raw
		}
	}

	const getActionColor = (act?: string | null) => {
		const normalized = act?.toUpperCase() || ''
		if (normalized.includes('CRIA') || normalized.includes('CREATE')) {
			return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
		}
		if (normalized.includes('ATUA') || normalized.includes('UPDATE')) {
			return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
		}
		if (normalized.includes('EXCLU') || normalized.includes('DELE')) {
			return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
		}
		return 'bg-primary/10 text-primary border-primary/20'
	}

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
				onClick={() => setOpen(true)}
			>
				<IconEye className="h-4 w-4" />
				<span className="sr-only">Ver Detalhes</span>
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
					<DialogHeader className="p-6 bg-muted/30 border-b border-border/50">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
									<IconHistory className="h-6 w-6 text-primary" />
								</div>
								<div>
									<DialogTitle className="text-xl font-bold tracking-tight">
										Auditoria de Alterações
									</DialogTitle>
									<DialogDescription className="text-sm font-medium text-primary mt-0.5">
										{entityName || 'Registro de sistema'}
									</DialogDescription>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{action && (
									<Badge
										variant="outline"
										className={cn('px-3 py-1 font-bold text-[10px] uppercase tracking-wider', getActionColor(action))}
									>
										{action}
									</Badge>
								)}
							</div>
						</div>
					</DialogHeader>

					<div className="flex-1 overflow-hidden flex flex-col">
						{entityId && (
							<div className="px-6 py-3 bg-muted/10 border-b border-border/50 flex items-center gap-3">
								<IconInfoCircle className="h-4 w-4 text-muted-foreground" />
								<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
									ID Único:
								</span>
								<code className="text-xs font-mono bg-background px-2 py-0.5 rounded border border-border/50 text-foreground/80">
									{entityId}
								</code>
							</div>
						)}

						<ScrollArea className="flex-1 p-6">
							<div className="grid gap-8 lg:grid-cols-2">
								{/* Coluna Antes */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-red-500" />
											<h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
												Estado Anterior
											</h4>
										</div>
										<Badge variant="secondary" className="text-[9px] font-mono opacity-50">JSON</Badge>
									</div>
									<div className="relative group">
										<pre className="rounded-xl border bg-[#0d1117] p-5 text-[11px] font-mono leading-relaxed text-slate-300 min-h-[300px] overflow-x-auto selection:bg-primary/30">
											{prettyJson(before) || '// Nenhum dado anterior'}
										</pre>
									</div>
								</div>

								{/* Coluna Depois */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-blue-500" />
											<h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
												Novo Estado
											</h4>
										</div>
										<Badge variant="secondary" className="text-[9px] font-mono opacity-50">JSON</Badge>
									</div>
									<div className="relative group">
										<pre className="rounded-xl border bg-[#0d1117] p-5 text-[11px] font-mono leading-relaxed text-slate-300 min-h-[300px] overflow-x-auto selection:bg-primary/30">
											{prettyJson(after) || '// Registro removido'}
										</pre>
									</div>
								</div>
							</div>
						</ScrollArea>
					</div>

					<div className="p-4 bg-muted/30 border-t border-border/50 flex justify-between items-center px-6">
						<p className="text-[10px] text-muted-foreground italic hidden sm:block">
							Use shift + scroll para navegar horizontalmente no código JSON.
						</p>
						<Button variant="outline" className="px-8 font-semibold shadow-sm" onClick={() => setOpen(false)}>
							Fechar Visualização
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
