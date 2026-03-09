'use client'

import { ChevronRight, Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from '@/components/ui/sidebar'
import {
	type AppSidebarProps,
	type NavItem,
	type Role,
	sectionsByRole,
} from '@/utils/sidebar-config'
import pkg from '../../../package.json'
import { useAuthTheme } from './auth-theme-provider'
import { NavUser } from './nav-user'

// ─── Component ───────────────────────────────────────────────────────────────

export function AppSidebar({ user, org }: AppSidebarProps) {
	const pathname = usePathname()
	const { theme, setTheme } = useAuthTheme()
	const [mounted, setMounted] = useState(false)
	const userRole = (user.role || 'USER') as Role
	const sections = sectionsByRole[userRole] ?? []

	useEffect(() => setMounted(true), [])

	const renderMenuItem = (item: NavItem) => {
		if (item.items && item.items.length > 0) {
			return (
				<Collapsible key={item.title} asChild className="group/collapsible">
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton tooltip={item.title}>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub>
								{item.items.map((subItem) => (
									<SidebarMenuSubItem key={subItem.title}>
										<SidebarMenuSubButton
											asChild
											isActive={pathname === subItem.url}
										>
											<Link href={subItem.url}>
												<span>{subItem.title}</span>
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								))}
							</SidebarMenuSub>
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>
			)
		}

		return (
			<SidebarMenuItem key={item.title}>
				<SidebarMenuButton
					asChild
					isActive={pathname === item.url}
					tooltip={item.title}
				>
					<Link href={item.url || '#'}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		)
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link
								href={
									userRole === 'ADMIN'
										? '/dashboard-gestor'
										: `/dashboard-${userRole.toLowerCase()}`
								}
							>
								<div className="flex items-center justify-center rounded-lg overflow-hidden">
									<Image
										src={org?.logo || '/logo.png'}
										alt="Logo"
										className="size-8 object-contain"
										width={100}
										height={100}
										priority
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{org?.name || 'SME - CGS'}
									</span>
									<span className="truncate text-xs text-muted-foreground">
										{org?.slug || 'Sistema'}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{sections.map((section) => (
					<SidebarGroup key={section.label}>
						<SidebarGroupLabel>{section.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>{section.items.map(renderMenuItem)}</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
							tooltip={
								mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'
							}
						>
							{mounted && theme === 'dark' ? <Sun /> : <Moon />}
							<span>
								{mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<p className="px-2 pb-1 text-center text-[10px] text-muted-foreground/50">
					v{pkg.version}
				</p>
			<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
