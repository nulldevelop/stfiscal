'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { getAditivos } from '../_data-access/get-aditivos'

interface AditivosTableProps {
	search: string
	page: number
	pageSize: number
	refreshKey: number
}

export function AditivosTable({
	search,
	page,
	refreshKey,
	pageSize,
}: AditivosTableProps) {
	const [data, setData] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setLoading(true)
		getAditivos({ search, page, pageSize }).then((res) => {
			setData(res)
			setLoading(false)
		})
	}, [search, page, pageSize, refreshKey])

	if (loading) return <div className="p-8 text-center">Carregando aditivos...</div>

	if (!data || data.aditivos.length === 0) {
		return <div className="p-8 text-center text-muted-foreground">Nenhum aditivo encontrado.</div>
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Sequência</TableHead>
						<TableHead>Contrato</TableHead>
						<TableHead>Data</TableHead>
						<TableHead>Valor</TableHead>
						<TableHead>Nova Vigência</TableHead>
						<TableHead>Motivação</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.aditivos.map((aditivo: any) => (
						<TableRow key={aditivo.id}>
							<TableCell className="font-medium">#{aditivo.sequencia}</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">{aditivo.contrato.displayContrato}</span>
									<span className="text-xs text-muted-foreground">{aditivo.contrato.contratado}</span>
								</div>
							</TableCell>
							<TableCell>{format(new Date(aditivo.data), 'dd/MM/yyyy')}</TableCell>
							<TableCell>
								{aditivo.valorAditivo
									? new Intl.NumberFormat('pt-BR', {
											style: 'currency',
											currency: 'BRL',
									  }).format(aditivo.valorAditivo)
									: '—'}
							</TableCell>
							<TableCell>
								{aditivo.dataTermino
									? format(new Date(aditivo.dataTermino), 'dd/MM/yyyy')
									: '—'}
							</TableCell>
							<TableCell className="max-w-[300px] truncate">
								{aditivo.motivacao || '—'}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
