import fs from 'node:fs'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { type NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { FiscalContractsPdf } from '@/app/(auth)/dashboard-gestor/fiscais/_components/fiscal-contracts-pdf'
import { getFiscalById } from '@/app/(auth)/dashboard-gestor/fiscais/_data-access/get-fiscal-by-id'

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const fiscal = await getFiscalById(id)

		if (!fiscal) {
			return NextResponse.json(
				{ error: 'Fiscal não encontrado' },
				{ status: 404 },
			)
		}

		// Gerar o PDF - Usando cast para any para evitar erro de tipo entre componente funcional e DocumentProps
		const buffer = await renderToBuffer(
			React.createElement(FiscalContractsPdf, { fiscal }) as any,
		)

		// Sanitizar nome do fiscal para pasta
		const sanitizedFolderName = fiscal.name
			.replace(/[^a-z0-9]/gi, '_')
			.toUpperCase()

		const reportsDir = path.join(
			process.cwd(),
			'public',
			'relatoriosContratos',
			sanitizedFolderName,
		)

		// Garantir que o diretório existe
		if (!fs.existsSync(reportsDir)) {
			fs.mkdirSync(reportsDir, { recursive: true })
		}

		const filename = `relatorio_contratos_${sanitizedFolderName}.pdf`
		const filePath = path.join(reportsDir, filename)

		// Salvar o arquivo no servidor
		fs.writeFileSync(filePath, buffer)

		// Retornar o PDF para visualização/download direto
		// Converte Buffer para Uint8Array para compatibilidade com NextResponse
		return new NextResponse(new Uint8Array(buffer), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="${filename}"`,
			},
		})
	} catch (error) {
		console.error('Erro na API de relatório do fiscal:', error)
		return NextResponse.json(
			{ error: 'Erro ao gerar relatório' },
			{ status: 500 },
		)
	}
}
