// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Page publique : demande de rendez-vous
// Route : /reservation
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackLink from '@/components/ui/BackLink'
import BookingForm from '@/components/booking/BookingForm'

export const metadata: Metadata = {
  title: "Demander un rendez-vous — Com'9",
  description:
    "Demandez une intervention Com'9 à domicile : réparation d'écran, de batterie ou de vitre arrière d'iPhone. Com'9 confirme le créneau ou propose une autre disponibilité.",
  alternates: { canonical: '/reservation' },
}

export default function ReservationPage() {
  return (
    <main className="relative min-h-screen" style={{ background: 'var(--c9-bg)' }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(26,169,255,0.08) 0%, transparent 70%)' }} />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-24 pt-24 sm:px-8">
        <BackLink href="/#tarifs" label="Tarifs" />

        <header className="mb-10 mt-8 flex flex-col gap-4">
          <span className="section-label">Intervention à domicile</span>
          <h1 className="c9-title font-space">Rendez-vous</h1>
          <p className="c9-subtitle max-w-xl font-space">
            Envoyez votre demande en quelques instants. COM&apos;9 vous confirme le créneau ou vous propose une autre disponibilité.
          </p>
        </header>

        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
