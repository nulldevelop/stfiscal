import nodemailer from 'nodemailer'

export interface SmtpConfig {
	host: string
	port: number
	user: string
	pass: string
	from: string
}

export function createTransporter(config: SmtpConfig) {
	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.port === 465,
		auth: {
			user: config.user,
			pass: config.pass,
		},
	})
}

export async function sendSyncNotification(
	config: SmtpConfig,
	to: string,
	result: {
		status: 'success' | 'error'
		totalContratos?: number
		totalFiscais?: number
		message?: string
		organizationName: string
	},
): Promise<void> {
	const transporter = createTransporter(config)

	const isSuccess = result.status === 'success'
	const subject = isSuccess
		? `✅ Sincronização concluída — ${result.organizationName}`
		: `❌ Falha na sincronização — ${result.organizationName}`

	const html = isSuccess
		? `
			<h2>Sincronização diária concluída com sucesso</h2>
			<p><strong>Organização:</strong> ${result.organizationName}</p>
			<p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
			<hr/>
			<p><strong>Contratos sincronizados:</strong> ${result.totalContratos ?? 0}</p>
			<p><strong>Fiscais processados:</strong> ${result.totalFiscais ?? 0}</p>
			${result.message ? `<p><strong>Detalhes:</strong> ${result.message}</p>` : ''}
		`
		: `
			<h2>Falha na sincronização diária</h2>
			<p><strong>Organização:</strong> ${result.organizationName}</p>
			<p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
			<hr/>
			<p><strong>Erro:</strong> ${result.message ?? 'Erro desconhecido'}</p>
			<p>Verifique as configurações da API e tente novamente manualmente.</p>
		`

	await transporter.sendMail({
		from: config.from,
		to,
		subject,
		html,
	})
}
