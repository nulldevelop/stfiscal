import { Skeleton } from '@/components/ui/skeleton'

export function MensagensFiscalSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4 px-4">
				<Skeleton className="h-8 w-48" />
				<div className="flex flex-1 items-center justify-end gap-4">
					<Skeleton className="h-10 w-64" />
				</div>
			</div>
			<div className="mx-4 space-y-4">
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	)
}
