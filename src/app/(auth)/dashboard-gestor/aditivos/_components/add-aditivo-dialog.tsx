'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { CreateAditivoForm } from './create-aditivo-form'

interface AddAditivoDialogProps {
	onSuccess?: () => void
}

export function AddAditivoDialog({ onSuccess }: AddAditivoDialogProps) {
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
					<span>Novo Aditivo</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Cadastrar Novo Aditivo</DialogTitle>
					<DialogDescription>
						Preencha as informações abaixo para cadastrar um novo aditivo a um contrato.
					</DialogDescription>
				</DialogHeader>
				<CreateAditivoForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	)
}
