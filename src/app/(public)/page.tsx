import { HomeCta } from '@/components/home/home-cta'
import { HomeFeatures } from '@/components/home/home-features'
import { HomeFooter } from '@/components/home/home-footer'
import { HomeHero } from '@/components/home/home-hero'
import { HomeNav } from '@/components/home/home-nav'

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<HomeNav />
			<main className="flex-1">
				<HomeHero />
				<HomeFeatures />
				<HomeCta />
			</main>
			<HomeFooter />
		</div>
	)
}
