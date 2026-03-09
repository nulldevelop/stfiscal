'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Loader2, Paperclip, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
	TipoHistoricoNotificacao,
	TipoNotificacaoRef,
} from '@/generated/prisma/client'
import { createHistorico } from '../_actions/historico-actions'

interface AddHistoricoFormProps {
	notificacaoId: string
	tipoNotificacao: TipoNotificacaoRef
	onSuccess: () => void
	onCancel: () => void
}

const TIPO_OPTIONS: { value: TipoHistoricoNotificacao; label: string }[] = [
	{ value: 'COMENTARIO', label: 'Comentário' },
	{ value: 'ANEXO', label: 'Anexo' },
	{ value: 'ENVIO_EMAIL', label: 'Envio de Email' },
	{ value: 'RETORNO_FORNECEDOR', label: 'Retorno do Fornecedor' },
	{ value: 'OUTRO', label: 'Outro' },
]

export function AddHistoricoForm({
	notificacaoId,
	tipoNotificacao,
	onSuccess,
	onCancel,
}: AddHistoricoFormProps) {
	const [tipo, setTipo] = useState<TipoHistoricoNotificacao>('COMENTARIO')
	const [titulo, setTitulo] = useState('')
	const [descricao, setDescricao] = useState('')
	const [dataOcorrencia, setDataOcorrencia] = useState<Date | undefined>(
		new Date(),
	)
	const [file, setFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function uploadFile(): Promise<{ path: string; name: string } | null> {
		if (!file) return null

		const formData = new FormData()
		formData.append('file', file)

		const response = await fetch('/api/notification-attachments', {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			const data = await response.json()
			throw new Error(data.error || 'Erro ao fazer upload')
		}

		const data = await response.json()
		return { path: data.filePath, name: data.fileName }
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		if (!titulo.trim()) {
			setError('O título é obrigatório')
			return
		}

		setSubmitting(true)

		try {
			let anexoPath: string | undefined
			let anexoNome: string | undefined

			if (file) {
				setUploading(true)
				const uploadResult = await uploadFile()
				setUploading(false)

				if (uploadResult) {
					anexoPath = uploadResult.path
					anexoNome = uploadResult.name
				}
			}

			const result = await createHistorico({
				notificacaoId,
				tipoNotificacao,
				tipo,
				titulo: titulo.trim(),
				descricao: descricao.trim() || undefined,
				anexoPath,
				anexoNome,
				dataOcorrencia,
			})

			if (!result.success) {
				setError(result.error)
				return
			}

			onSuccess()
		} catch (err) {
			console.error('Erro ao salvar:', err)
			setError('Erro ao salvar histórico. Tente novamente.')
		} finally {
			setSubmitting(false)
			setUploading(false)
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			if (selectedFile.size > 10 * 1024 * 1024) {
				setError('Arquivo muito grande. Máximo permitido: 10MB')
				return
			}
			setFile(selectedFile)
			setError(null)
		}
	}

	function removeFile() {
		setFile(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<Card>
			<CardContent className="pt-4">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="tipo">Tipo de Registro</Label>
							<Select
								value={tipo}
								onValueChange={(value) =>
									setTipo(value as TipoHistoricoNotificacao)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Selecione o tipo" />
								</SelectTrigger>
								<SelectContent>
									{TIPO_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="data">Data do Registro</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!dataOcorrencia && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dataOcorrencia ? (
											format(dataOcorrencia, 'PPP', { locale: ptBR })
										) : (
											<span>Selecione uma data</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={dataOcorrencia}
										onSelect={setDataOcorrencia}
										initialFocus
										locale={ptBR}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label htmlFor="titulo">Título *</Label>
							<Input
								id="titulo"
								value={titulo}
								onChange={(e) => setTitulo(e.target.value)}
								placeholder="Ex: Comprovante de envio de email"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="descricao">Descrição</Label>
						<Textarea
							id="descricao"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
							placeholder="Adicione detalhes sobre este registro..."
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label>Anexo (opcional)</Label>
						<div className="flex items-center gap-2">
							<Input
								ref={fileInputRef}
								type="file"
								onChange={handleFileChange}
								accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
								className="hidden"
								id="file-upload"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								className="gap-2"
							>
								<Paperclip className="h-4 w-4" />
								Selecionar Arquivo
							</Button>
							{file && (
								<div className="flex items-center gap-2 rounded-md  px-3 py-1.5 text-sm">
									<span className="max-w-50 truncate">{file.name}</span>
									<button
										type="button"
										onClick={removeFile}
										className="text-muted-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							)}
						</div>
						<p className="text-muted-foreground text-xs">
							Formatos aceitos: PDF, PNG, JPG, DOC, DOCX. Máximo: 10MB
						</p>
					</div>

					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancelar
						</Button>
						<Button type="submit" disabled={submitting || uploading}>
							{submitting || uploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{uploading ? 'Enviando arquivo...' : 'Salvando...'}
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" />
									Adicionar
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
