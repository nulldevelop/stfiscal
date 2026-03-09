import {
	IconBuildingSkyscraper,
	IconFileCertificate,
	IconFileReport,
	IconGavel,
	IconHome,
	IconUsers,
} from '@tabler/icons-react'
import { Bell } from 'lucide-react'
import type { NavSection } from '@/utils/sidebar-config'

export const adminSections: NavSection[] = [
	{
		label: 'Menu Principal',
		items: [
			{ title: 'Início', url: '/dashboard-gestor', icon: IconHome },
			{
				title: 'Contratos',
				url: '/dashboard-gestor/contratos',
				icon: IconFileCertificate,
			},
			{
				title: 'Empresas',
				url: '/dashboard-gestor/empresas',
				icon: IconBuildingSkyscraper,
			},
			{
				title: 'Licitações',
				url: '/dashboard-gestor/licitacoes',
				icon: IconGavel,
			},
			{
				title: 'Fiscais',
				url: '/dashboard-gestor/fiscais',
				icon: IconUsers,
			},
		],
	},
	{
		label: 'Fiscalização',
		items: [
			{
				title: 'Relatórios',
				url: '/dashboard-gestor/relatorios',
				icon: IconFileReport,
			},
			{
				title: 'Notificações',
				url: '/dashboard-gestor/notificacoes',
				icon: Bell,
			},
		],
	},
]
