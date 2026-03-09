import { z } from 'zod'

export const notificacaoEntregaIncompletaSchema = z.object({
	contratoId: z.string().min(1, 'ID do contrato obrigatório'),
	numeroEmpenho: z.string().min(1, 'Número do empenho obrigatório'),
	dataEmpenho: z.instanceof(Date, { message: 'Data do empenho inválida.' }),
	emailEmpenho: z
		.email({ message: 'Email do empenho inválido.' })
		.or(z.literal('')),
	responsavelEmpenho: z.string().min(1, 'Responsável pelo empenho obrigatório'),
	prazoEntrega: z.number().int('O prazo deve ser um número inteiro.'),
	dataCertidaoOcorrencia: z
		.instanceof(Date, { message: 'Data da certidão inválida.' })
		.optional(),
	prazoDefesa: z.number().int('O prazo de defesa deve ser um número inteiro.'),
	item: z.string().optional().or(z.literal('')),
	desconformidade: z.string().optional().or(z.literal('')),
	empresaEndereco: z.string().min(1, 'Endereço da empresa obrigatório'),
	empresaRepresentanteNome: z
		.string()
		.min(1, 'Nome do representante obrigatório'),
	empresaRepresentanteCpf: z
		.string()
		.min(1, 'CPF do representante obrigatório'),
})

export type NotificacaoEntregaIncompletaInput = z.infer<
	typeof notificacaoEntregaIncompletaSchema
>
