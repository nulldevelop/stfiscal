'use client'

import { IconLogout, IconSelector, IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
	DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

type NavUserProps = {
	user: {
		name: string
		email: string
		image?: string | null
	}
}

function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()
}

export function NavUser({ user }: NavUserProps) {
	const { isMobile } = useSidebar()
	const { setTheme } = useTheme()
	const router = useRouter()

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/')
				},
			},
		})
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild id="nav-user-dropdown">
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image || undefined} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{getInitials(user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
							<IconSelector className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image || undefined} alt={user.name} />
									<AvatarFallback className="rounded-lg">
										{getInitials(user.name)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="gap-2">
								<IconMoon className="size-4" />
								<span>Tema</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
										<IconSun className="size-4" />
										<span>Claro</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
										<IconMoon className="size-4" />
										<span>Escuro</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
										<IconDeviceDesktop className="size-4" />
										<span>Sistema</span>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
							<IconLogout className="size-4" />
							<span>Sair</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
