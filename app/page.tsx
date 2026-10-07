import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import { HowItWorks, OtherProblem, Tarifs, Trust } from '@/components/home/Sections'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'

/**
 * Accueil — réparation smartphone à domicile (atelier mobile).
 *   Hero (concept + CTA) → Comment ça marche → Tarifs → Autre problème
 *   → Horaires & confiance → Contact → Pied de page
 * Alternance sombre / claire pour la lisibilité.
 */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <StructuredData />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Tarifs />
      <OtherProblem />
      <Trust />
      <Contact />
      <Footer />
    </main>
  )
}
