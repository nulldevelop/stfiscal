'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { updateEmpresaAction } from '../_actions/update-empresa'
import { Save, Building2, User, CreditCard, MapPin, Contact } from 'lucide-react'
import { formatCnpj } from '@/utils/formatCNPJ'
import { formatCpf } from '@/utils/formatCpf'

interface EditEmpresaFormProps {
	empresa: any
}

export function EditEmpresaForm({ empresa }: EditEmpresaFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: empresa.name || '',
		cnpj: formatCnpj(empresa.cnpj || ''),
		endereco: empresa.endereco || '',
		representanteNome: empresa.representanteNome || '',
		representanteRg: empresa.representanteRg || '',
		representanteCpf: formatCpf(empresa.representanteCpf || ''),
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		let formattedValue = value

		if (name === 'cnpj') formattedValue = formatCnpj(value)
		if (name === 'representanteCpf') formattedValue = formatCpf(value)

		setFormData((prev) => ({ ...prev, [name]: formattedValue }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			const result = await updateEmpresaAction({
				id: empresa.id,
				name: formData.name,
				cnpj: formData.cnpj.replace(/\D/g, ''),
				endereco: formData.endereco,
				representanteNome: formData.representanteNome,
				representanteRg: formData.representanteRg,
				representanteCpf: formData.representanteCpf.replace(/\D/g, ''),
			})

			if (result.success) {
				toast.success('Empresa atualizada com sucesso')
				router.refresh()
			} else {
				toast.error(result.error || 'Erro ao atualizar empresa')
			}
		} catch {
			toast.error('Erro ao atualizar empresa')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Coluna 1: Dados da Empresa */}
				<div className="space-y-6">
					<div className="flex items-center gap-2 pb-2 border-b">
						<Building2 className="h-5 w-5 text-blue-600" />
						<h3 className="text-lg font-medium">Dados da Empresa</h3>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Razão Social / Nome</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cnpj" className="flex items-center gap-2">
							<CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
							CNPJ
						</Label>
						<Input
							id="cnpj"
							name="cnpj"
							value={formData.cnpj}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="endereco" className="flex items-center gap-2">
							<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
							Endereço
						</Label>
						<Input
							id="endereco"
							name="endereco"
							value={formData.endereco}
							onChange={handleChange}
							placeholder="Endereço completo"
						/>
					</div>
				</div>

				{/* Coluna 2: Representante Legal */}
				<div className="space-y-6">
					<div className="flex items-center gap-2 pb-2 border-b">
						<User className="h-5 w-5 text-blue-600" />
						<h3 className="text-lg font-medium">Representante Legal</h3>
					</div>

					<div className="space-y-2">
						<Label htmlFor="representanteNome">Nome do Representante</Label>
						<Input
							id="representanteNome"
							name="representanteNome"
							value={formData.representanteNome}
							onChange={handleChange}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="representanteCpf" className="flex items-center gap-2">
								<Contact className="h-3.5 w-3.5 text-muted-foreground" />
								CPF
							</Label>
							<Input
								id="representanteCpf"
								name="representanteCpf"
								value={formData.representanteCpf}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="representanteRg">RG</Label>
							<Input
								id="representanteRg"
								name="representanteRg"
								value={formData.representanteRg}
								onChange={handleChange}
							/>
						</div>
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
