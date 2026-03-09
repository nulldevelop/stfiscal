import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { FormConfig, TerceirizacaoReport } from '@/generated/prisma/client'
import { formatData } from '@/utils/formatData'
import {
	CheckboxOptions,
	DetailItem,
	LargeTextItem,
	SectionTitle,
	styles,
} from '@/utils/PdfSharedComponents'

type ReportData = TerceirizacaoReport & {
	user: { name?: string | null }
	type: string
	dataInicio: Date
	dataFim: Date
	qrCodeUrl: string
	protocolo: string
	brasaoBase64: string
	configs?: FormConfig[]
	organizationName: string
}

const TerceirizacaoLayout = ({ report }: { report: ReportData }) => {
	const dynamicResponses = report.dynamicData
		? JSON.parse(report.dynamicData)
		: {}
	const activeConfigs = report.configs?.filter((c) => c.isActive) || []
	const configMap = activeConfigs.reduce(
		(acc: Record<string, FormConfig>, config) => {
			acc[config.fieldKey] = config
			return acc
		},
		{},
	)

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
					report.dataInicio
						? `${formatData(report.dataInicio)} a ${formatData(report.dataFim)}`
						: null
				}
			/>
			<DetailItem
				label={configMap.secretariaNome?.label || 'Lotação'}
				value={report.secretariaNome}
			/>
			<DetailItem label="Objeto" value={report.objeto} />

			{sortedSectionNames.map((sectionName) => {
				const isSection1 = sectionName.match(/^1\s*[-–]/)
				const sectionNumber = sectionName.split(' ')[0] || '+'
				const sectionTitle =
					sectionName.includes('–') || sectionName.includes('-')
						? sectionName
								.substring(
									Math.max(sectionName.indexOf('–'), sectionName.indexOf('-')) +
										1,
								)
								.trim()
						: sectionName

				return (
					<View key={sectionName} wrap={false} style={{ marginTop: 10 }}>
						{!isSection1 && (
							<SectionTitle number={sectionNumber} title={sectionTitle} />
						)}

						{sections[sectionName].map((field) => {
							if (
								isSection1 &&
								[
									'secretariaNome',
									'periodoAnalisadoInicio',
									'periodoAnalisadoFim',
								].includes(field.fieldKey)
							)
								return null

							const value =
								(report as any)[field.fieldKey] !== undefined
									? (report as any)[field.fieldKey]
									: dynamicResponses[field.fieldKey]
							const obsValue =
								(report as any)[`${field.fieldKey}Obs`] !== undefined
									? (report as any)[`${field.fieldKey}Obs`]
									: dynamicResponses[`${field.fieldKey}Obs`]
							let displayValue = value
							if (field.type === 'DATE' && value)
								displayValue = formatData(value)

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
								<DetailItem
									key={field.id}
									label={field.label}
									value={displayValue}
								/>
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

export function ReportPdf({ report, siteUrl }: ReportPdfProps) {
	const verificationUrl = `${siteUrl}/verify-report/${report.assinaturaDigital}`

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View fixed style={styles.header}>
					<Image src={report.brasaoBase64} style={styles.brasao} />
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>
							{report.organizationName} - ST - Fiscalização e Relatórios
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

				<View>
					<Text style={styles.pageTitle}>
						Relatório de Fiscalização - Terceirização
					</Text>
					<View style={{ marginBottom: 10 }}>
						<DetailItem label="Tipo de Relatório" value={report.type} />
						<DetailItem label="Criado por" value={report.user?.name} />
						<DetailItem
							label="Data de Criação"
							value={formatData(report.createdAt)}
						/>
					</View>
					<TerceirizacaoLayout report={report} />
				</View>

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
							por: {report.user.name}.
						</Text>
						<Text
							wrap={false}
							style={{ fontSize: 5, textAlign: 'left', color: 'blue' }}
						>
							Para conferência acesse o link {verificationUrl} ou QR Code.
						</Text>
					</View>
					{report.qrCodeUrl && (
						<Image src={report.qrCodeUrl} style={{ width: 30, height: 30 }} />
					)}
				</View>

				<Text
					fixed
					render={({ pageNumber, totalPages }) =>
						`Página ${pageNumber} de ${totalPages} | Assinado por: ${report.user?.name} | ST - Fiscalização e Relatórios`
					}
					style={styles.footer}
				/>
			</Page>
		</Document>
	)
}
