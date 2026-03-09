'use server'

import fs from 'node:fs'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { simpleHash } from '@/utils/hash'

const ALLOWED_TYPES = [
	'application/pdf',
	'image/png',
	'image/jpeg',
	'image/jpg',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
	try {
		const session = await getSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
		}

		const organizationId = await getCurrentOrganizationId()
		if (!organizationId) {
			return NextResponse.json({ error: 'Organização não encontrada' }, { status: 400 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File | null

		if (!file) {
			return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Tipo de arquivo não permitido. Use PDF, PNG, JPG ou DOC/DOCX.' },
				{ status: 400 },
			)
		}

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: 'Arquivo muito grande. Máximo permitido: 10MB' },
				{ status: 400 },
			)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		const attachmentsDir =
			process.env.ATTACHMENTS_DIR || path.join(process.cwd(), 'public', 'attachments')

		if (!fs.existsSync(attachmentsDir)) {
			fs.mkdirSync(attachmentsDir, { recursive: true })
		}

		const timestamp = Date.now()
		const hash = simpleHash(`${file.name}-${timestamp}`)
		const ext = path.extname(file.name)
		const fileName = `${hash}${ext}`
		const filePath = path.join(attachmentsDir, fileName)

		fs.writeFileSync(filePath, buffer)

		return NextResponse.json({
			success: true,
			fileName: file.name,
			filePath: `/api/notification-attachments/${fileName}`,
			storedName: fileName,
		})
	} catch (error) {
		console.error('Erro ao fazer upload:', error)
		return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
	}
}
