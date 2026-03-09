import { ShieldCheck, ShieldX } from 'lucide-react'
import { prisma } from '@/lib/prisma'

import { formatData } from '@/utils/formatData'

interface DocumentData {
	protocolo: string | number
	createdAt: Date
	userName: string | null
	type: 'Bens e Serviços' | 'Transporte' | 'Obras' | 'Notificação'
}

const VerificationError = ({
	title,
	message,
	errorDetail,
}: {
	title: string
	message: string
	errorDetail: string | null
}) => (
	<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
		<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
			<ShieldX className="mx-auto h-16 w-16 text-red-600" />
			<h1 className="mt-4 text-2xl font-bold text-gray-800">{title}</h1>
			<p className="mt-2 text-gray-600">
				{message}
				{errorDetail && (
					<span className="block mt-2 text-red-500">
						Detalhe: {errorDetail}
					</span>
				)}
			</p>
		</div>
	</div>
)

type BensServicosResult = {
	protocolo: string | number
	createdAt: Date
	fiscalDoContrato: { nome: string | null } | null
}

type ReportResult = {
	protocolo: string | number
	createdAt: Date
	fiscalDoContrato: { user: { name: string | null } } | null
}

type NotificationResult = {
	assinaturaDigital: string
	createdAt: Date
	fiscalDoContrato: { user: { name: string | null } } | null
}

type SearchResult =
	| BensServicosResult
	| ReportResult
	| NotificationResult
	| null

export default async function VerificationPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	if (typeof id !== 'string' || id.length === 0) {
		return (
			<VerificationError
				title="ID de Documento Inválido"
				message="O identificador de documento fornecido na URL é inválido ou está vazio."
				errorDetail={null}
			/>
		)
	}

	let document: DocumentData | null = null
	let hasError = false

	try {
		const commonSelect = {
			fiscalDoContrato: {
				select: {
					user: { select: { name: true } },
				},
			},
		}

		const searchPromises = [
			prisma.bensEServicosReport.findUnique({
				where: { assinaturaDigital: id },
				select: {
					protocolo: true,
					createdAt: true,
					fiscalDoContrato: { select: { nome: true } },
				},
			}),
			prisma.transporteReport.findUnique({
				where: { assinaturaDigital: id },
				select: { protocolo: true, createdAt: true, ...commonSelect },
			}),
			prisma.obrasReport.findUnique({
				where: { assinaturaDigital: id },
				select: { protocolo: true, createdAt: true, ...commonSelect },
			}),
			prisma.notificacoes.findUnique({
				where: { assinaturaDigital: id },
				select: { createdAt: true, assinaturaDigital: true, ...commonSelect },
			}),
			prisma.notificacaoDesconformidade.findUnique({
				where: { assinaturaDigital: id },
				select: { createdAt: true, assinaturaDigital: true, ...commonSelect },
			}),
			prisma.notificacaoEntrega.findUnique({
				where: { assinaturaDigital: id },
				select: { createdAt: true, assinaturaDigital: true, ...commonSelect },
			}),
			prisma.notificacaoEntregaIncompleta.findUnique({
				where: { assinaturaDigital: id },
				select: { createdAt: true, assinaturaDigital: true, ...commonSelect },
			}),
			prisma.notificacaoFiscalTrabalhista.findUnique({
				where: { assinaturaDigital: id },
				select: { createdAt: true, assinaturaDigital: true, ...commonSelect },
			}),
		]

		const results = await Promise.allSettled(searchPromises)

		for (const [index, result] of results.entries()) {
			if (result.status === 'fulfilled' && result.value) {
				const item = result.value as SearchResult
				if (!item) continue

				let type: DocumentData['type']
				let userName: string | null = 'Não Informado'
				let protocolo: string | number

				switch (index) {
					case 0: {
						type = 'Bens e Serviços'
						const bsItem = item as BensServicosResult
						userName = bsItem.fiscalDoContrato?.nome || 'Não Informado'
						protocolo = bsItem.protocolo
						break
					}
					case 1:
					case 2: {
						type = index === 1 ? 'Transporte' : 'Obras'
						const rItem = item as ReportResult
						userName = rItem.fiscalDoContrato?.user?.name || 'Não Informado'
						protocolo = rItem.protocolo
						break
					}
					default: {
						type = 'Notificação'
						const nItem = item as NotificationResult
						userName = nItem.fiscalDoContrato?.user?.name || 'Não Informado'
						protocolo = nItem.assinaturaDigital
						break
					}
				}

				document = { protocolo, createdAt: item.createdAt, userName, type }
				break
			}

			if (result.status === 'rejected') {
				console.error(`Falha na consulta ${index}:`, result.reason)
				hasError = true
			}
		}
	} catch (e) {
		console.error('Erro inesperado durante as buscas:', e)
		hasError = true
	}

	if (hasError) {
		return (
			<VerificationError
				title="Erro na Busca de Dados"
				message="Ocorreu um erro inesperado ao tentar verificar o documento."
				errorDetail="Verifique o console do servidor para detalhes."
			/>
		)
	}

	if (!document) {
		return (
			<VerificationError
				title="Documento Não Encontrado"
				message="Não foi possível encontrar um documento com o ID fornecido. Verifique o QR code ou o link e tente novamente."
				errorDetail={null}
			/>
		)
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
			<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
				<ShieldCheck className="mx-auto h-16 w-16 text-green-600" />
				<h1 className="mt-4 text-2xl font-bold text-gray-800">
					Documento Autêntico ({document.type})
				</h1>
				<p className="mt-2 text-gray-600">
					Este documento foi verificado e consta em nossos registros.
				</p>
				<div className="mt-6 space-y-2 border-t pt-6 text-left">
					<div className="flex justify-between">
						<span className="font-semibold text-gray-700">Tipo:</span>
						<span className="text-gray-900">{document.type}</span>
					</div>
					<div className="flex justify-between">
						<span className="font-semibold text-gray-700">Protocolo:</span>
						<span className="text-gray-900">{document.protocolo}</span>
					</div>
					<div className="flex justify-between">
						<span className="font-semibold text-gray-700">
							Data de Criação:
						</span>
						<span className="text-gray-900">
							{formatData(document.createdAt)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="font-semibold text-gray-700">Gerado por:</span>
						<span className="text-gray-900">{document.userName}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
