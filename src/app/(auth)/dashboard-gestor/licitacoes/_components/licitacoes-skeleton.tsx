import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function LicitacoesSkeleton() {
	return (
		<Card className="py-2">
			<CardContent>
				<div className="relative w-full overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Exercício</TableHead>
								<TableHead>Modalidade</TableHead>
								<TableHead>Objeto</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-32 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-64" />
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
