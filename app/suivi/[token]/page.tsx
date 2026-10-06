// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Suivi de rendez-vous (lien personnel du client)
// Route : /suivi/[jeton]   — non indexée, sans Referer, jamais mise en cache
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrackingView from '@/components/booking/TrackingView'
import { getClientView, type ClientView } from '@/lib/agenda/service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Suivi de votre rendez-vous',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  let view: ClientView | null = null
  let unavailable = false
  try {
    view = await getClientView(token)
  } catch (err) {
    console.error("[COM'9 Suivi]", err)
    unavailable = true
  }

  return (
    <main className="relative min-h-screen" style={{ background: 'var(--c9-bg)' }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(26,169,255,0.08) 0%, transparent 70%)' }} />
      </div>
      <Navbar />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-24 pt-28 sm:px-8">
        <header className="mb-8 flex flex-col gap-3">
          <span className="section-label">Votre rendez-vous</span>
          <h1 className="c9-title font-space">Suivi</h1>
        </header>

        {view ? (
          <TrackingView token={token} initial={view} />
        ) : (
          <div className="c9-surface flex flex-col gap-3 rounded-[24px] p-6 sm:p-8">
            <p className="font-space text-[1.125rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
              {unavailable ? 'Suivi momentanément indisponible' : 'Ce lien de suivi n’est pas valide ou a expiré.'}
            </p>
            <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
              {unavailable
                ? 'Réessayez dans quelques instants.'
                : 'Vérifiez le lien reçu de COM’9, ou demandez-lui un nouveau lien.'}
            </p>
            <Link href="/" className="self-start font-space text-[0.9375rem] underline" style={{ color: 'var(--c9-text-2)' }}>
              Retour à l&apos;accueil
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
