// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Hero : le concept compris en moins de 3 secondes
// « Votre smartphone réparé chez vous. » · jusqu'à 23h · On vient à vous.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { DISTANCE_MAX_KM, HORAIRES_TEXTE } from '@/config/com9'

export default function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}>
      {/* Lumière unique, très diffuse */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 85% 10%, rgba(201,137,92,0.14) 0%, transparent 70%), radial-gradient(50% 40% at 0% 100%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-7">
          <span className="section-label c9-rise">Réparation smartphone à domicile</span>

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

          <p className="c9-rise text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-3)', animationDelay: '260ms' }}>
            <b className="font-semibold" style={{ color: 'var(--c9-text)' }}>On vient à vous.</b>
            {` Depuis Nogent-le-Rotrou, jusqu’à ${DISTANCE_MAX_KM} km · Aucun acompte · Paiement après l’intervention.`}
          </p>
        </div>

        {/* Mascotte COM'9 (orange, écriture crème) */}
        <div className="c9-rise flex justify-center" style={{ animationDelay: '260ms' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascotte-com9-creme-640.webp"
            srcSet="/mascotte-com9-creme-320.webp 320w, /mascotte-com9-creme-640.webp 640w"
            sizes="(min-width: 1024px) 380px, 240px"
            width={640}
            height={640}
            alt="La mascotte COM’9 répare un smartphone"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="h-auto w-[240px] select-none sm:w-[280px] lg:w-[380px]"
          />
        </div>
      </div>
    </section>
  )
}
