/** biome-ignore-all lint/suspicious/noArrayIndexKey: dev */

import { Document, Image, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ObrasReport, FormConfig } from '@/generated/prisma/client'
import { formatData } from '@/utils/formatData'
import {
	CheckboxOptions,
	DetailItem,
	LargeTextItem,
	SectionTitle,
	styles,
} from '@/utils/PdfSharedComponents'

const tableStyles = StyleSheet.create({
	table: { width: '100%', marginTop: 6, borderWidth: 1, borderColor: '#D1D5DB' },
	tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderColor: '#D1D5DB' },
	tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#D1D5DB', minHeight: 18 },
	tableCell: { padding: 3, fontSize: 7, borderRightWidth: 1, borderColor: '#D1D5DB' },
	tableCellHeader: { fontFamily: 'Helvetica-Bold', fontSize: 7 },
	tableFooter: { fontSize: 6, color: '#666', marginTop: 2, fontStyle: 'italic' }
})

type ReportData = ObrasReport & {
	user: { name?: string | null }
	type: string
	dataInicio: Date
	dataFim: Date
	qrCodeUrl: string
	protocolo: string
	brasaoBase64: string
	configs?: FormConfig[]
	tabelaAtrasos?: any[]
	tabelaServicos?: any[]
	tabelaMediacoes?: any[]
	tabelaObrigacoes?: any[]
	tabelaAditivos?: any[]
	organizationName: string
}

const ObrasLayout = ({ report }: { report: ReportData }) => {
	const dynamicResponses = report.dynamicData ? JSON.parse(report.dynamicData as string) : {}
	const activeConfigs = report.configs?.filter((c) => c.isActive) || []
	const configMap = activeConfigs.reduce((acc: Record<string, FormConfig>, config) => {
		acc[config.fieldKey] = config
		return acc
	}, {})

	const sections = activeConfigs.reduce((acc: Record<string, FormConfig[]>, config) => {
		const sectionName = config.section || 'Outros'
		if (!acc[sectionName]) acc[sectionName] = []
		acc[sectionName].push(config)
		return acc
	}, {})

	// Ordena as seções pelo número inicial (ex: "2 - ...", "10 - ...")
	const sortedSectionNames = Object.keys(sections).sort((a, b) => {
		const numA = Number.parseInt(a.split(/[\s\-–]/)[0]) || 0
		const numB = Number.parseInt(b.split(/[\s\-–]/)[0]) || 0
		return numA - numB
	})

	return (
		<View>
			<SectionTitle number="1" title="IDENTIFICAÇÃO DO CONTRATO" />
			<DetailItem label="Licitação n.º" value={report.licitacaoModalidadeNumero} />
			<DetailItem label="Contrato n.º" value={report.contratoNumero} />
			<DetailItem label="Contratada" value={report.contratada} />
			<DetailItem label="Período analisado" value={report.periodoAnalisadoInicio ? `${formatData(report.periodoAnalisadoInicio)} a ${formatData(report.periodoAnalisadoFim)}` : null} />
			<DetailItem label="Vigência do Contrato" value={report.dataInicio ? `${formatData(report.dataInicio)} a ${formatData(report.dataFim)}` : null} />
			<DetailItem label={configMap.secretariaNome?.label || 'Lotação'} value={report.secretariaNome} />
			<DetailItem label="Objeto" value={report.objeto} />

			{sortedSectionNames.map((sectionName) => {
				const isSection1 = sectionName.match(/^1\s*[-–]/)
				const sectionNumber = sectionName.split(' ')[0] || '+'
				const sectionTitle = sectionName.includes('–') || sectionName.includes('-')
						? sectionName.substring(Math.max(sectionName.indexOf('–'), sectionName.indexOf('-')) + 1).trim()
						: sectionName

				return (
					<View key={sectionName} wrap={false} style={{ marginTop: 10 }}>
						{!isSection1 && <SectionTitle number={sectionNumber} title={sectionTitle} />}

						{sections[sectionName].map((field) => {
							if (isSection1 && ['secretariaNome', 'periodoAnalisadoInicio', 'periodoAnalisadoFim'].includes(field.fieldKey)) return null

							// Lógica especial para Seção 5: Reordenar Previsto, Executado e Tabela 3
							if (field.fieldKey === 'controleExecutadoPercentual') {
								// Vamos renderizar apenas a Tabela 3 aqui, o campo de texto será renderizado junto com o Previsto
								return (
									<View key={field.id}>
										{/* Tabela 3 - Medições */}
										{report.tabelaMediacoes && report.tabelaMediacoes.length > 0 && (
											<View style={{ marginTop: 8 }}>
												<Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>TABELA 3 – MEDIÇÕES E PAGAMENTOS</Text>
												<View style={tableStyles.table}>
													<View style={[tableStyles.tableHeader, { backgroundColor: '#E5E7EB' }]}>
														<Text style={[tableStyles.tableCell, { width: '45%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>MEDIÇÃO</Text>
														<Text style={[tableStyles.tableCell, { width: '55%', textAlign: 'center', borderRightWidth: 0, fontFamily: 'Helvetica-Bold' }]}>PAGAMENTO</Text>
													</View>
													<View style={tableStyles.tableHeader}>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '10%' }]}>N.º</Text>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%' }]}>PERÍODO</Text>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>VALOR (R$)</Text>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%' }]}>DATA</Text>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>VALOR (R$)</Text>
														<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%', borderRightWidth: 0 }]}>N.º NOTA FISCAL</Text>
													</View>
													{report.tabelaMediacoes.map((item, idx) => (
														<View key={idx} style={tableStyles.tableRow}>
															<Text style={[tableStyles.tableCell, { width: '10%' }]}>{item.numeroMedicao}</Text>
															<Text style={[tableStyles.tableCell, { width: '15%' }]}>{formatData(item.dataMediacao)}</Text>
															<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.valor}</Text>
															<Text style={[tableStyles.tableCell, { width: '15%' }]}>{formatData(item.dataPagamento)}</Text>
															<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.valorPago}</Text>
															<Text style={[tableStyles.tableCell, { width: '20%', borderRightWidth: 0 }]}>{item.numeroRecibo}</Text>
														</View>
													))}
												</View>
											</View>
										)}
									</View>
								)
							}

							if (field.fieldKey === 'controlePrevistoPercentual') {
								// Renderiza o Previsto e logo em seguida o Executado
								const executadoField = sections[sectionName].find(f => f.fieldKey === 'controleExecutadoPercentual')
								const previstoValue = (report as any).controlePrevistoPercentual !== undefined ? (report as any).controlePrevistoPercentual : dynamicResponses.controlePrevistoPercentual
								const executadoValue = (report as any).controleExecutadoPercentual !== undefined ? (report as any).controleExecutadoPercentual : dynamicResponses.controleExecutadoPercentual

								return (
									<View key={field.id}>
										<DetailItem label={field.label} value={previstoValue} />
										{executadoField && (
											<DetailItem label={executadoField.label} value={executadoValue} />
										)}
									</View>
								)
							}

							const value = (report as any)[field.fieldKey] !== undefined ? (report as any)[field.fieldKey] : dynamicResponses[field.fieldKey]
							const obsValue =
								(report as any)[`${field.fieldKey}Obs`] !== undefined
									? (report as any)[`${field.fieldKey}Obs`]
									: dynamicResponses[`${field.fieldKey}Obs`]
							let displayValue = value
							if (field.type === 'DATE' && value) displayValue = formatData(value)

							const element = field.type === 'RADIO' ? (
								<CheckboxOptions key={field.id} obs={obsValue} options={JSON.parse(field.options || '["Sim", "Não"]')} question={field.label} value={displayValue} />
							) : field.type === 'TEXTAREA' ? (
								<LargeTextItem key={field.id} label={field.label} value={displayValue} />
							) : (
								<DetailItem key={field.id} label={field.label} value={displayValue} />
							)

							return (
								<View key={field.id}>
									{element}
									
									{/* Tabela 1 - Atrasos */}
									{field.fieldKey === 'controlePrazoExecucao' && report.tabelaAtrasos && report.tabelaAtrasos.length > 0 && (
										<View style={{ marginTop: 8 }}>
											<Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>TABELA 1 – ETAPAS EM ATRASO</Text>
											<View style={tableStyles.table}>
												<View style={tableStyles.tableHeader}>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '8%' }]}>ITEM</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '22%' }]}>ETAPA/SERVIÇO</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>CAUSAS</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%' }]}>RESPONSÁVEL</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>PROVIDÊNCIAS*</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%', borderRightWidth: 0 }]}>OBSERVAÇÕES**</Text>
												</View>
												{report.tabelaAtrasos.map((item, idx) => (
													<View key={idx} style={tableStyles.tableRow}>
														<Text style={[tableStyles.tableCell, { width: '8%' }]}>{item.item || (idx + 1)}</Text>
														<Text style={[tableStyles.tableCell, { width: '22%' }]}>{item.etapa}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.causa}</Text>
														<Text style={[tableStyles.tableCell, { width: '15%' }]}>{item.reponsavel}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.providencias}</Text>
														<Text style={[tableStyles.tableCell, { width: '15%', borderRightWidth: 0 }]}>{item.observacoes}</Text>
													</View>
												))}
											</View>
											<Text style={tableStyles.tableFooter}>(*) Descrever a providência e o prazo estabelecido para correção. (**) Informar a folha do livro de ocorrência.</Text>
										</View>
									)}

									{/* Tabela 2 - Qualidade */}
									{field.fieldKey === 'controleQualidadeProjeto' && report.tabelaServicos && report.tabelaServicos.length > 0 && (
										<View style={{ marginTop: 8 }}>
											<Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>TABELA 2 – SERVIÇOS OU MATERIAIS DIFERENTES</Text>
											<View style={tableStyles.table}>
												<View style={tableStyles.tableHeader}>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '8%' }]}>ITEM</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '22%' }]}>SERVIÇO</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '30%' }]}>OCORRÊNCIA*</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>PROVIDÊNCIAS**</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%', borderRightWidth: 0 }]}>OBSERVAÇÕES***</Text>
												</View>
												{report.tabelaServicos.map((item, idx) => (
													<View key={idx} style={tableStyles.tableRow}>
														<Text style={[tableStyles.tableCell, { width: '8%' }]}>{item.item || (idx + 1)}</Text>
														<Text style={[tableStyles.tableCell, { width: '22%' }]}>{item.servico}</Text>
														<Text style={[tableStyles.tableCell, { width: '30%' }]}>{item.ocorrencias}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.providencias}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%', borderRightWidth: 0 }]}>{item.observacoes}</Text>
													</View>
												))}
											</View>
											<Text style={tableStyles.tableFooter}>(*) Descrever a ocorrência e o dispositivo desrespeitado. (**) Providência e prazo. (***) Folha do livro de ocorrência.</Text>
										</View>
									)}

									{/* Tabela 4 - Atendimento */}
									{field.fieldKey === 'prepostoAcessivel' && report.tabelaObrigacoes && report.tabelaObrigacoes.length > 0 && (
										<View style={{ marginTop: 8 }}>
											<Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>TABELA 4 – OBRIGAÇÕES DA CONTRATADA</Text>
											<View style={tableStyles.table}>
												<View style={tableStyles.tableHeader}>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '8%' }]}>ITEM</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '27%' }]}>DESCRIÇÃO OCORRIDO</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '25%' }]}>DISP. LEGAL/CONTRATUAL</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>PROVIDÊNCIAS*</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%', borderRightWidth: 0 }]}>OBSERVAÇÕES**</Text>
												</View>
												{report.tabelaObrigacoes.map((item, idx) => (
													<View key={idx} style={tableStyles.tableRow}>
														<Text style={[tableStyles.tableCell, { width: '8%' }]}>{item.item || (idx + 1)}</Text>
														<Text style={[tableStyles.tableCell, { width: '27%' }]}>{item.descricao}</Text>
														<Text style={[tableStyles.tableCell, { width: '25%' }]}>{item.dispositivoLegal}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.providencias}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%', borderRightWidth: 0 }]}>{item.observacoes}</Text>
													</View>
												))}
											</View>
											<Text style={tableStyles.tableFooter}>(*) Descrever a providência e o prazo. (**) Folha do livro de ocorrência.</Text>
										</View>
									)}

									{/* Tabela 5 - Aditivos */}
									{field.fieldKey === 'houveAditivo' && report.tabelaAditivos && report.tabelaAditivos.length > 0 && (
										<View style={{ marginTop: 8 }}>
											<Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>TABELA 5 – ADITIVOS</Text>
											<View style={tableStyles.table}>
												<View style={[tableStyles.tableHeader, { backgroundColor: '#E5E7EB' }]}>
													<Text style={[tableStyles.tableCell, { width: '10%' }]}> </Text>
													<Text style={[tableStyles.tableCell, { width: '15%' }]}> </Text>
													<Text style={[tableStyles.tableCell, { width: '45%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>ADITIVO DE VALOR</Text>
													<Text style={[tableStyles.tableCell, { width: '30%', textAlign: 'center', borderRightWidth: 0, fontFamily: 'Helvetica-Bold' }]}>ADITIVO DE PRAZO</Text>
												</View>
												<View style={tableStyles.tableHeader}>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '10%' }]}>N.º</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%' }]}>DATA PUB.</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '25%' }]}>ACRÉSCIMO (R$)</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '20%' }]}>SUPRESSÃO (R$)</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%' }]}>ADITIVADO</Text>
													<Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { width: '15%', borderRightWidth: 0 }]}>TOTAL</Text>
												</View>
												{report.tabelaAditivos.map((item, idx) => (
													<View key={idx} style={tableStyles.tableRow}>
														<Text style={[tableStyles.tableCell, { width: '10%' }]}>{item.numero}</Text>
														<Text style={[tableStyles.tableCell, { width: '15%' }]}>{formatData(item.dataPublicacao)}</Text>
														<Text style={[tableStyles.tableCell, { width: '25%' }]}>{item.aditivoValorAcrecimoValor || '-'}</Text>
														<Text style={[tableStyles.tableCell, { width: '20%' }]}>{item.aditivoValorSupressaoValor || '-'}</Text>
														<Text style={[tableStyles.tableCell, { width: '15%' }]}>{item.aditivoPrazoAditivado || '-'}</Text>
														<Text style={[tableStyles.tableCell, { width: '15%', borderRightWidth: 0 }]}>{item.aditivoPrazoTotal || '-'}</Text>
													</View>
												))}
											</View>
										</View>
									)}
								</View>
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
	if (!report) return <Document />

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View fixed style={styles.header}>
					<Image src={report.brasaoBase64} style={styles.brasao} />
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>{report.organizationName} - SIRA</Text>
						<Text style={styles.headerSubtitle}>
							{report.secretariaNome?.toLowerCase().startsWith('secretaria') ? report.secretariaNome : `Secretaria de ${report.secretariaNome}`}
						</Text>
						<Text style={styles.headerSubtitle}>Protocolo: {report.protocolo}</Text>
					</View>
				</View>

				<View>
					<Text style={styles.pageTitle}>Relatório de Fiscalização de Contrato - Obras</Text>
					<View style={{ marginBottom: 10 }}>
						<DetailItem label="Tipo de Relatório" value={report.type} />
						<DetailItem label="Criado por" value={report.user?.name} />
						<DetailItem label="Data de Criação" value={formatData(report.createdAt)} />
					</View>
					<ObrasLayout report={report} />
				</View>

				<View fixed style={{ position: 'absolute', top: 100, right: -115, width: 300, height: 475, alignItems: 'center', justifyContent: 'space-evenly' }}>
					<View style={{ transform: 'rotate(-90deg)' }}>
						<Text wrap={false} style={{ fontSize: 5, textAlign: 'center' }}>
							Este documento foi assinado em {new Date(report.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} por: {report.user.name}.
						</Text>
						<Text wrap={false} style={{ fontSize: 5, textAlign: 'left', color: 'blue' }}>
							Para conferência acesse o link {verificationUrl} ou QR Code.
						</Text>
					</View>
					{report.qrCodeUrl && <Image src={report.qrCodeUrl} style={{ width: 30, height: 30 }} />}
				</View>

				<Text fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} | Assinado por: ${report.user?.name} | SIRA`} style={styles.footer} />
			</Page>
		</Document>
	)
}
