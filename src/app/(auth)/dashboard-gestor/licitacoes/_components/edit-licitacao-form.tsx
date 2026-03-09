'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { updateLicitacaoAction } from '../_actions/update-licitacao'
import { Save, Building2, FileText, Settings, Calendar, Hash, Tag } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface EditLicitacaoFormProps {
	licitacao: any
}

const SITUACOES = [
	{ value: 'AGUARDANDO', label: 'Aguardando' },
	{ value: 'ANDAMENTO', label: 'Em Andamento' },
	{ value: 'CANCELADA', label: 'Cancelada' },
	{ value: 'CONCLUIDA', label: 'Concluída' },
	{ value: 'SUSPENSA', label: 'Suspensa' },
]

const MODALIDADES = [
	{ value: 'CONCORRENCIA', label: 'Concorrência' },
	{ value: 'TOMADA_DE_PRECO', label: 'Tomada de Preço' },
	{ value: 'CONVITE', label: 'Convite' },
	{ value: 'PREGAO', label: 'Pregão' },
	{ value: 'LEILAO', label: 'Leilão' },
	{ value: 'INEXIGIBILIDADE', label: 'Inexigibilidade' },
	{ value: 'DISPENSA', label: 'Dispensa' },
]

export function EditLicitacaoForm({ licitacao }: EditLicitacaoFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		entidade: licitacao.entidade || '',
		objeto: licitacao.objeto || '',
		numero: licitacao.numero || 0,
		ano: licitacao.ano || 0,
		situacao: licitacao.situacao || '',
		modalidade: licitacao.modalidade || '',
		dataPublicacao: licitacao.dataPublicacao 
            ? new Date(licitacao.dataPublicacao).toISOString().split('T')[0] 
            : '',
	})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			const result = await updateLicitacaoAction({
				id: licitacao.id,
				entidade: formData.entidade,
				objeto: formData.objeto,
				numero: Number(formData.numero),
				ano: Number(formData.ano),
				situacao: formData.situacao as any,
				modalidade: formData.modalidade as any,
				dataPublicacao: formData.dataPublicacao,
			})

			if (result.success) {
				toast.success('Licitação atualizada com sucesso')
				router.refresh()
			} else {
				toast.error(result.error || 'Erro ao atualizar licitação')
			}
		} catch {
			toast.error('Erro ao atualizar licitação')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Coluna 1: Identificação e Processo */}
				<div className="space-y-6">
					<div className="flex items-center gap-2 pb-2 border-b">
						<Building2 className="h-5 w-5 text-emerald-600" />
						<h3 className="text-lg font-medium">Dados da Entidade e Processo</h3>
					</div>

					<div className="space-y-2">
						<Label htmlFor="entidade">Entidade Responsável</Label>
						<Input
							id="entidade"
							name="entidade"
							value={formData.entidade}
							onChange={handleChange}
							placeholder="Ex: Prefeitura Municipal"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="numero" className="flex items-center gap-2">
								<Hash className="h-3.5 w-3.5 text-muted-foreground" />
								Número
							</Label>
							<Input
								id="numero"
								name="numero"
								type="number"
								value={formData.numero}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ano" className="flex items-center gap-2">
								<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
								Ano
							</Label>
							<Input
								id="ano"
								name="ano"
								type="number"
								value={formData.ano}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="modalidade" className="flex items-center gap-2">
							<Tag className="h-3.5 w-3.5 text-muted-foreground" />
							Modalidade
						</Label>
						<Select
							value={formData.modalidade}
							onValueChange={(value) =>
								handleSelectChange('modalidade', value)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Selecione a modalidade..." />
							</SelectTrigger>
							<SelectContent>
								{MODALIDADES.map((m) => (
									<SelectItem key={m.value} value={m.value}>
										{m.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Coluna 2: Status e Objeto */}
				<div className="space-y-6">
					<div className="flex items-center gap-2 pb-2 border-b">
						<Settings className="h-5 w-5 text-emerald-600" />
						<h3 className="text-lg font-medium">Configurações e Detalhes</h3>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="situacao">Situação Atual</Label>
							<Select
								value={formData.situacao}
								onValueChange={(value) => handleSelectChange('situacao', value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Selecione a situação..." />
								</SelectTrigger>
								<SelectContent>
									{SITUACOES.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dataPublicacao">Data de Publicação</Label>
							<div className="relative">
								<Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
								<Input
									id="dataPublicacao"
									name="dataPublicacao"
									type="date"
									className="pl-9"
									value={formData.dataPublicacao}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="objeto" className="flex items-center gap-2">
							<FileText className="h-3.5 w-3.5 text-muted-foreground" />
							Objeto da Licitação
						</Label>
						<Textarea
							id="objeto"
							name="objeto"
							value={formData.objeto}
							onChange={handleChange}
							rows={6}
							className="resize-none"
							placeholder="Descreva detalhadamente o objeto licitado..."
							required
						/>
					</div>
				</div>
			</div>

			<div className="flex justify-end pt-6 border-t">
				<Button type="submit" size="lg" className="gap-2 px-8 shadow-md" disabled={loading}>
					<Save className="h-4 w-4" />
					{loading ? 'Salvando...' : 'Salvar Alterações'}
				</Button>
			</div>
		</form>
	)
}
