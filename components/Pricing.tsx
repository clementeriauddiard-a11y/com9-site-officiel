'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { tarifsRepair, diagnostic, type RepairCategory } from '@/data/tarifs'
import { waLink } from '@/lib/links'

// ─── Tab icons ────────────────────────────────────────────────────────────────

const TabIcons = {
  ecrans: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
      <rect x="1" y="3" width="18" height="12" rx="2"/>
      <path d="M7 19h6M10 15v4"/>
    </svg>
  ),
  batteries: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
      <rect x="1" y="6" width="15" height="8" rx="1.5"/>
      <path d="M19 9v2M5 10h5M10 8v4"/>
    </svg>
  ),
  diagnostic: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
      <circle cx="9" cy="9" r="6"/>
      <path d="M17 17l-3.5-3.5M9 7v2l1.5 1.5"/>
    </svg>
  ),
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ecrans',     label: 'Écrans'     },
  { id: 'batteries',  label: 'Batteries'  },
  { id: 'diagnostic', label: 'Diagnostic' },
] as const

type TabId = typeof TABS[number]['id']

// ─── Série accordion ─────────────────────────────────────────────────────────

function SerieBlock({ serie, tierLabels }: { serie: RepairCategory['series'][number]; tierLabels: RepairCategory['tierLabels'] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        border: open ? '1px solid rgba(0,209,255,0.16)' : '1px solid rgba(0,209,255,0.07)',
        background: open ? 'rgba(0,209,255,0.025)' : 'transparent',
      }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3">
          <span className="text-base leading-none">{serie.icon}</span>
          <span className="font-space text-sm font-semibold" style={{ color: open ? '#eafbff' : 'rgba(234,251,255,0.82)' }}>
            {serie.serie}
          </span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,209,255,0.07)', color: 'rgba(0,209,255,0.5)', border: '1px solid rgba(0,209,255,0.1)' }}>
            {serie.rows.length} modèles
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center w-6 h-6 rounded-full"
          style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.1)', color: 'rgba(0,209,255,0.6)' }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </motion.span>
      </button>

      {/* Rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Column headers */}
            <div className="grid grid-cols-3 px-5 py-2.5 font-mono text-[9px] tracking-[0.2em] uppercase"
              style={{ borderTop: '1px solid rgba(0,209,255,0.08)', background: 'rgba(0,0,0,0.18)' }}>
              <span style={{ color: 'rgba(234,251,255,0.25)' }}>Modèle</span>
              <span className="text-center" style={{ color: 'rgba(234,251,255,0.35)' }}>{tierLabels.compatible}</span>
              <span className="text-right" style={{ color: 'rgba(0,209,255,0.65)' }}>{tierLabels.premium}</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(0,209,255,0.04)' }}>
              {serie.rows.map((row, idx) => (
                <div key={row.model}
                  className="grid grid-cols-3 items-center px-5 py-3 transition-colors duration-150"
                  style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,209,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.08)')}
                >
                  <span className="font-space text-xs pr-2" style={{ color: 'rgba(234,251,255,0.80)' }}>{row.model}</span>
                  <span className="text-center font-mono text-xs font-bold" style={{ color: 'rgba(234,251,255,0.68)' }}>
                    {row.compatible} €
                  </span>
                  <div className="flex justify-end">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ color: '#00d1ff', background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.15)' }}>
                      {row.premium} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Repair tab ───────────────────────────────────────────────────────────────

function RepairTab({ cat }: { cat: RepairCategory }) {
  return (
    <div className="space-y-2.5">
      {/* Tier legend */}
      <div className="flex items-center gap-5 mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-px" style={{ background: 'rgba(234,251,255,0.3)' }} />
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(234,251,255,0.38)' }}>
            {cat.tierLabels.compatible} — {cat.tierDesc.compatible}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-px" style={{ background: 'rgba(0,209,255,0.8)' }} />
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(0,209,255,0.65)' }}>
            {cat.tierLabels.premium} — {cat.tierDesc.premium}
          </span>
        </div>
      </div>

      {cat.series.map((serie) => (
        <SerieBlock key={serie.serie} serie={serie} tierLabels={cat.tierLabels} />
      ))}
    </div>
  )
}

// ─── Diagnostic tab ───────────────────────────────────────────────────────────

function DiagnosticTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,209,255,0.04) 100%)', borderBottom: '1px solid rgba(0,209,255,0.1)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.15)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-7 h-7" style={{ color: '#00d1ff' }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v3l2 2"/>
            </svg>
          </div>
          <h3 className="font-black font-space text-cold-white text-xl mb-2">{diagnostic.label}</h3>
          <div className="font-black font-space text-neon-blue mb-1" style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', lineHeight: 1 }}>
            Gratuit
          </div>
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase mt-2" style={{ color: 'rgba(0,209,255,0.4)' }}>{diagnostic.note}</p>
        </div>

        {/* Inclus */}
        <div className="px-8 py-6">
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(234,251,255,0.25)' }}>Ce qui est inclus</p>
          <ul className="space-y-3">
            {diagnostic.inclus.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.2)' }}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5" style={{ color: '#00d1ff' }}>
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                </div>
                <span className="font-space text-sm leading-relaxed" style={{ color: 'rgba(234,251,255,0.6)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-8 pb-8">
          <motion.a
            href={waLink("Bonjour Com'9 👋 Je souhaite réserver un diagnostic.")}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
            style={{
              border: '1px solid rgba(0,209,255,0.3)',
              background: 'rgba(0,209,255,0.06)',
              color: '#00d1ff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,209,255,0.12)'
              e.currentTarget.style.borderColor = 'rgba(0,209,255,0.5)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0,209,255,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,209,255,0.06)'
              e.currentTarget.style.borderColor = 'rgba(0,209,255,0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            Réserver sur WhatsApp
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<TabId>('ecrans')
  const activeCat = tarifsRepair.find(c => c.id === activeTab)

  return (
    <section id="tarifs" className="relative overflow-hidden" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '700px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.04) 0%, transparent 70%)' }} />
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.1), transparent)' }} />

      <div className="max-w-3xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-5">— Tarifs —</p>
          <h2 className="font-black font-space text-cold-white mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Tarification <span className="gradient-text">Transparente</span>
          </h2>
          <p className="font-space text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(234,251,255,0.62)' }}>
            Prix réels, sans surprise. iPhone uniquement pour le moment.
          </p>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <div className="flex items-center p-1 rounded-2xl gap-1"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,209,255,0.08)' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[11px] tracking-[0.14em] uppercase transition-all duration-300"
                  style={{
                    color: isActive ? '#00d1ff' : 'rgba(234,251,255,0.35)',
                    background: isActive ? 'rgba(0,209,255,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,209,255,0.25)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 20px rgba(0,209,255,0.08)' : 'none',
                  }}
                >
                  <span style={{ color: isActive ? '#00d1ff' : 'rgba(234,251,255,0.3)' }}>
                    {TabIcons[tab.id]}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'diagnostic' ? (
              <DiagnosticTab />
            ) : activeCat ? (
              <RepairTab cat={activeCat} />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,209,255,0.08)' }}>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(0,209,255,0.5)' }} />
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(234,251,255,0.25)' }}>
              Garantie pièces & main d&apos;œuvre — CB / Espèces / Virement
            </p>
          </div>
          <div className="flex justify-center">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
              style={{
                border: '1px solid rgba(0,209,255,0.25)',
                background: 'rgba(0,209,255,0.05)',
                color: '#00d1ff',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,209,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(0,209,255,0.5)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0,209,255,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,209,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(0,209,255,0.25)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              Demander un devis
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
