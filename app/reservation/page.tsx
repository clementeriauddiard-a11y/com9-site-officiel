// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Réservation d'une intervention à domicile
// Route : /reservation   (?reparation=ecran · ?parcours=autre&symptome=charge)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import Footer from '@/components/Footer'
import BookingFlow from '@/components/booking/BookingFlow'
import { HORAIRES_TEXTE } from '@/config/com9'
import { distanceConfigured } from '@/lib/distance'

export const metadata: Metadata = {
  title: 'Réserver une intervention',
  description:
    "Choisissez votre réparation, votre smartphone, indiquez votre adresse et un créneau : COM'9 vient chez vous. Prix total affiché avant d'envoyer la demande.",
  alternates: { canonical: '/reservation' },
}

export default function ReservationPage() {
  return (
    <>
    <PageHeader hideCta label={`Réparation à domicile · ${HORAIRES_TEXTE.accroche.toLowerCase()}`}
      title={<>Réserver une <span className="c9-hl">intervention</span></>}
      sub={<>Votre réparation, votre adresse, votre créneau : le prix total s&apos;affiche avant d&apos;envoyer la demande.
        COM&apos;9 confirme ensuite le rendez-vous.</>} />
    <main className="c9-light relative min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 pb-32 pt-8 md:px-8 md:pt-10 lg:pb-24">

        <Suspense fallback={null}>
          {/* Calcul par la route seulement si la clé Google Maps est configurée sur Vercel */}
          <BookingFlow distanceEnabled={distanceConfigured()} />
        </Suspense>
      </div>
    </main>
    <Footer />
    </>
  )
}
