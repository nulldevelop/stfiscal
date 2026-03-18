'use client'
import { AlertTriangle, Loader2, PlusCircle, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DynamicFormRenderer } from '../../_components/dynamic-form-renderer'
import { getLotacoes } from '../../_data-access/get-locacoes'
import { CertidoesButton } from '@/components/shared/certidoes-button'
import type { BensEServicosReportFormValues } from '../_actions/action-schema'
import { createBensEServicosReport } from '../_actions/create-bens-e-servicos-report'
import { saveBensEServicosDraft } from '../_actions/save-bens-e-servicos-draft'
import type { BensEServicosReportFormProps } from './types'
import { useBensEServicosForm } from './use-bens-e-servicos-form'

const CONFIRMATION_TEXT = 'Estou ciente'

export function BensEServicosReportForm({
	initialContrato,
	formConfig,
	draftReport,
}: BensEServicosReportFormProps) {
	const [isPending, startTransition] = useTransition()
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [confirmationInput, setConfirmationInput] = useState('')
	const [lotacoes, setLotacoes] = useState<{ label: string; value: string }[]>(
		[],
	)
	const form = useBensEServicosForm(formConfig)
	const router = useRouter()

	const isConfirmationValid =
		confirmationInput.trim().toLowerCase() === CONFIRMATION_TEXT.toLowerCase()

	useEffect(() => {
		getLotacoes().then((data) => {
			setLotacoes(data.map((l) => ({ label: l.name, value: l.name })))
		})
	}, [])

	useEffect(() => {
		if (draftReport) {
			form.setValue('contratoId', draftReport.contratoId)
			form.setValue('objeto', draftReport.objeto)
			form.setValue('contratada', draftReport.contratada)
			form.setValue(
				'licitacaoModalidadeNumero',
				draftReport.licitacaoModalidadeNumero,
			)
			form.setValue('secretariaNome', draftReport.secretariaNome || '')
			form.setValue(
				'periodoAnalisadoInicio',
				draftReport.periodoAnalisadoInicio
					? new Date(draftReport.periodoAnalisadoInicio)
							.toISOString()
							.split('T')[0]
					: '',
			)
			form.setValue(
				'periodoAnalisadoFim',
				draftReport.periodoAnalisadoFim
					? new Date(draftReport.periodoAnalisadoFim)
							.toISOString()
							.split('T')[0]
					: '',
			)
		}
	}, [draftReport, form])

	useEffect(() => {
		if (initialContrato) {
			form.setValue('contratoId', initialContrato.id)
			form.setValue('objeto', initialContrato.objeto)
			form.setValue('contratada', initialContrato.contratado)
			form.setValue(
				'licitacaoModalidadeNumero',
				initialContrato.displayLicitacao,
			)
		}
	}, [initialContrato, form])

	// Campos obrigatórios do schema — sempre renderizados hardcoded para evitar
	// campos invisíveis com validação ativa.
	const CORE_SECTION1_KEYS = [
		'secretariaNome',
		'periodoAnalisadoInicio',
		'periodoAnalisadoFim',
	]

	// Campos extras da Seção 1 que vêm do FormConfig (item, descrição, etc.)
	const section1ExtraConfigs = formConfig.filter(
		(c) =>
			c.isActive &&
			(c.section ?? '').match(/^1[\s-]/) &&
			!CORE_SECTION1_KEYS.includes(c.fieldKey),
	)

	// Seções 2+ vêm todas do FormConfig
	const otherConfigs = formConfig.filter(
		(c) => c.isActive && !(c.section ?? '').match(/^1[\s-]/),
	)

	const onSubmit = (values: BensEServicosReportFormValues) => {
		startTransition(async () => {
			if (!initialContrato) {
				toast.error(
					'Nenhum contrato selecionado. Por favor, volte e selecione um contrato.',
				)
				return
			}
			const result = await createBensEServicosReport(values)
			if (!result.success) {
				toast.error(result.error)
			} else if (result.data?.filePath) {
				toast.success(result.data.message)
				const link = document.createElement('a')
				link.href = result.data.filePath
				link.download = result.data.filePath.split('/').pop() ?? 'relatorio.pdf'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				form.reset()
				setIsDialogOpen(false)
				router.push('/dashboard-fiscal/historico-relatorios')
			}
		})
	}

	const onSaveDraft = (values: BensEServicosReportFormValues) => {
		startTransition(async () => {
			const result = await saveBensEServicosDraft(values)
			if (!result.success) {
				toast.error(result.error)
			} else {
				toast.success('Rascunho salvo com sucesso!')
				router.push('/dashboard-fiscal/rascunhos')
			}
		})
	}

	const handleOpenDialog = () => {
		form.handleSubmit(() => {
			setIsDialogOpen(true)
		})()
	}

	return (
		<Form {...form}>
			<form
				className="mx-2 space-y-12 pb-32"
				onSubmit={(e) => e.preventDefault()}
			>
				{/* SEÇÃO 1 - IDENTIFICAÇÃO DO CONTRATO */}
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-2">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
							1 - IDENTIFICAÇÃO DO CONTRATO
						</h3>
						<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
					</div>

					<Card className="border-none shadow-none bg-transparent">
						<CardContent className="space-y-5 p-0">
							<div className="grid grid-cols-1 gap-5 p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
								<FormField
									control={form.control}
									name="contratoId"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Contrato
											</FormLabel>
											<FormControl>
												<Input
													readOnly
													value={
														initialContrato
															? `${initialContrato.displayContrato} - ${initialContrato.contratado}`
															: 'Nenhum contrato selecionado'
													}
													className="bg-muted/50 border-none font-medium"
												/>
											</FormControl>
											<Input type="hidden" {...field} />
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<FormField
										control={form.control}
										name="licitacaoModalidadeNumero"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													Licitação
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														readOnly
														className="bg-muted/50 border-none font-medium"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="contratada"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													Contratada
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														readOnly
														className="bg-muted/50 border-none font-medium"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="objeto"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Objeto
											</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													readOnly
													className="bg-muted/50 border-none font-medium min-h-20 resize-none"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 gap-5 md:grid-cols-3 border-t pt-5 mt-2">
									<FormField
										control={form.control}
										name="secretariaNome"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Secretaria
												</FormLabel>
												<FormControl>
													<Combobox
														options={lotacoes}
														value={field.value}
														onChange={field.onChange}
														placeholder="Selecione a secretaria"
														searchPlaceholder="Buscar secretaria..."
														emptyText="Nenhuma secretaria encontrada."
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="periodoAnalisadoInicio"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Período (Início)
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="periodoAnalisadoFim"
										render={({ field }) => (
											<FormItem className="space-y-1">
												<FormLabel className="text-xs font-bold text-primary uppercase tracking-wider">
													Período (Fim)
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Campos extras da Seção 1 vindos do FormConfig */}
							{section1ExtraConfigs.length > 0 && (
								<div className="pt-2">
									<DynamicFormRenderer
										form={form}
										configs={section1ExtraConfigs}
										lotacoes={lotacoes}
										flat
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* SEÇÕES DINÂMICAS (2 em diante) */}
				<DynamicFormRenderer
					form={form}
					configs={otherConfigs}
					lotacoes={lotacoes}
				/>

			<div className="fixed bottom-6 right-6 z-50 flex gap-3">
				<CertidoesButton />
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						form.handleSubmit(onSaveDraft)()
					}}
					size="lg"
					className="font-bold gap-2 shadow-lg"
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className="animate-spin h-4 w-4" />
					) : (
						<Save className="h-4 w-4" />
					)}
					Salvar Rascunho
				</Button>
					<AlertDialog
						open={isDialogOpen}
						onOpenChange={(open) => {
							setIsDialogOpen(open)
							if (!open) setConfirmationInput('')
						}}
					>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								onClick={handleOpenDialog}
								size="lg"
								className="font-bold gap-2 shadow-lg"
							>
								{isPending ? (
									<Loader2 className="animate-spin h-4 w-4" />
								) : (
									<PlusCircle className="h-4 w-4" />
								)}
								Finalizar Relatório de Bens e Serviços
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
									<AlertTriangle className="h-7 w-7 text-amber-600" />
								</div>
								<AlertDialogTitle className="text-center">
									Confirmação de Finalização
								</AlertDialogTitle>
								<AlertDialogDescription className="text-center">
									<span className="block mb-4">
										Ao finalizar este relatório, o documento será{' '}
										<strong>assinado digitalmente</strong> e não poderá mais ser{' '}
										<strong>editado ou excluído</strong>.
									</span>
									<span className="block text-foreground font-medium">
										Esta ação é irreversível. Certifique-se de que todas as
										informações estão corretas antes de continuar.
									</span>
								</AlertDialogDescription>
							</AlertDialogHeader>

							<div className="space-y-3 py-4">
								<label
									htmlFor="confirmation-input-bs"
									className="text-sm font-medium"
								>
									Digite{' '}
									<span className="font-bold text-primary">
										"{CONFIRMATION_TEXT}"
									</span>{' '}
									para confirmar:
								</label>
								<Input
									id="confirmation-input-bs"
									value={confirmationInput}
									onChange={(e) => setConfirmationInput(e.target.value)}
									placeholder={CONFIRMATION_TEXT}
									className="text-center"
									autoComplete="off"
								/>
							</div>

							<AlertDialogFooter>
								<AlertDialogCancel onClick={() => setConfirmationInput('')}>
									Cancelar
								</AlertDialogCancel>
								<AlertDialogAction
									disabled={isPending || !isConfirmationValid}
									className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={(e) => {
										e.preventDefault()
										form.handleSubmit(onSubmit, () => {
											setIsDialogOpen(false)
											setConfirmationInput('')
										})()
									}}
								>
									{isPending ? 'Enviando...' : 'Confirmar e Finalizar'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</form>
		</Form>
	)
}
