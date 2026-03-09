import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeCta() {
	return (
		<section className="py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-xl shadow-primary/30 sm:px-16">
					<h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
						Pronto para modernizar a fiscalização?
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/80">
						Acesse o sistema e centralize toda a gestão de contratos em um só
						lugar, com rastreabilidade e segurança.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-2">
						<Button
							asChild
							size="lg"
							variant="secondary"
							className="h-12 rounded-xl px-8 text-base font-semibold"
						>
							<Link href="/sign-in">Entrar no sistema</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
