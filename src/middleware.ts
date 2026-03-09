import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getCurrentOrganizationId, getSession } from './lib/auth-actions'
import { getMemberRole } from './lib/permissions/check-permission'
import { hasRoutePermission } from './lib/permissions/route-matcher'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
	try {
		const session = await getSession()

		if (!session?.user) {
			return NextResponse.redirect(new URL('/', request.url))
		}

		const { pathname } = request.nextUrl

		// Usa getCurrentOrganizationId que já tem fallback via DB em auth-actions.ts
		const organizationId = await getCurrentOrganizationId()

		if (!organizationId) {
			return NextResponse.redirect(new URL('/', request.url))
		}

		const role = await getMemberRole(session.user.id, organizationId)

		if (!role) {
			console.error('Membro sem role ao acessar rota protegida:', {
				userId: session.user.id,
				pathname,
			})
			return NextResponse.redirect(new URL('/', request.url))
		}

		if (!hasRoutePermission(pathname, role)) {
			return NextResponse.redirect(new URL('/', request.url))
		}

		return NextResponse.next()
	} catch (error) {
		console.error('Middleware error:', error)
		return NextResponse.redirect(new URL('/', request.url))
	}
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/dashboard-gestor/:path*',
		'/dashboard-owner/:path*',
		'/dashboard-fiscal/:path*',
	],
}
