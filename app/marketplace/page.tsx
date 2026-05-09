// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Page Marketplace (catalogue)
// Route : /marketplace
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { getPhones } from '@/lib/phones-db'
import type { Phone, PhoneStatus, PhoneCondition } from '@/data/phones'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Marketplace — Téléphones certifiés Com'9",
  description: "Catalogue de smartphones reconditionnés et certifiés par Com'9. Chaque téléphone est diagnostiqué sur 100 points avant mise en vente.",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getThumb(phone: Phone): string {
  if (phone.images && phone.images.length > 0) return phone.images[0]
  return phone.image ?? ''
}

const statusCfg: Record<PhoneStatus, { label: string; color: string; bg: string; border: string }> = {
  'Disponible': { label: 'Disponible', color: '#00d1ff',                bg: 'rgba(0,209,255,0.14)',      border: 'rgba(0,209,255,0.35)'  },
  'Réservé':    { label: 'Réservé',    color: '#facc15',                bg: 'rgba(250,204,21,0.14)',     border: 'rgba(250,204,21,0.35)' },
  'Vendu':      { label: 'Vendu',      color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.06)',    border: 'rgba(255,255,255,0.12)' },
}

const conditionColor: Record<PhoneCondition, string> = {
  'Excellent':  '#00d1ff',
  'Très bon':   '#4da6ff',
  'Bon':        '#a0b4d0',
  'Correct':    'rgba(255,255,255,0.45)',
}

// ─── PhoneCard ────────────────────────────────────────────────────────────────

function PhoneCard({ phone }: { phone: Phone }) {
  const thumb  = getThumb(phone)
  const status = statusCfg[phone.status]
  const isVendu = phone.status === 'Vendu'

  return (
    <Link
      href={`/marketplace/${phone.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-450"
      style={{
        background:  'linear-gradient(160deg, rgba(0,12,30,0.97) 0%, rgba(5,8,22,1) 100%)',
        border:      '1px solid rgba(0,209,255,0.1)',
        boxShadow:   '0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,209,255,0.06)',
        opacity:     isVendu ? 0.65 : 1,
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 inset-x-0 h-px transition-opacity duration-450 opacity-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.55), transparent)' }} />

      {/* ── Image zone ── */}
      <div className="relative overflow-hidden"
        style={{ aspectRatio: '4/3', background: 'rgba(0,0,0,0.45)' }}>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={`${phone.brand} ${phone.model}`}
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-15">
            <svg viewBox="0 0 40 72" fill="none" className="h-14">
              <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
              <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
              <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
            </svg>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: status.bg, border: `1px solid ${status.border}`, backdropFilter: 'blur(8px)' }}>
          {phone.status === 'Disponible' && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ background: status.color }} />
          )}
          <span className="font-mono text-[8px] tracking-[0.18em] uppercase"
            style={{ color: status.color }}>
            {status.label}
          </span>
        </div>

        {/* Score badge */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(5,8,22,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,209,255,0.18)' }}>
          <span className="font-black font-space text-neon-blue text-sm leading-none">{phone.com9Score}</span>
          <span className="font-mono text-[7.5px]" style={{ color: 'rgba(0,209,255,0.5)' }}>/100</span>
        </div>
      </div>

      {/* ── Info zone ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Model */}
        <div className="mb-2">
          <h3 className="font-black font-space text-white text-sm leading-tight">
            {phone.brand} {phone.model}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="font-mono text-[8px] tracking-[0.12em] px-1.5 py-0.5 rounded"
              style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {phone.storage}
            </span>
            <span className="font-mono text-[8px] tracking-[0.12em] px-1.5 py-0.5 rounded"
              style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {phone.color}
            </span>
            <span className="font-mono text-[8px] tracking-[0.1em] px-1.5 py-0.5 rounded"
              style={{ color: conditionColor[phone.condition], background: `${conditionColor[phone.condition]}12`, border: `1px solid ${conditionColor[phone.condition]}30` }}>
              {phone.condition}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 py-2.5 mt-auto"
          style={{ borderTop: '1px solid rgba(0,209,255,0.06)' }}>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-2.5 h-2.5 shrink-0" style={{ color: phone.battery >= 85 ? '#00d1ff' : phone.battery >= 70 ? '#facc15' : '#f87171' }}>
              <rect x="1" y="3.5" width="10.5" height="7" rx="1.2"/><path d="M12.5 6v2"/>
            </svg>
            <span className="font-mono text-[9px]"
              style={{ color: phone.battery >= 85 ? '#00d1ff' : phone.battery >= 70 ? '#facc15' : '#f87171' }}>
              {phone.battery} %
            </span>
          </div>

          {/* Prix */}
          <div className="ml-auto">
            <span className="font-black font-space text-xl leading-none" style={{ color: '#ffffff' }}>
              {phone.price} <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>€</span>
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-[9.5px] tracking-[0.18em] uppercase transition-all duration-300"
          style={{
            border:     isVendu ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,209,255,0.22)',
            background: isVendu ? 'rgba(255,255,255,0.03)'           : 'rgba(0,209,255,0.05)',
            color:      isVendu ? 'rgba(255,255,255,0.3)'            : 'rgba(0,209,255,0.8)',
          }}>
          {isVendu ? 'Vendu' : (
            <>
              Voir le téléphone
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Composant vide ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-32">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(0,209,255,0.04)', border: '1px solid rgba(0,209,255,0.1)' }}>
        <svg viewBox="0 0 40 72" fill="none" className="h-10 opacity-25">
          <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
          <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
          <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
        </svg>
      </div>
      <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
        style={{ color: 'rgba(0,209,255,0.4)' }}>
        Catalogue vide
      </p>
      <p className="font-space text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Aucun téléphone disponible pour le moment.
      </p>
      <p className="font-space text-xs mt-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
        Revenez bientôt ou contactez-nous sur WhatsApp.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MarketplacePage() {
  let phones: Phone[] = []
  try { phones = await getPhones() } catch { phones = [] }

  // Disponibles en premier, puis réservés, puis vendus
  const sorted = [
    ...phones.filter(p => p.status === 'Disponible'),
    ...phones.filter(p => p.status === 'Réservé'),
    ...phones.filter(p => p.status === 'Vendu'),
  ]

  const countAvailable = phones.filter(p => p.status === 'Disponible').length

  return (
    <div className="min-h-screen" style={{ background: '#050816' }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage:  'linear-gradient(rgba(0,209,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.018) 1px, transparent 1px)',
            backgroundSize:   '64px 64px',
          }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{ width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4"
          style={{ width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero section ── */}
      <section className="relative z-10 pt-32 pb-14 px-5 text-center">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/"
            className="font-mono text-[9px] tracking-[0.22em] uppercase transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.38)' }}
            onMouseEnter={undefined}>
            Accueil
          </Link>
          <span className="font-mono text-[8px]" style={{ color: 'rgba(0,209,255,0.3)' }}>›</span>
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: 'rgba(0,209,255,0.7)' }}>
            Marketplace
          </span>
        </div>

        <p className="section-label mb-5">— Marketplace Com&apos;9 —</p>
        <h1 className="font-black font-space text-white mb-5"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Téléphones{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00d1ff 0%, #4da6ff 35%, #0066ff 65%, #00d1ff 100%)',
            backgroundSize: '260% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Certifiés
          </span>
        </h1>
        <p className="font-space text-sm max-w-sm mx-auto leading-relaxed mb-8"
          style={{ color: 'rgba(255,255,255,0.72)' }}>
          Chaque appareil est diagnostiqué sur 100 points,<br className="hidden sm:block" />
          testé et validé par Com&apos;9 avant mise en vente.
        </p>

        {/* Stats */}
        {phones.length > 0 && (
          <div className="flex items-center justify-center gap-6">
            {[
              { label: 'Téléphones',  value: phones.length,    color: 'rgba(0,209,255,0.7)'  },
              { label: 'Disponibles', value: countAvailable,   color: '#00d1ff'               },
              { label: 'Réservés',    value: phones.filter(p => p.status === 'Réservé').length, color: '#facc15' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-black font-space text-2xl leading-none mb-1" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Catalogue ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24">

        {/* Séparateur */}
        <div className="h-px mb-10"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.18), transparent)' }} />

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map(phone => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
