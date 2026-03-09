export async function register() {
	// Só executa no servidor (não no Edge Runtime)
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { startScheduler } = await import('./lib/cron/scheduler')
		startScheduler()
	}
}
