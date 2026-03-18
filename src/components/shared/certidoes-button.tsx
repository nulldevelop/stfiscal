'use client'

import { ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const CERTIDOES = [
	{
		label: 'Certidão de Débitos Federais',
		url: 'https://www.gov.br/receitafederal/pt-br/servicos/certidoes/emitir-certidao',
	},
	{
		label: 'Certidão de Débitos Estaduais',
		url: 'https://www.fazenda.pr.gov.br/servicos/Economia-e-Financas/Certidoes/Emitir-Certidao-Negativa-Receita-Estadual-kZrX5gol',
	},
	{
		label: 'Certidão de Débitos Municipais',
		url: 'https://campinagrandedosul.oxy.elotech.com.br/portal-contribuinte/emissao-certidoes',
	},
	{
		label: 'Certidão Regularidade FGTS',
		url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
	},
	{
		label: 'Certidão Negativa de Débitos Trabalhistas',
		url: 'https://cndt-certidao.tst.jus.br/inicio.faces',
	},
]

export function CertidoesButton() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="lg"
					className="font-bold gap-2 shadow-lg"
				>
					<FileText className="h-4 w-4" />
					Certidões
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72">
				<DropdownMenuItem className="font-semibold" disabled>
					Links para Geração de Certidões
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{CERTIDOES.map((certidao) => (
					<DropdownMenuItem key={certidao.url} asChild>
						<a
							href={certidao.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-between cursor-pointer"
						>
							{certidao.label}
							<ExternalLink className="h-3 w-3 ml-2" />
						</a>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
