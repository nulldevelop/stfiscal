'use client'

import {
	FileText,
	Mail,
	MessageSquare,
	MoreVertical,
	Paperclip,
	RotateCcw,
	Trash2,
	User,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatData } from '@/utils/formatData'
import { deleteHistorico } from '../_actions/historico-actions'

interface HistoricoItem {
	id: string
	tipo: string
	titulo: string
	descricao: string | null
	anexoPath: string | null
	anexoNome: string | null
	createdAt: Date
	user: { name: string | null }
}

interface HistoricoTimelineProps {
	historicos: HistoricoItem[]
	onDelete: () => void
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
	COMENTARIO: <MessageSquare className="h-4 w-4" />,
	ANEXO: <Paperclip className="h-4 w-4" />,
	ENVIO_EMAIL: <Mail className="h-4 w-4" />,
	RETORNO_FORNECEDOR: <RotateCcw className="h-4 w-4" />,
	OUTRO: <FileText className="h-4 w-4" />,
}

const TIPO_LABELS: Record<string, string> = {
	COMENTARIO: 'Comentário',
	ANEXO: 'Anexo',
	ENVIO_EMAIL: 'Envio de Email',
	RETORNO_FORNECEDOR: 'Retorno do Fornecedor',
	OUTRO: 'Outro',
}

const TIPO_COLORS: Record<string, string> = {
	COMENTARIO:
		'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
	ANEXO: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
	ENVIO_EMAIL:
		'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
	RETORNO_FORNECEDOR:
		'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
	OUTRO: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
}

export function HistoricoTimeline({
	historicos,
	onDelete,
}: HistoricoTimelineProps) {
	const [deleting, setDeleting] = useState<string | null>(null)

	async function handleDelete(id: string) {
		setDeleting(id)
		try {
			const result = await deleteHistorico(id)
			if (result.success) {
				onDelete()
			}
		} catch (error) {
			console.error('Erro ao deletar:', error)
		} finally {
			setDeleting(null)
		}
	}

	return (
		<div className="relative">
			{/* Timeline line */}
			<div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

			<div className="space-y-4">
				{historicos.map((historico, index) => (
					<div key={historico.id} className="relative pl-10">
						{/* Timeline dot */}
						<div
							className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${TIPO_COLORS[historico.tipo] || TIPO_COLORS.OUTRO}`}
						>
							{TIPO_ICONS[historico.tipo] || TIPO_ICONS.OUTRO}
						</div>

						{/* Content */}
						<div className="rounded-lg border bg-card p-4">
							<div className="mb-2 flex items-start justify-between">
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium">{historico.titulo}</span>
										<span className="rounded  px-2 py-0.5 text-muted-foreground text-xs">
											{TIPO_LABELS[historico.tipo] || historico.tipo}
										</span>
									</div>
									<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
										<span className="flex items-center gap-1">
											<User className="h-3 w-3" />
											{historico.user?.name ?? 'Desconhecido'}
										</span>
										<span>•</span>
										<span>{formatData(historico.createdAt)}</span>
									</div>
								</div>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											disabled={deleting === historico.id}
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(historico.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Excluir
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{historico.descricao && (
								<p className="mt-2 whitespace-pre-wrap text-sm">
									{historico.descricao}
								</p>
							)}

							{historico.anexoPath && (
								<div className="mt-3">
									<Button variant="outline" size="sm" asChild>
										<a
											href={historico.anexoPath}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Paperclip className="mr-2 h-4 w-4" />
											{historico.anexoNome || 'Ver Anexo'}
										</a>
									</Button>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
