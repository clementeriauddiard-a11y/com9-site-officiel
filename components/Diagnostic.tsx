'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import DiagnosticFreeModal from '@/components/DiagnosticFreeModal'
import { WaCta } from '@/components/ui/Wa'
import { DIAGNOSTIC } from '@/data/tarifs'

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Protocole — 3 temps, aucune fonctionnalité inventée ─────────────────────

const PROTOCOL = [
  {
    n: '01',
    title: 'Analyse',
    desc: 'Les composants clés de l’appareil sont contrôlés un à un.',
  },
  {
    n: '02',
    title: 'Score',
    desc: 'Chaque contrôle alimente un score global sur 100.',
  },
  {
    n: '03',
    title: 'Décision',
    desc: 'Vous savez précisément quoi réparer — et ce que cela coûte.',
  },
]

// ─── Puce de contrôle ────────────────────────────────────────────────────────

function Point({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--c9-hairline-soft)',
      }}
    >
      <span
        className="h-1 w-1 shrink-0 rounded-full"
        style={{ background: 'var(--c9-accent)' }}
      />
      <span
        className="font-space text-[0.8125rem] leading-none"
        style={{ color: 'var(--c9-text-2)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Diagnostic() {
  const [freeOpen, setFreeOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {freeOpen && <DiagnosticFreeModal onClose={() => setFreeOpen(false)} />}
      </AnimatePresence>

      <section
        id="diagnostic"
        className="relative"
        style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
      >
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          {/* ── En-tête ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-16 text-center"
          >
            <p className="section-label mb-5">Diagnostic</p>
            <h2 className="c9-title mb-5">
              Savoir avant
              <br />
              <span className="gradient-text">de décider.</span>
            </h2>
            <p className="c9-subtitle mx-auto max-w-lg">
              Le protocole de contrôle Com&apos;9 mesure l&apos;état réel de votre
              appareil. Deux niveaux, une même méthode.
            </p>
          </motion.div>

          {/* ── Protocole ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-16 grid gap-8 sm:grid-cols-3 sm:gap-10"
          >
            {PROTOCOL.map((s) => (
              <div key={s.n} className="text-center sm:text-left">
                <div
                  className="mb-3 font-mono text-[10px] tracking-[0.28em]"
                  style={{ color: 'var(--c9-accent)' }}
                >
                  {s.n}
                </div>
                <h3
                  className="mb-2 font-space text-lg font-semibold"
                  style={{ color: 'var(--c9-text)', letterSpacing: '-0.02em' }}
                >
                  {s.title}
                </h3>
                <p
                  className="font-space text-[0.875rem] leading-relaxed"
                  style={{ color: 'var(--c9-text-3)' }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </motion.div>

          <div className="c9-divider mb-16" />

          {/* ── Deux niveaux ── */}
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            {/* ━━ Gratuit ━━ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="c9-surface flex flex-col rounded-[28px] p-7 sm:p-8"
            >
              <div className="mb-6">
                <h3
                  className="mb-3 font-space text-xl font-semibold"
                  style={{ color: 'var(--c9-text)', letterSpacing: '-0.025em' }}
                >
                  {DIAGNOSTIC.free.label}
                </h3>
                <div
                  className="font-space font-semibold leading-none"
                  style={{
                    color: 'var(--c9-text)',
                    fontSize: 'clamp(2rem, 6vw, 2.5rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {DIAGNOSTIC.free.price}
                </div>
              </div>

              <p
                className="mb-6 font-space text-[0.9375rem] leading-relaxed"
                style={{ color: 'var(--c9-text-2)' }}
              >
                {DIAGNOSTIC.free.desc}
              </p>

              <div className="mb-8 flex flex-wrap gap-2">
                {DIAGNOSTIC.free.points.map((p) => (
                  <Point key={p} label={p} />
                ))}
              </div>

              <div className="mt-auto">
                <motion.button
                  onClick={() => setFreeOpen(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex w-full items-center justify-center rounded-2xl px-5 font-space text-[0.9375rem] font-semibold transition-colors duration-300"
                  style={{
                    minHeight: '54px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--c9-hairline-lit)',
                    color: 'var(--c9-text)',
                  }}
                >
                  Lancer le diagnostic
                </motion.button>
              </div>
            </motion.div>

            {/* ━━ Premium ━━ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              className="c9-surface-accent flex flex-col rounded-[28px] p-7 sm:p-8"
            >
              <div className="mb-6">
                <h3
                  className="mb-3 font-space text-xl font-semibold"
                  style={{ color: 'var(--c9-text)', letterSpacing: '-0.025em' }}
                >
                  {DIAGNOSTIC.premium.label}
                </h3>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className="font-space font-semibold leading-none"
                    style={{
                      color: 'var(--c9-text)',
                      fontSize: 'clamp(2rem, 6vw, 2.5rem)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {DIAGNOSTIC.premium.price}
                  </span>
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
                    style={{ color: 'var(--c9-accent)' }}
                  >
                    Déduit si réparation
                  </span>
                </div>
              </div>

              <p
                className="mb-6 font-space text-[0.9375rem] leading-relaxed"
                style={{ color: 'var(--c9-text-2)' }}
              >
                {DIAGNOSTIC.premium.desc}
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                {DIAGNOSTIC.premium.points.map((p) => (
                  <Point key={p} label={p} />
                ))}
              </div>

              <ul className="mb-8 space-y-2">
                {DIAGNOSTIC.premium.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 shrink-0"
                      style={{ color: 'var(--c9-accent)' }}
                      aria-hidden="true"
                    >
                      <path d="M2 6.4l2.6 2.6L10 3.6" />
                    </svg>
                    <span
                      className="font-space text-[0.875rem]"
                      style={{ color: 'var(--c9-text-2)' }}
                    >
                      {h}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3">
                <WaCta message={DIAGNOSTIC.premium.waMessage} />

                <Link
                  href="/diagnostic-premium"
                  className="block text-center font-mono text-[9.5px] uppercase tracking-[0.2em] underline-offset-4 transition-colors duration-300 hover:underline"
                  style={{ color: 'var(--c9-text-3)' }}
                >
                  Accès atelier
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
