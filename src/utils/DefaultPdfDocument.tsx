"use client";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import React from "react";
import { formatData } from "@/utils/formatData";
import { DetailItem, styles } from "./PdfSharedComponents";

// Função simples para gerar hash hexadecimal
const hashString = async (str: string) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const DefaultLayout = ({ report }: { report: Report }) => {
	const filteredEntries = Object.entries(report).filter(
		([key]) =>
			key !== "id" &&
			key !== "organizationId" &&
			key !== "userId" &&
			key !== "type" &&
			key !== "createdAt" &&
			key !== "updatedAt" &&
			key !== "user" &&
			key !== "sessionId", // se você passar sessionId
	);

	return (
		<View>
			{filteredEntries.map(([key, value]) => (
				<View key={key} style={styles.detailRow}>
					<Text style={styles.detailKey}>
						{key.replace(/([A-Z])/g, " $1").trim()}:
					</Text>
					<Text style={styles.detailValue}>
						{value instanceof Date
							? formatData(value)
							: String(value ?? "Não Respondida")}
					</Text>
				</View>
			))}
		</View>
	);
};

type Report = {
	id?: string;
	organizationId?: string;
	userId?: string;
	type?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	user?: { name?: string };
	sessionId?: string;
	secretaria?: string;
} & {
	[key: string]: string | number | boolean | Date | undefined;
};

export const DefaultPdfDocument = ({ report }: { report: Report }) => {
	// Cria um hash simples do usuário para "assinatura digital"
	const [digitalSignature, setDigitalSignature] = React.useState<string>("");

	React.useEffect(() => {
		if (report?.sessionId) {
			hashString(report.sessionId).then(setDigitalSignature);
		}
	}, [report?.sessionId]);

	if (!report) {
		return <Document />;
	}

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View fixed style={styles.header}>
					<Image src="/imgs/Brasao.png" style={styles.brasao} />

					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>
							ST - Fiscalização e Relatórios
						</Text>

						<Text style={styles.headerSubtitle}>
							Secretaria de {report.secretaria}
						</Text>
					</View>
				</View>

				<View>
					<Text style={styles.pageTitle}>
						Relatório de Fiscalização de Contrato
					</Text>
				</View>

				<View>
					<DetailItem label="Tipo de Relatório" value={report.type} />
					<DetailItem label="Criado por" value={report.user?.name} />
					<DetailItem
						label="Data de Criação"
						value={formatData(report.createdAt ?? "")}
					/>
				</View>

				<DefaultLayout report={report} />

				{/* Footer com página e assinatura digital */}
				<Text
					fixed
					render={({ pageNumber, totalPages }) =>
						`Página ${pageNumber} de ${totalPages} | Assinatura Digital: ${digitalSignature}`
					}
					style={styles.footer}
				/>
			</Page>
		</Document>
	);
};
