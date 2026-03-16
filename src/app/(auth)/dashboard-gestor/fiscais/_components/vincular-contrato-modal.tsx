'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { vincularContratoAction } from '../_actions/vincular-contrato'
import { getContratosParaVincular } from '../_data-access/get-members'
import type { MemberData } from '../_data-access/get-members'

interface VincularContratoModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	member: MemberData | null
	onSuccess: () => void
}

type ContratoOption = {
	id: string
	label: string
	contratado: string
	hasFiscalPrincipal: boolean
}

export function VincularContratoModal({
	open,
	onOpenChange,
	member,
	onSuccess,
}: VincularContratoModalProps) {
	const [contratos, setContratos] = useState<ContratoOption[]>([])
	const [selectedContrato, setSelectedContrato] = useState<string>('')
	const [tipoFiscal, setTipoFiscal] = useState<'PRINCIPAL' | 'SETORIAL'>('SETORIAL')
	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingContratos, setIsLoadingContratos] = useState(false)

	useEffect(() => {
		if (open) {
			setIsLoadingContratos(true)
			getContratosParaVincular()
				.then(setContratos)
				.catch(() => toast.error('Erro ao carregar contratos'))
				.finally(() => setIsLoadingContratos(false))
		} else {
			setSelectedContrato('')
			setTipoFiscal('SETORIAL')
		}
	}, [open])

	const selectedContratoData = contratos.find((c) => c.id === selectedContrato)

	const handleSubmit = async () => {
		if (!member || !selectedContrato) {
			toast.error('Selecione um contrato')
			return
		}

		setIsLoading(true)
		try {
			const result = await vincularContratoAction({
				memberId: member.id,
				contratoId: selectedContrato,
				tipo: tipoFiscal,
			})

			if (result.success) {
				toast.success(result.message)
				onSuccess()
			} else {
				toast.error(result.error)
			}
		} catch {
			toast.error('Erro ao vincular contrato')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Vincular a Contrato</DialogTitle>
					<DialogDescription>
						Vincule <strong>{member?.name}</strong> como fiscal de um contrato.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Contrato</Label>
						{isLoadingContratos ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								Carregando contratos...
							</div>
						) : (
							<Select
								value={selectedContrato}
								onValueChange={setSelectedContrato}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um contrato" />
								</SelectTrigger>
								<SelectContent>
									{contratos.map((contrato) => (
										<SelectItem key={contrato.id} value={contrato.id}>
											<div className="flex flex-col">
												<span>{contrato.label}</span>
												<span className="text-xs text-muted-foreground">
													{contrato.contratado}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div className="space-y-2">
						<Label>Tipo de Fiscal</Label>
						<RadioGroup
							value={tipoFiscal}
							onValueChange={(v) => setTipoFiscal(v as 'PRINCIPAL' | 'SETORIAL')}
							className="flex flex-col gap-2"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem
									value="PRINCIPAL"
									id="principal"
									disabled={selectedContratoData?.hasFiscalPrincipal}
								/>
								<Label
									htmlFor="principal"
									className={
										selectedContratoData?.hasFiscalPrincipal
											? 'text-muted-foreground'
											: ''
									}
								>
									Fiscal Principal
									{selectedContratoData?.hasFiscalPrincipal && (
										<span className="ml-2 text-xs text-destructive">
											(Já possui fiscal principal)
										</span>
									)}
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="SETORIAL" id="setorial" />
								<Label htmlFor="setorial">Fiscal Setorial</Label>
							</div>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !selectedContrato}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Vinculando...
							</>
						) : (
							'Vincular'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
