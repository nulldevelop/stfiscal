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

export function ContratosSkeleton() {
	return (
		<Card className="w-full py-2">
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Licitação</TableHead>
								<TableHead>Tipo Ato</TableHead>
								<TableHead>Contratado</TableHead>
								<TableHead className="hidden md:table-cell text-center">Início</TableHead>
								<TableHead className="hidden md:table-cell text-center">Fim</TableHead>
								<TableHead className="table-cell md:hidden text-center">Vigência</TableHead>
								<TableHead>Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-48" />
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Skeleton className="h-5 w-20 mx-auto" />
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Skeleton className="h-5 w-20 mx-auto" />
									</TableCell>
									<TableCell className="table-cell md:hidden">
										<div className="flex flex-col gap-1 items-center">
											<Skeleton className="h-3 w-16" />
											<Skeleton className="h-3 w-16" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8 rounded-md" />
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
