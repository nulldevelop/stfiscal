'use client'

import {
	LinkIcon,
	Loader2,
	RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { bulkAutoLinkFiscaisAction } from '../../contratos/_actions/link-fiscais-bulk-auto'
import { resetFiscalLinksAction } from '../../contratos/_actions/reset-fiscal-links'

interface FiscaisPageActionsProps {
	onSuccess?: () => void
}

export function FiscaisPageActions({ onSuccess }: FiscaisPageActionsProps) {
	const [isBulkLinkLoading, setIsBulkLinkLoading] = useState(false)
	const [isResetLoading, setIsResetLoading] = useState(false)

	const handleBulkLink = async () => {
		setIsBulkLinkLoading(true)
		try {
			const res = await bulkAutoLinkFiscaisAction()
			if (res.success) {
				toast.success('Processo finalizado!', {
					description: (
						<div className="space-y-1">
							{(res.data.message ?? '').split('\n').map((line) => (
								<div key={line}>{line}</div>
							))}
						</div>
					),
					duration: 10000,
				})
				onSuccess?.()
			} else {
				toast.error(res.error)
			}
		} catch (error) {
			toast.error('Ocorreu um erro inesperado.')
			console.error(error)
		} finally {
			setIsBulkLinkLoading(false)
		}
	}

	const handleResetLinks = async () => {
		setIsResetLoading(true)
		try {
			const res = await resetFiscalLinksAction()
			if (res.success) {
				toast.success('Reset finalizado!', {
					description: res.data.message,
					duration: 10000,
				})
				onSuccess?.()
			} else {
				toast.error(res.error)
			}
		} catch (error) {
			toast.error('Ocorreu um erro inesperado.')
			console.error(error)
		} finally {
			setIsResetLoading(false)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={handleBulkLink}
				disabled={isBulkLinkLoading}
				className="flex items-center gap-2 text-foreground"
			>
				{isBulkLinkLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<LinkIcon className="h-4 w-4 text-foreground" />
				)}
				<span className="text-foreground">Vincular Fiscais</span>
			</Button>

			<Button
				variant="outline"
				onClick={handleResetLinks}
				disabled={isResetLoading}
				className="flex items-center gap-2 text-destructive hover:text-destructive"
			>
				{isResetLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<RefreshCw className="h-4 w-4" />
				)}
				<span>Resetar Vínculos</span>
			</Button>
		</div>
	)
}
