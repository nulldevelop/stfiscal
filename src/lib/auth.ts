import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { username } from 'better-auth/plugins'
import { organization } from 'better-auth/plugins/organization'
import { ensureMember } from '../utils/ensure-member'
import {
	getResetPasswordEmailHtml,
	getWelcomeEmailHtml,
	sendEmail,
} from './email/mailer'
import { prisma } from './prisma'

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		async sendResetPassword({ user, url }) {
			console.log(`[AUTH] Reset password request for ${user.email}`)

			try {
				await sendEmail({
					to: user.email,
					subject: 'Redefinir Senha - ST Fiscal',
					html: getResetPasswordEmailHtml(url, user.name),
				})
				console.log(`[AUTH] Reset password email sent to ${user.email}`)
			} catch (error) {
				console.error(`[AUTH] Failed to send reset password email:`, error)
				throw error
			}
		},
	},

	socialProviders: {
		microsoft: {
			clientId: process.env.MICROSOFT_CLIENT_ID as string,
			clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
			tenantId: process.env.MICROSOFT_TENANT_ID as string,
			authority: 'https://login.microsoftonline.com',
			prompt: 'select_account',
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},

	rateLimit: {
		enabled: true,
		window: 60,
		max: 50,
		customRules: {
			'/sign-in': { window: 60, max: 5 },
			'/sign-up': { window: 60, max: 5 },
		},
	},
	plugins: [organization(), username()],
	session: {
		expiresIn: 60 * 60 * 24 * 3,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},

	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					if (!user.email) return

					// Criar member na organização
					await ensureMember(user.id, user.email.toLowerCase()).catch((e) =>
						console.error('Erro ao criar member no cadastro:', e),
					)

					// Enviar email de boas-vindas
					try {
						await sendEmail({
							to: user.email,
							subject: 'Bem-vindo ao ST Fiscal!',
							html: getWelcomeEmailHtml(user.name),
						})
						console.log(`[AUTH] Welcome email sent to ${user.email}`)
					} catch (error) {
						console.error(`[AUTH] Failed to send welcome email:`, error)
						// Não lançar erro para não bloquear o cadastro
					}
				},
			},
		},

		session: {
			create: {
				after: async (session) => {
					try {
						const user = await prisma.user.findUnique({
							where: { id: session.userId },
							select: { email: true },
						})
						if (!user?.email) return

						const result = await ensureMember(
							session.userId,
							user.email.toLowerCase(),
						)
						if (!result) return

						await prisma.session.update({
							where: { id: session.id },
							data: { activeOrganizationId: result.organizationId },
						})
					} catch (error) {
						console.error('Erro ao configurar sessão:', error)
					}
				},
			},
		},
	},
})
