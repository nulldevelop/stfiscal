'use client'

import { ExternalLink, FileSearch, Plus, Printer, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { unlinkContractFromFiscalAction } from '../_actions/manage-links'
import { LinkContractModal } from './link-contract-modal'

interface FiscalContractsListProps {
	fiscalId: string // Record ID
	fiscalUserId: string | null // User ID
	initialContracts: any[]
}

export function FiscalContractsList({
	fiscalId,
	fiscalUserId,
	initialContracts,
}: FiscalContractsListProps) {
	const [isExporting, startExport] = useTransition()
	const [isUnlinking, setIsUnlinking] = useState<string | null>(null)
	const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
	const [linkToUnlink, setLinkToUnlink] = useState<{
		id: string
		name: string
	} | null>(null)

	const handleExportReport = () => {
		if (!fiscalUserId) {
			toast.error('Este fiscal não possui um usuário vinculado.')
			return
		}
		window.open(`/api/fiscais/${fiscalUserId}/report`, '_blank')
	}

	async function handleUnlink() {
		if (!linkToUnlink) return

		setIsUnlinking(linkToUnlink.id)
		try {
			const res = await unlinkContractFromFiscalAction(
				linkToUnlink.id,
				fiscalUserId!,
			)
			if (res.success) {
				toast.success('Contrato desvinculado com sucesso!')
			} else {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao desvincular contrato')
		} finally {
			setIsUnlinking(null)
			setLinkToUnlink(null)
		}
	}

	const renderHeader = () => (
		<CardHeader className="flex flex-row items-center justify-between">
			<CardTitle>Contratos Vinculados</CardTitle>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
					onClick={() => setIsLinkModalOpen(true)}
					disabled={!fiscalUserId}
				>
					<Plus className="h-4 w-4" />
					Vincular Contrato
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
					onClick={handleExportReport}
					disabled={isExporting || !fiscalUserId}
				>
					<Printer className="h-4 w-4" />
					{isExporting ? 'Gerando...' : 'Gerar Relatório'}
				</Button>
			</div>
		</CardHeader>
	)

	if (!initialContracts.length) {
		return (
			<Card>
				{renderHeader()}
				<CardContent className="py-8 text-center text-muted-foreground">
					Nenhum contrato vinculado a este fiscal.
				</CardContent>
				{fiscalUserId && (
					<LinkContractModal
						isOpen={isLinkModalOpen}
						onOpenChange={setIsLinkModalOpen}
						fiscalId={fiscalUserId}
					/>
				)}
			</Card>
		)
	}

	return (
		<Card>
			{renderHeader()}
			<CardContent className="p-0">
				<ScrollArea className="h-full max-h-87.5 overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
							<TableRow>
								<TableHead>Contrato</TableHead>
								<TableHead>Contratado</TableHead>
								<TableHead>Vigência</TableHead>
								<TableHead>Papel</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{initialContracts.map((link) => {
								const c = link.contrato
								const isPrincipal =
									c.fiscalPrincipal &&
									fiscalUserId &&
									c.fiscalPrincipal.member?.userId === fiscalUserId

								return (
									<TableRow key={c.id}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{c.displayContrato}
												{c.idOxy && (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6"
																	asChild
																>
																	<a
																		href={`https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/contratos/detalhes?id=${c.idOxy}`}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		<ExternalLink className="h-3 w-3" />
																	</a>
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																Ver no Portal da Transparência
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											</div>
										</TableCell>
										<TableCell className="max-w-50 truncate">
											{c.empresa?.name || c.contratado}
										</TableCell>
										<TableCell>
											{new Date(c.dataFim).toLocaleDateString('pt-BR')}
										</TableCell>
										<TableCell>
											<Badge variant={isPrincipal ? 'default' : 'outline'}>
												{isPrincipal ? 'Tecnico' : 'Administrativo'}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<Button variant="ghost" size="sm" asChild>
													<Link href={`/dashboard-gestor/contratos/${c.id}`}>
														<FileSearch className="h-4 w-4 mr-2" />
														Detalhes
													</Link>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() =>
														setLinkToUnlink({
															id: link.id,
															name: c.displayContrato,
														})
													}
													disabled={isUnlinking === link.id}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</ScrollArea>
			</CardContent>

			{fiscalUserId && (
				<LinkContractModal
					isOpen={isLinkModalOpen}
					onOpenChange={setIsLinkModalOpen}
					fiscalId={fiscalUserId}
				/>
			)}

			<AlertDialog
				open={!!linkToUnlink}
				onOpenChange={(open) => !open && setLinkToUnlink(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Desvincular Contrato</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja desvincular o fiscal deste contrato (
							<strong>{linkToUnlink?.name}</strong>)? Esta ação removerá o
							fiscal de todas as atribuições vinculadas a este contrato
							específico nesta organização.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={!!isUnlinking}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault()
								handleUnlink()
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={!!isUnlinking}
						>
							{isUnlinking ? 'Desvinculando...' : 'Confirmar Desvinculação'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	)
}
