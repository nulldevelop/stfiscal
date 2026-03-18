import {
	IconBuildingSkyscraper,
	IconFileCertificate,
	IconFileReport,
	IconGavel,
	IconHome,
	IconUsers,
} from '@tabler/icons-react'
import { Bell, MessageSquare } from 'lucide-react'
import type { NavSection } from '@/utils/sidebar-config'

export const gestorSections: NavSection[] = [
	{
		label: 'Menu Principal',
		items: [
			{ title: 'Início', url: '/dashboard-gestor', icon: IconHome },
			{
				title: 'Mensagens Internas',
				url: '/dashboard-gestor/mensagens',
				icon: MessageSquare,
				badgeKey: 'mensagens',
			},
		],
	},
	{
		label: 'Gestão de Contrato',
		items: [
			{
				title: 'Contratos',
				url: '/dashboard-gestor/contratos',
				icon: IconFileCertificate,
			},
			{
				title: 'Aditivos',
				url: '/dashboard-gestor/aditivos',
				icon: IconFileReport,
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
