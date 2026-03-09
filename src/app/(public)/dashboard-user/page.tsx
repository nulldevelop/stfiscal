import { Building2, Mail, ShieldAlert, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { getSession } from '@/lib/auth-actions'

const SUPPORT_EMAIL = 'informatica@pmcgs.pr.gov.br'

export default async function NoOrganizationPage() {
	const session = await getSession()

	if (!session) {
		console.log('No session found, redirecting to home.')
		redirect('/')
	}

	const userName = session.user.name || 'Usuário'
	const userEmail = session.user.email || ''

	const emailSubject = encodeURIComponent('Solicitação de Acesso ao SIBEA')
	const emailBody = encodeURIComponent(
		`Olá,

Solicito acesso ao sistema SIBEA.

Dados do usuário:
- Nome: ${userName}
- E-mail: ${userEmail}

Aguardo retorno.

Atenciosamente.`,
	)

	const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${emailSubject}&body=${emailBody}`

	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 p-4 dark:from-slate-900 dark:to-slate-800">
			<Card className="w-full max-w-lg shadow-xl">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-500" />
					</div>
					<div className="space-y-2">
						<CardTitle className="text-2xl font-bold">
							Acesso Restrito
						</CardTitle>
						<CardDescription className="text-base">
							Seu usuário ainda não está vinculado a uma organização
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="rounded-lg border /50 p-4">
						<div className="flex items-center gap-3">
							<User className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">{userName}</p>
								<p className="text-xs text-muted-foreground">{userEmail}</p>
							</div>
						</div>
					</div>

					<div className="space-y-3 text-center">
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Building2 className="h-5 w-5" />
							<span className="text-sm">Nenhuma organização vinculada</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Para utilizar o sistema, é necessário que um administrador vincule
							seu usuário a uma organização. Entre em contato com o setor de
							informática para solicitar acesso.
						</p>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-3">
					<Button asChild className="w-full" size="lg">
						<a href={mailtoLink}>
							<Mail className="mr-2 h-4 w-4" />
							Solicitar Acesso por E-mail
						</a>
					</Button>
					<p className="text-center text-xs text-muted-foreground">
						Será aberto seu cliente de e-mail para enviar a solicitação para{' '}
						<span className="font-medium text-foreground">{SUPPORT_EMAIL}</span>
					</p>
				</CardFooter>
			</Card>
		</div>
	)
}
