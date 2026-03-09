'use client'

import { RefreshCw, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { syncLicitacoesAction } from '../_actions/sync-licitacoes'

interface LicitacoesPageActionsProps {
	onSuccess?: () => void
}

export function LicitacoesPageActions({ onSuccess }: LicitacoesPageActionsProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleSync = async () => {
		setIsLoading(true)
		try {
			const res = await syncLicitacoesAction()
			if (res.success) {
				toast.success('Sincronização concluída!', {
					description: `${res.data.criadas} novas licitações, ${res.data.atualizadas} atualizadas.`,
					duration: 8000,
				})
				onSuccess?.()
			} else {
				toast.error('Erro na sincronização', { description: res.error })
			}
		} catch (error) {
			toast.error('Ocorreu um erro inesperado.')
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button
			variant="outline"
			onClick={handleSync}
			disabled={isLoading}
			className="flex items-center gap-2 text-foreground"
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<RefreshCw className="h-4 w-4" />
			)}
			<span>Sincronizar Licitações</span>
		</Button>
	)
}
