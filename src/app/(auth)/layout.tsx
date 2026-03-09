import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { BreadcrumbWrapper } from '@/components/shared/breadcrumb-wrapper'
import { SystemUpdateDialog } from '@/components/system-update-dialog'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { getCurrentOrganizationId, getSession } from '@/lib/auth-actions'
import { getMemberRole } from '@/lib/permissions/check-permission'
import { prisma } from '@/lib/prisma'
import { getLatestSystemUpdate } from './dashboard-owner/changelog/_data-access/get-latest-system-update'

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await getSession()

	if (!session?.user) {
		redirect('/')
	}

	const organizationId = await getCurrentOrganizationId()
	const role = organizationId
		? await getMemberRole(session.user.id, organizationId)
		: null

	const organization = organizationId
		? await prisma.organization.findUnique({
				where: { id: organizationId },
				select: { name: true, slug: true, logo: true },
			})
		: null

	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

	let latestUpdate = null
	if (role) {
		latestUpdate = await getLatestSystemUpdate(role)
	}

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar
				user={{
					name: session.user.name,
					email: session.user.email,
					image: session.user.image,
					role: role ?? 'USER',
				}}
				org={organization}
			/>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<BreadcrumbWrapper />
					</div>
				</header>
				<SystemUpdateDialog update={latestUpdate} />
				<div className="px-4 py-2 text-foreground">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
