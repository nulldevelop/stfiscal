import {
	IconAlertCircle,
	IconSettings,
	IconShield,
	IconUsers,
} from '@tabler/icons-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getModules } from '../modules/_data-access/get-modules'
import { PermissionSelector } from './_components/permission-selector'
import { getMembersWithPermissions } from './_data-access/get-members-permissions'

const DEFAULT_MODULES = [
	{ key: 'contratos', label: 'Contratos' },
	{ key: 'licitacoes', label: 'Licitações' },
	{ key: 'fiscais', label: 'Fiscais' },
	{ key: 'relatorios', label: 'Relatórios' },
	{ key: 'notificacoes', label: 'Notificações' },
	{ key: 'organizacao', label: 'Organização' },
	{ key: 'empresas', label: 'Empresas' },
]

export default async function PermissionsPage() {
	const [result, modulesResult] = await Promise.all([
		getMembersWithPermissions(),
		getModules(),
	])

	if (!result.success) {
		return (
			<div className="flex min-h-svh items-center justify-center p-4">
				<div className="flex max-w-md items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
					<IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="text-sm">{result.error}</p>
				</div>
			</div>
		)
	}

	const members = result.data ?? []

	const dbModules =
		modulesResult.success && modulesResult.data && modulesResult.data.length > 0
			? modulesResult.data.map((m) => ({ key: m.key, label: m.name }))
			: null

	const modules = dbModules ?? DEFAULT_MODULES

	return (
		<div className="flex min-h-svh flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div className="flex items-start gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<IconShield className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
							Gerenciar Permissões
						</h1>
						<p className="mt-1 text-muted-foreground">
							Selecione um membro e um módulo para configurar o acesso
						</p>
					</div>
				</div>
				<Button asChild variant="outline" className='text-foreground' size="default">
					<Link href="/dashboard-owner/modules">
						<IconSettings className="mr-2 h-4 w-4" />
						Gerenciar Módulos
					</Link>
				</Button>
			</div>

			{/* Selector */}
			{members.length > 0 ? (
				<PermissionSelector members={members} modules={modules} />
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<IconUsers className="mb-4 h-12 w-12 text-muted-foreground/50" />
						<p className="font-medium text-center text-muted-foreground">
							Nenhum membro encontrado
						</p>
						<p className="mt-1 text-center text-muted-foreground text-sm">
							Adicione membros à organização para gerenciar permissões
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
