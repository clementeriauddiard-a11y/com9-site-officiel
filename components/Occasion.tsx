'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { conditionColor, statusColor, type Phone } from '@/data/phones'
import { usePhones } from '@/context/PhonesContext'
import { waLink } from '@/lib/links'

// ─── WhatsApp URL ──────────────────────────────────────────────────────────────

function waURL(p: Phone) {
  return waLink(p.whatsappMessage)
}

// ─── Phone card — sobre, style Apple Store ────────────────────────────────────

function PhoneCard({ phone, index }: { phone: Phone; index: number }) {
  const condColor  = conditionColor[phone.condition]
  const statColor  = statusColor[phone.status]
  const isSold     = phone.status === 'Vendu'
  const isReserved = phone.status === 'Réservé'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500"
      style={{
        background: 'linear-gradient(170deg, rgba(10,16,34,0.92) 0%, rgba(5,8,22,0.98) 100%)',
        border:     '1px solid rgba(255,255,255,0.07)',
        boxShadow:  '0 20px 60px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,209,255,0.22)'
        e.currentTarget.style.transform   = 'translateY(-4px)'
        e.currentTarget.style.boxShadow   = '0 28px 80px rgba(0,0,0,0.5), 0 0 50px rgba(0,102,255,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.style.boxShadow   = '0 20px 60px rgba(0,0,0,0.4)'
      }}
    >
      {/* Lien principal sur toute la carte (sauf le bouton WhatsApp) */}
      <Link href={`/marketplace/${phone.id}`} className="flex flex-col flex-1 min-w-0" style={{ textDecoration: 'none' }}>

        {/* ── Zone photo ── */}
        <div className="relative overflow-hidden"
          style={{ height: '230px', background: 'radial-gradient(ellipse at 50% 70%, rgba(0,102,255,0.07) 0%, transparent 70%)' }}>

          {phone.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={phone.image}
              alt={phone.model}
              className="relative z-10 w-full h-full object-contain p-7 drop-shadow-2xl"
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
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9.5px] tracking-[0.14em] uppercase"
            style={{ color: condColor, background: 'rgba(5,8,22,0.72)', border: `1px solid ${condColor}30`, backdropFilter: 'blur(8px)' }}>
            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: condColor }} />
            {phone.condition}
          </div>

          {/* Badge Réservé */}
          {isReserved && (
            <div className="absolute top-4 right-[70px] z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9.5px] tracking-[0.14em] uppercase"
              style={{ color: statColor, background: 'rgba(5,8,22,0.72)', border: `1px solid ${statColor}35`, backdropFilter: 'blur(8px)' }}>
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: statColor }} />
              Réservé
            </div>
          )}

          {/* Score Com'9 */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center w-11 h-11 rounded-full"
            style={{ background: 'rgba(5,8,22,0.85)', border: '1px solid rgba(0,209,255,0.25)', backdropFilter: 'blur(12px)' }}>
            <span className="font-black font-space text-neon-blue text-sm leading-none">{phone.com9Score}</span>
            <span className="font-mono text-[7px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>/100</span>
          </div>
        </div>

        {/* ── Contenu ── */}
        <div className="flex flex-col flex-1 px-6 pt-5 pb-4 gap-1.5">
          <h3 className="font-bold font-space text-cold-white text-lg leading-tight">{phone.model}</h3>
          <p className="font-space text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {phone.storage} · {phone.color}
          </p>

          {/* Prix */}
          <div className="mt-4">
            <span className="font-black font-space text-cold-white"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 1.8rem)', lineHeight: 1 }}>
              {phone.price} €
            </span>
          </div>
        </div>
      </Link>

      {/* ── Actions — hors du Link ── */}
      <div className="px-6 pb-6 pt-1 flex items-center justify-between gap-3">
        <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase flex items-center gap-1.5"
          style={{ color: 'rgba(0,209,255,0.55)' }}>
          Voir la fiche
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5">
            <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>

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
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 px-4 rounded-full font-mono text-[10px] tracking-[0.14em] uppercase transition-all duration-300"
            style={{ minHeight: '42px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#4ade80' }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = 'rgba(34,197,94,0.12)'
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'rgba(34,197,94,0.06)'
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
            }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {isReserved ? 'Me prévenir' : 'Contacter'}
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}

// ─── État vide ─────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
      className="max-w-xl mx-auto"
    >
      <div className="relative rounded-3xl overflow-hidden text-center px-8 py-14"
        style={{
          background: 'linear-gradient(170deg, rgba(10,16,34,0.92) 0%, rgba(5,8,22,0.98) 100%)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 20px 60px rgba(0,0,0,0.4)',
        }}>
        <div className="relative z-10">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.14)' }}>
            <svg viewBox="0 0 40 72" fill="none" className="h-9 opacity-50">
              <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
              <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
              <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
              <rect x="14" y="5" width="12" height="2" rx="1" fill="#00d1ff"/>
            </svg>
          </div>

          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(0,209,255,0.85)' }}>
            Bientôt disponible
          </div>
          <h3 className="font-black font-space text-cold-white text-xl mb-3 leading-tight">
            Les appareils certifiés<br />arrivent prochainement
          </h3>
          <p className="font-space text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Rejoins notre liste WhatsApp pour être alerté en priorité dès la mise en ligne.
          </p>

          <motion.a
            href={waLink("Bonjour Com'9 👋 Je souhaite être prévenu(e) des prochains téléphones certifiés disponibles.")}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-7 rounded-full font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300"
            style={{ minHeight: '50px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#4ade80' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)' }}
          >
            Me prévenir en priorité
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section principale — aperçu accueil ──────────────────────────────────────

export default function Occasion() {
  const { phones } = usePhones()

  // Aperçu accueil : 3 téléphones max, disponibles en priorité
  const statusOrder = (s: Phone['status']) => (s === 'Vendu' ? 2 : s === 'Réservé' ? 1 : 0)
  const preview = [...phones].sort((a, b) => statusOrder(a.status) - statusOrder(b.status)).slice(0, 3)
  const isEmpty = phones.length === 0

  return (
    <section id="occasion"
      className="relative overflow-hidden"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

      {/* Séparateur haut */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.12), transparent)' }} />

      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-5">Marketplace</p>
          <h2 className="font-black font-space text-cold-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
            Com&apos;9 <span className="gradient-text">Marketplace</span>
          </h2>
          <p className="font-space max-w-md mx-auto text-[15px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Chaque appareil est contrôlé sur 100 points et certifié avant mise en vente.
          </p>
        </motion.div>

        {/* ── Aperçu (3 téléphones max) ou état vide ── */}
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {preview.map((phone, i) => (
                <PhoneCard key={phone.id} phone={phone} index={i} />
              ))}
            </div>

            {/* CTA vers la Marketplace complète */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="flex justify-center mt-14"
            >
              <Link
                href="/marketplace"
                className="group inline-flex items-center gap-3 px-9 rounded-full font-space text-[0.95rem] transition-all duration-500"
                style={{
                  minHeight: '54px',
                  border:     '1px solid rgba(0,209,255,0.3)',
                  background: 'rgba(0,209,255,0.05)',
                  color:      '#7fe4ff',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = 'rgba(0,209,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(0,209,255,0.55)'
                  e.currentTarget.style.boxShadow   = '0 0 32px rgba(0,209,255,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(0,209,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(0,209,255,0.3)'
                  e.currentTarget.style.boxShadow   = 'none'
                }}
              >
                Voir toute la Marketplace
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          </>
        )}

      </div>
    </section>
  )
}
