'use client'

import { Bell, Construction, FileText, Truck, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActionsCardProps {
	contrato: any
	userRole?: string
}

export function ActionsCard({ contrato, userRole }: ActionsCardProps) {
	// Usamos a nova flag booleana que verifica o vínculo real no banco
	const isPrincipalDoContrato = contrato.isPrincipalDoContrato

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-bold">Gerar Relatórios</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3">
					{/* Relatório Final (Anexo IV) - Exclusivo para o Fiscal Principal do contrato */}
					{isPrincipalDoContrato && (
						<Button
							asChild
							variant="outline"
							className="justify-start gap-2 h-12 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold shadow-sm"
						>
							<Link
								href={`/dashboard-fiscal/relatorios/fiscal-principal?contratoId=${contrato.id}`}
							>
								<FileText className="h-5 w-5" />
								Relatório Final de Fiscalização
							</Link>
						</Button>
					)}

					<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1 px-1">
						Relatórios Periódicos
					</div>

					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-green-200 hover:bg-green-50 hover:text-green-700"
					>
						<Link
							href={`/dashboard-fiscal/relatorios/bens-e-servicos?contratoId=${contrato.id}`}
						>
							<FileText className="h-4 w-4" />
							Bens e Serviços
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
					>
						<Link
							href={`/dashboard-fiscal/relatorios/servicos-transporte?contratoId=${contrato.id}`}
						>
							<Truck className="h-4 w-4" />
							Serviços de Transporte
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
					>
						<Link
							href={`/dashboard-fiscal/relatorios/obras?contratoId=${contrato.id}`}
						>
							<Construction className="h-4 w-4" />
							Obras
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
					>
						<Link
							href={`/dashboard-fiscal/relatorios/terceirizacao?contratoId=${contrato.id}`}
						>
							<Users className="h-4 w-4" />
							Terceirização de Mão de Obra
						</Link>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-bold">Notificações</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3">
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-red-200 hover:bg-red-50 hover:text-red-700"
					>
						<Link
							href={`/dashboard-fiscal/notificacoes/falta-atrasada?contratoId=${contrato.id}`}
						>
							<Bell className="h-4 w-4" />
							Atraso/Falta na Entrega
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-red-200 hover:bg-red-50 hover:text-red-700"
					>
						<Link
							href={`/dashboard-fiscal/notificacoes/entrega-incompleta?contratoId=${contrato.id}`}
						>
							<Bell className="h-4 w-4" />
							Entrega Incompleta
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="justify-start gap-2 h-11 border-red-200 hover:bg-red-50 hover:text-red-700"
					>
						<Link
							href={`/dashboard-fiscal/notificacoes/desconformidade?contratoId=${contrato.id}`}
						>
							<Bell className="h-4 w-4" />
							Desconformidade
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
