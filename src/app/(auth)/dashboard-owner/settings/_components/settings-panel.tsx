'use client'

import {
	IconBuilding,
	IconMapPin,
	IconPlug,
	IconUsers,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { OrganizationStatus } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'
import { updateOrganization } from '../_actions/update-organization'
import type { MemberItem } from '../_data-access/get-users-organization'
import type { OrganizationFormValues } from '../_schemas/organization.schema'
import type { ApiConfig } from '../_types/api-config'
import { ApiIntegrations } from './api-integrations'
import { LotacaoSettings } from './lotacao-settings'
import { Members } from './members'
import { OrganizationForm } from './organization-form'

interface Lotacao {
	id: string
	name: string
	createdAt: Date
}

interface Props {
	orgId: string
	defaultValues: OrganizationFormValues
	members: MemberItem[]
	nonMembers: { id: string; name: string; email: string }[]
	lotacoes: Lotacao[]
	apiConfig: ApiConfig | null
}

const triggerClass =
	'relative h-11 rounded-none border-b-2 border-transparent px-4 font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'

export function SettingsPanel({
	orgId,
	defaultValues,
	members,
	nonMembers,
	lotacoes,
	apiConfig,
}: Props) {
	const router = useRouter()
	const [status, setStatus] = useState(defaultValues.status)
	const [isPendingStatus, startStatusTransition] = useTransition()

	const handleStatusChange = (newStatus: OrganizationStatus) => {
		setStatus(newStatus)
		startStatusTransition(async () => {
			try {
				const result = await updateOrganization({
					...defaultValues,
					logo: defaultValues.logo ?? null,
					status: newStatus,
				})
				if (result.success) {
					toast.success('Status atualizado!')
					router.refresh()
				} else {
					setStatus(defaultValues.status)
					toast.error(result.error || 'Erro ao atualizar status')
				}
			} catch {
				setStatus(defaultValues.status)
				toast.error('Erro ao atualizar status')
			}
		})
	}

	return (
		<Tabs defaultValue="info" className="w-full">
			{/* Tabs com underline */}
			<div className="mb-8 border-b">
				<TabsList className="h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0">
					<TabsTrigger value="info" className={triggerClass}>
						<IconBuilding className="mr-2 h-4 w-4" />
						Organização
					</TabsTrigger>

					<TabsTrigger value="membros" className={triggerClass}>
						<IconUsers className="mr-2 h-4 w-4" />
						Membros
						<Badge
							variant="secondary"
							className="ml-2 px-1.5 py-0 text-[10px] font-bold"
						>
							{members.length}
						</Badge>
					</TabsTrigger>

					<TabsTrigger value="lotacoes" className={triggerClass}>
						<IconMapPin className="mr-2 h-4 w-4" />
						Lotações
						<Badge
							variant="secondary"
							className="ml-2 px-1.5 py-0 text-[10px] font-bold"
						>
							{lotacoes.length}
						</Badge>
					</TabsTrigger>

					<TabsTrigger value="integracoes" className={triggerClass}>
						<IconPlug className="mr-2 h-4 w-4" />
						Integrações
						{apiConfig?.lastSyncStatus && (
							<span
								className={cn(
									'ml-2 h-2 w-2 rounded-full',
									apiConfig.lastSyncStatus === 'success'
										? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
										: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]',
								)}
							/>
						)}
					</TabsTrigger>
				</TabsList>
			</div>

			{/* ── Organização ── */}
			<TabsContent value="info" className="mt-0 outline-none">
				<div className="mb-8 flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant="outline"
						disabled={isPendingStatus}
						onClick={() =>
							handleStatusChange(status === 'ACTIVE' ? 'DESACTIVE' : 'ACTIVE')
						}
						className="h-9 shrink-0 px-4 font-medium sm:self-center"
					>
						<span
							className={cn(
								'mr-2 h-2 w-2 rounded-full',
								status === 'ACTIVE'
									? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
									: 'bg-muted-foreground/50',
							)}
						/>
						{isPendingStatus
							? 'Atualizando...'
							: status === 'ACTIVE'
								? 'Organização Ativa'
								: 'Organização Inativa'}
					</Button>
				</div>
				<div className="px-1">
					<OrganizationForm
						key={status}
						organizationId={orgId}
						defaultValues={{ ...defaultValues, status }}
					/>
				</div>
			</TabsContent>

			{/* ── Membros ── */}
			<TabsContent value="membros" className="mt-0">
				<Members
					orgId={orgId}
					initialMembers={members}
					initialNonMembers={nonMembers}
				/>
			</TabsContent>

			{/* ── Lotações ── */}
			<TabsContent value="lotacoes" className="mt-0">
				<LotacaoSettings orgId={orgId} initialLotacoes={lotacoes} />
			</TabsContent>

			{/* ── Integrações ── */}
			<TabsContent value="integracoes" className="mt-0">
				<ApiIntegrations config={apiConfig} />
			</TabsContent>
		</Tabs>
	)
}
