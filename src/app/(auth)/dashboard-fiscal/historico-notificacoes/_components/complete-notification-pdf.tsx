import {
	Document,
	Page,
	StyleSheet,
	Text,
	View,
	Image,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import path from 'node:path'
import fs from 'node:fs'
import type { NotificationWithHistorico } from '../_data-access/get-notifications-by-empresa'

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: 'Helvetica',
		fontSize: 10,
		lineHeight: 1.5,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottom: 1,
		borderBottomColor: '#eee',
		paddingBottom: 20,
		marginBottom: 20,
	},
	logo: {
		width: 120,
	},
	titleContainer: {
		alignItems: 'flex-end',
	},
	reportTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
	},
	reportSubtitle: {
		fontSize: 10,
		color: '#666',
		marginTop: 4,
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		backgroundColor: '#f5f5f5',
		padding: 5,
		marginBottom: 10,
		borderLeft: 4,
		borderLeftColor: '#000',
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 10,
	},
	gridItem: {
		width: '50%',
		marginBottom: 8,
	},
	label: {
		fontSize: 8,
		color: '#888',
		textTransform: 'uppercase',
		marginBottom: 2,
	},
	value: {
		fontSize: 10,
		fontWeight: 'medium',
	},
	historyItem: {
		borderBottom: 0.5,
		borderBottomColor: '#eee',
		paddingVertical: 10,
	},
	historyHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	historyTitle: {
		fontSize: 10,
		fontWeight: 'bold',
	},
	historyMeta: {
		fontSize: 8,
		color: '#888',
	},
	historyDesc: {
		fontSize: 9,
		color: '#444',
		marginTop: 4,
	},
	footer: {
		position: 'absolute',
		bottom: 30,
		left: 40,
		right: 40,
		borderTop: 0.5,
		borderTopColor: '#eee',
		paddingTop: 10,
		textAlign: 'center',
		fontSize: 8,
		color: '#aaa',
	},
	attachmentImage: {
		width: '100%',
		maxHeight: 350,
		marginTop: 10,
		marginBottom: 5,
		objectFit: 'contain',
		borderRadius: 4,
	},
})

interface CompleteNotificationPdfProps {
	notification: NotificationWithHistorico
	historicos: any[]
}

const logoPath = path.join(process.cwd(), 'public/imgs', 'LogoHorizontal.png')
const logoImage = fs.existsSync(logoPath)
	? fs.readFileSync(logoPath).toString('base64')
	: ''
const logoDataUri = logoImage ? `data:image/png;base64,${logoImage}` : ''

export const CompleteNotificationPdf = ({
	notification,
	historicos,
}: CompleteNotificationPdfProps) => {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					{logoDataUri ? (
						<Image src={logoDataUri} style={styles.logo} />
					) : (
						<Text style={{ fontWeight: 'bold' }}>ST - Fiscalização e Relatórios</Text>
					)}
					<View style={styles.titleContainer}>
						<Text style={styles.reportTitle}>Relatório Completo</Text>
						<Text style={styles.reportSubtitle}>Histórico de Notificação</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Dados da Notificação</Text>
					<View style={styles.grid}>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Título</Text>
							<Text style={styles.value}>{notification.title}</Text>
						</View>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Nº Contrato</Text>
							<Text style={styles.value}>{notification.contratoNumero}</Text>
						</View>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Tipo</Text>
							<Text style={styles.value}>{notification.tipo}</Text>
						</View>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Data de Envio</Text>
							<Text style={styles.value}>
								{format(new Date(notification.dataEnvio), 'dd/MM/yyyy HH:mm', {
									locale: ptBR,
								})}
							</Text>
						</View>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Fiscal Responsável</Text>
							<Text style={styles.value}>
								{notification.fiscalNome || 'Não informado'}
							</Text>
						</View>
						<View style={styles.gridItem}>
							<Text style={styles.label}>Assinatura Digital</Text>
							<Text style={[styles.value, { fontSize: 7, fontFamily: 'Courier' }]}>
								{notification.assinaturaDigital}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Acompanhamento e Histórico</Text>
					{historicos.length > 0 ? (
						historicos.map((h, i) => (
							<View key={h.id || i} style={styles.historyItem} wrap={false}>
								<View style={styles.historyHeader}>
									<Text style={styles.historyTitle}>
										{h.titulo}
										<Text style={{ color: '#888', fontWeight: 'normal', fontSize: 8 }}>
											{' '}
											• {h.tipo}
										</Text>
									</Text>
									<Text style={styles.historyMeta}>
										Data do Registro: {format(new Date(h.dataOcorrencia || h.createdAt), 'dd/MM/yyyy', {
											locale: ptBR,
										})}
									</Text>
								</View>
								<Text style={styles.historyMeta}>
									Por: {h.user?.name || 'Sistema'} • No sistema em: {format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm', {
										locale: ptBR,
									})}
								</Text>
								{h.descricao && <Text style={styles.historyDesc}>{h.descricao}</Text>}
								
								{/* Renderizar imagens processadas (seja de anexo imagem ou PDF convertido) */}
								{h.processedImages && h.processedImages.length > 0 && (
									<View style={{ marginTop: 10 }}>
										{h.processedImages.map((imgUri: string, imgIdx: number) => (
											<Image 
												key={`${h.id}-img-${imgIdx}`} 
												src={imgUri} 
												style={styles.attachmentImage} 
											/>
										))}
									</View>
								)}

								{h.anexoNome && !h.processedImages && (
									<Text style={[styles.historyMeta, { marginTop: 4, color: '#0066cc' }]}>
										Anexo: {h.anexoNome} (Arquivo não suportado para exibição direta)
									</Text>
								)}
							</View>
						))
					) : (
						<Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
							Nenhum registro de histórico encontrado.
						</Text>
					)}
				</View>

				<Text style={styles.footer} fixed>
					Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')} - ST - Fiscalização e Relatórios
				</Text>
			</Page>
		</Document>
	)
}
