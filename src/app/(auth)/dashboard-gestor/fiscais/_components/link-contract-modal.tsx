'use client'

import { Loader2, Plus, Search } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUnlinkedContracts } from '../_data-access/get-unlinked-contracts'
import { linkContractToFiscalAction } from '../_actions/manage-links'

interface LinkContractModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	fiscalId: string // userId
}

export function LinkContractModal({ isOpen, onOpenChange, fiscalId }: LinkContractModalProps) {
	const [contracts, setContracts] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [search, setSearch] = useState('')
	const [isLinking, setIsLinking] = useState<string | null>(null)

	useEffect(() => {
		if (isOpen) {
			loadContracts()
		}
	}, [isOpen])

	async function loadContracts() {
		setLoading(true)
		try {
			const res = await getUnlinkedContracts(fiscalId)
			setContracts(res.data || [])
		} catch (error) {
			toast.error('Erro ao carregar contratos disponíveis')
		} finally {
			setLoading(false)
		}
	}

	const filtered = useMemo(() => {
		return contracts.filter(c => 
			c.displayContrato.toLowerCase().includes(search.toLowerCase()) ||
			c.contratado.toLowerCase().includes(search.toLowerCase())
		)
	}, [contracts, search])

	async function handleLink(contratoId: string) {
		setIsLinking(contratoId)
		try {
			const res = await linkContractToFiscalAction(fiscalId, contratoId)
			if (res.success) {
				toast.success('Contrato vinculado com sucesso!')
				// Remove o contrato da lista local
				setContracts(prev => prev.filter(c => c.id !== contratoId))
			} else {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao vincular contrato')
		} finally {
			setIsLinking(null)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Vincular Novo Contrato</DialogTitle>
					<DialogDescription>
						Selecione um contrato da lista abaixo para vincular a este fiscal.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Pesquisar por número ou contratado..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<ScrollArea className="h-[300px] border rounded-md p-2">
						{loading ? (
							<div className="flex items-center justify-center h-full">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : filtered.length === 0 ? (
							<p className="text-center text-sm text-muted-foreground py-8">
								Nenhum contrato disponível para vinculação.
							</p>
						) : (
							<div className="space-y-2">
								{filtered.map((c) => (
									<div
										key={c.id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="flex flex-col gap-0.5">
											<span className="font-medium text-sm">{c.displayContrato}</span>
											<span className="text-xs text-muted-foreground truncate max-w-[250px]">
												{c.contratado}
											</span>
										</div>
										<Button
											size="sm"
											variant="outline"
											className="h-8 gap-1"
											onClick={() => handleLink(c.id)}
											disabled={!!isLinking}
										>
											{isLinking === c.id ? (
												<Loader2 className="h-3 w-3 animate-spin" />
											) : (
												<Plus className="h-3 w-3" />
											)}
											Vincular
										</Button>
									</div>
								))}
							</div>
						)}
					</ScrollArea>
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Fechar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
