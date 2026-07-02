import ParticleBackground from '@/components/ParticleBackground'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Pricing from '@/components/Pricing'
import Diagnostic from '@/components/Diagnostic'
import Occasion from '@/components/Occasion'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative bg-space-black min-h-screen overflow-x-hidden">
      <ParticleBackground />
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
