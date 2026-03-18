import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import type { FiscalPrincipalReport, FormConfig } from '@/generated/prisma/client'
import { formatData } from '@/utils/formatData'
import {
	CheckboxOptions,
	DetailItem,
	LargeTextItem,
	SectionTitle,
	styles,
} from '@/utils/PdfSharedComponents'

type AtoDeFormato = {
	num: number
	atoPraticado: string
	data: string
	identificouIrregularidade: string
}
type MedidaAdotada = {
	num: number
	irregularidade: string
	medidasAdotadas: string
	data: string
	problemaResolvido: string
}

type ReportData = Omit<
	FiscalPrincipalReport,
	'atosDeFormato' | 'medidasAdotadas'
> & {
	user: { name?: string | null }
	type: string
	dataInicio?: Date | null
	dataFim?: Date | null
	secretariaNome: string
	brasaoBase64: string
	qrCodeUrl: string
	protocolo: string
	atosDeFormato: AtoDeFormato[]
	medidasAdotadas: MedidaAdotada[]
	organizationName: string
	organizationCidade?: string | null
	configs?: FormConfig[]
}

const tableStyles = StyleSheet.create({
	table: {
		width: '100%',
		marginTop: 6,
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#F3F4F6',
		borderWidth: 1,
		borderColor: '#D1D5DB',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
		minHeight: 20,
	},
	cellNum: {
		width: '8%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellAto: {
		width: '50%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellData: {
		width: '21%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellIrregSn: {
		width: '21%',
		padding: 4,
		fontSize: 8,
	},
	cellIrreg: {
		width: '30%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellMedida: {
		width: '35%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellDataMedida: {
		width: '15%',
		padding: 4,
		fontSize: 8,
		borderRightWidth: 1,
		borderColor: '#D1D5DB',
	},
	cellResolvido: {
		width: '12%',
		padding: 4,
		fontSize: 8,
	},
	cellHeaderText: {
		fontFamily: 'Helvetica-Bold',
		fontSize: 8,
	},
})

const FiscalPrincipalLayout = ({ report }: { report: ReportData }) => {
	// 1. Processa dados dinâmicos se existirem
	const dynamicResponses = report.dynamicData
		? JSON.parse(report.dynamicData as string)
		: {}

	// 2. Agrupa todos os campos (originais e custom) por seção, apenas os ativos
	const activeConfigs = report.configs?.filter((c) => c.isActive) || []

	// Mapeia os campos para facilitar o acesso aos rótulos personalizados
	const configMap = activeConfigs.reduce(
		(acc: Record<string, FormConfig>, config) => {
			acc[config.fieldKey] = config
			return acc
		},
		{},
	)

	// Agrupamento por seção
	const sections = activeConfigs.reduce(
		(acc: Record<string, FormConfig[]>, config) => {
			const sectionName = config.section || 'Outros'
			if (!acc[sectionName]) acc[sectionName] = []
			acc[sectionName].push(config)
			return acc
		},
		{},
	)

	// Ordena as seções pelo número inicial (ex: "2 - ...", "10 - ...")
	const sortedSectionNames = Object.keys(sections).sort((a, b) => {
		const numA = Number.parseInt(a.split(/[\s\-–]/)[0]) || 0
		const numB = Number.parseInt(b.split(/[\s\-–]/)[0]) || 0
		return numA - numB
	})

	return (
		<View>
			{/* SEÇÃO 1 - SEMPRE FIXA (com labels do config se existirem) */}
			<SectionTitle number="1" title="IDENTIFICAÇÃO DO CONTRATO" />
			<DetailItem
				label="Licitação n.º"
				value={report.licitacaoModalidadeNumero}
			/>
			<DetailItem label="Contrato n.º" value={report.contratoNumero} />
			<DetailItem label="Contratada" value={report.contratada} />
			<DetailItem
				label="Período analisado"
				value={
					report.periodoAnalisadoInicio
						? `${formatData(report.periodoAnalisadoInicio)} a ${formatData(
								report.periodoAnalisadoFim,
							)}`
						: null
				}
			/>
			<DetailItem
				label="Vigência do Contrato"
				value={
					report.dataInicio && report.dataFim
						? `${formatData(report.dataInicio)} a ${formatData(report.dataFim)}`
						: null
				}
			/>
			<DetailItem
				label={configMap.secretariaNome?.label || 'Lotação'}
				value={report.secretariaNome}
			/>
			<DetailItem label="Objeto" value={report.objeto} />

			{/* SEÇÃO 2 – ATOS DE FISCALIZAÇÃO */}
			<View style={{ marginTop: 12 }}>
				<SectionTitle number="2" title="ATOS DE FISCALIZAÇÃO" />
				<View style={tableStyles.table}>
					<View style={tableStyles.tableHeader}>
						<Text style={[tableStyles.cellNum, tableStyles.cellHeaderText]}>
							Nº
						</Text>
						<Text style={[tableStyles.cellAto, tableStyles.cellHeaderText]}>
							Ato praticado
						</Text>
						<Text style={[tableStyles.cellData, tableStyles.cellHeaderText]}>
							Data
						</Text>
						<Text style={[tableStyles.cellIrregSn, tableStyles.cellHeaderText]}>
							Irregularidade?
						</Text>
					</View>
					{report.atosDeFormato.map((ato) => (
						<View key={ato.num} style={tableStyles.tableRow}>
							<Text style={tableStyles.cellNum}>{ato.num}</Text>
							<Text style={tableStyles.cellAto}>{ato.atoPraticado}</Text>
							<Text style={tableStyles.cellData}>{ato.data}</Text>
							<Text style={tableStyles.cellIrregSn}>
								{ato.identificouIrregularidade}
							</Text>
						</View>
					))}
				</View>
			</View>

			{/* SEÇÃO 3 – MEDIDAS ADOTADAS */}
			<View style={{ marginTop: 12 }} wrap={false}>
				<SectionTitle
					number="3"
					title="MEDIDAS ADOTADAS PARA SOLUÇÃO DE IRREGULARIDADES"
				/>
				<View style={tableStyles.table}>
					<View style={tableStyles.tableHeader}>
						<Text style={[tableStyles.cellNum, tableStyles.cellHeaderText]}>
							Nº
						</Text>
						<Text style={[tableStyles.cellIrreg, tableStyles.cellHeaderText]}>
							Irregularidade Identificada
						</Text>
						<Text style={[tableStyles.cellMedida, tableStyles.cellHeaderText]}>
							Medidas Adotadas
						</Text>
						<Text style={[tableStyles.cellDataMedida, tableStyles.cellHeaderText]}>
							Data
						</Text>
						<Text style={[tableStyles.cellResolvido, tableStyles.cellHeaderText]}>
							Resolvido?
						</Text>
					</View>
					{report.medidasAdotadas.length > 0 ? (
						report.medidasAdotadas.map((m) => (
							<View key={m.num} style={tableStyles.tableRow}>
								<Text style={tableStyles.cellNum}>{m.num}</Text>
								<Text style={tableStyles.cellIrreg}>{m.irregularidade}</Text>
								<Text style={tableStyles.cellMedida}>{m.medidasAdotadas}</Text>
								<Text style={tableStyles.cellDataMedida}>{m.data}</Text>
								<Text style={tableStyles.cellResolvido}>{m.problemaResolvido}</Text>
							</View>
						))
					) : (
						<View style={tableStyles.tableRow}>
							<Text style={[tableStyles.cellNum]}>-</Text>
							<Text style={[tableStyles.cellIrreg]}>
								Nenhuma irregularidade registrada.
							</Text>
							<Text style={[tableStyles.cellMedida]}>-</Text>
							<Text style={[tableStyles.cellDataMedida]}>-</Text>
							<Text style={[tableStyles.cellResolvido]}>-</Text>
						</View>
					)}
				</View>
			</View>

			{/* SEÇÕES DINÂMICAS (4 + ADICIONAIS) */}
			{sortedSectionNames.map((sectionName) => {
				const isSection1To3 = sectionName.match(/^[123]\s*[-–]/)

				const sectionNumber = sectionName.split(' ')[0] || '+'
				const sectionTitle =
					sectionName.includes('–') || sectionName.includes('-')
						? sectionName
								.substring(
									Math.max(sectionName.indexOf('–'), sectionName.indexOf('-')) + 1,
								)
								.trim()
						: sectionName

				return (
					<View key={sectionName} wrap={false} style={{ marginTop: 10 }}>
						{!isSection1To3 && (
							<SectionTitle number={sectionNumber} title={sectionTitle} />
						)}

						{sections[sectionName].map((field) => {
							// Ignora campos que já foram renderizados nas seções fixas
							if (
								(isSection1To3 &&
									(field.fieldKey === 'secretariaNome' ||
										field.fieldKey === 'periodoAnalisadoInicio' ||
										field.fieldKey === 'periodoAnalisadoFim')) ||
								(sectionName.match(/^4\s*[-–]/) && field.fieldKey === 'demaisInformacoes')
							) {
								return null
							}

							const value =
								(report as any)[field.fieldKey] !== undefined
									? (report as any)[field.fieldKey]
									: dynamicResponses[field.fieldKey]

							const obsValue =
								(report as any)[`${field.fieldKey}Obs`] !== undefined
									? (report as any)[`${field.fieldKey}Obs`]
									: dynamicResponses[`${field.fieldKey}Obs`]

							// Formatação de data se necessário
							let displayValue = value
							if (field.type === 'DATE' && value) {
								displayValue = formatData(value)
							}

							if (field.type === 'RADIO') {
								return (
									<CheckboxOptions
										key={field.id}
										obs={obsValue}
										options={JSON.parse(field.options || '["Sim", "Não"]')}
										question={field.label}
										value={displayValue}
									/>
								)
							}

							if (field.type === 'TEXTAREA') {
								return (
									<LargeTextItem
										key={field.id}
										label={field.label}
										value={displayValue}
									/>
								)
							}

							return (
								<DetailItem key={field.id} label={field.label} value={displayValue} />
							)
						})}
					</View>
				)
			})}
		</View>
	)
}

interface ReportPdfProps {
	report: ReportData
	siteUrl: string
}

export function FiscalPrincipalReportPdf({ report, siteUrl }: ReportPdfProps) {
	const verificationUrl = `${siteUrl}/verify-report/${report.assinaturaDigital}`

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Cabeçalho */}
				<View fixed style={styles.header}>
					<Image src={report.brasaoBase64} style={styles.brasao} />
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>
							{report.organizationName} - SIRA
						</Text>
						<Text style={styles.headerSubtitle}>
							{report.secretariaNome?.toLowerCase().startsWith('secretaria')
								? report.secretariaNome
								: `Secretaria de ${report.secretariaNome}`}
						</Text>
						<Text style={styles.headerSubtitle}>
							Protocolo: {report.protocolo}
						</Text>
					</View>
				</View>

				{/* Título */}
				<Text style={styles.pageTitle}>
					Relatório de Fiscalização – Fiscal Tecnico
				</Text>

				{/* Meta */}
				<View style={{ marginBottom: 10 }}>
					<DetailItem label="Tipo de Relatório" value={report.type} />
					<DetailItem label="Criado por" value={report.user?.name} />
					<DetailItem
						label="Data de Criação"
						value={formatData(report.createdAt)}
					/>
				</View>

				<FiscalPrincipalLayout report={report} />

				{/* Assinatura */}
				<View style={{ marginTop: 30 }} wrap={false}>
					<Text style={{ fontSize: 10, textAlign: 'right' }}>
						{report.organizationCidade ?? report.organizationName},{' '}
						{new Date(report.createdAt).toLocaleDateString('pt-BR', {
							day: '2-digit',
							month: 'long',
							year: 'numeric',
						})}
					</Text>
					<View style={{ marginTop: 40, alignItems: 'center' }}>
						<View
							style={{
								borderTopWidth: 1,
								borderColor: '#000',
								width: 200,
								marginBottom: 4,
							}}
						/>
						<Text style={{ fontSize: 10 }}>{report.user?.name}</Text>
						<Text style={{ fontSize: 9, color: '#666' }}>Fiscal Tecnico</Text>
					</View>
				</View>

				{/* QR Code lateral */}
				<View
					fixed
					style={{
						position: 'absolute',
						top: 100,
						right: -115,
						width: 300,
						height: 475,
						alignItems: 'center',
						justifyContent: 'space-evenly',
					}}
				>
					<View style={{ transform: 'rotate(-90deg)' }}>
						<Text wrap={false} style={{ fontSize: 5, textAlign: 'center' }}>
							Este documento foi assinado em{' '}
							{new Date(report.createdAt).toLocaleString('pt-BR', {
								dateStyle: 'short',
								timeStyle: 'short',
							})}{' '}
							por: {report.user?.name}.
						</Text>
						<Text
							wrap={false}
							style={{ fontSize: 5, textAlign: 'left', color: 'blue' }}
						>
							Para conferência acesse {verificationUrl} ou QR Code.
						</Text>
					</View>
					{report.qrCodeUrl && (
						<Image src={report.qrCodeUrl} style={{ width: 30, height: 30 }} />
					)}
				</View>

				{/* Rodapé */}
				<Text
					fixed
					render={({ pageNumber, totalPages }) =>
						`Página ${pageNumber} de ${totalPages} | Assinado por: ${report.user?.name} | SIRA`
					}
					style={styles.footer}
				/>
			</Page>
		</Document>
	)
}
