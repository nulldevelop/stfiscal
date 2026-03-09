'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

type SystemUpdateData = {
	id: string
	title: string
	description: string
	version: string | null
	createdAt: Date
}

type SystemUpdateDialogProps = {
	update: SystemUpdateData | null
}

export function SystemUpdateDialog({ update }: SystemUpdateDialogProps) {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!update) return

		const key = `seen_update_${update.id}`
		const alreadySeen = localStorage.getItem(key)

		if (!alreadySeen) {
			setOpen(true)
		}
	}, [update])

	const handleClose = () => {
		if (update) {
			localStorage.setItem(`seen_update_${update.id}`, '1')
		}
		setOpen(false)
	}

	if (!update) return null

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-2">
						{update.version && (
							<Badge variant="secondary">{update.version}</Badge>
						)}
						<DialogTitle>{update.title}</DialogTitle>
					</div>
					<p className="text-xs text-muted-foreground">
						{new Date(update.createdAt).toLocaleDateString('pt-BR', {
							day: '2-digit',
							month: 'long',
							year: 'numeric',
						})}
					</p>
				</DialogHeader>
				<div className="py-2">
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
						{update.description}
					</p>
				</div>
				<div className="flex justify-end">
					<Button onClick={handleClose}>Entendido</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
