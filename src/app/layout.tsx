import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/shared/theme-provider'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'SIRA - PMCGS',
	description: 'SIRA - Sistema Integrado de Relatórios Administrativos',
	openGraph: {
		images: '/imgs/logo.svg',
	},
	icons: {
		icon: '/imgs/logo.svg',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} text-foreground`}>
				<ThemeProvider>
					{children}
					<Toaster duration={2000} position="top-right" richColors closeButton />
				</ThemeProvider>
			</body>
		</html>
	)
}
