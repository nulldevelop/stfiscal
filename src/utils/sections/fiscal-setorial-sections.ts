import {
	IconAlertTriangle,
	IconBell,
	IconClockExclamation, IconHistory,
	IconHome,
	IconPackage
} from '@tabler/icons-react'
import type { NavSection } from '@/utils/sidebar-config'

export const fiscalSetorialSections: NavSection[] = [
	{
		label: 'Menu Principal',
		items: [{ title: 'Início', url: '/dashboard-fiscal', icon: IconHome }],
	},
	{
		label: 'Notificações',
		items: [
			{
				title: 'Faltando ou Atraso',
				url: '/dashboard-fiscal/notificacoes/falta-atrasada',
				icon: IconClockExclamation,
			},
			{
				title: 'Entrega Incompleta',
				url: '/dashboard-fiscal/notificacoes/entrega-incompleta',
				icon: IconPackage,
			},
			{
				title: 'Desconformidade',
				url: '/dashboard-fiscal/notificacoes/desconformidade',
				icon: IconAlertTriangle,
			},
		],
	},
	{
		label: 'Histórico',
		items: [
			{
				title: 'Histórico de Relatórios',
				url: '/dashboard-fiscal/historico-relatorios',
				icon: IconHistory,
			},
			{
				title: 'Histórico de Notificações',
				url: '/dashboard-fiscal/historico-notificacoes',
				icon: IconBell,
			},
		],
	},
]
