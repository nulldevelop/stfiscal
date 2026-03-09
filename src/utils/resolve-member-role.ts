export function parseEmails(envVar?: string) {
	if (!envVar) return []
	return envVar
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean)
}

export function resolveMemberRole(email: string) {
	const ownerEmails = parseEmails(process.env.OWNER_EMAILS)
	const adminEmails = parseEmails(process.env.ADMIN_EMAILS)
	const gestorEmails = parseEmails(process.env.GESTOR_EMAILS)
	const fiscalPrincipalEmails = parseEmails(process.env.FISCAL_PRINCIPAL_EMAILS)
	const fiscalSetorialEmails = parseEmails(process.env.FISCAL_SETORIAL_EMAILS)
	if (ownerEmails.includes(email)) return 'OWNER' as const
	if (adminEmails.includes(email)) return 'ADMIN' as const
	if(gestorEmails.includes(email)) return 'GESTOR_CONTRATOS' as const
	if (fiscalPrincipalEmails.includes(email)) return 'FISCAL_PRINCIPAL' as const
	if (fiscalSetorialEmails.includes(email)) return 'FISCAL_SETORIAL' as const
	return 'FISCAL_SETORIAL' as const
}
