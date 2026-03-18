import { getMensagemFiscalById } from '../_data-access/get-mensagens-fiscal'
import { marcarMensagemLidaAction } from '../_actions/mensagem-fiscal-actions'
import { MensagemFiscalDetalhesClient } from './_components/mensagem-fiscal-detalhes-client'

interface MensagemFiscalDetalhesPageProps {
	params: Promise<{ id: string }>
}

export default async function MensagemFiscalDetalhesPage({ params }: MensagemFiscalDetalhesPageProps) {
	const { id } = await params
	const mensagem = await getMensagemFiscalById(id)

	if (!mensagem) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Mensagem não encontrada</p>
			</div>
		)
	}

	// Marcar como lida automaticamente ao abrir
	if (!mensagem.lida) {
		await marcarMensagemLidaAction(id)
	}

	return <MensagemFiscalDetalhesClient mensagem={mensagem} />
}
