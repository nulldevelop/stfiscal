export interface ApiConfig {
	apiUrlContratos: string | null
	apiUrlLicitacoes: string | null
	apiUrlFiscais: string | null
	apiUrlAditivos: string | null
	autoLinkFiscais: boolean
	smtpHost: string | null
	smtpPort: number | null
	smtpUser: string | null
	smtpFrom: string | null
	notifyEmail: string | null
	lastSyncAt: Date | null
	lastSyncStatus: string | null
	lastSyncMessage: string | null
}
