'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

export function BackButton() {
	const router = useRouter()

	return (
		<Button variant="ghost" size="sm" onClick={() => router.back()}>
			<IconArrowLeft className="mr-1 size-4" />
			Voltar
		</Button>
	)
}
