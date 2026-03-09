'use server'

import fs from 'node:fs'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { revalidatePath } from 'next/cache'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { simpleHash } from '@/utils/hash'
import { withPermission } from '@/lib/permissions/with-permission'
import { getContratoDetailsForPdf } from '../../_data-access/get-contrato-details-for-pdf'
import { AnexoXXIITemplate } from '../../pdf-templates/desconformidade'
import {
	type NotificacaoDesconformidadeInput,
	notificacaoDesconformidadeSchema,
} from './action-schema'

export type { NotificacaoDesconformidadeInput }

export const saveAndGenerateNotificacaoDesconformidade = withPermission(
	'create',
	async (ctx, dados: NotificacaoDesconformidadeInput) => {
		const { userId, organizationId } = ctx

		try {
			const validation = notificacaoDesconformidadeSchema.safeParse(dados)
			if (!validation.success) {
				return {
					success: false,
					error: 'Dados inválidos',
					details: validation.error.flatten(),
				}
			}

			const { contratoId, ...dadosNotificacao } = validation.data

			// Busca os detalhes do contrato primeiro para verificar dados da empresa
			const contratoDetails = await getContratoDetailsForPdf(contratoId)
			if (contratoDetails.error || !contratoDetails.data) {
				return {
					success: false,
					error: 'Erro ao buscar dados do contrato.',
				}
			}

			// Valida se os dados da empresa estão completos (do banco OU do formulário)
			const empresaEndereco =
				dados.empresaEndereco || contratoDetails.data.empresaEndereco
			const empresaRepresentanteNome =
				dados.empresaRepresentanteNome ||
				contratoDetails.data.empresaRepresentanteNome
			const empresaRepresentanteCpf =
				dados.empresaRepresentanteCpf ||
				contratoDetails.data.empresaRepresentanteCpf

			if (
				!empresaEndereco ||
				!empresaRepresentanteNome ||
				!empresaRepresentanteCpf
			) {
				return {
					success: false,
					error:
						'Dados da empresa incompletos. Preencha todos os campos obrigatórios: endereço, nome do representante e CPF.',
				}
			}

			const fiscalContrato = await prisma.fiscalContrato.findFirst({
				where: {
					userId,
					organizationId,
					contratos: { some: { contratoId: contratoId } },
				},
			})

			if (!fiscalContrato) {
				return {
					success: false,
					error:
						'Você não é um fiscal deste contrato ou o vínculo não foi encontrado.',
				}
			}
			const empresaId = contratoDetails.data.empresaId

			const [novaNotificacao] = await prisma.$transaction(async (tx) => {
				const notificacao = await tx.notificacaoDesconformidade.create({
					data: {
						contratoId,
						fiscalContratoId: fiscalContrato.id,
						organizationId,
						tipo: 'Notificação Extrajudicial - Desconformidade',
						dataEnvio: new Date(),
						assinaturaDigital: '',
						numeroEmpenho: dadosNotificacao.numeroEmpenho || null,
						dataEmpenho: dadosNotificacao.dataEmpenho || null,
						emailEmpenho: dadosNotificacao.emailEmpenho || null,
						responsavelEmpenho: dadosNotificacao.responsavelEmpenho || null,
						dataCertidaoOcorrencia:
							dadosNotificacao.dataCertidaoOcorrencia || null,
						itemDesconformidade: JSON.stringify(dadosNotificacao.items),
						prazoRegularizacao: dadosNotificacao.prazoRegularizacao,
					},
				})

				// Se os dados vierem do formulário e forem diferentes do banco, atualizamos no banco
				if (
					dados.empresaEndereco !== contratoDetails.data.empresaEndereco ||
					dados.empresaRepresentanteNome !==
						contratoDetails.data.empresaRepresentanteNome ||
					dados.empresaRepresentanteCpf !==
						contratoDetails.data.empresaRepresentanteCpf
				) {
					await tx.empresas.update({
						where: { id: empresaId },
						data: {
							endereco: empresaEndereco,
							representanteNome: empresaRepresentanteNome,
							representanteCpf: empresaRepresentanteCpf,
						},
					})
				}

				return [notificacao]
			})

			const notificacaoAtualizada =
				await prisma.notificacaoDesconformidade.update({
					where: { id: novaNotificacao.id },
					data: { assinaturaDigital: simpleHash(novaNotificacao.id) },
				})

			const baseUrl = `${process.env.LINK_URL}`
			const linkValidacao = `${baseUrl}/verify-report/${notificacaoAtualizada.assinaturaDigital}`
			const qrCodeDataUri = await QRCode.toDataURL(linkValidacao)

			const itemsParsed = JSON.parse(notificacaoAtualizada.itemDesconformidade)

			const pdfBuffer = await renderToBuffer(
				<AnexoXXIITemplate
					data={{
						...contratoDetails.data,
						empresaEndereco,
						empresaRepresentanteNome,
						empresaRepresentanteCpf,
						gestorPortaria: fiscalContrato.portaria || '',
					}}
					notificacao={notificacaoAtualizada}
					qrCodeUrl={qrCodeDataUri}
					items={itemsParsed}
				/>,
			)

			const fileName = `${notificacaoAtualizada.assinaturaDigital}.pdf`

			const notificationsDir =
				process.env.NOTIFICATION_DIR ||
				path.join(process.cwd(), 'public', 'notificacoes')
			const filePath = path.join(notificationsDir, fileName)

			try {
				if (!fs.existsSync(notificationsDir)) {
					fs.mkdirSync(notificationsDir, { recursive: true })
				}
				fs.writeFileSync(filePath, pdfBuffer)
			} catch (diskError) {
				console.error('ERRO ao salvar o PDF no disco:', diskError)
			}

			revalidatePath('/(fiscal)/dashboard-fiscal/contratos')
			revalidatePath(`/(fiscal)/dashboard-fiscal/contratos/${contratoId}`)

			return {
				success: true,
				data: {
					filePath: `/api/notifications/${fileName}`,
					fileName: `Notificacao_Desconformidade_${contratoDetails.data.contratoNumero}.pdf`,
				},
			}
		} catch (error) {
			console.error('Erro no processo de Notificação de Desconformidade:', error)
			return { success: false, error: 'Erro interno no servidor.' }
		}
	},
	{ module: 'fiscal-notificacoes', log: 'NOTIFICACAO_DESCONFORMIDADE' }
)
