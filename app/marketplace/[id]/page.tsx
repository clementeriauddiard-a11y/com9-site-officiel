// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Page Détail Téléphone
// Route : /marketplace/[id]
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhones } from '@/lib/phones-db'
import type { Phone, PhoneStatus, PhoneCondition } from '@/data/phones'
import { LINKS } from '@/lib/links'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PhoneGallery from '@/components/marketplace/PhoneGallery'

export const dynamic = 'force-dynamic'

// ─── Metadata dynamique ───────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const phones = await getPhones()
    const phone  = phones.find(p => p.id === id)
    if (!phone) return { title: "Téléphone introuvable — Com'9" }
    return {
      title:       `${phone.brand} ${phone.model} ${phone.storage} — Marketplace Com'9`,
      description: `${phone.brand} ${phone.model} ${phone.storage} ${phone.color} — Score Diagnostic ${phone.com9Score}/100 — ${phone.price} €. Testé et certifié Com'9.`,
    }
  } catch {
    return {}
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllImages(phone: Phone): string[] {
  const imgs = phone.images && phone.images.length > 0 ? phone.images : []
  if (imgs.length === 0 && phone.image) return [phone.image]
  return imgs
}

function buildWaMessage(phone: Phone): string {
  if (phone.whatsappMessage) return phone.whatsappMessage
  return `Bonjour, je viens du site Com'9. Je suis intéressé(e) par le ${phone.brand} ${phone.model} ${phone.storage} affiché à ${phone.price} €. Est-il toujours disponible ?`
}

const statusCfg: Record<PhoneStatus, { label: string; color: string; bg: string; border: string }> = {
  'Disponible': { label: 'Disponible', color: '#00d1ff',                bg: 'rgba(0,209,255,0.12)',   border: 'rgba(0,209,255,0.35)'  },
  'Réservé':    { label: 'Réservé',    color: '#facc15',                bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.35)' },
  'Vendu':      { label: 'Vendu',      color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
}

const conditionColor: Record<PhoneCondition, string> = {
  'Excellent':  '#00d1ff',
  'Très bon':   '#4da6ff',
  'Bon':        '#a0b4d0',
  'Correct':    'rgba(255,255,255,0.45)',
}

// ─── Spec row ────────────────────────────────────────────────────────────────

function SpecRow({ icon, label, value, valueColor }: {
  icon:        React.ReactNode
  label:       string
  value:       string
  valueColor?: string
}) {
  return (
    <div className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(0,209,255,0.06)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.12)', color: 'rgba(0,209,255,0.65)' }}>
        {icon}
      </div>
      <span className="font-mono text-[9px] tracking-[0.18em] uppercase w-20 shrink-0"
        style={{ color: 'rgba(255,255,255,0.38)' }}>
        {label}
      </span>
      <span className="font-space text-sm font-semibold ml-auto text-right"
        style={{ color: valueColor ?? '#ffffff' }}>
        {value}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PhoneDetailPage({ params }: Props) {
  const { id } = await params

  let phones: Phone[] = []
  try { phones = await getPhones() } catch { phones = [] }

  const phone = phones.find(p => p.id === id)
  if (!phone) notFound()

  const images    = getAllImages(phone)
  const status    = statusCfg[phone.status]
  const isVendu   = phone.status === 'Vendu'
  const waMessage = buildWaMessage(phone)
  const waUrl     = `${LINKS.whatsapp}?text=${encodeURIComponent(waMessage)}`

  const batteryColor = phone.battery >= 85 ? '#00d1ff' : phone.battery >= 70 ? '#facc15' : '#f87171'

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
          style={{ width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Content ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-28 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="font-mono text-[8.5px] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.32)' }}>
            Accueil
          </Link>
          <span className="font-mono text-[8px]" style={{ color: 'rgba(0,209,255,0.28)' }}>›</span>
          <Link href="/marketplace" className="font-mono text-[8.5px] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.32)' }}>
            Marketplace
          </Link>
          <span className="font-mono text-[8px]" style={{ color: 'rgba(0,209,255,0.28)' }}>›</span>
          <span className="font-mono text-[8.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(0,209,255,0.7)' }}>
            {phone.brand} {phone.model}
          </span>
        </div>

        {/* ── Layout 2 colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── LEFT : Galerie ── */}
          <div>
            <PhoneGallery images={images} model={`${phone.brand} ${phone.model}`} />

            {/* Certification labels (sous la galerie) */}
            {phone.labels.length > 0 && (
              <div className="mt-5 rounded-2xl p-4"
                style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.08)' }}>
                <p className="font-mono text-[8.5px] tracking-[0.25em] uppercase mb-3"
                  style={{ color: 'rgba(0,209,255,0.55)' }}>
                  Points de certification
                </p>
                <div className="flex flex-col gap-2">
                  {phone.labels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3 shrink-0" style={{ color: '#00d1ff' }}>
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-space text-[12.5px]" style={{ color: 'rgba(255,255,255,0.82)' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT : Info ── */}
          <div className="flex flex-col gap-6">

            {/* Header produit */}
            <div>
              {/* Status badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                style={{ background: status.bg, border: `1px solid ${status.border}` }}>
                {phone.status === 'Disponible' && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                    style={{ background: status.color }} />
                )}
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase"
                  style={{ color: status.color }}>
                  {status.label}
                </span>
              </div>

              <h1 className="font-black font-space text-white mb-1 leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', letterSpacing: '-0.02em' }}>
                {phone.brand} {phone.model}
              </h1>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-5"
                style={{ color: 'rgba(0,209,255,0.65)' }}>
                {phone.storage} · {phone.color}
              </p>

              {/* Prix */}
              <div className="flex items-end gap-2 mb-6">
                <span className="font-black font-space leading-none"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', color: '#ffffff' }}>
                  {phone.price}
                </span>
                <span className="font-bold font-space text-xl mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>€</span>
              </div>
            </div>

            {/* Specs */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(0,209,255,0.08)' }}>
              <SpecRow
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5"><rect x="1" y="2" width="10.5" height="7" rx="1.2"/><path d="M12 5v4"/></svg>}
                label="Batterie"
                value={`${phone.battery} %`}
                valueColor={batteryColor}
              />
              <SpecRow
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v2.5l2 1"/></svg>}
                label="État"
                value={phone.condition}
                valueColor={conditionColor[phone.condition]}
              />
              <SpecRow
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5"><rect x="2" y="1.5" width="10" height="11" rx="2"/><rect x="4" y="3.5" width="6" height="4" rx="0.8"/><circle cx="7" cy="10.5" r="0.8" fill="currentColor"/></svg>}
                label="Stockage"
                value={phone.storage}
              />
              <SpecRow
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5"><circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2"/></svg>}
                label="Couleur"
                value={phone.color}
              />
              <div className="flex items-center gap-3 py-3 px-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-3"
                  style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.12)', color: 'rgba(0,209,255,0.65)' }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5">
                    <circle cx="7" cy="7" r="5.5"/><path d="M7 4v2.5l1.5 1.5"/>
                  </svg>
                </div>
                <span className="font-mono text-[9px] tracking-[0.18em] uppercase w-20 shrink-0"
                  style={{ color: 'rgba(255,255,255,0.38)' }}>Score</span>
                <div className="ml-auto mr-3 flex items-baseline gap-1">
                  <span className="font-black font-space text-2xl leading-none" style={{ color: '#00d1ff' }}>
                    {phone.com9Score}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(0,209,255,0.45)' }}>/100</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {phone.description && (
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-[8.5px] tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'rgba(0,209,255,0.5)' }}>Description</p>
                <p className="font-space text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {phone.description}
                </p>
              </div>
            )}

            {/* Réparations / Accessoires / Garantie */}
            {(phone.repairs || phone.accessories || phone.guarantee) && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {phone.repairs && (
                  <div className="px-4 py-3.5"
                    style={{ borderBottom: phone.accessories || phone.guarantee ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p className="font-mono text-[8.5px] tracking-[0.25em] uppercase mb-1.5"
                      style={{ color: 'rgba(0,209,255,0.5)' }}>Réparations effectuées</p>
                    <p className="font-space text-sm" style={{ color: 'rgba(255,255,255,0.82)' }}>{phone.repairs}</p>
                  </div>
                )}
                {phone.accessories && (
                  <div className="px-4 py-3.5"
                    style={{ borderBottom: phone.guarantee ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p className="font-mono text-[8.5px] tracking-[0.25em] uppercase mb-1.5"
                      style={{ color: 'rgba(0,209,255,0.5)' }}>Accessoires inclus</p>
                    <p className="font-space text-sm" style={{ color: 'rgba(255,255,255,0.82)' }}>{phone.accessories}</p>
                  </div>
                )}
                {phone.guarantee && (
                  <div className="px-4 py-3.5">
                    <p className="font-mono text-[8.5px] tracking-[0.25em] uppercase mb-1.5"
                      style={{ color: 'rgba(0,209,255,0.5)' }}>Garantie</p>
                    <p className="font-space text-sm" style={{ color: 'rgba(255,255,255,0.82)' }}>{phone.guarantee}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Bloc Diagnostic Premium ── */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(0,12,30,0.98) 0%, rgba(0,30,60,0.6) 100%)',
                border:     '1px solid rgba(0,209,255,0.18)',
                boxShadow:  'inset 0 1px 0 rgba(0,209,255,0.1)',
              }}>

              {/* Top glow */}
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.5), transparent)' }} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.22)' }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-4 h-4" style={{ color: '#00d1ff' }}>
                      <circle cx="8" cy="8" r="6.5"/><path d="M8 5v3l2 2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-[8.5px] tracking-[0.22em] uppercase mb-0.5"
                      style={{ color: 'rgba(0,209,255,0.65)' }}>
                      Diagnostic Premium Com&apos;9
                    </p>
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 shrink-0" style={{ color: '#4ade80' }}>
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-space text-sm font-bold" style={{ color: '#ffffff' }}>Validé</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="font-black font-space text-2xl leading-none" style={{ color: '#00d1ff' }}>
                      {phone.com9Score}
                    </span>
                    <span className="font-mono text-[9px] ml-0.5" style={{ color: 'rgba(0,209,255,0.5)' }}>/100</span>
                  </div>
                </div>

                {/* Image diagnostic */}
                {phone.diagnosticImage && (
                  <div className="mb-4 rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(0,209,255,0.12)', background: 'rgba(0,0,0,0.4)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={phone.diagnosticImage}
                      alt="Résultat Diagnostic Premium Com'9"
                      className="w-full object-contain max-h-64"
                    />
                  </div>
                )}

                {/* Mention */}
                <p className="font-space text-xs leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Ce téléphone a été vérifié et validé via le{' '}
                  <span style={{ color: 'rgba(0,209,255,0.85)' }}>Diagnostic Premium Com&apos;9</span>{' '}
                  avant sa mise en vente. Score calculé sur 100 points de contrôle.
                </p>
              </div>
            </div>

            {/* ── CTA WhatsApp ── */}
            {!isVendu ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-space font-bold text-sm tracking-wide transition-all duration-300"
                style={{
                  background:  'rgba(34,197,94,0.1)',
                  border:      '1px solid rgba(34,197,94,0.35)',
                  color:       '#4ade80',
                  boxShadow:   '0 4px 24px rgba(34,197,94,0.08)',
                }}
                onMouseEnter={undefined}
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Demander ce téléphone
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-space text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                Ce téléphone a été vendu
              </div>
            )}

            {/* Back link */}
            <Link href="/marketplace"
              className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.2em] uppercase transition-colors duration-200 self-start"
              style={{ color: 'rgba(0,209,255,0.45)' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3">
                <path d="M10 7H4M7 4L4 7l3 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Retour au catalogue
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
