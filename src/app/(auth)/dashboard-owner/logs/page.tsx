import {
	IconCalendarClock,
	IconClipboardList,
	IconDatabase,
	IconEdit,
	IconPlus,
	IconSearch,
	IconTrash,
	IconUser,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import type { LogAction } from '@/generated/prisma/client'
import { formatDataWithHours } from '@/utils/formatData'
import { LogDetailDialog } from './_components/log-detail-dialog'
import { LogFilters } from './_components/log-filters'
import { LogPagination } from './_components/log-pagination'
import {
	getAuditLogEntities,
	getAuditLogs,
} from './_data-access/get-audit-logs'

const ACTION_CONFIG: Record<
	LogAction,
	{ label: string; class: string; icon: any }
> = {
	CREATE: {
		label: 'Criação',
		class:
			'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
		icon: IconPlus,
	},
	UPDATE: {
		label: 'Edição',
		class:
			'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
		icon: IconEdit,
	},
	DELETE: {
		label: 'Exclusão',
		class:
			'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
		icon: IconTrash,
	},
}

const PAGE_SIZE = 20

type SearchParams = Promise<{ action?: string; entity?: string; page?: string }>

export default async function LogsPage({
	searchParams,
}: {
	searchParams: SearchParams
}) {
	const params = await searchParams

	const action =
		params.action === 'CREATE' ||
		params.action === 'UPDATE' ||
		params.action === 'DELETE'
			? (params.action as LogAction)
			: undefined

	const entity = params.entity ?? undefined
	const page = Math.max(1, Number(params.page ?? 1))

	const [logsResult, entitiesResult] = await Promise.all([
		getAuditLogs({ action, entity, page, pageSize: PAGE_SIZE }),
		getAuditLogEntities(),
	])

	if (!logsResult.success || !entitiesResult.success) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<Card className="w-full max-w-md border-red-200 bg-red-50/50">
					<CardHeader>
						<CardTitle className="text-red-700">Erro no Carregamento</CardTitle>
						<CardDescription>
							{'error' in logsResult && typeof logsResult.error === 'string'
								? logsResult.error
								: 'Não foi possível carregar os logs de auditoria.'}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	const { logs, total, totalPages } = logsResult.data
	const entities = entitiesResult.data

	return (
		<div className="flex flex-col gap-6 w-full py-4">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg text-primary">
							<IconClipboardList className="h-6 w-6" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Audit Logs
						</h1>
					</div>
					<p className="text-muted-foreground text-sm pl-11">
						Rastreabilidade completa de todas as ações administrativas
						realizadas no sistema.
					</p>
				</div>

				<LogFilters
					entities={entities}
					currentAction={params.action}
					currentEntity={params.entity}
				/>
			</div>

			<Separator />

			{/* Main Content */}
			<div className="grid gap-6">
				<Card className="border-none shadow-none bg-transparent">
					<CardContent className="p-0">
						{logs.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 py-24 bg-card border border-dashed rounded-2xl text-muted-foreground">
								<div className="p-4 bg-muted rounded-full">
									<IconSearch className="h-8 w-8 opacity-20" />
								</div>
								<div className="text-center">
									<p className="font-semibold">Nenhum log encontrado</p>
									<p className="text-sm opacity-70">
										Tente ajustar os filtros para encontrar o que procura.
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between px-1">
									<div className="flex items-center gap-2 text-sm font-medium">
										<Badge variant="secondary" className="font-bold">
											{total}
										</Badge>
										<span className="text-muted-foreground">
											{total === 1
												? 'operação registrada'
												: 'operações registradas'}
										</span>
									</div>
								</div>

								<div className="rounded-xl border bg-card shadow-sm overflow-hidden overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50 hover:bg-muted/50">
												<TableHead className="w-[180px]">
													<div className="flex items-center gap-2">
														<IconCalendarClock className="h-3.5 w-3.5" />
														Data / Hora
													</div>
												</TableHead>
												<TableHead>
													<div className="flex items-center gap-2">
														<IconUser className="h-3.5 w-3.5" />
														Responsável
													</div>
												</TableHead>
												<TableHead className="w-[120px]">Ação</TableHead>
												<TableHead>
													<div className="flex items-center gap-2">
														<IconDatabase className="h-3.5 w-3.5" />
														Entidade
													</div>
												</TableHead>
												<TableHead className="min-w-[200px]">
													Registro Afetado
												</TableHead>
												<TableHead className="w-[80px] text-right">
													Detalhes
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{logs.map((log) => {
												const config = ACTION_CONFIG[log.action]
												const ActionIcon = config.icon

												return (
													<TableRow
														key={log.id}
														className="group hover:bg-muted/30 transition-colors"
													>
														<TableCell className="whitespace-nowrap">
															<span className="text-sm tabular-nums text-muted-foreground">
																{formatDataWithHours(log.createdAt)}
															</span>
														</TableCell>
														<TableCell>
															<div className="flex flex-col max-w-[200px]">
																<span className="text-sm font-semibold leading-tight truncate">
																	{log.userName}
																</span>
																<span className="text-[11px] text-muted-foreground truncate">
																	{log.userEmail}
																</span>
															</div>
														</TableCell>
														<TableCell>
															<Badge
																variant="outline"
																className={`gap-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${config.class}`}
															>
																<ActionIcon className="h-3 w-3" />
																{config.label}
															</Badge>
														</TableCell>
														<TableCell>
															<span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-transparent">
																{log.entity}
															</span>
														</TableCell>
														<TableCell>
															<div className="flex flex-col max-w-[250px]">
																{log.entityName ? (
																	<span className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
																		{log.entityName}
																	</span>
																) : null}
																{log.entityId ? (
																	<code className="text-[10px] font-mono text-muted-foreground/70 truncate block">
																		{log.entityId}
																	</code>
																) : null}
																{!log.entityName && !log.entityId && (
																	<span className="text-xs text-muted-foreground italic">
																		Identificador não disponível
																	</span>
																)}
															</div>
														</TableCell>
														<TableCell className="text-right">
															<LogDetailDialog
																before={log.before}
																after={log.after}
																entityName={log.entityName}
																entityId={log.entityId}
															/>
														</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</div>

								<div className="pt-2">
									<LogPagination
										page={page}
										totalPages={totalPages}
										total={total}
										pageSize={PAGE_SIZE}
									/>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
