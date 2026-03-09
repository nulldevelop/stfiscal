'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { previewNotificacaoPdf } from '../_actions/preview-notificacao-pdf'

interface LivePdfPreviewProps {
	tipo: 'entrega' | 'entrega-incompleta' | 'desconformidade'
	dados: any
}

export function LivePdfPreview({ tipo, dados }: LivePdfPreviewProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const pdfUrlRef = useRef<string | null>(null)

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			startTransition(async () => {
				try {
					const result = await previewNotificacaoPdf({
						tipo,
						dados,
					})

					if (result.success && result.pdfBase64) {
						const byteArray = Uint8Array.from(atob(result.pdfBase64), (c) =>
							c.charCodeAt(0),
						)
						const blob = new Blob([byteArray], { type: 'application/pdf' })
						const url = URL.createObjectURL(blob)

						// Clean up old URL using ref to avoid infinite loop
						if (pdfUrlRef.current) {
							URL.revokeObjectURL(pdfUrlRef.current)
						}
						pdfUrlRef.current = url
						setPdfUrl(url)
						setError(null)
					} else {
						setError(result.error || 'Erro ao gerar prévia')
					}
				} catch (err) {
					console.error('Preview error:', err)
					setError('Erro ao processar prévia')
				}
			})
		}, 2000) // Debounce increased to 2s to prevent constant reloading

		return () => {
			clearTimeout(timeoutId)
		}
	}, [dados, tipo])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pdfUrlRef.current) {
				URL.revokeObjectURL(pdfUrlRef.current)
			}
		}
	}, [])

	return (
		<div className="relative w-full h-[calc(100vh-180px)] border-2 shadow-inner rounded-lg /30 overflow-hidden">
			{isPending && (
				<div className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-md border shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in zoom-in duration-300">
					<Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
					<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Atualizando...
					</p>
				</div>
			)}

			<div
				className={cn(
					'w-full h-full transition-opacity duration-500',
					isPending ? 'opacity-60' : 'opacity-100',
				)}
			>
				{error ? (
					<div className="flex items-center justify-center h-full p-6 text-center">
						<div className="max-w-xs space-y-2">
							<p className="text-destructive font-semibold">Ops!</p>
							<p className="text-sm text-muted-foreground">{error}</p>
						</div>
					</div>
				) : pdfUrl ? (
					<iframe
						src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
						className="w-full h-full border-none"
						title="Prévia da Notificação"
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-sm text-muted-foreground">
							Carregando prévia...
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
