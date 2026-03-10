import {
	Briefcase,
	Building,
	Building2,
	FileText,
	Home,
	LogsIcon,
	UserCheck,
} from 'lucide-react'
import Image from 'next/image'
import type * as React from 'react'
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
	SidebarRail,
} from '@/components/ui/sidebar'
import { LogoutButton } from './logout-button'
import { SearchForm } from './search-form'

const data = {
	navMain: [
		{
			title: 'Dashboard',
			items: [
				{
					title: 'Overview',
					url: '/dashboard-owner',
					icon: Home,
					isActive: true,
				},
			],
		},
		{
			title: 'Gestão',
			items: [
				{
					title: 'Organizações',
					url: '/dashboard-owner/organization',
					icon: Building,
					isActive: true,
				},
			],
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarHeader>
					<div className="flex items-center gap-2">
						<Image
							src="/images/logo.svg"
							alt="Logo"
							width={50}
							height={50}
							className="size-12"
						/>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">Relatorios</span>
							<span className="truncate text-muted-foreground text-xs">
								Dashboard
							</span>
						</div>
					</div>
				</SidebarHeader>
				<SearchForm />
			</SidebarHeader>
			<SidebarContent>
				{data.navMain.map((group) => (
					<SidebarGroup key={group.title}>
						<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<a className="flex items-center gap-2" href={item.url}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter className="text-sm text-center text-muted-foreground">
				Desenvolvido e mantido por Secretaria de Tecnologia da Informação - STI
				<LogoutButton />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
