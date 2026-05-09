'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { tarifsRepair, diagnostic, type RepairCategory } from '@/data/tarifs'
import { waLink } from '@/lib/links'

// ─── Génère le message WhatsApp contextuel ────────────────────────────────────

function buildWaMessage(serviceId: string, model?: string): string {
  const base = "Bonjour, je viens du site Com'9. Je souhaite prendre rendez-vous pour"
  if (!model) {
    if (serviceId === 'ecrans')     return `${base} un changement d'écran.`
    if (serviceId === 'batteries')  return `${base} un changement de batterie.`
    return `${base} un diagnostic.`
  }
  if (serviceId === 'ecrans')    return `${base} un changement d'écran sur ${model}.`
  if (serviceId === 'batteries') return `${base} un changement de batterie sur ${model}.`
  return `${base} un diagnostic sur ${model}.`
}

// ─── WhatsApp icon ─────────────────────────────────────────────────────────────

function WaIcon({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ─── Bouton WhatsApp principal (bas d'onglet) ─────────────────────────────────

function WaButton({ message, label = 'Prendre rendez-vous' }: { message: string; label?: string }) {
  return (
    <motion.a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300"
      style={{
        border:     '1px solid rgba(34,197,94,0.35)',
        background: 'rgba(34,197,94,0.07)',
        color:      '#4ade80',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background  = 'rgba(34,197,94,0.14)'
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.55)'
        e.currentTarget.style.boxShadow   = '0 0 24px rgba(34,197,94,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = 'rgba(34,197,94,0.07)'
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      <WaIcon />
      {label}
    </motion.a>
  )
}

// ─── Tab icons ────────────────────────────────────────────────────────────────

const TabIcons = {
  ecrans: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4 shrink-0">
      <rect x="1" y="3" width="18" height="12" rx="2"/>
      <path d="M7 19h6M10 15v4"/>
    </svg>
  ),
  batteries: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4 shrink-0">
      <rect x="1" y="6" width="15" height="8" rx="1.5"/>
      <path d="M19 9v2M5 10h5M10 8v4"/>
    </svg>
  ),
  diagnostic: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4 shrink-0">
      <circle cx="9" cy="9" r="6"/>
      <path d="M17 17l-3.5-3.5M9 7v2l1.5 1.5"/>
    </svg>
  ),
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ecrans',     label: 'Écrans'     },
  { id: 'batteries',  label: 'Batteries'  },
  { id: 'diagnostic', label: 'Diagnostic' },
] as const

type TabId = typeof TABS[number]['id']

// ─── Quality spec cards ───────────────────────────────────────────────────────

function QualityCards({ cat }: { cat: RepairCategory }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-7">
      {/* Compatible */}
      <div className="rounded-xl px-4 py-3.5 flex flex-col gap-1.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.55)' }} />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase font-semibold"
            style={{ color: 'rgba(255,255,255,0.90)' }}>
            {cat.tierLabels.compatible}
          </span>
        </div>
        <span className="font-space text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {cat.tierDesc.compatible}
        </span>
      </div>

      {/* Premium */}
      <div className="rounded-xl px-4 py-3.5 flex flex-col gap-1.5"
        style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.22)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#00d1ff' }} />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase font-semibold"
            style={{ color: '#00d1ff' }}>
            {cat.tierLabels.premium}
          </span>
        </div>
        <span className="font-space text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {cat.tierDesc.premium}
        </span>
      </div>
    </div>
  )
}

// ─── Série accordion ──────────────────────────────────────────────────────────

function SerieBlock({
  serie,
  tierLabels,
  serviceId,
}: {
  serie: RepairCategory['series'][number]
  tierLabels: RepairCategory['tierLabels']
  serviceId: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        border:     open ? '1px solid rgba(0,209,255,0.18)' : '1px solid rgba(0,209,255,0.08)',
        background: open ? 'rgba(0,209,255,0.025)'          : 'transparent',
      }}>

      {/* Header accordion */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base leading-none shrink-0">{serie.icon}</span>
          <span className="font-space text-sm font-semibold truncate"
            style={{ color: open ? '#ffffff' : 'rgba(255,255,255,0.94)' }}>
            {serie.serie}
          </span>
          <span className="font-mono text-[8.5px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full shrink-0"
            style={{ background: 'rgba(0,209,255,0.07)', color: 'rgba(0,209,255,0.88)', border: '1px solid rgba(0,209,255,0.16)' }}>
            {serie.rows.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 ml-2"
          style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.12)', color: 'rgba(0,209,255,0.7)' }}
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
            <div className="grid grid-cols-3 px-4 py-2 font-mono text-[9px] tracking-[0.16em] uppercase"
              style={{ borderTop: '1px solid rgba(0,209,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>Modèle</span>
              <span className="text-center" style={{ color: 'rgba(255,255,255,0.72)' }}>{tierLabels.compatible}</span>
              <span className="text-right"  style={{ color: '#00d1ff' }}>{tierLabels.premium}</span>
            </div>

            {/* Model rows — cliquables WhatsApp */}
            <div className="divide-y" style={{ borderColor: 'rgba(0,209,255,0.04)' }}>
              {serie.rows.map((row, idx) => (
                <motion.a
                  key={row.model}
                  href={waLink(buildWaMessage(serviceId, row.model))}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.985, backgroundColor: 'rgba(0,209,255,0.07)' }}
                  className="grid grid-cols-3 items-center px-4 py-3.5 cursor-pointer transition-all duration-200 group"
                  style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.08)', minHeight: '48px' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,209,255,0.06)'
                    e.currentTarget.style.borderLeft = '2px solid rgba(34,197,94,0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.08)'
                    e.currentTarget.style.borderLeft  = 'none'
                  }}
                >
                  {/* Modèle + icône WA au hover */}
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="font-space text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.96)' }}>
                      {row.model}
                    </span>
                    <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: '#4ade80' }}>
                      <WaIcon size="sm" />
                    </span>
                  </div>
                  {/* Prix Compatible */}
                  <span className="text-center font-mono text-xs font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {row.compatible} €
                  </span>
                  {/* Prix Premium */}
                  <div className="flex justify-end">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ color: '#00d1ff', background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.18)' }}>
                      {row.premium} €
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Hint tap mobile */}
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(0,209,255,0.04)', background: 'rgba(0,0,0,0.12)' }}>
              <WaIcon size="sm" />
              <span className="font-mono text-[8px] tracking-[0.14em] uppercase"
                style={{ color: 'rgba(34,197,94,0.75)' }}>
                Appuyez sur un modèle pour contacter via WhatsApp
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Repair tab (Écrans / Batteries) ─────────────────────────────────────────

function RepairTab({ cat }: { cat: RepairCategory }) {
  return (
    <div className="space-y-2.5">
      <QualityCards cat={cat} />

      {cat.series.map((serie) => (
        <SerieBlock key={serie.serie} serie={serie} tierLabels={cat.tierLabels} serviceId={cat.id} />
      ))}

      <div className="pt-6 mt-2" style={{ borderTop: '1px solid rgba(0,209,255,0.08)' }}>
        <WaButton message={buildWaMessage(cat.id)} label="Prendre rendez-vous sur WhatsApp" />
      </div>
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
        <div className="px-7 py-7 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,209,255,0.04) 100%)', borderBottom: '1px solid rgba(0,209,255,0.1)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.18)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-7 h-7" style={{ color: '#00d1ff' }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v3l2 2"/>
            </svg>
          </div>
          <h3 className="font-black font-space text-cold-white text-xl mb-2">{diagnostic.label}</h3>
          <div className="font-black font-space text-neon-blue mb-1" style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', lineHeight: 1 }}>
            Gratuit
          </div>
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase mt-2" style={{ color: 'rgba(0,209,255,0.88)' }}>
            {diagnostic.note}
          </p>
        </div>

        {/* Inclus */}
        <div className="px-7 py-6">
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Ce qui est inclus
          </p>
          <ul className="space-y-3">
            {diagnostic.inclus.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.22)' }}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5" style={{ color: '#00d1ff' }}>
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                </div>
                <span className="font-space text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA WhatsApp */}
        <div className="px-7 pb-7">
          <WaButton message={buildWaMessage('diagnostic')} label="Réserver sur WhatsApp" />
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

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-5">— Tarifs —</p>
          <h2 className="font-black font-space text-cold-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Tarification <span className="gradient-text">Transparente</span>
          </h2>
          <p className="font-space text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.88)' }}>
            Prix réels, sans surprise. iPhone uniquement pour le moment.
          </p>
        </motion.div>

        {/* ── Tab bar — 3 colonnes équilibrées ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="grid grid-cols-3 p-1.5 rounded-2xl gap-1.5 w-full max-w-lg mx-auto"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,209,255,0.1)' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-mono text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-all duration-300 whitespace-nowrap"
                  style={{
                    color:      isActive ? '#00d1ff' : 'rgba(255,255,255,0.72)',
                    background: isActive ? 'rgba(0,209,255,0.1)' : 'transparent',
                    border:     isActive ? '1px solid rgba(0,209,255,0.28)' : '1px solid transparent',
                    boxShadow:  isActive ? '0 0 18px rgba(0,209,255,0.08)' : 'none',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="shrink-0" style={{ color: isActive ? '#00d1ff' : 'rgba(255,255,255,0.58)' }}>
                    {TabIcons[tab.id]}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Tab content ── */}
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

        {/* ── Footer note — mobile-safe ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12"
        >
          {/* Bloc garantie + paiement — 2 lignes stackées, aucun overflow */}
          <div className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl mb-8 max-w-xs mx-auto"
            style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(0,209,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(0,209,255,0.65)' }} />
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-center"
                style={{ color: 'rgba(255,255,255,0.82)' }}>
                Garantie pièces &amp; main d&apos;œuvre
              </p>
            </div>
            <p className="font-mono text-[8.5px] tracking-[0.14em] uppercase text-center"
              style={{ color: 'rgba(255,255,255,0.52)' }}>
              CB &nbsp;·&nbsp; Espèces &nbsp;·&nbsp; Virement
            </p>
          </div>

          {/* CTA devis */}
          <div className="flex justify-center">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
              style={{
                border:     '1px solid rgba(0,209,255,0.25)',
                background: 'rgba(0,209,255,0.05)',
                color:      '#00d1ff',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(0,209,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(0,209,255,0.5)'
                e.currentTarget.style.boxShadow   = '0 0 24px rgba(0,209,255,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(0,209,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(0,209,255,0.25)'
                e.currentTarget.style.boxShadow   = 'none'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse shrink-0" />
              Demander un devis
            </motion.a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
