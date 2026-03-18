import type { Metadata } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { Analytics } from '@vercel/analytics/next'
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

const poppins = Poppins({
	variable: '--font-poppins',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
	title: 'ST - Fiscalização e Relatórios',
	description: 'ST - Fiscalização e Relatórios',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	),
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
				className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} text-foreground`}
			>
				<ThemeProvider>
					<Providers>
						{children}
						<Analytics />
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
