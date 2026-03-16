'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	AlertTriangle,
	Calendar,
	Clock,
	RotateCcw,
	Save,
	Settings2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	resetOverdueConfig,
	updateOverdueConfig,
} from '../_actions/overdue-config-actions'

interface OverdueConfig {
	id: string
	reportType: string
	diasOverdue: number
	diasAlerta: number
	isActive: boolean
	organizationId: string
	createdAt: Date
	updatedAt: Date
	label: string
	description: string
}

const formSchema = z.object({
	diasOverdue: z.coerce
		.number()
		.min(1, 'Minimo 1 dia')
		.max(365, 'Maximo 365 dias'),
	diasAlerta: z.coerce
		.number()
		.min(1, 'Minimo 1 dia')
		.max(90, 'Maximo 90 dias'),
	isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function OverdueConfigTable({
	configs: initialConfigs,
}: {
	configs: OverdueConfig[]
}) {
	const [configs, setConfigs] = useState<OverdueConfig[]>(initialConfigs)
	const [editingConfig, setEditingConfig] = useState<OverdueConfig | null>(null)
	const [isResetting, setIsResetting] = useState<string | null>(null)

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema) as any,
		defaultValues: {
			diasOverdue: 30,
			diasAlerta: 7,
			isActive: true,
		},
	})

	const openEditDialog = (config: OverdueConfig) => {
		setEditingConfig(config)
		form.reset({
			diasOverdue: config.diasOverdue,
			diasAlerta: config.diasAlerta,
			isActive: config.isActive,
		})
	}

	const handleSave = async (values: FormValues) => {
		if (!editingConfig) return

		try {
			const result = await updateOverdueConfig(
				editingConfig.reportType as any,
				values,
			)
			if (result.success && result.data) {
				setConfigs((prev) =>
					prev.map((c) =>
						c.reportType === editingConfig.reportType
							? { ...c, ...values }
							: c,
					),
				)
				setEditingConfig(null)
				toast.success('Configuracao atualizada com sucesso!')
			} else {
				toast.error('Erro ao atualizar configuracao')
			}
		} catch {
			toast.error('Erro ao atualizar configuracao')
		}
	}

	const handleReset = async (reportType: string) => {
		setIsResetting(reportType)
		try {
			const result = await resetOverdueConfig(reportType as any)
			if (result.success && result.data) {
				setConfigs((prev) =>
					prev.map((c) =>
						c.reportType === reportType
							? {
									...c,
									diasOverdue: result.data.diasOverdue,
									diasAlerta: result.data.diasAlerta,
									isActive: result.data.isActive,
								}
							: c,
					),
				)
				toast.success('Configuracao resetada para valores padrao!')
			} else {
				toast.error('Erro ao resetar configuracao')
			}
		} catch {
			toast.error('Erro ao resetar configuracao')
		} finally {
			setIsResetting(null)
		}
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold flex items-center gap-2">
						<Settings2 className="h-4 w-4 text-primary" />
						Configuracao de Vencimentos
					</h2>
					<p className="text-xs text-muted-foreground">
						Defina os dias de atraso (overdue) e alerta para cada tipo de
						relatorio.
					</p>
				</div>
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{configs.map((config) => (
					<Card
						key={config.reportType}
						className={`group transition-all hover:shadow-md border-l-4 ${
							config.isActive
								? 'border-l-emerald-500'
								: 'border-l-muted opacity-70'
						}`}
					>
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-base font-bold">
										{config.label}
									</CardTitle>
									<p className="text-xs text-muted-foreground">
										{config.description}
									</p>
								</div>
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
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Metrics */}
							<div className="grid grid-cols-2 gap-3">
								<TooltipProvider delayDuration={0}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
												<Clock className="h-4 w-4 text-amber-600" />
												<div>
													<p className="text-xs text-amber-600 font-medium">
														Overdue
													</p>
													<p className="text-lg font-bold text-amber-700">
														{config.diasOverdue}{' '}
														<span className="text-xs font-normal">dias</span>
													</p>
												</div>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">
												Relatorio considerado atrasado apos {config.diasOverdue}{' '}
												dias do periodo analisado
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider delayDuration={0}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
												<AlertTriangle className="h-4 w-4 text-blue-600" />
												<div>
													<p className="text-xs text-blue-600 font-medium">
														Alerta
													</p>
													<p className="text-lg font-bold text-blue-700">
														{config.diasAlerta}{' '}
														<span className="text-xs font-normal">dias</span>
													</p>
												</div>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">
												Alerta enviado {config.diasAlerta} dias antes do
												vencimento
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 pt-2 border-t">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 gap-2"
									onClick={() => openEditDialog(config)}
								>
									<Calendar className="h-3 w-3" />
									Configurar
								</Button>
								<TooltipProvider delayDuration={0}>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												disabled={isResetting === config.reportType}
												onClick={() => handleReset(config.reportType)}
											>
												<RotateCcw
													className={`h-4 w-4 ${isResetting === config.reportType ? 'animate-spin' : ''}`}
												/>
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">Resetar para valor padrao</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Edit Dialog */}
			<Dialog
				open={!!editingConfig}
				onOpenChange={(open) => !open && setEditingConfig(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Configurar Vencimento</DialogTitle>
						<DialogDescription>
							{editingConfig?.label} - {editingConfig?.description}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSave)}
							className="space-y-6 py-4"
						>
							<FormField
								control={form.control}
								name="diasOverdue"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-amber-600" />
											Dias para Overdue
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={365}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Apos quantos dias o relatorio sera considerado atrasado
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="diasAlerta"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<AlertTriangle className="h-4 w-4 text-blue-600" />
											Dias para Alerta
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={90}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Quantos dias antes do vencimento enviar alerta
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
										<div className="space-y-0.5">
											<FormLabel>Ativo</FormLabel>
											<FormDescription>
												Desative para ignorar este tipo nos calculos de
												vencimento
											</FormDescription>
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

							<DialogFooter className="pt-4 border-t">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setEditingConfig(null)}
								>
									Cancelar
								</Button>
								<Button type="submit" className="gap-2">
									<Save className="h-4 w-4" />
									Salvar
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
