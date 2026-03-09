import { adminSections } from '@/utils/sections/admin-sections'
import { fiscalPrincipalSections } from '@/utils/sections/fiscal-principal-sections'
import { fiscalSetorialSections } from '@/utils/sections/fiscal-setorial-sections'
import { ownerSections } from '@/utils/sections/owner-sections'
import { gestorSections } from './sections/gestor-section'

export type Role =
	| 'OWNER'
	| 'ADMIN'
	| 'SUPORT'
	| 'FISCAL_PRINCIPAL'
	| 'FISCAL_SETORIAL'
	| 'GESTOR_CONTRATOS'
	| 'USER'

export type NavItem = {
	title: string
	url?: string
	icon: React.ComponentType<{ className?: string }>
	items?: { title: string; url: string }[]
}

export type NavSection = {
	label: string
	items: NavItem[]
}

export type Team = {
	id: string
	name: string
}

export type AppSidebarProps = {
	user: {
		name: string
		email: string
		image?: string | null
		role: string
	}
	org?: {
		name: string
		slug: string
		logo?: string | null
	} | null
	teams?: Team[]
	activeTeamId?: string | null
}

export const sectionsByRole: Record<Role, NavSection[]> = {
	OWNER: ownerSections,
	ADMIN: adminSections,
	SUPORT: adminSections,
	FISCAL_PRINCIPAL: fiscalPrincipalSections,
	FISCAL_SETORIAL: fiscalSetorialSections,
	GESTOR_CONTRATOS: gestorSections,
	USER: [],
}
