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
import { AnexoEntregaIncompletaTemplate } from '../../pdf-templates/entrega-incompleta'
import {
	type NotificacaoEntregaIncompletaInput,
	notificacaoEntregaIncompletaSchema,
} from './action-schema'

export type { NotificacaoEntregaIncompletaInput }

export const saveAndGenerateNotificacaoEntregaIncompleta = withPermission(
	'create',
	async (ctx, dados: NotificacaoEntregaIncompletaInput) => {
		const { userId, organizationId } = ctx

		try {
			const validation = notificacaoEntregaIncompletaSchema.safeParse(dados)
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

			const [novaNotificacaoEntregaIncompleta] = await prisma.$transaction(
				async (tx) => {
					const notificacao = await tx.notificacaoEntregaIncompleta.create({
						data: {
							contratoId,
							fiscalContratoId: fiscalContrato.id,
							organizationId,
							tipo: 'Notificação Extrajudicial - Entrega Incompleta',
							dataEnvio: new Date(),
							assinaturaDigital: '',
							numeroEmpenho: dadosNotificacao.numeroEmpenho || null,
							dataEmpenho: dadosNotificacao.dataEmpenho || null,
							emailEmpenho: dadosNotificacao.emailEmpenho || null,
							responsavelEmpenho: dadosNotificacao.responsavelEmpenho || null,
							prazoEntrega: dadosNotificacao.prazoEntrega || null,
							dataCertidaoOcorrencia:
								dadosNotificacao.dataCertidaoOcorrencia || null,
							prazoDefesa: dadosNotificacao.prazoDefesa || null,
							item: dadosNotificacao.item || null,
							desconformidade: dadosNotificacao.desconformidade || null,
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
							where: { id: contratoDetails.data.empresaId },
							data: {
								endereco: empresaEndereco,
								representanteNome: empresaRepresentanteNome,
								representanteCpf: empresaRepresentanteCpf,
							},
						})
					}

					return [notificacao]
				},
			)

			const notificacaoAtualizada =
				await prisma.notificacaoEntregaIncompleta.update({
					where: { id: novaNotificacaoEntregaIncompleta.id },
					data: {
						assinaturaDigital: simpleHash(novaNotificacaoEntregaIncompleta.id),
					},
				})

			const baseUrl = `${process.env.LINK_URL}`
			const linkValidacao = `${baseUrl}/verify-report/${notificacaoAtualizada.assinaturaDigital}`
			const qrCodeDataUri = await QRCode.toDataURL(linkValidacao)

			const pdfBuffer = await renderToBuffer(
				<AnexoEntregaIncompletaTemplate
					data={{
						...contratoDetails.data,
						empresaEndereco,
						empresaRepresentanteNome,
						empresaRepresentanteCpf,
						gestorPortaria: fiscalContrato.portaria || '',
					}}
					notificacao={notificacaoAtualizada}
					qrCodeUrl={qrCodeDataUri}
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
					fileName: `Notificacao_Entrega_Incompleta_${contratoDetails.data.contratoNumero}.pdf`,
				},
			}
		} catch (error) {
			console.error(
				'Erro no processo de Notificação de Entrega Incompleta:',
				error,
			)
			return { success: false, error: 'Erro interno no servidor.' }
		}
	},
	{ module: 'fiscal-notificacoes', log: 'NOTIFICACAO_ENTREGA_INCOMPLETA' }
)
