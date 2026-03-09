'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	Edit2,
	Eye,
	FileSliders,
	ListFilter,
	MessageSquare,
	Plus,
	Save,
	Settings2,
	Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	createFormField,
	deleteFormField,
	seedDefaultFormConfigs,
	updateFormConfig,
} from '../_actions/form-config-actions'

/* =========================================================
   Types & Schemas
========================================================= */

const AVAILABLE_OPTIONS = ['Sim', 'Não', 'Não se aplica', 'Parcialmente']

interface Config {
	id: string
	fieldKey: string
	label: string
	type: string
	section: string | null
	options: string | null
	isActive: boolean
	isRequired: boolean
	isVisiblePrincipal: boolean
	isVisibleSetorial: boolean
	hasObs: boolean
	requiredObsValue: string | null
	order: number
}

const fieldSchema = z.object({
	label: z.string().min(1, 'Informe o label'),
	type: z.enum(['RADIO', 'TEXT', 'TEXTAREA', 'DATE', 'NUMBER', 'LOTACAO']),
	section: z.string().min(1, 'Informe a seção'),
	options: z.array(z.string()),
	hasObs: z.boolean(),
	requiredObsValues: z.array(z.string()),
	order: z.number().min(0),
	isActive: z.boolean(),
	isRequired: z.boolean(),
	isVisiblePrincipal: z.boolean(),
	isVisibleSetorial: z.boolean(),
})

type FieldFormValues = z.infer<typeof fieldSchema>

const typeStyles: Record<string, { label: string; className: string }> = {
	RADIO: {
		label: 'Múltipla Escolha',
		className:
			'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
	},
	TEXT: {
		label: 'Texto Curto',
		className:
			'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
	},
	TEXTAREA: {
		label: 'Texto Longo',
		className:
			'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
	},
	NUMBER: {
		label: 'Numérico',
		className:
			'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
	},
	DATE: {
		label: 'Data',
		className:
			'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
	},
	LOTACAO: {
		label: 'Secretaria/Lotação',
		className:
			'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
	},
}

/* =========================================================
   Component: FormConfigTable (Now a List Layout)
========================================================= */

export function FormConfigTable({
	configs: initialConfigs,
	reportType,
	description,
}: {
	configs: Config[]
	reportType: string
	description?: string
}) {
	const [configs, setConfigs] = useState<Config[]>(initialConfigs)
	const [editingConfig, setEditingConfig] = useState<Config | null>(null)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isSeeding, setIsSeeding] = useState(false)

	const groupedConfigs = useMemo(() => {
		const parsed = configs.map((c) => {
			let options: string[] = []
			let triggers: string[] = []
			try {
				if (c.options) {
					const parsedOptions = JSON.parse(c.options)
					options = Array.isArray(parsedOptions) ? parsedOptions : []
				}
				if (c.requiredObsValue) {
					const parsedTriggers = JSON.parse(c.requiredObsValue)
					triggers = Array.isArray(parsedTriggers)
						? parsedTriggers
						: [parsedTriggers]
				}
			} catch {
				options = ['Sim', 'Não']
			}
			return { ...c, _options: options, _triggers: triggers }
		})

		const sorted = [...parsed].sort((a, b) => (a.order || 0) - (b.order || 0))

		const groups: Record<string, typeof sorted> = {}
		for (const item of sorted) {
			const sec = item.section || 'Sem Seção'
			if (!groups[sec]) groups[sec] = []
			groups[sec].push(item)
		}
		return groups
	}, [configs])

	const handleSave = async (values: FieldFormValues) => {
		if (!editingConfig) return
		try {
			const payload = {
				...values,
				options:
					values.type === 'RADIO' ? JSON.stringify(values.options) : null,
				requiredObsValue: values.hasObs
					? JSON.stringify(values.requiredObsValues)
					: null,
			}
			const result = await updateFormConfig(editingConfig.id, payload)
			if (result.success) {
				setConfigs((prev) =>
					prev.map((c) =>
						c.id === editingConfig.id ? { ...c, ...values, ...payload } : c,
					),
				)
				setEditingConfig(null)
				toast.success('Campo atualizado com sucesso!')
			} else {
				toast.error(result.error || 'Erro ao atualizar')
			}
		} catch {
			toast.error('Erro ao atualizar')
		}
	}

	const handleCreate = async (values: any) => {
		try {
			const result = await createFormField(reportType, values)
			if (result.success && result.data) {
				setConfigs((prev) => [...prev, result.data as Config])
				setIsCreateModalOpen(false)
				toast.success('Campo criado com sucesso!')
			} else {
				toast.error('Erro ao criar campo')
			}
		} catch {
			toast.error('Erro ao criar campo')
		}
	}

	const handleSeedDefaults = async () => {
		setIsSeeding(true)
		try {
			const result = await seedDefaultFormConfigs(reportType)
			if (result.success) {
				toast.success(
					`${(result.data as any)?.created ?? 0} campos padrão criados! Recarregue a página.`,
				)
			} else {
				toast.error(result.error || 'Erro ao inicializar campos.')
			}
		} catch {
			toast.error('Erro ao inicializar campos.')
		} finally {
			setIsSeeding(false)
		}
	}

	const handleDelete = async (id: string) => {
		try {
			const result = await deleteFormField(id)
			if (result.success) {
				setConfigs((prev) => prev.filter((c) => c.id !== id))
				toast.success('Campo removido')
			} else {
				toast.error(result.error || 'Erro ao excluir')
			}
		} catch {
			toast.error('Erro ao excluir')
		}
	}

	return (
		<div className="space-y-6">
			{/* Toolbar */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold flex items-center gap-2">
						<Settings2 className="h-4 w-4 text-primary" />
						Configuração de Campos
					</h2>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						disabled={isSeeding}
						onClick={handleSeedDefaults}
					>
						{isSeeding ? 'Inicializando...' : 'Inicializar Padrões'}
					</Button>
					<Button
						size="sm"
						className="gap-2"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Plus className="h-4 w-4" />
						Novo Campo Personalizado
					</Button>
				</div>
			</div>

			{/* Empty State */}
			{configs.length === 0 && (
				<div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-card border-dashed gap-4">
					<FileSliders className="h-10 w-10 text-muted-foreground/30" />
					<p className="text-sm font-medium text-muted-foreground">
						Nenhum campo configurado para este relatório.
					</p>
					{reportType === 'BENS_SERVICOS' && (
						<Button
							size="sm"
							variant="outline"
							disabled={isSeeding}
							onClick={handleSeedDefaults}
						>
							{isSeeding ? 'Inicializando...' : 'Inicializar Campos Padrão'}
						</Button>
					)}
				</div>
			)}

			{/* Grouped List */}
			<div className="space-y-10">
				{Object.entries(groupedConfigs).map(([section, items]) => (
					<div key={section} className="space-y-4">
						<div className="flex items-center gap-4">
							<Badge
								variant="outline"
								className="bg-background shadow-sm px-3 py-1 text-xs uppercase tracking-wider font-bold text-primary border-primary/20"
							>
								{section}
							</Badge>
							<div className="h-px flex-1 bg-linear-to-r from-primary/10 to-transparent" />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{items.map((item) => (
								<FieldCard
									key={item.id}
									config={item}
									onEdit={() => setEditingConfig(item)}
									onDelete={() => handleDelete(item.id)}
								/>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Create/Edit Components */}
			<FieldEditSheet
				config={editingConfig}
				onClose={() => setEditingConfig(null)}
				onSave={handleSave}
			/>

			<CreateFieldModal
				isOpen={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
				onCreated={handleCreate}
			/>
		</div>
	)
}

/* =========================================================
   Sub-component: FieldCard
========================================================= */

function FieldCard({
	config,
	onEdit,
	onDelete,
}: {
	config: any
	onEdit: () => void
	onDelete: () => void
}) {
	const typeStyle = typeStyles[config.type] || {
		label: config.type,
		className: 'bg-muted',
	}

	return (
		<Card
			className={`group transition-all hover:shadow-md border-l-4 ${config.isActive ? 'border-l-emerald-500' : 'border-l-muted opacity-70'}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="space-y-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-mono text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded">
								#{config.order}
							</span>
							<Badge
								variant="outline"
								className={`text-[9px] uppercase tracking-tight py-0 ${typeStyle.className}`}
							>
								{typeStyle.label}
							</Badge>
						</div>
						<h4
							className="font-bold text-sm leading-tight line-clamp-2"
							title={config.label}
						>
							{config.label}
						</h4>
					</div>
					<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground"
							onClick={onEdit}
						>
							<Edit2 className="h-4 w-4" />
						</Button>
						<DeleteDialog onConfirm={onDelete} />
					</div>
				</div>

				<div className="flex flex-wrap gap-1.5 mb-4">
					{config.isActive ? (
						<Badge
							variant="outline"
							className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0"
						>
							Ativo
						</Badge>
					) : (
						<Badge variant="outline" className="text-[10px] py-0">
							Inativo
						</Badge>
					)}
					{config.isRequired && (
						<Badge
							variant="outline"
							className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 uppercase font-bold"
						>
							Obrigatório
						</Badge>
					)}

					{/* Visibility indicators */}
					<div className="flex items-center gap-1 ml-auto">
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className={`p-1 rounded ${config.isVisiblePrincipal ? 'text-blue-600 bg-blue-50' : 'text-muted-foreground/40'}`}
									>
										<Eye className="h-3 w-3" />
									</div>
								</TooltipTrigger>
								<TooltipContent className="text-[10px]">
									Visível para Fiscal Tecnico:{' '}
									{config.isVisiblePrincipal ? 'Sim' : 'Não'}
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className={`p-1 rounded ${config.isVisibleSetorial ? 'text-indigo-600 bg-indigo-50' : 'text-muted-foreground/40'}`}
									>
										<Eye className="h-3 w-3" />
									</div>
								</TooltipTrigger>
								<TooltipContent className="text-[10px]">
									Visível para Fiscal Administrativo:{' '}
									{config.isVisibleSetorial ? 'Sim' : 'Não'}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				{config.type === 'RADIO' && config._options && (
					<div className="flex flex-wrap gap-1 border-t pt-3 mt-2">
						{config._options.map((opt: string) => (
							<Badge
								key={opt}
								variant="secondary"
								className={`text-[9px] px-1.5 py-0 font-medium border ${
									config.hasObs && (config._triggers || []).includes(opt)
										? 'bg-blue-50 text-blue-700 border-blue-200 gap-1'
										: 'bg-muted/50 border-transparent'
								}`}
							>
								{opt}
								{config.hasObs && (config._triggers || []).includes(opt) && (
									<MessageSquare className="h-2 w-2" />
								)}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

/* =========================================================
   Sub-component: FieldEditSheet (Unified Edit Form)
========================================================= */

function FieldEditSheet({
	config,
	onClose,
	onSave,
}: {
	config: Config | null
	onClose: () => void
	onSave: (values: FieldFormValues) => Promise<void>
}) {
	const form = useForm<FieldFormValues>({
		resolver: zodResolver(fieldSchema) as any,
		defaultValues: {
			label: '',
			type: 'RADIO',
			section: '',
			order: 0,
			isActive: true,
			isRequired: false,
			isVisiblePrincipal: true,
			isVisibleSetorial: true,
			hasObs: false,
			options: [],
			requiredObsValues: [],
		},
	})

	useMemo(() => {
		if (config) {
			let options: string[] = []
			let triggers: string[] = []
			try {
				if (config.options) options = JSON.parse(config.options)
				if (config.requiredObsValue)
					triggers = JSON.parse(config.requiredObsValue)
			} catch {}

			form.reset({
				label: config.label,
				type: config.type as any,
				section: config.section || '',
				order: config.order,
				isActive: config.isActive,
				isRequired: config.isRequired,
				isVisiblePrincipal: config.isVisiblePrincipal,
				isVisibleSetorial: config.isVisibleSetorial,
				hasObs: config.hasObs,
				options,
				requiredObsValues: triggers,
			})
		}
	}, [config, form])

	const selectedType = form.watch('type')
	const hasObs = form.watch('hasObs')

	const toggleList = (
		field: 'options' | 'requiredObsValues',
		value: string,
	) => {
		const current = form.getValues(field)
		form.setValue(
			field,
			current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value],
		)
	}

	return (
		<Sheet open={!!config} onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Configurar Campo</SheetTitle>
					<SheetDescription>
						Altere as propriedades do campo no formulário.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSave)} className="space-y-6 py-6">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="label"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Título / Pergunta</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="section"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Seção</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="order"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ordem</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<Separator />

							<div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-2">
								<FormField
									control={form.control}
									name="isActive"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between gap-2 border rounded-lg p-2 px-3 bg-muted/20">
											<div className="space-y-0.5">
												<FormLabel className="text-xs">Ativo</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isRequired"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between gap-2 border rounded-lg p-2 px-3 bg-muted/20">
											<div className="space-y-0.5">
												<FormLabel className="text-xs">Obrigatório</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isVisiblePrincipal"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between gap-2 border rounded-lg p-2 px-3 bg-muted/20">
											<div className="space-y-0.5">
												<FormLabel className="text-xs">Fiscal Tecn.</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isVisibleSetorial"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between gap-2 border rounded-lg p-2 px-3 bg-muted/20">
											<div className="space-y-0.5">
												<FormLabel className="text-xs">Fiscal Admin.</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							{selectedType === 'RADIO' && (
								<div className="rounded-xl border bg-muted/30 p-4 space-y-4 mt-2">
									<div className="space-y-3">
										<Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
											<ListFilter className="h-3 w-3" />
											Opções da Resposta
										</Label>
										<div className="flex flex-wrap gap-2">
											{AVAILABLE_OPTIONS.map((opt) => (
												<Label
													key={opt}
													className="flex items-center gap-2 p-2 rounded-md border bg-card cursor-pointer hover:bg-accent transition-colors"
												>
													<Checkbox
														checked={form.watch('options').includes(opt)}
														onCheckedChange={() => toggleList('options', opt)}
													/>
													<span className="text-xs">{opt}</span>
												</Label>
											))}
										</div>
									</div>

									<div className="pt-4 border-t space-y-4">
										<FormField
											control={form.control}
											name="hasObs"
											render={({ field }) => (
												<FormItem className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
													<div className="space-y-0.5">
														<FormLabel className="text-xs font-bold text-blue-600">
															Exigir Observação
														</FormLabel>
														<p className="text-[10px] text-muted-foreground leading-tight">
															Obriga comentário se responder:
														</p>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										{hasObs && (
											<div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in">
												{form.watch('options').map((opt) => (
													<Label
														key={opt}
														className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
													>
														<Checkbox
															checked={form
																.watch('requiredObsValues')
																.includes(opt)}
															onCheckedChange={() =>
																toggleList('requiredObsValues', opt)
															}
														/>
														<span className="text-xs">{opt}</span>
													</Label>
												))}
											</div>
										)}
									</div>
								</div>
							)}
						</div>

						<SheetFooter className="pt-6 border-t mt-6">
							<Button type="submit" className="w-full gap-2">
								<Save className="h-4 w-4" />
								Atualizar Configurações
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}

/* =========================================================
   Sub-component: CreateFieldModal (Standalone Modal)
========================================================= */

function CreateFieldModal({
	isOpen,
	onOpenChange,
	onCreated,
}: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onCreated: (values: any) => Promise<void>
}) {
	const form = useForm<FieldFormValues>({
		resolver: zodResolver(fieldSchema) as any,
		defaultValues: {
			label: '',
			type: 'RADIO',
			section: 'Campos Adicionais',
			options: ['Sim', 'Não'],
			hasObs: false,
			requiredObsValues: [],
			order: 0,
			isActive: true,
			isRequired: false,
			isVisiblePrincipal: true,
			isVisibleSetorial: true,
		},
	})

	const selectedType = form.watch('type')

	const toggleList = (
		field: 'options' | 'requiredObsValues',
		value: string,
	) => {
		const current = form.getValues(field)
		form.setValue(
			field,
			current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value],
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Novo Campo Personalizado</DialogTitle>
					<DialogDescription>
						Crie um novo campo para este tipo de relatório.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onCreated)}
						className="space-y-5 py-4"
					>
						<FormField
							control={form.control}
							name="label"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Título / Pergunta</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: A obra está no cronograma?"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="RADIO">Múltipla Escolha</SelectItem>
												<SelectItem value="TEXT">Texto Curto</SelectItem>
												<SelectItem value="TEXTAREA">Texto Longo</SelectItem>
												<SelectItem value="NUMBER">Numérico</SelectItem>
												<SelectItem value="DATE">Data</SelectItem>
												<SelectItem value="LOTACAO">
													Secretaria/Lotação
												</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="section"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Seção</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{selectedType === 'RADIO' && (
							<div className="rounded-lg border bg-muted/20 p-4 space-y-4">
								<div className="space-y-2">
									<Label className="text-xs font-bold uppercase text-muted-foreground">
										Opções de Resposta
									</Label>
									<div className="flex flex-wrap gap-2">
										{AVAILABLE_OPTIONS.map((opt) => (
											<Label
												key={opt}
												className="flex items-center gap-2 p-2 border rounded-md bg-card cursor-pointer"
											>
												<Checkbox
													checked={form.watch('options').includes(opt)}
													onCheckedChange={() => toggleList('options', opt)}
												/>
												<span className="text-xs">{opt}</span>
											</Label>
										))}
									</div>
								</div>
							</div>
						)}

						<DialogFooter className="pt-4 border-t">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Cancelar
							</Button>
							<Button type="submit">Criar Campo</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

/* =========================================================
   UI Helpers Components
========================================================= */

function DeleteDialog({ onConfirm }: { onConfirm: () => void }) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remover campo?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta ação não pode ser desfeita. Novos relatórios não terão mais
						este campo.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Voltar</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-destructive hover:bg-destructive/90"
					>
						Confirmar Remoção
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
