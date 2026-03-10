import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/shared/providers'
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
	title: 'ST - Fiscalização e Relatórios',
	description: 'ST - Fiscalização e Relatórios',
	openGraph: {
		images: '/images/logo.svg',
	},
	icons: {
		icon: '/images/logo.svg',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} text-foreground`}
			>
				<ThemeProvider>
					<Providers>
						{children}
						<Toaster
							duration={2000}
							position="top-right"
							richColors
							closeButton
						/>
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	)
}
