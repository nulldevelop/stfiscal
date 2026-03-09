import fs from 'node:fs'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-actions'

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ filename: string }> },
) {
	const session = await getSession()

	if (!session) {
		return NextResponse.json(
			{ error: 'Acesso negado. Usuário não autenticado.' },
			{ status: 401 },
		)
	}

	const { filename } = await params

	// Validar que o arquivo é um PDF
	if (!filename.endsWith('.pdf')) {
		return NextResponse.json(
			{ error: 'Formato de arquivo inválido. Apenas PDFs são permitidos.' },
			{ status: 400 },
		)
	}

	// Sanitizar o nome do arquivo para evitar path traversal
	const sanitizedFilename = path.basename(filename)

	// Definir o diretório de relatórios
	const reportsDir =
		process.env.REPORTS_DIR || path.join(process.cwd(), 'public', 'reports')

	const filePath = path.join(reportsDir, sanitizedFilename)

	// Verificar se o arquivo existe
	if (!fs.existsSync(filePath)) {
		return NextResponse.json(
			{ error: 'Arquivo não encontrado.' },
			{ status: 404 },
		)
	}

	// Ler o arquivo
	const fileBuffer = fs.readFileSync(filePath)

	// Retornar o PDF com os headers corretos
	return new NextResponse(fileBuffer, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
			'Content-Length': fileBuffer.length.toString(),
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
