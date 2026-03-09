'use client'

import { Building2, FileText, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { ReportDetailModal } from './_components/report-detail-modal'
import { ReportEmpresaCard } from './_components/report-empresa-card'
import {
	type EmpresaWithReports,
	getReportsByEmpresaFiscal,
	type ReportWithMeta,
} from './_data-access/get-reports-by-empresa'

function HistoricoContent() {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()

	const [empresas, setEmpresas] = useState<EmpresaWithReports[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedReport, setSelectedReport] = useState<ReportWithMeta | null>(
		null,
	)
	const [modalOpen, setModalOpen] = useState(false)

	const search = searchParams.get('search') || undefined

	const handleSearch = useDebouncedCallback((term: string) => {
		const params = new URLSearchParams(searchParams)
		if (term) {
			params.set('search', term)
		} else {
			params.delete('search')
		}
		router.replace(`${pathname}?${params.toString()}`)
	}, 300)

	useEffect(() => {
		async function loadReports() {
			setLoading(true)
			try {
				const data = await getReportsByEmpresaFiscal({ search })
				setEmpresas(data)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		loadReports()
	}, [search])

	function handleSelectReport(report: ReportWithMeta) {
		setSelectedReport(report)
		setModalOpen(true)
	}

	const totalReports = empresas.reduce(
		(acc, empresa) => acc + empresa.reports.length,
		0,
	)

	return (
		<div className="">
			<div className="mb-6">
				<h1 className="font-bold text-2xl text-foreground">
					Histórico de Relatórios
				</h1>
				<p className="text-muted-foreground">
					Visualize e gerencie seus relatórios, organizados por empresa
				</p>
			</div>

			<div className="mb-6">
				<div className="relative max-w-md">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-9"
						defaultValue={searchParams.get('search') || ''}
						placeholder="Buscar por empresa, contrato, protocolo..."
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="mt-10 flex flex-col items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
				</div>
			) : empresas.length > 0 ? (
				<div>
					<div className="mb-4 flex items-center gap-4">
						<div className="flex items-center gap-2 rounded-lg  px-3 py-1.5 text-sm">
							<Building2 className="h-4 w-4" />
							<span className="font-medium">{empresas.length}</span>
							<span className="text-muted-foreground">
								{empresas.length === 1 ? 'empresa' : 'empresas'}
							</span>
						</div>
						<div className="flex items-center gap-2 rounded-lg  px-3 py-1.5 text-sm">
							<FileText className="h-4 w-4" />
							<span className="font-medium">{totalReports}</span>
							<span className="text-muted-foreground">
								{totalReports === 1 ? 'relatório' : 'relatórios'}
							</span>
						</div>
					</div>

					{empresas.map((empresa) => (
						<ReportEmpresaCard
							key={empresa.empresaId}
							empresa={empresa}
							onSelectReport={handleSelectReport}
						/>
					))}
				</div>
			) : (
				<div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-muted-foreground/30 border-dashed p-12 text-center">
					<FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
					<h3 className="font-semibold text-lg text-foreground">
						Nenhum relatório encontrado
					</h3>
					<p className="text-muted-foreground text-sm">
						{search
							? 'Tente ajustar os termos de busca.'
							: 'Você ainda não enviou nenhum relatório.'}
					</p>
				</div>
			)}

			<ReportDetailModal
				report={selectedReport}
				open={modalOpen}
				onOpenChange={setModalOpen}
			/>
		</div>
	)
}

export default function HistoricoPage() {
	return (
		<Suspense fallback={<div className="p-10">Carregando...</div>}>
			<HistoricoContent />
		</Suspense>
	)
}
