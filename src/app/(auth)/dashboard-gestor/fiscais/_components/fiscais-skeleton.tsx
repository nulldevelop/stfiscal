import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

export function FiscaisSkeleton() {
	return (
		<Card className="py-2">
			<CardContent>
				<div className="relative w-full overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Matrícula</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i.toString()}>
									<TableCell>
										<Skeleton className="h-5 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-56" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20 rounded-full" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="h-8 w-8 ml-auto rounded-md" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<Skeleton className="h-4 w-40" />
				<div className="flex items-center space-x-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-20" />
				</div>
			</CardFooter>
		</Card>
	)
}
