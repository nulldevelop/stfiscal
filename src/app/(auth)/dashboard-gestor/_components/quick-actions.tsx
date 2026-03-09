'use client'
import { Briefcase, Building2, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<h3 className="font-medium text-lg text-foreground">Ações rápidas</h3>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					<Link href="/dashboard-gestor/empresas">
						<Button className="w-full" variant="secondary">
							<Building2 className="mr-2 h-4 w-4" /> Nova Empresa
						</Button>
					</Link>
					<Link href="/dashboard-gestor/licitacoes">
						<Button className="w-full" variant="secondary">
							<FileText className="mr-2 h-4 w-4" /> Nova Licitação
						</Button>
					</Link>
					<Link href="/dashboard-gestor/contratos">
						<Button className="w-full" variant="secondary">
							<Briefcase className="mr-2 h-4 w-4" /> Novo Contrato
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
