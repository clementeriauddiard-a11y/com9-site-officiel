// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — En-tête des pages intérieures (réservation, suivi, 404)
// Même DA que l'accueil : bandeau noir avec la barre de navigation, étiquette,
// grand titre (un mot en cuivre) ; le contenu suit en section sable.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'

export default function PageHeader({ label, title, sub, narrow = false, hideCta = false }: {
  label: string
  title: ReactNode
  sub?: ReactNode
  /** largeur de lecture étroite (suivi) */
  narrow?: boolean
  hideCta?: boolean
}) {
  return (
    <header style={{ background: 'var(--c9-bg)', borderBottom: '1px solid var(--c9-hairline-soft)' }}>
      <Navbar hideCta={hideCta} />
      <div className={`mx-auto w-full px-5 md:px-8 ${narrow ? 'max-w-2xl sm:px-8' : 'max-w-6xl'}`}
        style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px) + 2.25rem)', paddingBottom: '2.5rem' }}>
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="section-label">{label}</span>
          <h1 className="c9-title" style={{ fontSize: 'clamp(2rem, 4.6vw, 3rem)' }}>{title}</h1>
          {sub && <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{sub}</p>}
        </div>
      </div>
    </header>
  )
}
