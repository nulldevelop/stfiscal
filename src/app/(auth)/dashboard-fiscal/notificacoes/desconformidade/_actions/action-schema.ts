import { z } from 'zod'

export const notificacaoDesconformidadeSchema = z.object({
	contratoId: z.string().min(1, 'ID do contrato obrigatório'),
	numeroEmpenho: z.string().min(1, 'Número do empenho é obrigatório.'),
	dataEmpenho: z.instanceof(Date, { message: 'Data do empenho inválida.' }),
	emailEmpenho: z
		.email({ message: 'Email do empenho inválido.' })
		.min(1, 'Email de empenho é obrigatório.'),
	responsavelEmpenho: z
		.string()
		.min(1, 'Responsável pelo empenho é obrigatório.'),
	dataCertidaoOcorrencia: z.instanceof(Date, {
		message: 'Data da certidão inválida.',
	}),
	prazoRegularizacao: z
		.number()
		.int('O prazo deve ser um número inteiro.')
		.min(1, 'O prazo de regularização é obrigatório.'),
	items: z
		.array(
			z.object({
				titulo: z.string().min(1, 'Título da item é obrigatório.'),
				caracteristicasContrato: z
					.string()
					.min(1, 'Características conforme o contrato é obrigatório.'),
				caracteristicasRecebido: z
					.string()
					.min(1, 'Características recebidas é obrigatório.'),
			}),
		)
		.min(1, 'Adicione pelo menos um item.'),
	empresaEndereco: z.string().min(1, 'Endereço da empresa é obrigatório.'),
	empresaRepresentanteNome: z
		.string()
		.min(1, 'Nome do representante é obrigatório.'),
	empresaRepresentanteCpf: z
		.string()
		.min(1, 'CPF do representante é obrigatório.'),
	itemDesconformidade: z.string().optional().or(z.literal('')),
})

export type NotificacaoDesconformidadeInput = z.infer<
	typeof notificacaoDesconformidadeSchema
>
