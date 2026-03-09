'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Contract {
	id: string
	displayContrato: string
	contratado: string
	objeto: string | null
}

interface ContractSelectionScreenProps {
	contratos: Contract[]
	title: string
	baseUrl: string
}

export function ContractSelectionScreen({
	contratos,
	title,
	baseUrl,
}: ContractSelectionScreenProps) {
	const [search, setSearch] = useState('')
	const router = useRouter()

	const filteredContracts = contratos.filter(
		(c) =>
			c.displayContrato.toLowerCase().includes(search.toLowerCase()) ||
			c.contratado.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="space-y-2 text-center md:text-left">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">
					Selecione um contrato para prosseguir com a notificação.
				</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar por número do contrato ou contratada..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 h-12 text-base shadow-sm"
				/>
			</div>

			<ScrollArea className="h-[500px] rounded-xl border bg-card shadow-sm">
				<div className="p-4 grid gap-3">
					{filteredContracts.length > 0 ? (
						filteredContracts.map((contrato) => (
							<button
								key={contrato.id}
								onClick={() => router.push(`${baseUrl}?contratoId=${contrato.id}`)}
								className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-background hover:border-green-600 hover:ring-1 hover:ring-green-600 transition-all text-left gap-4 group"
							>
								<div className="space-y-1 flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-bold text-green-700">
											{contrato.displayContrato}
										</span>
										<span className="text-xs text-muted-foreground">•</span>
										<span className="text-sm font-medium truncate">
											{contrato.contratado}
										</span>
									</div>
									{contrato.objeto && (
										<p className="text-xs text-muted-foreground line-clamp-1 italic">
											{contrato.objeto}
										</p>
									)}
								</div>
								<div className="shrink-0 flex items-center text-xs font-bold text-green-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
									Selecionar
								</div>
							</button>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
							<p className="text-muted-foreground font-medium">
								Nenhum contrato encontrado para sua busca.
							</p>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
