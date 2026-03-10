'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, Monitor, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { OrganizationStatus, STATUS } from '@/generated/prisma/enums'
import { updateOrganization } from '../_actions/update-organization'

const appearanceSchema = z.object({
	name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
	slug: z.string().min(2, 'Slug deve ter ao menos 2 caracteres'),
	logo: z.string().optional(),
})

type AppearanceValues = z.infer<typeof appearanceSchema>

interface Props {
	orgId: string
	defaultValues: {
		name: string
		slug: string
		logo: string
		email: string
		telefone: string
		cnpj: string
		status: OrganizationStatus
	}
}

export function SidebarAppearanceForm({ orgId: _orgId, defaultValues }: Props) {
	const [isPending, startTransition] = useTransition()
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

	const form = useForm<AppearanceValues>({
		resolver: zodResolver(appearanceSchema),
		defaultValues: {
			name: defaultValues.name,
			slug: defaultValues.slug,
			logo: defaultValues.logo,
		},
	})

	const logoValue = form.watch('logo')

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setIsUploading(true)
		try {
			const fd = new FormData()
			fd.append('file', file)

			const res = await fetch('/api/upload-logo', { method: 'POST', body: fd })
			const data = await res.json()

			if (!res.ok) {
				toast.error(data.error || 'Erro ao enviar imagem')
				return
			}

			form.setValue('logo', data.url, { shouldDirty: true })
			toast.success('Logo enviado com sucesso!')
		} catch {
			toast.error('Erro ao enviar imagem')
		} finally {
			setIsUploading(false)
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	const handleSubmit = (values: AppearanceValues) => {
		startTransition(async () => {
			try {
				const result = await updateOrganization({
					name: values.name,
					slug: values.slug,
					logo: values.logo ?? null,
					email: defaultValues.email,
					telefone: defaultValues.telefone,
					cnpj: defaultValues.cnpj,
					status: defaultValues.status,
				})

				if (result.success) {
					toast.success('Aparência do sidebar atualizada!')
					router.refresh()
				} else {
					toast.error(result.error || 'Erro ao atualizar aparência')
				}
			} catch {
				toast.error('Erro ao atualizar aparência')
			}
		})
	}

	return (
		<div className="space-y-6">
			{/* Preview do sidebar */}
			<div className="rounded-lg border /30 p-4">
				<p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
					Pré-visualização
				</p>
				<div className="flex items-center gap-3 rounded-md border bg-background p-3 shadow-sm w-fit">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
						{logoValue ? (
							<Image
								src={logoValue}
								alt="Logo"
								width={40}
								height={40}
								className="object-contain"
								onError={() => {}}
							/>
						) : (
							<Monitor className="h-5 w-5 text-primary" />
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-semibold leading-tight">
							{form.watch('name') || 'Nome da Organização'}
						</span>
						<span className="text-xs text-muted-foreground leading-tight">
							{form.watch('slug') || 'slug-da-org'}
						</span>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome exibido no Sidebar</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: SME - CGS"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormDescription>
										Este nome aparece no cabeçalho do menu lateral.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Subtítulo (slug)</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: esporte-campinense"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormDescription>
										Aparece abaixo do nome no sidebar.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="logo"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-1.5">
									<ImageIcon className="h-4 w-4" />
									Logo
								</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2">
										<input
											ref={fileInputRef}
											type="file"
											accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
											className="hidden"
											onChange={handleFileChange}
											disabled={isPending || isUploading}
										/>
										<input type="hidden" {...field} value={field.value ?? ''} />
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={isPending || isUploading}
											onClick={() => fileInputRef.current?.click()}
										>
											{isUploading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Enviando...
												</>
											) : (
												<>
													<Upload className="mr-2 h-4 w-4" />
													{logoValue ? 'Trocar imagem' : 'Enviar imagem'}
												</>
											)}
										</Button>
										{logoValue && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												disabled={isPending || isUploading}
												onClick={() =>
													form.setValue('logo', '', { shouldDirty: true })
												}
											>
												<X className="mr-1 h-4 w-4" />
												Remover
											</Button>
										)}
									</div>
								</FormControl>
								<FormDescription>
									PNG, JPG, SVG ou WebP · máx. 2MB · Prefira images quadradas
									(ex: 100×100px).
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						className="w-full sm:w-auto"
						disabled={isPending || isUploading}
						type="submit"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							'Salvar aparência'
						)}
					</Button>
				</form>
			</Form>
		</div>
	)
}
