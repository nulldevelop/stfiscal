'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NovaMensagemDialog } from './nova-mensagem-dialog'

interface MensagensPageActionsProps {
	onSuccess: () => void
}

export function MensagensPageActions({ onSuccess }: MensagensPageActionsProps) {
	const [dialogOpen, setDialogOpen] = useState(false)

	const handleSuccess = () => {
		setDialogOpen(false)
		onSuccess()
	}

	return (
		<>
			<Button onClick={() => setDialogOpen(true)}>
				<Plus className="mr-2 h-4 w-4" />
				Nova Mensagem
			</Button>

			<NovaMensagemDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onSuccess={handleSuccess}
			/>
		</>
	)
}
