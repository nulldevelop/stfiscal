import { ArrowLeft, FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
			{/* Ilustração ou Ícone Grande */}
			<div className="relative mb-8">
				<div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
				<div className="relative  rounded-2xl p-6 shadow-sm border">
					<FileQuestion className="h-20 w-20 text-primary animate-pulse" />
				</div>
			</div>

			{/* Texto de Erro */}
			<div className="max-w-md space-y-4">
				<h1 className="text-7xl font-black tracking-tighter text-foreground/20">
					404
				</h1>
				<h2 className="text-3xl font-bold tracking-tight text-foreground">
					Página não encontrada
				</h2>
				<p className="text-muted-foreground text-lg leading-relaxed">
					Desculpe, não conseguimos encontrar a página que você está procurando.
					<br />
					<span className="font-medium text-foreground/60 italic block mt-2">
						This page could not be found.
					</span>
				</p>
			</div>

			{/* Ações */}
			<div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none justify-center">
				<Button asChild variant="outline" size="lg" className="gap-2">
					<Link href="/">
						<Home className="h-4 w-4" />
						Início
					</Link>
				</Button>
				<Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
					<Link href="/dashboard">
						<ArrowLeft className="h-4 w-4" />
						Voltar ao Dashboard
					</Link>
				</Button>
			</div>

			{/* Rodapé sutil */}
			<p className="mt-20 text-xs text-muted-foreground/50 uppercase tracking-widest font-semibold">
				SIRA - Sistema Integrado de Relatórios de Acompanhamento
			</p>
		</div>
	)
}
