import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncOrganization } from '@/lib/sync/utils'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
	const authHeader = req.headers.get('authorization')
	if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const organizations = await prisma.organization.findMany({
			where: {
				status: 'ACTIVE',
				apiUrlContratos: { not: null },
				apiUrlLicitacoes: { not: null },
				apiUrlFiscais: { not: null },
				apiUrlAditivos: { not: null },
			},
			select: { id: true, name: true },
		})

		if (!organizations.length) {
			return NextResponse.json({
				message: 'Nenhuma organização com API configurada',
				synced: 0,
			})
		}

		const results = await Promise.allSettled(
			organizations.map((org) => syncOrganization(org.id)),
		)

		const summary = results.map((result, i) => ({
			organization: organizations[i].name,
			...(result.status === 'fulfilled'
				? result.value
				: { success: false, message: String(result.reason) }),
		}))

		return NextResponse.json({ synced: organizations.length, results: summary })
	} catch (error) {
		console.error('[CRON] Erro no sync-contratos:', error)
		return NextResponse.json(
			{ error: 'Erro interno na sincronização' },
			{ status: 500 },
		)
	}
}

export async function GET(req: NextRequest) {
	return POST(req)
}
