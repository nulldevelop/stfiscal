import fs from 'node:fs'
import path from 'node:path'
import {
	Document,
	Image,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import { format, parseISO } from 'date-fns'

const PRIMARY_COLOR = '#000000' // Black
const SECONDARY_COLOR = '#475569' // Slate 600
const ACCENT_COLOR = '#10b981' // Emerald 500
const BORDER_COLOR = '#e2e8f0' // Slate 200
const BG_COLOR = '#f0fdf4' // Emerald 50

const MODALIDADE_MAP: Record<string, number> = {
	CONVITE: 1,
	TOMADA_DE_PRECO: 2,
	CONCORRENCIA: 3,
	CONCURSO: 4,
	LEILAO: 5,
	PREGAO: 6,
	DISPENSA: 7,
	INEXIGIBILIDADE: 9,
	RDC: 10,
	COMPRA_DIRETA: 13,
	LEI_13303: 14,
	CHAMAMENTO: 1001,
}

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: 'Helvetica',
		fontSize: 9,
		color: PRIMARY_COLOR,
		lineHeight: 1.5,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
		borderBottom: 2,
		borderBottomColor: ACCENT_COLOR,
		paddingBottom: 15,
	},
	logo: {
		width: 140,
	},
	headerInfo: {
		textAlign: 'right',
	},
	reportTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: PRIMARY_COLOR,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	reportDate: {
		fontSize: 8,
		color: SECONDARY_COLOR,
		marginTop: 2,
	},
	section: {
		marginBottom: 25,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: BG_COLOR,
		padding: '6 10',
		marginBottom: 12,
		borderRadius: 4,
		borderLeft: 3,
		borderLeftColor: ACCENT_COLOR,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: PRIMARY_COLOR,
		textTransform: 'uppercase',
	},
	infoGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingHorizontal: 10,
	},
	infoItem: {
		width: '33.33%',
		marginBottom: 12,
	},
	infoLabel: {
		fontSize: 7,
		color: SECONDARY_COLOR,
		textTransform: 'uppercase',
		marginBottom: 2,
		fontWeight: 'bold',
	},
	infoValue: {
		fontSize: 10,
		color: PRIMARY_COLOR,
	},
	table: {
		width: 'auto',
		borderRadius: 4,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: BORDER_COLOR,
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: PRIMARY_COLOR,
		paddingVertical: 8,
		paddingHorizontal: 5,
	},
	tableHeaderText: {
		color: '#ffffff',
		fontSize: 7,
		fontWeight: 'bold',
		textTransform: 'uppercase',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: BORDER_COLOR,
		paddingVertical: 8,
		paddingHorizontal: 5,
		backgroundColor: '#ffffff',
	},
	alternateRow: {
		backgroundColor: BG_COLOR,
	},
	cellText: {
		fontSize: 8,
		color: PRIMARY_COLOR,
	},
	boldCellText: {
		fontSize: 8,
		fontWeight: 'bold',
		color: PRIMARY_COLOR,
	},
	smallCellText: {
		fontSize: 7,
		color: SECONDARY_COLOR,
	},
	// Column Configs
	colContrato: { width: '18%' },
	colLicitacao: { width: '15%' },
	colContratada: { width: '32%' },
	colVigencia: { width: '35%' },

	footer: {
		position: 'absolute',
		bottom: 30,
		left: 40,
		right: 40,
		paddingTop: 15,
		borderTopWidth: 1,
		borderTopColor: BORDER_COLOR,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	footerText: {
		fontSize: 7,
		color: SECONDARY_COLOR,
	},
	pageNumber: {
		fontSize: 7,
		color: SECONDARY_COLOR,
	},
	statusBadge: {
		padding: '2 6',
		borderRadius: 10,
		fontSize: 7,
		backgroundColor: '#dcfce7',
		color: '#166534',
		textAlign: 'center',
		width: 40,
	},
})

interface FiscalContractsPdfProps {
	fiscal: {
		name: string
		email: string
		cpf: string | null
		matricula: string | null
		cargo: string | null
		contratos: {
			id: string
			numero: number
			idOxy: string | null
			displayContrato: string
			displayLicitacao: string
			contratado: string
			dataInicio: Date
			dataFim: Date
			fiscalInicio: string | null
			fiscalFim: string | null
			licitacaoAno: number | null
			licitacaoNumero: number | null
			licitacaoModalidade: string | null
		}[]
	}
}

const formatDate = (date: string | Date | null | undefined) => {
	if (!date) return '-'
	try {
		const d = typeof date === 'string' ? parseISO(date) : date
		if (Number.isNaN(d.getTime())) return date.toString()
		return format(d, 'dd/MM/yyyy')
	} catch {
		return '-'
	}
}

const logoPath = path.join(process.cwd(), 'public/imgs', 'LogoHorizontal.png')
const logoImage = fs.existsSync(logoPath)
	? fs.readFileSync(logoPath).toString('base64')
	: ''
const logoDataUri = logoImage ? `data:image/png;base64,${logoImage}` : ''

export const FiscalContractsPdf = ({ fiscal }: FiscalContractsPdfProps) => {
	return (
		<Document
			author="SIRA System"
			title={`Relatório de Contratos - ${fiscal.name}`}
		>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					{logoDataUri ? (
						<Image src={logoDataUri} style={styles.logo} />
					) : (
						<Text style={{ fontWeight: 'bold', fontSize: 16 }}>
							SIRA SYSTEM
						</Text>
					)}
					<View style={styles.headerInfo}>
						<Text style={styles.reportTitle}>Relatório de Contratos</Text>
						<Text style={styles.reportDate}>
							Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
						</Text>
					</View>
				</View>

				{/* Fiscal Profile Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Identificação do Fiscal</Text>
					</View>
					<View style={styles.infoGrid}>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Nome Completo</Text>
							<Text style={styles.infoValue}>{fiscal.name}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>E-mail</Text>
							<Text style={styles.infoValue}>{fiscal.email.toLowerCase()}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Matrícula</Text>
							<Text style={styles.infoValue}>{fiscal.matricula || '-'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>CPF</Text>
							<Text style={styles.infoValue}>{fiscal.cpf || '-'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Cargo / Função</Text>
							<Text style={styles.infoValue}>{fiscal.cargo || '-'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Total de Contratos</Text>
							<Text style={[styles.infoValue, { fontWeight: 'bold' }]}>
								{fiscal.contratos.length}
							</Text>
						</View>
					</View>
				</View>

				{/* Contracts Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Contratos sob Fiscalização</Text>
					</View>

					{fiscal.contratos.length > 0 ? (
						<View style={styles.table}>
							{/* Table Header */}
							<View style={styles.tableHeader}>
								<View style={styles.colContrato}>
									<Text style={styles.tableHeaderText}>Contrato</Text>
								</View>
								<View style={styles.colLicitacao}>
									<Text style={styles.tableHeaderText}>Licitação</Text>
								</View>
								<View style={styles.colContratada}>
									<Text style={styles.tableHeaderText}>Contratada</Text>
								</View>
								<View style={styles.colVigencia}>
									<Text style={styles.tableHeaderText}>
										Vigência (Contrato / Fiscal)
									</Text>
								</View>
							</View>

							{/* Table Body */}
							{fiscal.contratos.map((contrato, index) => {
								const tipoLicitacao = MODALIDADE_MAP[contrato.licitacaoModalidade || ''] || 6
								const licitacaoUrl = contrato.licitacaoNumero 
									? `https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/licitacoes/detalhes?entidade=1&exercicio=${contrato.licitacaoAno}&tipoLicitacao=${tipoLicitacao}&licitacao=${contrato.licitacaoNumero}`
									: null

								return (
									<View
										key={contrato.id}
										style={[
											styles.tableRow,
											index % 2 === 1 ? styles.alternateRow : {},
										]}
										wrap={false}
									>
										<View style={styles.colContrato}>
											{contrato.idOxy ? (
												<Link
													src={`https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/contratos/detalhes?id=${contrato.idOxy}`}
													style={[
														styles.boldCellText,
														{ color: ACCENT_COLOR, textDecoration: 'underline' },
													]}
												>
													{contrato.displayContrato}
												</Link>
											) : (
												<Text style={styles.boldCellText}>
													{contrato.displayContrato}
												</Text>
											)}
										</View>
										<View style={styles.colLicitacao}>
											{licitacaoUrl ? (
												<Link
													src={licitacaoUrl}
													style={[
														styles.cellText,
														{ color: ACCENT_COLOR, textDecoration: 'underline' },
													]}
												>
													{contrato.displayLicitacao}
												</Link>
											) : (
												<Text style={styles.cellText}>
													{contrato.displayLicitacao}
												</Text>
											)}
										</View>
										<View style={styles.colContratada}>
											<Text style={styles.cellText}>{contrato.contratado}</Text>
										</View>
										<View style={styles.colVigencia}>
											<View>
												<Text style={styles.cellText}>
													C: {formatDate(contrato.dataInicio)} —{' '}
													{formatDate(contrato.dataFim)}
												</Text>
												<Text style={styles.smallCellText}>
													F: {formatDate(contrato.fiscalInicio)} —{' '}
													{formatDate(contrato.fiscalFim)}
												</Text>
											</View>
										</View>
									</View>
								)
							})}
						</View>
					) : (
						<View
							style={{
								padding: 20,
								borderWidth: 1,
								borderColor: BORDER_COLOR,
								borderStyle: 'dashed',
								alignItems: 'center',
							}}
						>
							<Text style={{ color: SECONDARY_COLOR }}>
								Nenhum contrato vinculado a este fiscal.
							</Text>
						</View>
					)}
				</View>

				{/* Footer */}
				<View style={styles.footer} fixed>
					<Text style={styles.footerText}>
						SIRA System - Sistema de Inteligência em Relatórios e Auditoria
					</Text>
					<Text
						style={styles.pageNumber}
						render={({ pageNumber, totalPages }) =>
							`Página ${pageNumber} de ${totalPages}`
						}
					/>
				</View>
			</Page>
		</Document>
	)
}
