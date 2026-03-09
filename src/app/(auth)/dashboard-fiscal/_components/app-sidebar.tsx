import { Bell, FileClock, Home } from 'lucide-react'
import Image from 'next/image'
import type * as React from 'react'
import { Separator } from '@/components/ui/separator'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LogoutButton } from './logout-button'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const menuItems = [
		{
			title: 'Dashboard',
			href: '/dashboard-fiscal',
			icon: Home,
		},
		{
			title: 'Histórico de Relatórios',
			href: '/dashboard-fiscal/historico-relatorios',
			icon: FileClock,
		},
		{
			title: 'Histórico de Notificações',
			href: '/dashboard-fiscal/historico-notificacoes',
			icon: Bell,
		},
	]

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<Image
						src="/imgs/logo.svg"
						alt="Logo"
						width={50}
						height={50}
						className="size-12"
					/>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">SIRA - STI</span>
						<span className="truncate text-muted-foreground text-xs">
							Dashboard Fiscal
						</span>
					</div>
				</div>
			</SidebarHeader>
			<Separator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
					<SidebarMenu>
						{menuItems.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<a href={item.href} className="flex items-center gap-2">
										<item.icon className="size-4" />
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<LogoutButton />
			</SidebarFooter>
		</Sidebar>
	)
}
