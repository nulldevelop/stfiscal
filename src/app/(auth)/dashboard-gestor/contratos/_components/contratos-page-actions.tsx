'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { importContratos } from '../import/_actions/import-contratos'
import { useImport } from './import-context'

export function ContratosPageActions() {
	const { isImporting, setIsImporting } = useImport()

	const handleImport = async () => {
		setIsImporting(true)
		try {
			const res = await importContratos()
			if (res.success) {
				toast.success('Sincronização concluída!', {
					description: `Contratos: ${res.data.criados} criados, ${res.data.atualizados} atualizados. Licitações sincronizadas: ${res.data.licitacoesSync}.`,
					duration: 10000,
				})
			} else {
				toast.error('Erro na sincronização', { description: res.error })
			}
		} catch (error) {
			toast.error('Ocorreu um erro inesperado.')
			console.error(error)
		} finally {
			setIsImporting(false)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={handleImport}
				disabled={isImporting}
				className="flex items-center gap-2"
			>
				{isImporting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<RefreshCw className="h-4 w-4" />
				)}
				<span>Sincronizar Contratos</span>
			</Button>
		</div>
	)
}
