import {
	IconBell,
	IconForms,
	IconHome,
	IconSettings,
	IconShield,
} from '@tabler/icons-react'
import { Logs } from 'lucide-react'

import type { NavSection } from '@/utils/sidebar-config'

export const ownerSections: NavSection[] = [
	{
		label: 'Menu Principal',
		items: [{ title: 'Inicio', url: '/dashboard-owner', icon: IconHome }],
	},
	{
		label: 'Administração',
		items: [
			{
				title: 'Permissões',
				url: '/dashboard-owner/permissions',
				icon: IconShield,
			},
			{ title: 'LOGS', url: '/dashboard-owner/logs', icon: Logs },
			{
				title: 'Cadastro de Formulários',
				url: '/dashboard-owner/forms',
				icon: IconForms,
			},
			{ title: 'Changelog', url: '/dashboard-owner/changelog', icon: IconBell },
		],
	},
	{
		label: 'Configurações',
		items: [
			{
				title: 'Configurações',
				url: '/dashboard-owner/settings',
				icon: IconSettings,
			},
		],
	},
]
