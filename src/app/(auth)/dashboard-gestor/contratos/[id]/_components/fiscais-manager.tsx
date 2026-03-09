'use client'

import { Loader2, Plus, Trash2, UserCheck, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getFiscais } from '../../_data-access/get-fiscais'
import {
	linkFiscalPrincipal,
	linkFiscalSetorial,
	unlinkFiscalPrincipal,
	unlinkFiscalSetorial,
} from '../_actions/manage-fiscais'

interface FiscalInfo {
	id: string
	memberId: string
	name: string
	cargo?: string | null
	matricula?: string | null
}

interface FiscaisManagerProps {
	contratoId: string
	fiscalPrincipal: FiscalInfo | null
	setoriais: FiscalInfo[]
}

interface FiscalOption {
	id: string // userId
	memberId: string
	name: string
}

type DialogMode = 'principal' | 'setorial' | null

export function FiscaisManager({
	contratoId,
	fiscalPrincipal,
	setoriais,
}: FiscaisManagerProps) {
	const router = useRouter()
	const [dialogMode, setDialogMode] = useState<DialogMode>(null)
	const [options, setOptions] = useState<FiscalOption[]>([])
	const [search, setSearch] = useState('')
	const [loadingOptions, setLoadingOptions] = useState(false)
	const [savingId, setSavingId] = useState<string | null>(null)
	const [removingId, setRemovingId] = useState<string | null>(null)

	// Carrega membros disponíveis ao abrir o dialog
	useEffect(() => {
		if (!dialogMode) return
		setSearch('')
		setLoadingOptions(true)
		getFiscais()
			.then((res) => {
				if (res.success && res.data) setOptions(res.data)
			})
			.catch(() => toast.error('Erro ao carregar fiscais'))
			.finally(() => setLoadingOptions(false))
	}, [dialogMode])

	const filtered = useMemo(
		() =>
			options.filter((o) =>
				o.name.toLowerCase().includes(search.toLowerCase()),
			),
		[options, search],
	)

	async function handleLink(option: FiscalOption) {
		setSavingId(option.memberId)
		try {
			const res =
				dialogMode === 'principal'
					? await linkFiscalPrincipal({ contratoId, memberId: option.memberId })
					: await linkFiscalSetorial({ contratoId, memberId: option.memberId })

			if (res.success) {
				toast.success(res.data)
				setDialogMode(null)
				router.refresh()
			} else {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao vincular fiscal.')
		} finally {
			setSavingId(null)
		}
	}

	async function handleUnlinkPrincipal() {
		setRemovingId('principal')
		try {
			const res = await unlinkFiscalPrincipal(contratoId)
			if (res.success) {
				toast.success(res.data)
				router.refresh()
			} else {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao remover fiscal.')
		} finally {
			setRemovingId(null)
		}
	}

	async function handleUnlinkSetorial(memberId: string) {
		setRemovingId(memberId)
		try {
			const res = await unlinkFiscalSetorial({ contratoId, memberId })
			if (res.success) {
				toast.success(res.data)
				router.refresh()
			} else {
				toast.error(res.error)
			}
		} catch {
			toast.error('Erro ao remover fiscal.')
		} finally {
			setRemovingId(null)
		}
	}

	return (
		<>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-base">
					<span className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Fiscais
					</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4 text-sm">
				{/* Fiscal Principal */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Tecnico
						</p>
						{!fiscalPrincipal && (
							<Button
								size="sm"
								variant="outline"
								className="h-7 gap-1 text-xs"
								onClick={() => setDialogMode('principal')}
							>
								<Plus className="h-3 w-3" />
								Vincular
							</Button>
						)}
					</div>

					{fiscalPrincipal ? (
						<div className="flex items-center justify-between rounded border px-3 py-2">
							<div>
								<div className="flex items-center gap-2">
									<UserCheck className="h-3.5 w-3.5 text-primary" />
									<p className="font-medium">{fiscalPrincipal.name}</p>
								</div>
								{fiscalPrincipal.cargo && (
									<p className="text-xs text-muted-foreground">
										{fiscalPrincipal.cargo}
									</p>
								)}
								{fiscalPrincipal.matricula && (
									<p className="text-xs text-muted-foreground">
										Mat. {fiscalPrincipal.matricula}
									</p>
								)}
							</div>
							<div className="flex items-center gap-1">
								<Button
									size="sm"
									variant="ghost"
									className="h-7 gap-1 text-xs"
									onClick={() => setDialogMode('principal')}
								>
									Trocar
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-destructive hover:text-destructive"
									disabled={removingId === 'principal'}
									onClick={handleUnlinkPrincipal}
								>
									{removingId === 'principal' ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
						</div>
					) : (
						<p className="text-muted-foreground">Nenhum fiscal tecnico.</p>
					)}
				</div>

				{/* Fiscais Administrativos */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Administrativos
						</p>
						<Button
							size="sm"
							variant="outline"
							className="h-7 gap-1 text-xs"
							onClick={() => setDialogMode('setorial')}
						>
							<Plus className="h-3 w-3" />
							Vincular
						</Button>
					</div>

					{setoriais.length === 0 ? (
						<p className="text-muted-foreground">Nenhum fiscal administrativo.</p>
					) : (
						setoriais.map((s) => (
							<div
								key={s.memberId}
								className="flex items-center justify-between rounded border px-3 py-2"
							>
								<div>
									<p className="font-medium">{s.name}</p>
									{s.cargo && (
										<p className="text-xs text-muted-foreground">{s.cargo}</p>
									)}
								</div>
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-destructive hover:text-destructive"
									disabled={removingId === s.memberId}
									onClick={() => handleUnlinkSetorial(s.memberId)}
								>
									{removingId === s.memberId ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
						))
					)}
				</div>
			</CardContent>

			{/* Dialog de seleção */}
			<Dialog
				open={!!dialogMode}
				onOpenChange={(open) => !open && setDialogMode(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							{dialogMode === 'principal'
								? 'Vincular Fiscal Tecnico'
								: 'Vincular Fiscal Administrativo'}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-3">
						<Input
							placeholder="Pesquisar fiscal..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>

						{loadingOptions ? (
							<div className="flex justify-center py-6">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						) : filtered.length === 0 ? (
							<p className="py-4 text-center text-sm text-muted-foreground">
								Nenhum fiscal encontrado.
							</p>
						) : (
							<div className="max-h-72 space-y-1 overflow-y-auto">
								{filtered.map((opt) => {
									const isCurrentPrincipal =
										fiscalPrincipal?.memberId === opt.memberId
									const isCurrentSetorial = setoriais.some(
										(s) => s.memberId === opt.memberId,
									)
									const alreadyLinked =
										(dialogMode === 'principal' && isCurrentPrincipal) ||
										(dialogMode === 'setorial' && isCurrentSetorial)

									return (
										<button
											key={opt.memberId}
											type="button"
											disabled={alreadyLinked || savingId === opt.memberId}
											onClick={() => handleLink(opt)}
											className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors hover: disabled:cursor-not-allowed disabled:opacity-50"
										>
											<span>{opt.name}</span>
											{alreadyLinked && (
												<Badge variant="secondary" className="text-xs">
													Vinculado
												</Badge>
											)}
											{savingId === opt.memberId && (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											)}
										</button>
									)
								})}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogMode(null)}>
							Cancelar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
