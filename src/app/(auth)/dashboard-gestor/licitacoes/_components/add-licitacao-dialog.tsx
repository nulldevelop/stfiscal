'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { CreateLicitacaoForm } from './create-licitacao-form'

interface AddLicitacaoDialogProps {
	onSuccess?: () => void
}

export function AddLicitacaoDialog({ onSuccess }: AddLicitacaoDialogProps) {
	const [open, setOpen] = useState(false)

	const handleSuccess = () => {
		setOpen(false)
		onSuccess?.()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					<span>Nova Licitação</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle>Cadastrar Nova Licitação</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto p-6 pt-2">
					<CreateLicitacaoForm onSuccess={handleSuccess} />
				</div>
			</DialogContent>
		</Dialog>
	)
}
