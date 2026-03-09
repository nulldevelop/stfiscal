'use client'

import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
	const handleLogout = async () => {
		try {
			const response = await authClient.signOut()

			if (response) {
				toast.success('Você foi desconectado.')
				window.location.href = '/'
			} else {
				toast.error('Não foi possível fazer logout.')
			}
		} catch (error) {
			console.error('Logout failed:', error)
			toast.error('Ocorreu um erro ao tentar fazer logout.')
		}
	}

	return (
		<SidebarMenuButton onClick={handleLogout} className="mt-auto">
			<div className="flex items-center gap-2">
				<LogOut className="size-4" />
				<span>Sair</span>
			</div>
		</SidebarMenuButton>
	)
}
