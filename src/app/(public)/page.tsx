import { HomeCta } from '@/components/home/home-cta'
import { HomeFeatures } from '@/components/home/home-features'
import { HomeFooter } from '@/components/home/home-footer'
import { HomeHero } from '@/components/home/home-hero'
import { HomeNav } from '@/components/home/home-nav'

export default function Home() {
	return (
		<div className="relative min-h-screen bg-background">
			<HomeNav />
			<main>
				<HomeHero />
				<HomeFeatures />
				<HomeCta />
			</main>
			<HomeFooter />
		</div>
	)
}
