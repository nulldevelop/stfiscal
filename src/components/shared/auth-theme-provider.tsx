'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const AuthThemeContext = createContext<{
	theme: Theme
	setTheme: (t: Theme) => void
}>({
	theme: 'light',
	setTheme: () => {},
})

export function useAuthTheme() {
	return useContext(AuthThemeContext)
}

export function AuthThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>('light')

	useEffect(() => {
		const saved = localStorage.getItem('auth-theme') as Theme | null
		let currentTheme: Theme = 'light'

		if (saved === 'dark' || saved === 'light') {
			currentTheme = saved
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			currentTheme = 'dark'
		}

		setThemeState(currentTheme)
		document.documentElement.classList.toggle('dark', currentTheme === 'dark')
	}, [])

	function setTheme(t: Theme) {
		setThemeState(t)
		localStorage.setItem('auth-theme', t)
		document.documentElement.classList.toggle('dark', t === 'dark')
	}

	return (
		<AuthThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</AuthThemeContext.Provider>
	)
}
