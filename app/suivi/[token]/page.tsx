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
    <>
    <main className="c9-light relative min-h-screen">
      <Navbar />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-24 sm:px-8"
        style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px) + 2.5rem)' }}>
        <header className="mb-8 flex flex-col gap-3">
          <span className="section-label">Votre rendez-vous</span>
          <h1 className="c9-title">Suivi</h1>
        </header>

        {view ? (
          <TrackingView token={token} initial={view} />
        ) : (
          <div className="c9-surface flex flex-col gap-3 rounded-[24px] p-6 sm:p-8">
            <p className="text-[1.125rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
              {unavailable ? 'Suivi momentanément indisponible' : 'Ce lien de suivi n’est pas valide ou a expiré.'}
            </p>
            <p className="text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
              {unavailable
                ? 'Réessayez dans quelques instants.'
                : 'Vérifiez le lien reçu de COM’9, ou demandez-lui un nouveau lien.'}
            </p>
            <Link href="/" className="self-start text-[0.9375rem] underline" style={{ color: 'var(--c9-text-2)' }}>
              Retour à l&apos;accueil
            </Link>
          </div>
        )}
      </div>
    </main>
    <Footer />
    </>
  )
}
