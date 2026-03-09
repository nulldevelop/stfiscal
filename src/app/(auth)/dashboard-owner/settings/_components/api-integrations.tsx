'use client'

import {
	CheckCircle2,
	Clock,
	FilePlus2,
	FileText,
	Gavel,
	KeyRound,
	Loader2,
	Lock,
	Mail,
	RefreshCw,
	ServerCog,
	UserCheck,
	XCircle,
	Zap,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
	triggerManualSync,
	updateApiConfig,
} from '../_actions/update-api-config'
import type { ApiConfig } from '../_types/api-config'

interface Props {
	config: ApiConfig | null
}

const endpoints = [
	{
		id: 'contratos',
		label: 'Contratos',
		description: 'Endpoint de contratos vigentes',
		icon: FileText,
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
		placeholder: 'https://portal.oxy.elotech.com.br/.../api/contratos',
	},
	{
		id: 'licitacoes',
		label: 'Licitações',
		description: 'Enriquece dados de data e situação',
		icon: Gavel,
		color: 'text-violet-500',
		bg: 'bg-violet-500/10',
		placeholder: 'https://portal.oxy.elotech.com.br/.../api/licitacoes',
	},
	{
		id: 'fiscais',
		label: 'Responsáveis',
		description: 'Fiscais vinculados a cada contrato',
		icon: UserCheck,
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
		placeholder:
			'https://portal.oxy.elotech.com.br/.../api/responsaveis/contrato',
	},
	{
		id: 'aditivos',
		label: 'Aditivos',
		description: 'Aditivos vinculados a cada contrato',
		icon: FilePlus2,
		color: 'text-orange-500',
		bg: 'bg-orange-500/10',
		placeholder: 'https://portal.oxy.elotech.com.br/.../api/aditivos',
	},
]

export function ApiIntegrations({ config }: Props) {
	const [isPendingApi, startApiTransition] = useTransition()
	const [isPendingSmtp, startSmtpTransition] = useTransition()
	const [isSyncing, startSyncTransition] = useTransition()

	const [apiUrlContratos, setApiUrlContratos] = useState(
		config?.apiUrlContratos ?? '',
	)
	const [apiUrlLicitacoes, setApiUrlLicitacoes] = useState(
		config?.apiUrlLicitacoes ?? '',
	)
	const [apiUrlFiscais, setApiUrlFiscais] = useState(
		config?.apiUrlFiscais ?? '',
	)
	const [apiUrlAditivos, setApiUrlAditivos] = useState(
		config?.apiUrlAditivos ?? '',
	)
	const [autoLinkFiscais, setAutoLinkFiscais] = useState(
		config?.autoLinkFiscais ?? false,
	)
	const [smtpHost, setSmtpHost] = useState(config?.smtpHost ?? '')
	const [smtpPort, setSmtpPort] = useState(String(config?.smtpPort ?? 587))
	const [smtpUser, setSmtpUser] = useState(config?.smtpUser ?? '')
	const [smtpPass, setSmtpPass] = useState('')
	const [smtpFrom, setSmtpFrom] = useState(config?.smtpFrom ?? '')
	const [notifyEmail, setNotifyEmail] = useState(config?.notifyEmail ?? '')

	const urlByEndpoint: Record<string, string> = {
		contratos: apiUrlContratos,
		licitacoes: apiUrlLicitacoes,
		fiscais: apiUrlFiscais,
		aditivos: apiUrlAditivos,
	}
	const setterByEndpoint: Record<string, (v: string) => void> = {
		contratos: setApiUrlContratos,
		licitacoes: setApiUrlLicitacoes,
		fiscais: setApiUrlFiscais,
		aditivos: setApiUrlAditivos,
	}

	const allEndpointsFilled =
		!!apiUrlContratos &&
		!!apiUrlLicitacoes &&
		!!apiUrlFiscais &&
		!!apiUrlAditivos

	function handleSaveApi() {
		startApiTransition(async () => {
			const result = await updateApiConfig({
				apiUrlContratos: apiUrlContratos || undefined,
				apiUrlLicitacoes: apiUrlLicitacoes || undefined,
				apiUrlFiscais: apiUrlFiscais || undefined,
				apiUrlAditivos: apiUrlAditivos || undefined,
				autoLinkFiscais,
			})
			if (result?.error) toast.error(result.error)
			else toast.success('Configurações de API salvas')
		})
	}

	function handleSaveSmtp() {
		startSmtpTransition(async () => {
			const result = await updateApiConfig({
				smtpHost: smtpHost || undefined,
				smtpPort: smtpPort ? Number(smtpPort) : undefined,
				smtpUser: smtpUser || undefined,
				smtpPass: smtpPass || undefined,
				smtpFrom: smtpFrom || undefined,
				notifyEmail: notifyEmail || undefined,
			})
			if (result?.error) toast.error(result.error)
			else toast.success('Configurações SMTP salvas')
		})
	}

	function handleSync() {
		startSyncTransition(async () => {
			toast.info('Iniciando sincronização...')
			const result = await triggerManualSync()
			if (!result) {
				toast.error('Erro desconhecido')
				return
			}
			if ('error' in result) toast.error(`Falha: ${result.error}`)
			else if (result.success) toast.success(result.message)
			else toast.error(result.message)
		})
	}

	const lastSync = config?.lastSyncAt
	const syncStatus = config?.lastSyncStatus
	const isSuccess = syncStatus === 'success'

	return (
		<div className="space-y-6 text-foreground">

			{/* ── Status de Sincronização ── */}
			<div className={`relative overflow-hidden rounded-xl border p-5 ${
				lastSync
					? isSuccess
						? 'border-blue-500/20 bg-blue-500/5'
						: 'border-destructive/20 bg-destructive/5'
					: 'border-border bg-muted/30'
			}`}>
				{/* Decorative glow */}
				{lastSync && (
					<div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-20 ${isSuccess ? 'bg-blue-500' : 'bg-destructive'}`} />
				)}

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
							lastSync
								? isSuccess
									? 'bg-blue-500/15'
									: 'bg-destructive/15'
								: 'bg-muted'
						}`}>
							{isSyncing ? (
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							) : lastSync ? (
								isSuccess ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								) : (
									<XCircle className="h-5 w-5 text-destructive" />
								)
							) : (
								<ServerCog className="h-5 w-5 text-muted-foreground" />
							)}
						</div>

						<div className="space-y-0.5">
							<div className="flex items-center gap-2">
								<p className="text-sm font-semibold">Sincronização</p>
								{lastSync ? (
									<Badge
										variant={isSuccess ? 'default' : 'destructive'}
										className={`text-[10px] px-1.5 py-0 ${isSuccess ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20' : ''}`}
									>
										{isSuccess ? 'Sucesso' : 'Falhou'}
									</Badge>
								) : (
									<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
										Aguardando
									</Badge>
								)}
							</div>

							{lastSync ? (
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Clock className="h-3 w-3" />
									{new Date(lastSync).toLocaleString('pt-BR')}
								</div>
							) : (
								<p className="text-xs text-muted-foreground">
									Nenhuma sincronização realizada ainda.
								</p>
							)}

							{config?.lastSyncMessage && (
								<p className={`text-xs mt-1 ${isSuccess ? 'text-blue-700 dark:text-blue-400' : 'text-destructive'}`}>
									{config.lastSyncMessage}
								</p>
							)}

							<div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
								<Zap className="h-3 w-3" />
								Agendamento automático todos os dias às <strong>03:00</strong>
							</div>
						</div>
					</div>

					<Button
						size="sm"
						variant={lastSync ? 'outline' : 'default'}
						onClick={handleSync}
						disabled={isSyncing || !allEndpointsFilled}
						className="shrink-0 w-full sm:w-auto"
					>
						<RefreshCw className={`mr-2 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
						{isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
					</Button>
				</div>
			</div>

			{/* ── Endpoints da API ── */}
			<div className="rounded-xl border bg-card">
				<div className="flex items-center gap-3 border-b px-5 py-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
						<ServerCog className="h-4 w-4 text-primary" />
					</div>
					<div>
						<p className="text-sm font-semibold">Endpoints da API</p>
						<p className="text-xs text-muted-foreground">
							URLs de origem dos dados do portal de transparência
						</p>
					</div>
				</div>

				<div className="p-5 space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						{endpoints.map((ep) => {
							const Icon = ep.icon
							const value = urlByEndpoint[ep.id] ?? ''
							const setVal = setterByEndpoint[ep.id]
							const filled = value.length > 0

							return (
								<div
									key={ep.id}
									className={`rounded-lg border p-4 space-y-3 transition-colors ${filled ? 'border-border bg-muted/20' : 'border-border/50 bg-muted/10'}`}
								>
									<div className="flex items-center gap-2.5">
										<div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ep.bg}`}>
											<Icon className={`h-3.5 w-3.5 ${ep.color}`} />
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-1.5">
												<p className="text-xs font-semibold">{ep.label}</p>
												{filled && (
													<span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
												)}
											</div>
											<p className="text-[10px] text-muted-foreground truncate">
												{ep.description}
											</p>
										</div>
									</div>
									<Input
										placeholder={ep.placeholder}
										value={value}
										onChange={(e) => setVal(e.target.value)}
										className="font-mono text-xs h-8"
									/>
								</div>
							)
						})}
					</div>

					<Separator />

					{/* Vinculação automática */}
					<div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
						<div className="flex items-center gap-2.5">
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
								<Zap className="h-3.5 w-3.5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium">Vinculação automática de fiscais</p>
								<p className="text-xs text-muted-foreground">
									Fiscais vinculados automaticamente no primeiro login
								</p>
							</div>
						</div>
						<Switch checked={autoLinkFiscais} onCheckedChange={setAutoLinkFiscais} />
					</div>
				</div>

				<div className="flex items-center justify-between border-t px-5 py-3">
					{!allEndpointsFilled && (
						<p className="text-xs text-muted-foreground">
							Preencha todos os endpoints para sincronizar.
						</p>
					)}
					<div className="ml-auto">
						<Button size="sm" onClick={handleSaveApi} disabled={isPendingApi}>
							{isPendingApi ? (
								<><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Salvando...</>
							) : (
								'Salvar configurações'
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* ── SMTP ── */}
			<div className="rounded-xl border bg-card">
				<div className="flex items-center gap-3 border-b px-5 py-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
						<Mail className="h-4 w-4 text-primary" />
					</div>
					<div>
						<p className="text-sm font-semibold">Notificações por E-mail</p>
						<p className="text-xs text-muted-foreground">
							Servidor SMTP para envio de relatórios de sincronização
						</p>
					</div>
				</div>

				<div className="divide-y">
					{/* Conexão */}
					<div className="px-5 py-4 space-y-3">
						<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
							<ServerCog className="h-3.5 w-3.5" />
							Conexão
						</div>
						<div className="grid gap-3 sm:grid-cols-[1fr_120px]">
							<div className="space-y-1.5">
								<Label htmlFor="smtp-host" className="text-xs font-medium">
									Host SMTP
								</Label>
								<Input
									id="smtp-host"
									placeholder="smtp.gmail.com"
									value={smtpHost}
									onChange={(e) => setSmtpHost(e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="smtp-port" className="text-xs font-medium">
									Porta
								</Label>
								<Input
									id="smtp-port"
									type="number"
									placeholder="587"
									value={smtpPort}
									onChange={(e) => setSmtpPort(e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Autenticação */}
					<div className="px-5 py-4 space-y-3">
						<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
							<KeyRound className="h-3.5 w-3.5" />
							Autenticação
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="smtp-user" className="text-xs font-medium">
									Usuário
								</Label>
								<Input
									id="smtp-user"
									placeholder="seu@email.com"
									value={smtpUser}
									onChange={(e) => setSmtpUser(e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="smtp-pass" className="text-xs font-medium flex items-center gap-1">
									<Lock className="h-3 w-3" />
									Senha
								</Label>
								<Input
									id="smtp-pass"
									type="password"
									placeholder="••••••••"
									value={smtpPass}
									onChange={(e) => setSmtpPass(e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Endereços */}
					<div className="px-5 py-4 space-y-3">
						<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
							<Mail className="h-3.5 w-3.5" />
							Endereços
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="smtp-from" className="text-xs font-medium">
									Remetente (From)
								</Label>
								<Input
									id="smtp-from"
									placeholder="noreply@stfiscal.gov.br"
									value={smtpFrom}
									onChange={(e) => setSmtpFrom(e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="notify-email" className="text-xs font-medium">
									E-mail de notificações
								</Label>
								<Input
									id="notify-email"
									placeholder="admin@stfiscal.gov.br"
									value={notifyEmail}
									onChange={(e) => setNotifyEmail(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end border-t px-5 py-3">
					<Button size="sm" onClick={handleSaveSmtp} disabled={isPendingSmtp}>
						{isPendingSmtp ? (
							<><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Salvando...</>
						) : (
							'Salvar configurações'
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
