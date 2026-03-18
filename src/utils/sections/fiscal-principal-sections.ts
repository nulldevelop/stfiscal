import {
	IconAlertTriangle,
	IconBell,
	IconClockExclamation,
	IconFileText,
	IconHistory,
	IconHome,
	IconPackage,
	IconTruck,
} from '@tabler/icons-react'
import { MessageSquare } from 'lucide-react'
import type { NavSection } from '@/utils/sidebar-config'

export const fiscalPrincipalSections: NavSection[] = [
	{
		label: 'Menu Principal',
		items: [
			{ title: 'Início', url: '/dashboard-fiscal', icon: IconHome },
			{
				title: 'Mensagens',
				url: '/dashboard-fiscal/mensagens',
				icon: MessageSquare,
				badgeKey: 'mensagens',
			},
		],
	},
	{
		label: 'Relatórios',
		items: [
			{
				title: 'Bens e Serviços',
				url: '/dashboard-fiscal/relatorios/bens-e-servicos',
				icon: IconFileText,
			},
			{
				title: 'Serviços de Transporte',
				url: '/dashboard-fiscal/relatorios/servicos-transporte',
				icon: IconTruck,
			},
			{
				title: 'Obras',
				url: '/dashboard-fiscal/relatorios/obras',
				icon: IconFileText,
			},
		],
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
				title: 'Rascunhos de Relatórios',
				url: '/dashboard-fiscal/rascunhos',
				icon: IconHistory,
			},
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
