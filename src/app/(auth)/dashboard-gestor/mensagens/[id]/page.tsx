import { getMensagemById } from '../_data-access/get-mensagens'
import { MensagemDetalhesClient } from './_components/mensagem-detalhes-client'

interface MensagemDetalhesPageProps {
	params: Promise<{ id: string }>
}

export default async function MensagemDetalhesPage({
	params,
}: MensagemDetalhesPageProps) {
	const { id } = await params
	const mensagem = await getMensagemById(id)

	if (!mensagem) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Mensagem não encontrada</p>
			</div>
		)
	}

	return <MensagemDetalhesClient mensagem={mensagem} />
}
