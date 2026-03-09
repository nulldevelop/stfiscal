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
	if (ownerEmails.includes(email)) return 'OWNER' as const
	if (adminEmails.includes(email)) return 'ADMIN' as const
	return 'FISCAL_SETORIAL' as const
}
