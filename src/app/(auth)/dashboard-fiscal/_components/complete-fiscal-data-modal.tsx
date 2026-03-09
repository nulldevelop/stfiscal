'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateFiscalInfoAction } from '../_actions/update-fiscal-info'
import type { FiscalInfo } from '../_data-access/get-fiscal-info'

// 1. Definição do Schema de validação
const fiscalFormSchema = z.object({
	cpf: z.string().min(11, 'CPF inválido').max(14),
	matricula: z.string().min(1, 'A matrícula é obrigatória'),
	portaria: z.string().min(1, 'A portaria é obrigatória'),
	contato: z.string().min(1, 'O contato é obrigatório'),
})

// Extraindo o tipo do schema
type FiscalFormData = z.infer<typeof fiscalFormSchema>

interface CompleteFiscalDataModalProps {
	fiscalInfo: FiscalInfo
}

export function CompleteFiscalDataModal({
	fiscalInfo,
}: CompleteFiscalDataModalProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 2. Inicialização do React Hook Form
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FiscalFormData>({
		resolver: zodResolver(fiscalFormSchema),
		defaultValues: {
			cpf: fiscalInfo.cpf || '',
			matricula: fiscalInfo.matricula || '',
			portaria: fiscalInfo.portaria || '',
			contato: fiscalInfo.contato || '',
		},
	})

	// 3. Função de submissão
	const onSubmit = async (data: FiscalFormData) => {
		setIsSubmitting(true)
		try {
			const result = await updateFiscalInfoAction(data)

			if (result.success) {
				toast.success('Dados atualizados com sucesso!')
				router.refresh()
			} else {
				toast.error(result.error || 'Erro ao atualizar dados')
			}
		} catch {
			toast.error('Erro interno ao atualizar dados')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={true}>
			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Complete seus dados</DialogTitle>
					<DialogDescription>
						Para continuar utilizando o sistema, preencha as informações
						obrigatórias abaixo.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Campo CPF */}
					<div className="space-y-2">
						<Label htmlFor="cpf">CPF *</Label>
						<Input id="cpf" placeholder="000.000.000-00" {...register('cpf')} />
						{errors.cpf && (
							<p className="text-xs text-red-500">{errors.cpf.message}</p>
						)}
					</div>

					{/* Campo Matrícula */}
					<div className="space-y-2">
						<Label htmlFor="matricula">Matrícula *</Label>
						<Input
							id="matricula"
							placeholder="Sua matrícula"
							{...register('matricula')}
						/>
						{errors.matricula && (
							<p className="text-xs text-red-500">{errors.matricula.message}</p>
						)}
					</div>

					{/* Campo Portaria - CORRIGIDO */}
					<div className="space-y-2">
						<Label htmlFor="portaria">Portaria *</Label>
						<Input
							id="portaria"
							placeholder="Ex: Portaria nº 123/2023"
							{...register('portaria')}
						/>
						{errors.portaria && (
							<p className="text-xs text-red-500">{errors.portaria.message}</p>
						)}
					</div>

					{/* Campo Contato */}
					<div className="space-y-2">
						<Label htmlFor="contato">Contato (Telefone) *</Label>
						<Input
							id="contato"
							placeholder="(00) 00000-0000"
							{...register('contato')}
						/>
						{errors.contato && (
							<p className="text-xs text-red-500">{errors.contato.message}</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? 'Salvando...' : 'Salvar e Continuar'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
