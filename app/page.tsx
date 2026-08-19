import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Pricing from '@/components/Pricing'
import Occasion from '@/components/Occasion'
import Diagnostic from '@/components/Diagnostic'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

/**
 * Hiérarchie de l'accueil :
 *   Hero → Tarification (réparer) → Marketplace (acheter)
 *        → Diagnostic (analyser) → Contact → Footer
 */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Pricing />
      <Occasion />
      <Diagnostic />
      <Contact />
      <Footer />
    </main>
  )
}
