'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { resolveEntityName } from '@/utils/resolve-entity-name'
import { routeMapping } from '@/utils/route-mapping'
import { UUID_REGEX } from '@/utils/uuid-regex'


// Detecta qual entidade o UUID representa baseado no segmento anterior
function getEntityType(segments: string[], index: number): string | null {
	if (index === 0) return null
	const parent = segments[index - 1]
	if (parent === 'championships') return 'championship'
	if (parent === 'teams') return 'team'
	return null
}

export function DynamicBreadcrumbs() {
	const pathname = usePathname()
	const segments = useMemo(
		() => pathname.split('/').filter((item) => item !== ''),
		[pathname],
	)
	const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({})

	useEffect(() => {
		const uuidSegments = segments
			.map((segment, index) => ({ segment, index }))
			.filter(({ segment }) => UUID_REGEX.test(segment))

		if (uuidSegments.length === 0) return

		for (const { segment, index } of uuidSegments) {
			if (resolvedNames[segment]) continue

			const entityType = getEntityType(segments, index)
			if (!entityType) continue

			resolveEntityName(segment, entityType).then((name) => {
				if (name) {
					setResolvedNames((prev) => ({ ...prev, [segment]: name }))
				}
			})
		}
	}, [segments, resolvedNames])

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{segments.map((segment, index) => {
					const href = `/${segments.slice(0, index + 1).join('/')}`
					const isLast = index === segments.length - 1

					let label: string
					if (UUID_REGEX.test(segment)) {
						label = resolvedNames[segment] ?? '...'
					} else {
						label =
							routeMapping[segment] ||
							segment.charAt(0).toUpperCase() + segment.slice(1)
					}

					return (
						<React.Fragment key={href}>
							<BreadcrumbItem className="hidden md:block">
								{isLast ? (
									<BreadcrumbPage>{label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={href}>{label}</BreadcrumbLink>
								)}
							</BreadcrumbItem>

							{!isLast && <BreadcrumbSeparator className="hidden md:block" />}
						</React.Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
