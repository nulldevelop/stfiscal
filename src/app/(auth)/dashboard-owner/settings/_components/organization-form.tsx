/** biome-ignore-all lint/style/noMagicNumbers:dev */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from '@/components/kibo-ui/dropzone'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatCnpj } from '@/utils/formatCNPJ'
import { formatPhone } from '@/utils/formatPhone'
import { updateOrganization } from '../_actions/update-organization'
import {
	type OrganizationFormValues,
	organizationSchema,
} from '../_schemas/organization.schema'

type Props = {
	defaultValues: OrganizationFormValues
	organizationId: string
}

export function OrganizationForm({
	defaultValues,
	organizationId: _organizationId,
}: Props) {
	const [isPending, startTransition] = useTransition()
	const [isUploading, setIsUploading] = useState(false)
	const [files, setFiles] = useState<File[] | undefined>()
	const [filePreview, setFilePreview] = useState<string | undefined>()
	const router = useRouter()

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationSchema),
		defaultValues,
	})

	const logoValue = form.watch('logo')

	const handleDrop = (dropped: File[]) => {
		setFiles(dropped)

		if (dropped.length > 0) {
			const reader = new FileReader()
			reader.onload = (e) => {
				if (typeof e.target?.result === 'string') {
					setFilePreview(e.target.result)
				}
			}
			reader.readAsDataURL(dropped[0])

			// Upload immediately after drop
			setIsUploading(true)
			const fd = new FormData()
			fd.append('file', dropped[0])

			fetch('/api/upload-logo', { method: 'POST', body: fd })
				.then((res) => res.json())
				.then((data) => {
					if (data.url) {
						form.setValue('logo', data.url, { shouldDirty: true })
						toast.success('Logo enviado com sucesso!')
					} else {
						toast.error(data.error || 'Erro ao enviar imagem')
						setFiles(undefined)
						setFilePreview(undefined)
					}
				})
				.catch(() => {
					toast.error('Erro ao enviar imagem')
					setFiles(undefined)
					setFilePreview(undefined)
				})
				.finally(() => setIsUploading(false))
		}
	}

	const handleRemoveLogo = () => {
		form.setValue('logo', '', { shouldDirty: true })
		setFiles(undefined)
		setFilePreview(undefined)
	}

	const handleSubmit: SubmitHandler<OrganizationFormValues> = (formData) => {
		startTransition(async () => {
			try {
				const result = await updateOrganization({
					...formData,
					logo: formData.logo ?? null,
				})
				if (result.success) {
					toast.success('Organização atualizada com sucesso!')
					router.refresh()
				} else {
					toast.error(result.error || 'Erro ao atualizar organização')
				}
			} catch {
				toast.error('Erro ao atualizar organização')
			}
		})
	}

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-foreground">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										placeholder="Nome da organização"
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="slug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Slug (nome amigável)</FormLabel>
								<FormControl>
									<Input
										placeholder="Ex: minha-org"
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-foreground">
					<FormField
						control={form.control}
						name="cnpj"
						render={({ field }) => (
							<FormItem>
								<FormLabel>CNPJ</FormLabel>
								<FormControl>
									<Input
										placeholder="XX.XXX.XXX/XXXX-XX"
										{...field}
										value={field.value ?? ''}
										onChange={(e) => {
											const formatted = formatCnpj(e.target.value)
											field.onChange(formatted)
										}}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-mail</FormLabel>
								<FormControl>
									<Input
										placeholder="contato@exemplo.gov.br"
										type="email"
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="telefone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Telefone</FormLabel>
							<FormControl>
								<Input
									placeholder="(XX) XXXXX-XXXX"
									{...field}
									value={field.value ?? ''}
									onChange={(e) => {
										const formatted = formatPhone(e.target.value)
										field.onChange(formatted)
									}}
									className="text-foreground"
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="cidade"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cidade</FormLabel>
							<FormControl>
								<Input
									placeholder="Ex: Campina Grande do Sul"
									{...field}
									value={field.value ?? ''}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="logo"
					render={() => (
						<FormItem>
							<FormLabel>Logo (opcional)</FormLabel>

							{/* Preview do logo atual (vindo do banco) */}
							{logoValue && !files?.length && (
								<div className="flex items-center gap-3 rounded-md border p-3">
									<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border">
										<Image
											src={logoValue}
											alt="Logo atual"
											fill
											className="object-contain"
										/>
									</div>
									<p className="flex-1 text-sm text-muted-foreground truncate">
										Logo atual
									</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={isPending || isUploading}
										onClick={handleRemoveLogo}
									>
										<X className="h-4 w-4" />
										Remover
									</Button>
								</div>
							)}

							<FormControl>
								<Dropzone
									accept={{
										'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
									}}
									maxSize={2 * 1024 * 1024}
									onDrop={handleDrop}
									onError={(e) => toast.error(e.message)}
									src={files}
									disabled={isPending || isUploading}
								>
									<DropzoneEmptyState />
									<DropzoneContent>
										{filePreview && (
											<div className="relative h-[102px] w-full">
												<img
													alt="Preview"
													className="absolute top-0 left-0 h-full w-full object-contain p-4"
													src={filePreview}
												/>
												{isUploading && (
													<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
														<Loader2 className="h-5 w-5 animate-spin text-primary" />
													</div>
												)}
											</div>
										)}
									</DropzoneContent>
								</Dropzone>
							</FormControl>
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
						'Salvar alterações'
					)}
				</Button>
			</form>
		</Form>
	)
}
