import Image from 'next/image'

export function RegisterHero() {
	return (
		<div className="relative flex h-full w-full flex-col overflow-hidden">
			<Image
				src="/images/login-hero.jpg"
				alt="Plataforma de fiscalização de contratos"
				fill
				className="object-cover"
				priority
			/>

			{/* Overlay gradiente */}
			<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/20" />
			<div className="absolute inset-0 bg-primary/20" />

			{/* Brand — topo */}
			<div className="relative z-10 p-8">
				<div className="flex items-center gap-2.5">
					<div className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
						<span className="text-sm font-bold text-white">ST</span>
					</div>
					<span className="font-semibold text-white/90">
						Fiscalização de Contratos
					</span>
				</div>
			</div>

			{/* Texto — base */}
			<div className="relative z-10 mt-auto p-8">
				<p className="text-2xl font-semibold leading-snug text-balance text-white">
					Crie sua conta e comece a gerenciar contratos com eficiência.
				</p>
				<p className="mt-2 text-sm text-white/60">
					Rápido, seguro e intuitivo.
				</p>
			</div>
		</div>
	)
}
