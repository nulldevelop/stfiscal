import fs from 'node:fs'
import path from 'node:path'
import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type React from 'react'
import type {
	NotificacaoDesconformidade,
	NotificacaoEntrega,
	NotificacaoEntregaIncompleta,
	NotificacaoFiscalTrabalhista,
	Notificacoes,
} from '@/generated/prisma/client'

const logoPath = path.join(process.cwd(), 'public/imgs', 'LogoHorizontal.png')
const logoImage = fs.existsSync(logoPath)
	? fs.readFileSync(logoPath).toString('base64')
	: ''
const logoDataUri = `data:image/png;base64,${logoImage}`

const styles = StyleSheet.create({
	page: {
		paddingTop: 120,
		paddingBottom: 100,
		paddingHorizontal: 70,
		fontFamily: 'Helvetica',
		fontSize: 10,
		lineHeight: 1.5,
	},
	header: {
		position: 'absolute',
		top: 30,
		left: 70,
		right: 70,
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: 20,
	},
	logo: { width: 100, marginBottom: 5 },
	headerLine: {
		width: '100%',
		height: 1,
		backgroundColor: 'black',
		marginBottom: 5,
		marginTop: 5,
	},
	title: {
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center',
		textTransform: 'uppercase',
		marginTop: 5,
	},
	footerInfo: {
		position: 'absolute',
		bottom: 30,
		left: 70,
		right: 70,
		textAlign: 'center',
		fontSize: 8,
		color: 'grey',
		lineHeight: 1.2,
	},
	signatureContainer: { marginTop: 40, alignItems: 'center' },
	signatureLine: {
		width: 250,
		borderBottomWidth: 1,
		borderBottomColor: 'black',
		marginBottom: 5,
	},
	signatureText: { textAlign: 'center', fontSize: 10 },
	sidebar: {
		position: 'absolute',
		top: 120,
		right: -115,
		width: 300,
		height: 475,
		alignItems: 'center',
		justifyContent: 'space-evenly',
	},
	bold: { fontWeight: 'bold' },
})

interface PdfLayoutProps {
	children: React.ReactNode
	title: string
	subTitle?: string
	gestorNome: string
	notificacao:
		| Notificacoes
		| NotificacaoEntrega
		| NotificacaoEntregaIncompleta
		| NotificacaoFiscalTrabalhista
		| NotificacaoDesconformidade
	qrCodeUrl?: string
}

export const NotificationPdfLayout = ({
	children,
	title,
	subTitle,
	gestorNome,
	notificacao,
	qrCodeUrl,
}: PdfLayoutProps) => {
	const siteUrl = `${process.env.LINK_URL}`

	const dataEnvioFormatada = format(
		new Date(notificacao.dataEnvio),
		"dd/MM/yyyy 'às' HH:mm",
		{ locale: ptBR },
	)
	const nomeAssinatura = gestorNome || 'Sistema'

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header} fixed>
					<Image src={logoDataUri} style={styles.logo} />
					<View style={styles.headerLine} />
					<Text style={styles.title}>{title}</Text>
					{subTitle && (
						<Text style={{ ...styles.title, fontSize: 8 }}>{subTitle}</Text>
					)}
				</View>

				{children}

				<View style={styles.signatureContainer}>
					<View style={styles.signatureLine} />
					<Text style={{ ...styles.signatureText, ...styles.bold }}>
						{(gestorNome || 'NOME DO GESTOR').toUpperCase()}
					</Text>
					<Text style={styles.signatureText}>Fiscal de Contratos</Text>
				</View>

				<View fixed style={styles.sidebar}>
					<View style={{ transform: 'rotate(-90deg)' }}>
						<Text wrap={false} style={{ fontSize: 6, textAlign: 'center' }}>
							Este documento foi assinado em {dataEnvioFormatada} por:
							{nomeAssinatura.toUpperCase()}
						</Text>

						<Text
							wrap={false}
							style={{
								fontSize: 6,
								textAlign: 'left',
								color: 'blue',
							}}
						>
							Para conferência acesse o link {siteUrl}/verify-report/
							{notificacao.assinaturaDigital} ou QR Code.
						</Text>
					</View>

					{qrCodeUrl && (
						<Image
							src={qrCodeUrl}
							style={{ width: 40, height: 40, marginTop: 10 }}
						/>
					)}
				</View>

				<View fixed style={styles.footerInfo}>
					<Text>
						Praça Bento Munhoz da Rocha Neto, 30 - Centro - Campina Grande do
						Sul - PR
					</Text>
					<Text>CEP: 83434-820 - Telefone: (41) 3162-7000</Text>
					<Text>www.campinagrandedosul.pr.gov.br</Text>
				</View>
			</Page>
		</Document>
	)
}
