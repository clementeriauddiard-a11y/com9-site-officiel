'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { conditionColor, statusColor, type Phone } from '@/data/phones'
import { usePhones } from '@/context/PhonesContext'
import { waLink, LINKS } from '@/lib/links'

// ─── Points de certification du protocole COM'9 (bannière section) ─────────────

const PROTOCOL_POINTS = [
  { label: "Diagnostic Com'9 effectué",  icon: 'diag'    },
  { label: 'Batterie analysée',          icon: 'batt'    },
  { label: 'Écran vérifié',              icon: 'screen'  },
  { label: 'Caméras testées',            icon: 'camera'  },
  { label: 'Audio contrôlé',             icon: 'audio'   },
  { label: 'Réseau validé',              icon: 'network' },
  { label: 'Connectivité vérifiée',      icon: 'conn'    },
  { label: 'Appareil nettoyé et optimisé', icon: 'clean' },
]

// ─── Mini SVG icons ────────────────────────────────────────────────────────────

function CertIcon({ type }: { type: string }) {
  const cls = 'w-3 h-3'
  const s   = { color: '#00d1ff' as string }
  switch (type) {
    case 'diag':   return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><circle cx="5" cy="5" r="3.5"/><path d="M8 8l2 2"/><path d="M5 3.5v1.5l1 1"/></svg>
    case 'batt':   return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><rect x="1" y="3.5" width="8" height="5" rx="1"/><path d="M11 5.5v1"/><path d="M3 6h3"/></svg>
    case 'screen': return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><rect x="1" y="2" width="10" height="7" rx="1"/><path d="M4 11h4M6 9v2"/></svg>
    case 'camera': return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><rect x="1" y="3" width="10" height="7" rx="1"/><circle cx="6" cy="6.5" r="2"/><path d="M4 3l1-1.5h2L8 3"/></svg>
    case 'audio':  return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><path d="M2 4.5h2l2-2v7l-2-2H2z"/><path d="M8 4a3 3 0 010 4"/></svg>
    case 'network':return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><path d="M1 9a7 7 0 0110 0M3.5 7a4 4 0 015 0M6 5v.1"/></svg>
    case 'conn':   return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><circle cx="3" cy="6" r="1.5"/><circle cx="9" cy="6" r="1.5"/><path d="M4.5 6h3"/></svg>
    case 'clean':  return <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={cls} style={s}><path d="M2 10l2-2M6 2l4 4-5 5-4-4 1-3z"/><path d="M10 2l-1 1"/></svg>
    default:       return null
  }
}

// ─── Checkmark icon ────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" style={{ color: '#00d1ff' }}>
      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── WhatsApp URL ──────────────────────────────────────────────────────────────

function waURL(p: Phone) {
  return waLink(p.whatsappMessage)
}

// ─── Certified block (compact, sur chaque carte) ──────────────────────────────

function CertifiedBlock({ labels }: { labels: string[] }) {
  return (
    <div className="relative rounded-xl overflow-hidden"
      style={{
        background:  'linear-gradient(135deg, rgba(0,12,35,0.98) 0%, rgba(0,5,18,0.99) 100%)',
        border:      '1px solid rgba(0,209,255,0.18)',
        boxShadow:   '0 0 30px rgba(0,102,255,0.07), inset 0 1px 0 rgba(0,209,255,0.08)',
      }}>

      {/* Top neon line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.45), transparent)' }} />

      {/* Corner accents */}
      {(['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r',
         'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'] as const
      ).map((cls, i) => (
        <div key={i} className={`absolute ${cls} w-3 h-3 pointer-events-none`}
          style={{ borderColor: 'rgba(0,209,255,0.4)', borderStyle: 'solid' }} />
      ))}

      {/* Scan line */}
      <motion.div
        animate={{ y: ['-100%', '600%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 9 }}
        className="absolute inset-x-0 pointer-events-none z-0"
        style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.2), transparent)' }}
      />

      <div className="relative z-10 p-3.5">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
            style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.2)' }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
              <polygon points="10,1 12.9,6.6 19,7.6 14.5,12 15.7,18 10,15.1 4.3,18 5.5,12 1,7.6 7.1,6.6"
                fill="rgba(0,209,255,0.1)" stroke="#00d1ff" strokeWidth="1.2"/>
              <path d="M7 10l2 2 4-4" stroke="#00d1ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ boxShadow: '0 0 8px rgba(0,209,255,0.3)' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[8px] tracking-[0.3em] uppercase" style={{ color: 'rgba(0,209,255,0.5)' }}>
              Com&apos;9
            </div>
            <div className="font-black font-space tracking-widest" style={{ fontSize: '0.72rem', color: '#eafbff' }}>
              CERTIFIED DEVICE
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
            style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.15)' }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1 h-1 rounded-full"
              style={{ background: '#00d1ff' }}
            />
            <span className="font-mono text-[7.5px] tracking-[0.18em] uppercase" style={{ color: 'rgba(0,209,255,0.7)' }}>
              Validé
            </span>
          </div>
        </div>

        {/* Labels */}
        <div className="grid grid-cols-2 gap-1">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
              style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.07)' }}>
              <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,209,255,0.08)' }}>
                <CheckIcon />
              </div>
              <span className="font-mono leading-tight truncate" style={{ fontSize: '0.58rem', letterSpacing: '0.06em', color: 'rgba(234,251,255,0.52)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Trust banner (niveau section) ────────────────────────────────────────────

function TrustBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative rounded-3xl overflow-hidden max-w-3xl mx-auto mb-14"
      style={{
        background:  'linear-gradient(135deg, rgba(0,18,50,0.98) 0%, rgba(0,8,25,0.99) 60%, rgba(0,15,40,0.98) 100%)',
        border:      '1px solid rgba(0,209,255,0.18)',
        boxShadow:   '0 0 80px rgba(0,102,255,0.1), 0 0 0 1px rgba(0,209,255,0.04), inset 0 1px 0 rgba(0,209,255,0.1)',
      }}>

      {/* Top neon line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.6), rgba(0,102,255,0.4), rgba(0,209,255,0.6), transparent)' }} />

      {/* Inner glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '300px', height: '120px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 70%)' }} />

      {/* Horizontal scan */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 10 }}
        className="absolute inset-y-0 pointer-events-none z-0"
        style={{ width: '60px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.05), transparent)' }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,209,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.6) 1px, transparent 1px)',
          backgroundSize:  '40px 40px',
        }} />

      <div className="relative z-10 px-7 py-7">

        {/* Badge + titre */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-4">
            {/* Star badge avec halo rotatif */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                style={{ background: 'conic-gradient(from 0deg, transparent 60%, rgba(0,209,255,0.3) 70%, transparent 80%)', borderRadius: '50%' }}
              />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.25)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <polygon points="12,1 15.5,8 23,9.2 17.5,14.5 18.9,22 12,18.3 5.1,22 6.5,14.5 1,9.2 8.5,8"
                    fill="rgba(0,209,255,0.1)" stroke="#00d1ff" strokeWidth="1.2"/>
                  <path d="M8.5 12l2.5 2.5 5-5" stroke="#00d1ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <div className="font-mono text-[8.5px] tracking-[0.35em] uppercase mb-1" style={{ color: 'rgba(0,209,255,0.55)' }}>
                Protocole de certification
              </div>
              <h3 className="font-black font-space tracking-wider" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', color: '#eafbff', letterSpacing: '0.06em' }}>
                COM&apos;9 CERTIFIED DEVICE
              </h3>
            </div>
          </div>

          {/* Status pill */}
          <div className="sm:ml-auto flex items-center gap-2.5 px-4 py-2 rounded-full self-start sm:self-auto shrink-0"
            style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.15)' }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00d1ff', boxShadow: '0 0 8px rgba(0,209,255,0.8)' }}
            />
            <span className="font-mono text-[8.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(0,209,255,0.7)' }}>
              Système actif
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="font-space text-sm leading-relaxed mb-5 max-w-lg" style={{ color: 'rgba(234,251,255,0.42)' }}>
          Chaque appareil est vérifié et validé par le système de diagnostic Com&apos;9.
          Chaque point de contrôle est documenté avant toute mise en vente.
        </p>

        {/* 8-point grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROTOCOL_POINTS.map((pt, i) => (
            <motion.div key={pt.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300"
              style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.08)' }}
            >
              <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.2)' }}>
                <CertIcon type={pt.icon} />
              </div>
              <span className="font-mono leading-tight" style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: 'rgba(234,251,255,0.55)' }}>
                {pt.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.2), transparent)' }} />
    </motion.div>
  )
}

// ─── Phone card ────────────────────────────────────────────────────────────────

function PhoneCard({ phone, index }: { phone: Phone; index: number }) {
  const condColor   = conditionColor[phone.condition]
  const statColor   = statusColor[phone.status]
  const isSold      = phone.status === 'Vendu'
  const isReserved  = phone.status === 'Réservé'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background:  'linear-gradient(160deg, rgba(0,12,30,0.97) 0%, rgba(5,8,22,0.99) 100%)',
        border:      '1px solid rgba(0,209,255,0.12)',
        boxShadow:   '0 0 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(0,209,255,0.07)',
      }}
    >
      {/* Scan line */}
      <motion.div
        animate={{ y: ['-100%', '600%'] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', repeatDelay: 7, delay: index * 1.2 }}
        className="absolute inset-x-0 pointer-events-none z-10"
        style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.35), transparent)' }}
      />

      {/* ── Zone photo ── */}
      <div className="relative overflow-hidden"
        style={{ height: '200px', background: 'radial-gradient(ellipse at 50% 65%, rgba(0,102,255,0.1) 0%, transparent 70%)' }}>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,209,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.08) 1px, transparent 1px)',
            backgroundSize:  '24px 24px',
          }} />

        {phone.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={phone.image}
            alt={phone.model}
            className="relative z-10 w-full h-full object-contain p-6 drop-shadow-2xl"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <svg viewBox="0 0 40 72" fill="none" className="h-28 opacity-10">
              <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
              <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
              <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
              <rect x="14" y="5" width="12" height="2" rx="1" fill="#00d1ff"/>
            </svg>
          </div>
        )}

        {/* Overlay Vendu */}
        {isSold && (
          <div className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: 'rgba(5,8,22,0.82)', backdropFilter: 'blur(4px)' }}>
            <div className="font-black font-space text-xl tracking-[0.3em] uppercase rotate-[-12deg] px-4 py-1.5 rounded"
              style={{ color: 'rgba(234,251,255,0.35)', border: '2px solid rgba(234,251,255,0.1)' }}>
              Vendu
            </div>
          </div>
        )}

        {/* Badge condition */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase"
          style={{ color: condColor, background: `${condColor}12`, border: `1px solid ${condColor}35`, backdropFilter: 'blur(8px)' }}>
          <span className="w-1 h-1 rounded-full shrink-0" style={{ background: condColor }} />
          {phone.condition}
        </div>

        {/* Badge statut (Réservé uniquement — Vendu a son overlay) */}
        {isReserved && (
          <div className="absolute top-3 right-14 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase"
            style={{ color: statColor, background: `${statColor}14`, border: `1px solid ${statColor}40`, backdropFilter: 'blur(8px)' }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: statColor }}
            />
            Réservé
          </div>
        )}

        {/* Score HUD */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center w-11 h-11 rounded-full"
          style={{ background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(0,209,255,0.3)', backdropFilter: 'blur(12px)', boxShadow: '0 0 16px rgba(0,209,255,0.15)' }}>
          <span className="font-black font-space text-neon-blue text-sm leading-none">{phone.com9Score}</span>
          <span className="font-mono text-[7px] leading-none mt-0.5" style={{ color: 'rgba(234,251,255,0.3)' }}>/100</span>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="flex flex-col flex-1 p-4 gap-3.5">

        {/* Modèle */}
        <div>
          <h3 className="font-black font-space text-cold-white text-base leading-tight mb-2">{phone.model}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[phone.storage, phone.color].map((tag) => (
              <span key={tag}
                className="font-mono text-[9px] tracking-[0.12em] px-2 py-0.5 rounded"
                style={{ color: 'rgba(234,251,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {tag}
              </span>
            ))}
          </div>
          {phone.description && (
            <p className="font-space text-[11px] leading-relaxed mt-2" style={{ color: 'rgba(234,251,255,0.28)' }}>
              {phone.description}
            </p>
          )}
        </div>

        {/* Barre batterie */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-2.5 h-2.5" style={{ color: 'rgba(0,209,255,0.5)' }}>
                <rect x="0.5" y="2.5" width="9" height="7" rx="1"/><path d="M11 5v2"/><path d="M2.5 6h4"/>
              </svg>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(234,251,255,0.28)' }}>
                Batterie
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold" style={{
              color: phone.battery >= 85 ? '#00d1ff' : phone.battery >= 75 ? '#a0b4d0' : '#facc15',
            }}>
              {phone.battery} %
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,209,255,0.07)' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${phone.battery}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2 + index * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="h-full rounded-full"
              style={{
                background: phone.battery >= 85
                  ? 'linear-gradient(to right, rgba(0,102,255,0.9), #00d1ff)'
                  : phone.battery >= 75
                  ? 'linear-gradient(to right, rgba(100,150,200,0.7), #a0b4d0)'
                  : 'linear-gradient(to right, rgba(200,150,0,0.7), #facc15)',
              }}
            />
          </div>
        </div>

        {/* Bloc CERTIFIED (labels du téléphone) */}
        <CertifiedBlock labels={phone.labels} />

        {/* Prix + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3"
          style={{ borderTop: '1px solid rgba(0,209,255,0.07)' }}>
          <div>
            <span className="font-black font-space text-neon-blue"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', lineHeight: 1 }}>
              {phone.price} €
            </span>
          </div>

          {isSold ? (
            <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-2 rounded-xl"
              style={{ color: 'rgba(234,251,255,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              Vendu
            </span>
          ) : (
            <motion.a
              href={waURL(phone)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300"
              style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#4ade80' }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = 'rgba(34,197,94,0.12)'
                e.currentTarget.style.borderColor  = 'rgba(34,197,94,0.5)'
                e.currentTarget.style.boxShadow    = '0 0 20px rgba(34,197,94,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = 'rgba(34,197,94,0.06)'
                e.currentTarget.style.borderColor  = 'rgba(34,197,94,0.3)'
                e.currentTarget.style.boxShadow    = 'none'
              }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {isReserved ? 'Me prévenir' : 'Contacter'}
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── État vide ─────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="max-w-xl mx-auto"
    >
      <div className="relative rounded-3xl overflow-hidden text-center px-8 py-14"
        style={{
          background:  'linear-gradient(160deg, rgba(0,12,30,0.97) 0%, rgba(5,8,22,0.99) 100%)',
          border:      '1px solid rgba(0,209,255,0.14)',
          boxShadow:   '0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,209,255,0.08)',
        }}>

        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.5), transparent)' }} />

        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,209,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.06) 1px, transparent 1px)',
            backgroundSize:  '30px 30px',
          }} />

        <motion.div
          animate={{ y: ['-100%', '600%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
          className="absolute inset-x-0 pointer-events-none"
          style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.3), transparent)' }}
        />

        <div className="relative z-10">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.15)' }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: '0 0 20px rgba(0,102,255,0.2)' }}
            />
            <svg viewBox="0 0 40 72" fill="none" className="h-9 opacity-50 relative z-10">
              <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
              <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
              <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
              <rect x="14" y="5" width="12" height="2" rx="1" fill="#00d1ff"/>
            </svg>
          </div>

          <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(0,209,255,0.5)' }}>
            Bientôt disponible
          </div>
          <h3 className="font-black font-space text-cold-white text-xl mb-3 leading-tight">
            Les appareils certifiés<br />arrivent prochainement
          </h3>
          <p className="font-space text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(234,251,255,0.32)' }}>
            Rejoins notre liste WhatsApp pour être alerté en priorité dès la mise en ligne.
          </p>

          <motion.a
            href={waLink("Bonjour Com'9 👋 Je souhaite être prévenu(e) des prochains téléphones certifiés disponibles.")}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
            style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#4ade80' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Me prévenir en priorité
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section principale ────────────────────────────────────────────────────────

export default function Occasion() {
  const { phones } = usePhones()
  const [activeBrand, setActiveBrand] = useState('Tous')

  const BRANDS  = ['Tous', ...Array.from(new Set(phones.map(p => p.brand)))]
  const filtered = phones.filter(p => activeBrand === 'Tous' || p.brand === activeBrand)
  const isEmpty  = phones.length === 0

  return (
    <section id="occasion"
      className="relative overflow-hidden"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

      {/* Separateurs */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.15), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.1), transparent)' }} />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '900px', height: '600px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.05) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="section-label mb-5">— Marketplace —</p>
          <h2 className="font-black font-space text-cold-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Com&apos;9{' '}
            <span className="gradient-text">Marketplace</span>
          </h2>
          <p className="font-space max-w-md mx-auto text-sm leading-relaxed"
            style={{ color: 'rgba(234,251,255,0.32)' }}>
            Chaque appareil est diagnostiqué sur 100 points et certifié par nos techniciens avant mise en vente.
          </p>
        </motion.div>

        {/* ── Trust banner ── */}
        <TrustBanner />

        {/* ── Filtre marque (visible seulement si plusieurs marques) ── */}
        {!isEmpty && BRANDS.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 flex-wrap mb-10"
          >
            <div className="flex items-center gap-1 p-1 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,209,255,0.07)' }}>
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(brand)}
                  className="px-4 py-2 rounded-xl font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-250"
                  style={{
                    color:      activeBrand === brand ? '#00d1ff' : 'rgba(234,251,255,0.35)',
                    background: activeBrand === brand ? 'rgba(0,209,255,0.1)' : 'transparent',
                    border:     activeBrand === brand ? '1px solid rgba(0,209,255,0.25)' : '1px solid transparent',
                  }}>
                  {brand}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Grid ou état vide ── */}
        {isEmpty ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((phone, i) => (
                <PhoneCard key={phone.id} phone={phone} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </section>
  )
}
