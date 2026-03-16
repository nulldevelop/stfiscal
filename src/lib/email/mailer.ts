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

// Transporter padrão usando variáveis de ambiente
const defaultTransporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_SECURE === 'true',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
})

type SendEmailParams = {
	to: string
	subject: string
	html: string
	text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
	const from = process.env.SMTP_FROM || process.env.SMTP_USER

	await defaultTransporter.sendMail({
		from,
		to,
		subject,
		html,
		text: text || html.replace(/<[^>]*>/g, ''),
	})
}

export function getPendingReportsEmailHtml(
	userName: string,
	contratos: { numero: string; contratado: string; diasPendente: number }[],
	loginUrl?: string,
) {
	const appUrl =
		loginUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

	const contratosHtml = contratos
		.map(
			(c) => `
			<tr>
				<td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${c.numero}</td>
				<td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${c.contratado}</td>
				<td style="padding: 12px; border-bottom: 1px solid #eee; color: #e53e3e; font-weight: bold;">${c.diasPendente} dias</td>
			</tr>
		`,
		)
		.join('')

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Relatórios Pendentes - ST Fiscal</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 0;">
				<table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
					<tr>
						<td style="padding: 40px 40px 20px; text-align: center;">
							<h1 style="margin: 0; color: #16a34a; font-size: 24px;">ST Fiscal</h1>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px; text-align: center;">
							<h2 style="margin: 0; color: #333; font-size: 20px;">Relatórios Pendentes</h2>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
								Olá <strong>${userName}</strong>,
							</p>
							<p style="margin: 16px 0 0; color: #666; font-size: 16px; line-height: 1.6;">
								Você possui <strong>${contratos.length} contrato(s)</strong> com relatórios pendentes há mais de 30 dias. 
								Por favor, acesse o sistema para regularizar a situação.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<table style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; border-radius: 6px;">
								<thead>
									<tr style="background-color: #16a34a; color: white;">
										<th style="padding: 12px; text-align: left; border-radius: 6px 0 0 0;">Contrato</th>
										<th style="padding: 12px; text-align: left;">Contratado</th>
										<th style="padding: 12px; text-align: left; border-radius: 0 6px 0 0;">Pendente há</th>
									</tr>
								</thead>
								<tbody>
									${contratosHtml}
								</tbody>
							</table>
						</td>
					</tr>
					<tr>
						<td style="padding: 10px 40px 30px; text-align: center;">
							<a href="${appUrl}/dashboard-fiscal" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
								Acessar Meus Contratos
							</a>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #999; font-size: 14px; line-height: 1.5;">
								Este é um lembrete automático enviado pelo sistema ST Fiscal.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 20px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
							<p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
								ST Fiscal - Todos os direitos reservados
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`
}

export function getWelcomeEmailHtml(userName?: string, loginUrl?: string) {
	const appUrl =
		loginUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Bem-vindo ao ST Fiscal</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 0;">
				<table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
					<tr>
						<td style="padding: 40px 40px 20px; text-align: center;">
							<h1 style="margin: 0; color: #16a34a; font-size: 28px;">ST Fiscal</h1>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px; text-align: center;">
							<h2 style="margin: 0; color: #333; font-size: 22px;">Bem-vindo(a)!</h2>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
								${userName ? `Olá <strong>${userName}</strong>,` : 'Olá,'}
							</p>
							<p style="margin: 16px 0 0; color: #666; font-size: 16px; line-height: 1.6;">
								Sua conta foi criada com sucesso no <strong>ST Fiscal</strong>! Estamos muito felizes em ter você conosco.
							</p>
							<p style="margin: 16px 0 0; color: #666; font-size: 16px; line-height: 1.6;">
								Com o ST Fiscal você pode:
							</p>
							<ul style="margin: 12px 0 0; padding-left: 20px; color: #666; font-size: 15px; line-height: 1.8;">
								<li>Gerenciar contratos e fiscalizações</li>
								<li>Gerar relatórios de acompanhamento</li>
								<li>Enviar notificações às empresas</li>
								<li>Acompanhar o histórico de atividades</li>
							</ul>
						</td>
					</tr>
					<tr>
						<td style="padding: 10px 40px 30px; text-align: center;">
							<a href="${appUrl}/sign-in" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
								Acessar Minha Conta
							</a>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #999; font-size: 14px; line-height: 1.5;">
								Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 20px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
							<p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
								ST Fiscal - Todos os direitos reservados
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`
}

export function getResetPasswordEmailHtml(url: string, userName?: string) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Redefinir Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 0;">
				<table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
					<tr>
						<td style="padding: 40px 40px 20px; text-align: center;">
							<h1 style="margin: 0; color: #333; font-size: 24px;">ST Fiscal</h1>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px; text-align: center;">
							<h2 style="margin: 0; color: #333; font-size: 20px;">Redefinir Senha</h2>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
								${userName ? `Olá ${userName},` : 'Olá,'}
							</p>
							<p style="margin: 16px 0 0; color: #666; font-size: 16px; line-height: 1.5;">
								Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 30px; text-align: center;">
							<a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
								Redefinir Senha
							</a>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #999; font-size: 14px; line-height: 1.5;">
								Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá a mesma.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 40px 20px;">
							<p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
								Este link expira em 1 hora.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 20px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
							<p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
								ST Fiscal - Todos os direitos reservados
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`
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
