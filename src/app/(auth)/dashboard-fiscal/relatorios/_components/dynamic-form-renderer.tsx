'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import React from 'react'

interface DynamicFormRendererProps {
	form: any
	configs: any[]
	lotacoes?: { label: string; value: string }[]
	/** Renderiza campos sem Card wrapper */
	flat?: boolean
	/** Função para renderizar algo customizado após um campo específico */
	renderAfterField?: (fieldKey: string) => React.ReactNode
}

export function DynamicFormRenderer({
	form,
	configs,
	lotacoes = [],
	flat = false,
	renderAfterField,
}: DynamicFormRendererProps) {
	const sections = configs.reduce((acc: any, field) => {
		const sectionName = field.section || 'Outros'
		if (!acc[sectionName]) acc[sectionName] = []
		acc[sectionName].push(field)
		return acc
	}, {})

	const renderField = (fieldConfig: any) => {
		const {
			fieldKey,
			label,
			type,
			options,
			isRequired,
			description,
			hasObs,
			requiredObsValue,
		} = fieldConfig

		// Lógica de Visibilidade Condicional Específica
		if (fieldKey === 'modalidadeGarantia' || fieldKey === 'validadeGarantia') {
			const garantiaStatus = form.watch('garantiaContratual')
			if (garantiaStatus !== 'Previsto') return null
		}

		// Oculta campos de abertura de processo e sanção se não houve notificação
		if (fieldKey === 'aberturaProcessoAdministrativo' || fieldKey === 'sofreuSancao') {
			const recebeuNotificacao = form.watch('recebeuNotificacao')
			if (recebeuNotificacao === 'Não') return null
		}

		const currentValue = form.watch(fieldKey)

		let showObsField = false
		if (hasObs && requiredObsValue) {
			try {
				const triggers = JSON.parse(requiredObsValue)
				showObsField = Array.isArray(triggers)
					? triggers.includes(currentValue)
					: triggers === currentValue
			} catch {
				showObsField = currentValue === requiredObsValue
			}
		}

		return (
			<React.Fragment key={fieldKey}>
				<div className="space-y-4 p-5 rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200">
					<FormField
						control={form.control}
						name={fieldKey}
						render={({ field }) => (
							<FormItem className="space-y-4">
								<div className="flex flex-col gap-1.5">
									<FormLabel className="text-sm font-bold text-foreground/90 leading-tight flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
										{label}
										{isRequired && <span className="text-destructive ml-0.5">*</span>}
									</FormLabel>
									{description && (
										<p className="text-xs text-muted-foreground/70 leading-relaxed ml-3.5 italic">{description}</p>
									)}
								</div>

								<FormControl>
									{(() => {
										switch (type) {
											case 'LOTACAO':
												return (
													<div className="ml-3.5">
														<Combobox
															options={lotacoes}
															value={field.value}
															onChange={field.onChange}
															placeholder="Selecione a secretaria"
															searchPlaceholder="Buscar secretaria..."
															emptyText="Nenhuma secretaria encontrada."
														/>
													</div>
												)
											case 'TEXTAREA':
												return <div className="ml-3.5"><Textarea {...field} className="min-h-28 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30" /></div>
											case 'RADIO': {
												const radioOptions: string[] = options ? JSON.parse(options) : ['Sim', 'Não']
												return (
													<RadioGroup
														onValueChange={field.onChange}
														value={field.value}
														className="flex flex-row flex-wrap gap-3 ml-3.5 pt-1"
													>
														{radioOptions.map((opt: string) => {
															const isChecked = field.value === opt
															const id = `${fieldKey}-${opt}`
															return (
																<div key={opt} className="relative flex">
																	<RadioGroupItem value={opt} id={id} className="peer sr-only" />
																	<Label
																		htmlFor={id}
																		className={cn(
																			'flex items-center space-x-2.5 rounded-lg border-2 px-4 py-2.5 transition-all cursor-pointer shadow-sm',
																			isChecked ? 'border-primary bg-primary/5 text-primary font-bold ring-4 ring-primary/10' : 'border-muted bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/20'
																		)}
																	>
																		<div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors', isChecked ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-transparent')}>
																			{isChecked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
																		</div>
																		<span className="text-xs uppercase tracking-tight">{opt}</span>
																	</Label>
																</div>
															)
														})}
													</RadioGroup>
												)
											}
											case 'DATE':
												return <div className="ml-3.5"><Input type="date" {...field} className="bg-muted/30 border-muted-foreground/20 max-w-[200px]" /></div>
											case 'NUMBER':
												return <div className="ml-3.5"><Input type="number" {...field} className="bg-muted/30 border-muted-foreground/20 max-w-[150px]" /></div>
											default:
												return <div className="ml-3.5"><Input {...field} className="bg-muted/30 border-muted-foreground/20" /></div>
										}
									})()}
								</FormControl>
								<FormMessage className="text-[10px] font-bold ml-3.5" />
							</FormItem>
						)}
					/>

					{showObsField && (
						<FormField
							control={form.control}
							name={`${fieldKey}Obs`}
							render={({ field }) => (
								<FormItem className="mt-4 ml-3.5 pl-5 border-l-4 border-primary/30 bg-primary/5 p-4 rounded-r-xl space-y-3">
									<div className="flex items-center gap-2">
										<FormLabel className="text-[10px] font-black text-primary uppercase tracking-widest">
											Justificativa Obrigatória
										</FormLabel>
										<span className="text-destructive font-bold text-xs">*</span>
									</div>
									<FormControl>
										<Textarea 
											{...field} 
											placeholder="Por favor, descreva detalhadamente os motivos desta resposta..." 
											className="min-h-24 bg-background border-primary/20 focus-visible:ring-primary/40 resize-none shadow-inner" 
										/>
									</FormControl>
									<FormMessage className="text-[10px] font-bold" />
								</FormItem>
							)}
						/>
					)}
				</div>
				
				{/* Injeção de componentes customizados (Tabelas, etc) */}
				<div className="ml-3.5">
					{renderAfterField && renderAfterField(fieldKey)}
				</div>
			</React.Fragment>
		)
	}

	if (flat) {
		return (
			<div className="space-y-5">
				{configs.map((field) => renderField(field)).filter((el) => el !== null)}
			</div>
		)
	}

	return (
		<div className="space-y-10">
			{Object.entries(sections).map(([sectionName, fields]: [string, any]) => {
				const renderedFields = fields.map((field: any) => renderField(field)).filter((el: any) => el !== null)
				if (renderedFields.length === 0) return null

				return (
					<div key={sectionName} className="space-y-6">
						<div className="flex items-center gap-4 px-2">
							<h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap">
								{sectionName}
							</h3>
							<div className="h-[1px] w-full bg-gradient-to-r from-foreground/10 to-transparent" />
						</div>
						<div className="grid grid-cols-1 gap-5">
							{renderedFields}
						</div>
					</div>
				)
			})}
		</div>
	)
}
