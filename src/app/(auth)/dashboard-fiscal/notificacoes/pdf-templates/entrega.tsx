import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { NotificacaoEntrega } from '@/generated/prisma/client'
import { NotificationPdfLayout } from './NotificationPdfLayout'

const styles = StyleSheet.create({
	paragraph: { textAlign: 'justify', marginBottom: 12, textIndent: 0 },
	paragraphIndented: {
		textAlign: 'justify',
		marginBottom: 5,
		textIndent: 70,
		marginTop: 5,
	},
	notificationTitle: {
		textAlign: 'center',
		fontWeight: 'bold',
		marginTop: 2,
		marginBottom: 5,
	},
	legalQuoteContainer: {
		marginTop: 5,
		marginBottom: 15,
		marginLeft: 20,
		paddingLeft: 10,
		borderLeftWidth: 1,
		borderLeftColor: 'grey',
	},
	legalQuoteText: {
		fontSize: 9,
		fontStyle: 'italic',
		textAlign: 'justify',
		marginBottom: 5,
	},
	bold: { fontWeight: 'bold' },
	identificationBox: {
		border: '1px solid black',
		padding: 10,
		marginBottom: 15,
	},
	identificationTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
	},
	identificationRow: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	identificationLabel: {
		fontWeight: 'bold',
		width: 120,
	},
	identificationValue: {
		flex: 1,
	},
})

interface EntregaPdfData {
	secretariaNome: string
	gestorPortaria: string
	empresaNome: string
	empresaCnpj: string
	empresaEndereco: string
	empresaRepresentanteNome: string
	empresaRepresentanteRg: string
	empresaRepresentanteCpf: string
	licitacaoModalidade: string
	licitacaoNumero: number
	contratoNumero: number
	displayLicitacao: string
	displayContrato: string
	licitacaoObjeto: string
	gestorNome: string
	dataAtual: Date | string
}

interface AnexoEntregaTemplateProps {
	data: EntregaPdfData
	notificacao: NotificacaoEntrega
	qrCodeUrl?: string
	consideracoes?: string // New prop
}

export const AnexoEntregaTemplate = ({
	data,
	notificacao,
	qrCodeUrl,
	consideracoes,
}: AnexoEntregaTemplateProps) => {
	// Destructure consideracoes
	if (!data) {
		return null // Or some error component
	}

	const dataAtualFormatada = format(
		new Date(data.dataAtual),
		"dd 'de' MMMM 'de' yyyy",
		{ locale: ptBR },
	)
	const dataEmpenhoFormatada = notificacao.dataEmpenho
		? format(new Date(notificacao.dataEmpenho), 'dd/MM/yyyy', { locale: ptBR })
		: 'xx/xx/202x'

	return (
		<NotificationPdfLayout
			title="NOTIFICAÇÃO EXTRAJUDICIAL"
			gestorNome={data.gestorNome}
			notificacao={notificacao}
			qrCodeUrl={qrCodeUrl}
		>
			<View style={styles.identificationBox}>
				<Text style={styles.identificationTitle}>
					IDENTIFICAÇÃO DO CONTRATO
				</Text>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Licitação n.º:</Text>
					<Text style={styles.identificationValue}>
						{data.licitacaoModalidade} {data.displayLicitacao}
					</Text>
				</View>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Contrato n.º:</Text>
					<Text style={styles.identificationValue}>{data.displayContrato}</Text>
				</View>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Empenho n.º:</Text>
					<Text style={styles.identificationValue}>
						{notificacao.numeroEmpenho || 'N/A'}
					</Text>
				</View>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Contratada:</Text>
					<Text style={styles.identificationValue}>{data.empresaNome}</Text>
				</View>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Tipo:</Text>
					<Text style={styles.identificationValue}>{notificacao.tipo}</Text>
				</View>
				<View style={styles.identificationRow}>
					<Text style={styles.identificationLabel}>Objeto:</Text>
					<Text style={styles.identificationValue}>
						{data.licitacaoObjeto.toLowerCase()}
					</Text>
				</View>
			</View>

			<Text style={styles.paragraphIndented}>
				<Text style={styles.bold}>O MUNICÍPIO DE CAMPINA GRANDE DO SUL</Text>,
				pessoa jurídica de direito público interno, inscrito no CNPJ/MF sob n.º
				76.105.600/0001-86, com sede na Praça Bento Munhoz da Rocha Neto, n.º
				30, Centro, através da Secretaria Municipal de{' '}
				<Text style={styles.bold}>{data.secretariaNome}</Text>, neste ato
				representado pelo(a) Fiscal de Contratos, nos termos da Portaria n.º{' '}
				<Text style={styles.bold}>{data.gestorPortaria}</Text>, vem
			</Text>

			<Text style={styles.notificationTitle}>NOTIFICAR</Text>

			<Text style={styles.paragraphIndented}>
				A <Text style={styles.bold}>{data.empresaNome}</Text>, pessoa jurídica
				de direito privado, inscrita no CNPJ/MF sob n.º{' '}
				<Text style={styles.bold}>{data.empresaCnpj}</Text>, estabelecida na{' '}
				<Text style={styles.bold}>{data.empresaEndereco}</Text>, neste ato
				representada pelo(a) Sr(a){' '}
				<Text style={styles.bold}>{data.empresaRepresentanteNome}</Text>, nos
				seguintes termos:
			</Text>

			<Text style={styles.paragraphIndented}>
				O referido empenho foi emitido com data de{' '}
				<Text style={styles.bold}>{dataEmpenhoFormatada}</Text> e enviado
				através do e-mail{' '}
				<Text style={styles.bold}>
					{notificacao.emailEmpenho || 'xxxxxx@xxxx'}
				</Text>{' '}
				aos cuidados de{' '}
				<Text style={styles.bold}>
					{notificacao.responsavelEmpenho || 'XXXXXXXXX'}
				</Text>{' '}
				conforme arquivos em anexo.
			</Text>

			<Text style={styles.paragraphIndented}>
				O prazo máximo para a entrega dos produtos (ou execução dos serviços) é
				de <Text style={styles.bold}>{notificacao.prazoEntrega || 'XX'}</Text>{' '}
				DIAS, porém, verifica-se atrasos na entrega dos itens {notificacao.item}
				.
			</Text>

			{notificacao.desconformidade && (
				<Text
					style={{ ...styles.paragraph, textAlign: 'justify', marginTop: 10 }}
				>
					{notificacao.desconformidade}
				</Text>
			)}

			<Text style={styles.paragraphIndented}>
				Desta forma, verifica-se desconformidade por parte da contratada (ou
				fornecedora) com as determinações do edital de licitação e do contrato
				(ou Ata de Registro de Preços) firmado(a) com esta Administração.
			</Text>

			<Text style={styles.paragraphIndented}>
				A este respeito, determina o art. 162 da Lei Federal n.º 14.133, de 1º
				de abril de 2021:
			</Text>

			<View style={styles.legalQuoteContainer}>
				<Text style={styles.legalQuoteText}>
					Art. 162. O atraso injustificado na execução do contrato sujeitará o
					contratado a multa de mora, na forma prevista em edital ou em
					contrato.
				</Text>
				<Text style={styles.legalQuoteText}>
					Parágrafo único. A aplicação de multa de mora não impedirá que a
					Administração a converta em compensatória e promova a extinção
					unilateral do contrato com a aplicação cumulada de outras sanções
					previstas nesta Lei.
				</Text>
			</View>

			{consideracoes && (
				<Text
					style={{ ...styles.paragraph, textAlign: 'justify', marginTop: 10 }}
				>
					{consideracoes}
				</Text>
			)}

			<Text style={styles.paragraphIndented}>
				Considerando que o descumprimento, total ou parcial do Contrato
				Administrativo, acarreta em prejuízos, conforme demonstrado que a
				empresa contratada não cumpriu com as obrigações iniciais do contrato
				firmado,
			</Text>

			<Text style={styles.paragraphIndented}>
				RESOLVE NOTIFICAR a empresa{' '}
				<Text style={styles.bold}>{data.empresaNome}</Text>, pessoa jurídica de
				direito privado, inscrita no CNPJ{' '}
				<Text style={styles.bold}>{data.empresaCnpj}</Text>, com sede na{' '}
				<Text style={styles.bold}>{data.empresaEndereco}</Text>, representada
				pelo seu sócio administrador{' '}
				<Text style={styles.bold}>{data.empresaRepresentanteNome}</Text>, para
				que cumpra o objeto do contrato no prazo máximo de{' '}
				{notificacao.prazoDefesa} (DIA), à contar do recebimento desta
				notificação, sob pena de aplicação das sanções legais cabíveis ao caso,
				dentre elas, aplicação de multas legais e contratuais, além de abertura
				de processo de inidoneidade para contratar com a administração pública.
				Ou então, apresente justificativa devidamente fundamentada no prazo de
				24 (vinte e quatro horas) após recebimento desta, para o atraso na
				entrega do referido item, o qual, caberá ao Município de Campina Grande
				do Sul, por sua aceitação.
			</Text>
			<Text style={styles.paragraphIndented}>
				Após o decurso do citado prazo, este não tendo êxito, será imediatamente
				aberto o processo de apuração de inidoneidade da referida empresa para
				contratar com a administração pública.
			</Text>

			<Text style={{ ...styles.paragraph, textAlign: 'center', marginTop: 20 }}>
				Certos de que seremos prontamente atendidos, desde já agradecemos pela
				compreensão.
			</Text>
			<Text style={{ ...styles.paragraph, textAlign: 'center', marginTop: 20 }}>
				Atenciosamente.
			</Text>
			<Text
				style={{ ...styles.paragraph, textAlign: 'center', marginTop: 20 }}
			>{`Campina Grande do Sul, ${dataAtualFormatada}.`}</Text>
		</NotificationPdfLayout>
	)
}
