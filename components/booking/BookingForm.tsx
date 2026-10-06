'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Demande de rendez-vous (formulaire public)
//
//  Le client envoie une DEMANDE. Rien n'est réservé : COM'9 confirme le
//  créneau ou propose une autre disponibilité. Aucun paiement, aucun acompte.
//  Le prix affiché vient de la grille ; le serveur le recalcule de son côté.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  PRICE_NOTE,
  REPAIRS,
  SERIES,
  TRAVEL_RULE,
  ZONES,
  buildQuote,
  buildQuoteMessage,
  findModel,
  findZone,
  getOptions,
  type RepairId,
  type ZoneId,
} from '@/data/tarifs'
import {
  BOOKING_HORIZON_DAYS,
  addDaysToDay,
  parsePublicRequest,
  todayInParis,
} from '@/lib/agenda/logic'
import {
  PREFERRED_PERIODS,
  PREFERRED_PERIOD_LABEL,
  REQUEST_RECEIVED_MESSAGE,
  type PreferredPeriod,
} from '@/lib/agenda/types'
import { WaCta } from '@/components/ui/Wa'

type Recap = {
  model: string
  repairLabel: string
  quality: string
  repairPrice: number
  zoneLabel: string | null
  travelFee: number | null
  total: number | null
  onQuote: boolean
  wish: string
}

const isRepair = (v: string | null): v is RepairId => REPAIRS.some((r) => r.id === v)
const isZone = (v: string | null): v is ZoneId => ZONES.some((z) => z.id === v)

// ─── Petits éléments ─────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-2xl px-4 font-space text-[1rem] outline-none transition-colors duration-200 focus:border-[color:var(--c9-accent-line)]'
const inputStyle: React.CSSProperties = {
  minHeight: '52px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--c9-hairline)',
  color: 'var(--c9-text)',
  colorScheme: 'dark',
}

function Step({ n, title, hint, children }: { n: string; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby={`step-${n}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-[0.28em]" style={{ color: 'var(--c9-accent)' }}>{n}</span>
          <h2 id={`step-${n}`} className="font-space text-[1.1875rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
            {title}
          </h2>
        </div>
        {hint && (
          <p className="font-space text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>{hint}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--c9-text-3)' }}>
      {children}
      {optional && <span className="normal-case tracking-normal"> · facultatif</span>}
    </label>
  )
}

/** Choix exclusif en pastilles, accessible au clavier (radiogroup). */
function Choice<T extends string>({
  name, options, value, onChange, columns,
}: {
  name: string
  options: { id: T; label: ReactNode; sub?: ReactNode }[]
  value: T | null
  onChange: (v: T) => void
  columns: number
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className="flex min-w-0 flex-col items-start justify-center gap-0.5 rounded-2xl px-4 py-3 text-left transition-all duration-200"
            style={{
              minHeight: '52px',
              background: on ? 'rgba(58,217,255,0.10)' : 'rgba(255,255,255,0.04)',
              border: on ? '1px solid var(--c9-accent-line)' : '1px solid var(--c9-hairline)',
            }}
          >
            <span className="font-space text-[0.9375rem] font-semibold leading-tight" style={{ color: on ? 'var(--c9-text)' : 'var(--c9-text-2)' }}>
              {o.label}
            </span>
            {o.sub && (
              <span className="font-space text-[0.8125rem] leading-tight" style={{ color: 'var(--c9-text-3)' }}>{o.sub}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-space" style={{ color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)', fontWeight: strong ? 600 : 400 }}>
        {label}
      </span>
      <span className="whitespace-nowrap font-space tabular-nums"
        style={{ color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)', fontSize: strong ? '1.375rem' : '0.9375rem', fontWeight: strong ? 600 : 500 }}>
        {value}
      </span>
    </div>
  )
}

// ─── Formulaire ──────────────────────────────────────────────────────────────

export default function BookingForm() {
  const params = useSearchParams()
  const startedAt = useRef(Date.now())
  const today = useMemo(() => todayInParis(), [])
  const maxDay = useMemo(() => addDaysToDay(today, BOOKING_HORIZON_DAYS), [today])

  // Pré-remplissage depuis la grille tarifaire (paramètres vérifiés)
  const pModel = params.get('model')
  const pRepair = params.get('repair')
  const [model, setModel] = useState(pModel && findModel(pModel) ? pModel : '')
  const [repair, setRepair] = useState<RepairId>(isRepair(pRepair) ? pRepair : 'ecran')
  const [quality, setQuality] = useState(params.get('quality') ?? '')
  const pZone = params.get('zone')
  const [zone, setZone] = useState<ZoneId | 'inconnue' | null>(isZone(pZone) ? pZone : null)

  const [date, setDate] = useState('')
  const [period, setPeriod] = useState<PreferredPeriod | 'indifferent' | null>(null)
  const [availability, setAvailability] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('') // piège à robots, invisible

  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [fallback, setFallback] = useState(false) // service indisponible → WhatsApp
  const [done, setDone] = useState<{ recap: Recap | null } | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const m = model ? findModel(model) : undefined
  const options = useMemo(() => (m ? getOptions(repair, m) : []), [m, repair])

  // Qualité : conservée si elle existe pour ce modèle, sinon choix unique automatique
  useEffect(() => {
    if (!options.length) return
    if (!options.some((o) => o.label === quality)) {
      setQuality(options.length === 1 ? options[0].label : '')
    }
  }, [options, quality])

  const option = options.find((o) => o.label === quality) ?? null
  const zoneObj = zone && zone !== 'inconnue' ? findZone(zone) : null
  const quote = option ? buildQuote(option, zoneObj) : null

  useEffect(() => {
    if (errors.length) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [errors])

  function payload() {
    return {
      clientName: name,
      clientPhone: phone,
      address,
      model,
      repair,
      quality,
      zone: zone && zone !== 'inconnue' ? zone : null,
      description,
      preferredDate: date,
      preferredPeriod: period && period !== 'indifferent' ? period : null,
      availabilityNote: availability,
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFallback(false)
    const body = payload()
    const local = parsePublicRequest(body, todayInParis())
    const extra: string[] = []
    if (zone === null) extra.push('Indiquez votre zone, ou « Je ne sais pas ».')
    if (period === null) extra.push('Indiquez le moment souhaité, ou « Indifférent ».')
    if (!local.ok || extra.length) {
      setErrors([...(local.ok ? [] : local.errors), ...extra])
      return
    }
    setBusy(true)
    setErrors([])
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, website, elapsedMs: Date.now() - startedAt.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setDone({ recap: data.recap ?? null })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (res.status === 503 || res.status === 429 || res.status >= 500) setFallback(true)
      setErrors(
        Array.isArray(data.errors) && data.errors.length
          ? data.errors
          : [data.error ?? "La demande n'a pas pu être envoyée."],
      )
    } catch {
      setFallback(true)
      setErrors(["La demande n'a pas pu être envoyée. Vérifiez votre connexion."])
    } finally {
      setBusy(false)
    }
  }

  // ─── Demande envoyée ───
  if (done) {
    const r = done.recap
    return (
      <div className="flex flex-col gap-6" role="status" aria-live="polite">
        <div className="c9-surface-accent flex flex-col gap-4 rounded-[26px] p-6 sm:p-8">
          <span className="section-label">Demande envoyée</span>
          <p className="font-space text-[1.25rem] font-semibold leading-snug" style={{ color: 'var(--c9-text)' }}>
            {REQUEST_RECEIVED_MESSAGE}
          </p>
          <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
            Ce n&apos;est pas encore un rendez-vous confirmé. Aucun paiement ni acompte n&apos;est demandé.
          </p>
        </div>

        {r && (
          <div className="c9-surface flex flex-col gap-3 rounded-[26px] p-6 sm:p-7">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: 'var(--c9-text-3)' }}>
              Récapitulatif de votre demande
            </p>
            <p className="font-space text-[1.0625rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
              {r.model} · {r.repairLabel}
            </p>
            <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>{r.quality}</p>
            <div className="c9-divider my-2" />
            <Line label="Réparation" value={`${r.repairPrice} €`} />
            <Line label="Déplacement" value={r.onQuote ? 'Sur devis' : r.travelFee === null ? 'Selon votre zone' : `${r.travelFee} €`} />
            {r.zoneLabel && (
              <p className="text-right font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
                {r.zoneLabel} · zone vérifiée par COM&apos;9 avant confirmation
              </p>
            )}
            <div className="c9-divider my-2" />
            {r.total !== null
              ? <Line label="Total indicatif" value={`${r.total} €`} strong />
              : <Line label="Total" value={r.onQuote ? 'Sur devis' : 'Après vérification de la zone'} />}
            <div className="c9-divider my-2" />
            <Line label="Souhait" value={r.wish.charAt(0).toUpperCase() + r.wish.slice(1)} />
          </div>
        )}

        <Link href="/" className="c9-back self-start rounded-xl px-3 py-3 font-space text-[0.9375rem] font-medium" style={{ color: 'var(--c9-text)' }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  // ─── Formulaire ───
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      {/* 01 — Réparation */}
      <Step n="01" title="Votre réparation">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-model">Modèle</Label>
          <select id="b-model" className={inputCls} style={inputStyle} value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">Choisir votre iPhone</option>
            {SERIES.map((s) => (
              <optgroup key={s.serie} label={s.serie}>
                {s.models.map((x) => <option key={x.model} value={x.model}>{x.model}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Prestation</Label>
          <Choice name="Prestation" columns={3} value={repair} onChange={setRepair}
            options={REPAIRS.map((r) => ({ id: r.id, label: r.label }))} />
        </div>

        {m && (
          <div className="flex flex-col gap-1.5">
            <Label>{options.length > 1 ? 'Qualité de la pièce' : 'Pièce'}</Label>
            <Choice name="Qualité de la pièce" columns={options.length > 1 ? 2 : 1} value={quality || null} onChange={setQuality}
              options={options.map((o) => ({ id: o.label, label: o.label, sub: `${o.price} € · ${o.note}` }))} />
          </div>
        )}
      </Step>

      {/* 02 — Adresse et zone */}
      <Step n="02" title="Lieu de l'intervention"
        hint="Choisissez votre zone de déplacement. Elle reste indicative : COM'9 la vérifie avant de confirmer. La distance n'est pas calculée automatiquement.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-address">Adresse</Label>
          <input id="b-address" className={inputCls} style={inputStyle} autoComplete="street-address"
            placeholder="N°, rue, code postal, ville" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Zone de déplacement</Label>
          <Choice name="Zone de déplacement" columns={2} value={zone} onChange={setZone}
            options={[
              ...ZONES.map((z) => ({ id: z.id as ZoneId | 'inconnue', label: z.label, sub: z.fee === null ? 'Sur devis' : `${z.fee} €` })),
              { id: 'inconnue' as const, label: 'Je ne sais pas', sub: 'COM\'9 vous l\'indiquera' },
            ]} />
        </div>

        {quote && (
          <div className="c9-surface flex flex-col gap-3 rounded-[22px] p-5" aria-live="polite">
            <Line label="Réparation" value={`${quote.repairPrice} €`} />
            <Line label="Déplacement" value={quote.onQuote ? 'Sur devis' : quote.travelFee === null ? 'Selon votre zone' : `${quote.travelFee} €`} />
            <div className="c9-divider my-1" />
            {quote.total !== null
              ? <Line label="Total indicatif" value={`${quote.total} €`} strong />
              : <Line label="Total" value={quote.onQuote ? 'Sur devis' : 'Selon votre zone'} />}
            <p className="font-space text-[0.75rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
              {PRICE_NOTE} {TRAVEL_RULE}
            </p>
          </div>
        )}
      </Step>

      {/* 03 — Créneau souhaité */}
      <Step n="03" title="Créneau souhaité"
        hint="C'est une demande : COM'9 vous confirmera le créneau ou vous proposera une autre disponibilité.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-date">Jour souhaité</Label>
          <input id="b-date" type="date" className={inputCls} style={inputStyle} min={today} max={maxDay}
            value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Moment de la journée</Label>
          <Choice name="Moment de la journée" columns={2} value={period} onChange={setPeriod}
            options={[
              ...PREFERRED_PERIODS.map((p) => ({ id: p as PreferredPeriod | 'indifferent', label: PREFERRED_PERIOD_LABEL[p] })),
              { id: 'indifferent' as const, label: 'Indifférent' },
            ]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-avail" optional>Autres disponibilités</Label>
          <textarea id="b-avail" rows={2} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: '76px' }} maxLength={300}
            placeholder="Ex. : mercredi après 17 h, ou samedi matin" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        </div>
      </Step>

      {/* 04 — Coordonnées */}
      <Step n="04" title="Vos coordonnées"
        hint="Elles servent uniquement à organiser votre intervention et ne sont jamais publiées.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-name">Nom</Label>
            <input id="b-name" className={inputCls} style={inputStyle} autoComplete="name" maxLength={80}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-phone">Téléphone</Label>
            <input id="b-phone" type="tel" inputMode="tel" className={inputCls} style={inputStyle} autoComplete="tel" maxLength={30}
              placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-desc" optional>Le problème en quelques mots</Label>
          <textarea id="b-desc" rows={3} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: '96px' }} maxLength={1000}
            placeholder="Ex. : écran fissuré, le tactile répond encore" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Piège à robots : invisible pour les personnes, ignoré par les lecteurs d'écran */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="b-website">Site web</label>
          <input id="b-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </Step>

      {errors.length > 0 && (
        <div ref={errorRef} role="alert" className="flex flex-col gap-3 rounded-2xl px-5 py-4 font-space text-[0.9375rem]"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)', color: '#fecaca' }}>
          <ul className="list-disc space-y-1 pl-5">{errors.map((x) => <li key={x}>{x}</li>)}</ul>
          {fallback && (
            <WaCta variant="secondary" label="Écrire à COM'9 sur WhatsApp"
              message={m && option ? buildQuoteMessage(repair, model, option, zoneObj) : "Bonjour, je souhaite prendre rendez-vous avec COM'9."} />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button type="submit" disabled={busy}
          className="flex w-full items-center justify-center rounded-2xl px-5 font-space text-[1rem] font-semibold transition-transform duration-200 active:scale-[0.985] disabled:opacity-60"
          style={{
            minHeight: '56px',
            background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
            color: '#06131f',
            boxShadow: '0 14px 40px -18px rgba(26,169,255,0.75)',
          }}>
          {busy ? 'Envoi…' : 'Envoyer ma demande'}
        </button>
        <p className="text-center font-space text-[0.8125rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
          Ce n&apos;est pas encore un rendez-vous confirmé. Aucun paiement ni acompte n&apos;est demandé.
        </p>
      </div>
    </form>
  )
}
