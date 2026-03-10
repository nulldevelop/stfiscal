'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	if (!mounted) return <div className="size-8" />

	const isDark = resolvedTheme === 'dark'

	return (
		<button
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			aria-label="Alternar tema"
			className="group flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
		>
			{isDark ? (
				<IconSun className="size-5 animate-in fade-in zoom-in-75 duration-200" />
			) : (
				<IconMoon className="size-5 animate-in fade-in zoom-in-75 duration-200" />
			)}
		</button>
	)
}
