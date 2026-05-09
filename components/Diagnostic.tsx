'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import DiagnosticFreeModal from '@/components/DiagnosticFreeModal'

// ─── Free category icons ───────────────────────────────────────────────────────

const FREE_CATS = [
  { id: 'batterie', label: 'Batterie', icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
      <rect x="1" y="6" width="15" height="8" rx="1.5"/><path d="M18 9v2"/><path d="M4 10h4M8 8v4"/>
    </svg>
  )},
  { id: 'ecran', label: 'Écran', icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
      <rect x="4" y="2" width="12" height="16" rx="2.5"/><circle cx="10" cy="15" r="0.8"/><rect x="7" y="4" width="6" height="1" rx="0.5"/>
    </svg>
  )},
  { id: 'cameras', label: 'Caméras', icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
      <path d="M19 16a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z"/><circle cx="10" cy="11" r="3"/>
    </svg>
  )},
  { id: 'vitre', label: 'Vitre arrière', icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
      <rect x="4" y="2" width="12" height="16" rx="2.5"/><path d="M7 7l6 6M13 7l-6 6"/>
    </svg>
  )},
]

// ─── Premium categories ────────────────────────────────────────────────────────

const PREMIUM_CATS = [
  { label: 'Batterie /20',         color: '#00d1ff' },
  { label: 'Écran /20',            color: '#00d1ff' },
  { label: 'Caméras /10',          color: '#4da6ff' },
  { label: 'Audio /10',            color: '#4da6ff' },
  { label: 'Réseau /15',           color: '#0066ff' },
  { label: 'Capteurs /10',         color: '#4da6ff' },
  { label: 'Performances /10',     color: '#4da6ff' },
  { label: 'État physique /5',     color: '#0066ff' },
]

// ─── Scan line animation ───────────────────────────────────────────────────────

function ScanLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      animate={{ y: ['-100%', '400%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 6, delay }}
      className="absolute inset-x-0 pointer-events-none z-0"
      style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.3), transparent)' }}
    />
  )
}

// ─── Section ───────────────────────────────────────────────────────────────────

export default function Diagnostic() {
  const [freeOpen, setFreeOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {freeOpen && <DiagnosticFreeModal onClose={() => setFreeOpen(false)} />}
      </AnimatePresence>

      <section id="diagnostic" className="relative overflow-hidden" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
        {/* Top separator */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.15), transparent)' }} />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.05) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-5 md:px-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="section-label mb-5">— Diagnostic —</p>
            <h2 className="font-black font-space text-cold-white mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
              Contrôle Technique <span className="gradient-text">Officiel</span>
            </h2>
            <p className="font-space text-sm max-w-md mx-auto leading-relaxed"
              style={{ color: 'rgba(234,251,255,0.32)' }}>
              Deux niveaux d&apos;analyse — de l&apos;estimation rapide à la validation complète sur 100 points.
            </p>
          </motion.div>

          {/* ── Two-card layout ── */}
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                CARD GRATUIT
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(0,12,30,0.97) 0%, rgba(5,8,22,0.99) 100%)',
                border: '1px solid rgba(0,209,255,0.14)',
                boxShadow: '0 0 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,209,255,0.08)',
              }}
            >
              <ScanLine delay={0} />

              {/* Top neon line */}
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.5), transparent)' }} />

              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(0,209,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

              <div className="relative z-10 flex flex-col flex-1 p-7">

                {/* Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-1.5" style={{ color: 'rgba(0,209,255,0.5)' }}>
                      Com&apos;9
                    </div>
                    <h3 className="font-black font-space text-cold-white text-2xl leading-tight tracking-tight">
                      Diagnostic
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,209,255,0.07)', border: '1px solid rgba(0,209,255,0.2)' }}>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#00d1ff' }}
                    />
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#00d1ff' }}>
                      Gratuit
                    </span>
                  </div>
                </div>

                {/* Taglines */}
                <p className="font-space text-sm leading-relaxed mb-1.5" style={{ color: 'rgba(234,251,255,0.55)' }}>
                  Analyse rapide de l&apos;état de votre appareil.
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] mb-6" style={{ color: 'rgba(0,209,255,0.45)' }}>
                  Première estimation intelligente par le système Com&apos;9.
                </p>

                {/* 4 analysis points */}
                <div className="grid grid-cols-2 gap-2.5 mb-7">
                  {FREE_CATS.map((cat, i) => (
                    <motion.div key={cat.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(0,209,255,0.04)', border: '1px solid rgba(0,209,255,0.1)' }}>
                      <div className="shrink-0" style={{ color: 'rgba(0,209,255,0.7)' }}>
                        {cat.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d1ff' }} />
                          <span className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(0,209,255,0.5)' }}>
                            ✔ Vérifié
                          </span>
                        </div>
                        <span className="font-space text-xs font-semibold" style={{ color: 'rgba(234,251,255,0.75)' }}>
                          {cat.label}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Separator */}
                <div className="h-px mb-5" style={{ background: 'rgba(0,209,255,0.07)' }} />

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFreeOpen(true)}
                  className="w-full py-4 rounded-2xl font-mono text-[11px] tracking-[0.22em] uppercase cursor-pointer transition-all duration-300 flex items-center justify-center gap-3"
                  style={{
                    border: '1px solid rgba(0,209,255,0.3)',
                    background: 'rgba(0,209,255,0.07)',
                    color: '#00d1ff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,209,255,0.13)'
                    e.currentTarget.style.borderColor = 'rgba(0,209,255,0.5)'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0,209,255,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,209,255,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(0,209,255,0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0"
                  />
                  Lancer l&apos;analyse gratuite
                </motion.button>
              </div>
            </motion.div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                CARD PREMIUM
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(0,18,50,0.98) 0%, rgba(0,8,25,0.99) 100%)',
                border: '1px solid rgba(0,209,255,0.2)',
                boxShadow: '0 0 60px rgba(0,102,255,0.1), inset 0 1px 0 rgba(0,209,255,0.1)',
              }}
            >
              <ScanLine delay={2} />

              {/* Top premium line */}
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.7), rgba(0,102,255,0.5), rgba(0,209,255,0.7), transparent)' }} />

              {/* Corner glow */}
              <div className="absolute top-0 right-0 pointer-events-none"
                style={{ width: '200px', height: '200px', background: 'radial-gradient(circle at top right, rgba(0,102,255,0.15) 0%, transparent 70%)' }} />

              <div className="relative z-10 flex flex-col flex-1 p-7">

                {/* Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-1.5" style={{ color: 'rgba(0,209,255,0.5)' }}>
                      Com&apos;9
                    </div>
                    <h3 className="font-black font-space text-cold-white text-2xl leading-tight tracking-tight">
                      Diagnostic{' '}
                      <span className="gradient-text">Premium</span>
                    </h3>
                  </div>
                  {/* Prix */}
                  <div className="text-right">
                    <div className="font-black font-space text-neon-blue text-2xl leading-none">4,99 €</div>
                    <div className="font-mono text-[8px] tracking-[0.12em] mt-0.5" style={{ color: 'rgba(0,209,255,0.45)' }}>
                      Déduit si réparation
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <p className="font-space text-sm leading-relaxed mb-6" style={{ color: 'rgba(234,251,255,0.55)' }}>
                  Analyse avancée sur <span style={{ color: '#00d1ff' }}>100 points</span>. Validation complète de tous les composants — résultat officiel imprimable.
                </p>

                {/* 8 categories grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-7">
                  {PREMIUM_CATS.map((cat, i) => (
                    <motion.div key={cat.label}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.08)' }}>
                      <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(0,209,255,0.1)' }}>
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" style={{ color: '#00d1ff' }}>
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-mono leading-tight" style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: 'rgba(234,251,255,0.5)' }}>
                        {cat.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Inclus badge row */}
                <div className="flex flex-wrap gap-2 mb-7">
                  {['Score /100', 'Feuille officielle', 'Résultat immédiat'].map(item => (
                    <div key={item} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.12)' }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: '#00d1ff' }} />
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(0,209,255,0.6)' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Separator */}
                <div className="h-px mb-5"
                  style={{ background: 'linear-gradient(to right, rgba(0,209,255,0.15), rgba(0,102,255,0.1), transparent)' }} />

                {/* CTA — lien vers la page privée */}
                <Link href="/diagnostic-premium" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl font-mono text-[11px] tracking-[0.22em] uppercase cursor-pointer transition-all duration-300 flex items-center justify-center gap-3"
                    style={{
                      border: '1px solid rgba(0,209,255,0.4)',
                      background: 'rgba(0,209,255,0.1)',
                      color: '#00d1ff',
                      boxShadow: '0 0 30px rgba(0,102,255,0.1)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,209,255,0.17)'
                      e.currentTarget.style.borderColor = 'rgba(0,209,255,0.6)'
                      e.currentTarget.style.boxShadow = '0 0 40px rgba(0,209,255,0.18)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0,209,255,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(0,102,255,0.1)'
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0"
                    />
                    Accéder au diagnostic Premium
                  </motion.div>
                </Link>
              </div>
            </motion.div>

          </div>

          {/* ── Comparatif rapide ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-6 py-4 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,209,255,0.07)' }}>
              {[
                { label: 'Gratuit',    desc: '4 points analysés, résultat immédiat' },
                { icon: '→',          desc: null },
                { label: 'Premium — 4,99 €', desc: '100 points, feuille officielle, déduit si réparation' },
              ].map((item, i) => (
                item.icon ? (
                  <span key={i} className="hidden sm:block font-mono text-sm" style={{ color: 'rgba(0,209,255,0.3)' }}>{item.icon}</span>
                ) : (
                  <div key={i} className="text-center sm:text-left">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase mb-0.5" style={{ color: '#00d1ff' }}>
                      {item.label}
                    </div>
                    <div className="font-space text-xs" style={{ color: 'rgba(234,251,255,0.35)' }}>{item.desc}</div>
                  </div>
                )
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom separator */}
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.1), transparent)' }} />
      </section>
    </>
  )
}
