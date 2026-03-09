import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'

export async function BreadcrumbWrapper() {

	return (
		<div className="flex items-center gap-2">
			<DynamicBreadcrumbs />
		</div>
	)
}
