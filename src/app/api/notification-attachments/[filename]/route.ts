import fs from 'node:fs'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

const MIME_TYPES: Record<string, string> = {
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.doc': 'application/msword',
	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ filename: string }> },
) {
	const { filename } = await params

	const ext = path.extname(filename).toLowerCase()
	if (!MIME_TYPES[ext]) {
		return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
	}

	const sanitizedFilename = path.basename(filename)

	const attachmentsDir =
		process.env.ATTACHMENTS_DIR || path.join(process.cwd(), 'public', 'attachments')

	const filePath = path.join(attachmentsDir, sanitizedFilename)

	if (!fs.existsSync(filePath)) {
		return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
	}

	const fileBuffer = fs.readFileSync(filePath)

	return new NextResponse(fileBuffer, {
		status: 200,
		headers: {
			'Content-Type': MIME_TYPES[ext],
			'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
			'Content-Length': fileBuffer.length.toString(),
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
