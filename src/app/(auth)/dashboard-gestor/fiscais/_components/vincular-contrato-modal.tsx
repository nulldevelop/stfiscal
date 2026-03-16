'use client'

import { Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
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
	const [selectedContratos, setSelectedContratos] = useState<string[]>([])
	const [tipoFiscal, setTipoFiscal] = useState<'PRINCIPAL' | 'SETORIAL'>('SETORIAL')
	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingContratos, setIsLoadingContratos] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		if (open) {
			setIsLoadingContratos(true)
			getContratosParaVincular()
				.then(setContratos)
				.catch(() => toast.error('Erro ao carregar contratos'))
				.finally(() => setIsLoadingContratos(false))
		} else {
			setSelectedContratos([])
			setTipoFiscal('SETORIAL')
			setSearchTerm('')
		}
	}, [open])

	const filteredContratos = useMemo(() => {
		if (!searchTerm) return contratos
		const term = searchTerm.toLowerCase()
		return contratos.filter(
			(c) =>
				c.label.toLowerCase().includes(term) ||
				c.contratado.toLowerCase().includes(term)
		)
	}, [contratos, searchTerm])

	const toggleContrato = (contratoId: string) => {
		setSelectedContratos((prev) =>
			prev.includes(contratoId)
				? prev.filter((id) => id !== contratoId)
				: [...prev, contratoId]
		)
	}

	const toggleAll = () => {
		if (selectedContratos.length === filteredContratos.length) {
			setSelectedContratos([])
		} else {
			// Se for PRINCIPAL, só pode selecionar contratos sem fiscal principal
			if (tipoFiscal === 'PRINCIPAL') {
				setSelectedContratos(
					filteredContratos
						.filter((c) => !c.hasFiscalPrincipal)
						.map((c) => c.id)
				)
			} else {
				setSelectedContratos(filteredContratos.map((c) => c.id))
			}
		}
	}

	// Quando muda para PRINCIPAL, remove contratos que já têm fiscal principal
	useEffect(() => {
		if (tipoFiscal === 'PRINCIPAL') {
			setSelectedContratos((prev) =>
				prev.filter((id) => {
					const contrato = contratos.find((c) => c.id === id)
					return contrato && !contrato.hasFiscalPrincipal
				})
			)
		}
	}, [tipoFiscal, contratos])

	const handleSubmit = async () => {
		if (!member || selectedContratos.length === 0) {
			toast.error('Selecione pelo menos um contrato')
			return
		}

		setIsLoading(true)
		let successCount = 0
		let errorCount = 0

		try {
			for (const contratoId of selectedContratos) {
				const result = await vincularContratoAction({
					memberId: member.id,
					contratoId,
					tipo: tipoFiscal,
				})

				if (result.success) {
					successCount++
				} else {
					errorCount++
					console.error(`Erro ao vincular contrato ${contratoId}:`, result.error)
				}
			}

			if (successCount > 0) {
				toast.success(
					`${successCount} contrato(s) vinculado(s) com sucesso!${
						errorCount > 0 ? ` (${errorCount} falha(s))` : ''
					}`
				)
				onSuccess()
			} else {
				toast.error('Nenhum contrato foi vinculado')
			}
		} catch {
			toast.error('Erro ao vincular contratos')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="text-xl">Vincular a Contratos</DialogTitle>
					<DialogDescription>
						Vincule <strong>{member?.name}</strong> como fiscal de um ou mais
						contratos.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
					<div className="flex-shrink-0 space-y-3">
						<Label className="text-base font-medium">Tipo de Fiscal</Label>
						<RadioGroup
							value={tipoFiscal}
							onValueChange={(v) =>
								setTipoFiscal(v as 'PRINCIPAL' | 'SETORIAL')
							}
							className="flex gap-6"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="SETORIAL" id="setorial" />
								<Label htmlFor="setorial" className="cursor-pointer">
									Fiscal Setorial
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="PRINCIPAL" id="principal" />
								<Label htmlFor="principal" className="cursor-pointer">
									Fiscal Principal
								</Label>
							</div>
						</RadioGroup>
						{tipoFiscal === 'PRINCIPAL' && (
							<p className="text-xs text-muted-foreground">
								Contratos que já possuem fiscal principal estão desabilitados.
							</p>
						)}
					</div>

					<div className="flex-1 flex flex-col min-h-0 space-y-3">
						<div className="flex-shrink-0 flex items-center justify-between">
							<Label className="text-base font-medium">
								Contratos{' '}
								<span className="text-muted-foreground font-normal">
									({selectedContratos.length} selecionados)
								</span>
							</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={toggleAll}
								disabled={isLoadingContratos || filteredContratos.length === 0}
							>
								{selectedContratos.length === filteredContratos.length &&
								filteredContratos.length > 0
									? 'Desmarcar todos'
									: 'Selecionar todos'}
							</Button>
						</div>

						<div className="flex-shrink-0 relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Buscar por número do contrato ou contratado..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9"
							/>
						</div>

						{isLoadingContratos ? (
							<div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
								<Loader2 className="h-5 w-5 animate-spin" />
								Carregando contratos...
							</div>
						) : filteredContratos.length === 0 ? (
							<div className="flex-1 flex items-center justify-center text-muted-foreground">
								{searchTerm
									? 'Nenhum contrato encontrado'
									: 'Nenhum contrato disponível'}
							</div>
						) : (
							<ScrollArea className="flex-1 min-h-[200px] max-h-[400px] rounded-md border">
								<div className="p-3 space-y-2">
									{filteredContratos.map((contrato) => {
										const isDisabled =
											tipoFiscal === 'PRINCIPAL' && contrato.hasFiscalPrincipal
										const isSelected = selectedContratos.includes(contrato.id)

										return (
											<label
												key={contrato.id}
												className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
													isDisabled
														? 'cursor-not-allowed opacity-50 bg-muted/30'
														: 'cursor-pointer hover:bg-accent hover:border-accent-foreground/20'
												} ${isSelected && !isDisabled ? 'bg-accent border-primary/50 ring-1 ring-primary/20' : ''}`}
											>
												<Checkbox
													checked={isSelected}
													onCheckedChange={() => toggleContrato(contrato.id)}
													disabled={isDisabled}
													className="mt-0.5"
												/>
												<div className="flex-1 min-w-0">
													<div className="font-medium">
														{contrato.label}
													</div>
													<div className="text-sm text-muted-foreground mt-0.5">
														{contrato.contratado}
													</div>
													{contrato.hasFiscalPrincipal &&
														tipoFiscal === 'PRINCIPAL' && (
															<div className="text-xs text-destructive mt-1.5 font-medium">
																Já possui fiscal principal
															</div>
														)}
												</div>
											</label>
										)
									})}
								</div>
							</ScrollArea>
						)}
					</div>
				</div>

				<DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || selectedContratos.length === 0}
						className="min-w-[140px]"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Vinculando...
							</>
						) : (
							`Vincular ${selectedContratos.length > 0 ? `(${selectedContratos.length})` : ''}`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
