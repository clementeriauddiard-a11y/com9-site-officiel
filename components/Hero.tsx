// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Hero : le concept compris en moins de 3 secondes
// « Votre smartphone réparé chez vous. » · jusqu'à 23h · On vient à vous.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { HORAIRES_TEXTE, ZONES } from '@/config/com9'
import { findModel, getOptions } from '@/data/tarifs'
import { euros } from '@/lib/money'
import Logo from '@/components/ui/Logo'

/** Exemple réel tiré de la grille (aucun prix écrit en dur ici). */
function example() {
  const m = findModel('iPhone 13')
  const opt = m ? getOptions('ecran', m).find((o) => o.recommended) ?? getOptions('ecran', m)[0] : null
  const zone = ZONES[0]
  if (!m || !opt || zone.feeCents === null) return null
  return { model: m.model, quality: opt.label, repair: opt.priceCents, travel: zone.feeCents, zone: zone.full }
}

export default function Hero() {
  const ex = example()
  return (
    <section id="accueil" className="c9-dark relative overflow-hidden" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}>
      {/* Lumière unique, très diffuse */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 85% 10%, rgba(0,168,248,0.16) 0%, transparent 70%), radial-gradient(50% 40% at 0% 100%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-7">
          {/* Téléphone : le logo d'abord, pour reconnaître COM'9 tout de suite */}
          <div className="c9-rise flex items-center gap-4 lg:hidden">
            <Logo size={112} priority />
            <span className="section-label">Réparation smartphone à domicile</span>
          </div>
          <span className="section-label c9-rise hidden lg:inline-flex">Réparation smartphone à domicile</span>

          <h1 className="c9-display c9-rise" style={{ animationDelay: '60ms' }}>
            Votre smartphone réparé chez vous.
          </h1>

          <div className="c9-rise flex flex-col gap-2" style={{ animationDelay: '120ms' }}>
            <p className="text-[1.375rem] font-medium leading-snug tracking-[-0.02em] sm:text-[1.625rem]">
              Réparation à domicile <span className="c9-copper">{HORAIRES_TEXTE.accroche.toLowerCase()}</span>.
            </p>
            <p className="text-[1rem]" style={{ color: 'var(--c9-text-2)' }}>{HORAIRES_TEXTE.detail}</p>
          </div>

          <div className="c9-rise flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: '180ms' }}>
            <Link href="/reservation" className="c9-btn c9-btn-primary w-full sm:w-auto">Voir mon tarif</Link>
            <Link href="/reservation?etape=creneau" className="c9-btn c9-btn-secondary w-full sm:w-auto">Réserver une intervention</Link>
          </div>
          <Link href="/reservation?parcours=autre" className="c9-rise self-start text-[0.9375rem] font-medium"
            style={{ color: 'var(--c9-text-2)', animationDelay: '220ms' }}>
            <span className="c9-link">J&apos;ai un autre problème</span> →
          </Link>
        </div>

        {/* Signature + exemple concret */}
        <div className="c9-rise flex flex-col gap-4" style={{ animationDelay: '260ms' }}>
          <Logo size={220} priority className="mx-auto -mb-2 hidden lg:block" />
          <div className="c9-surface rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'var(--c9-accent-soft)', color: 'var(--c9-accent-text)' }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11.5L12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" />
                </svg>
              </span>
              <div>
                <p className="text-[1.125rem] font-semibold tracking-[-0.02em]">On vient à vous.</p>
                <p className="text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>Depuis Nogent-le-Rotrou, jusqu&apos;à 30 km</p>
              </div>
            </div>

            {ex && (
              <div className="mt-6 flex flex-col gap-3" aria-label="Exemple de prix">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em]" style={{ color: 'var(--c9-text-3)' }}>Exemple</p>
                <div className="flex items-baseline justify-between gap-4">
                  <span style={{ color: 'var(--c9-text-2)' }}>Écran {ex.model} · {ex.quality}</span>
                  <span className="tabular-nums">{euros(ex.repair)}</span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span style={{ color: 'var(--c9-text-2)' }}>Déplacement · {ex.zone.toLowerCase()}</span>
                  <span className="tabular-nums">{euros(ex.travel)}</span>
                </div>
                <div className="c9-divider" />
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-[1.5rem] font-semibold tabular-nums tracking-[-0.02em]">{euros(ex.repair + ex.travel)}</span>
                </div>
              </div>
            )}
          </div>
          <p className="px-1 text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
            Aucun acompte · Paiement après l&apos;intervention (CB, espèces, virement)
          </p>
        </div>
      </div>
    </section>
  )
}
