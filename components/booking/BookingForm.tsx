'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Demande de rendez-vous (formulaire public)
//
//  Le client envoie une DEMANDE. Rien n'est réservé : COM'9 confirme le
//  créneau ou propose une autre disponibilité. Aucun paiement, aucun acompte.
//  Le prix affiché vient de la grille ; le serveur le recalcule de son côté.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  PRICE_NOTE,
  REPAIRS,
  SERIES,
  TRAVEL_RULE,
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
import CommuneSearch, { NOT_LISTED, type CommuneValue } from './CommuneSearch'
import { findCommune } from '@/lib/communes'
import { LINKS, PHONE } from '@/lib/links'
import { Choice, Label, Line, Step, inputCls, inputStyle } from './ui'

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
  trackPath?: string
  communeNom?: string
  distanceKm?: number | null
  zoneVerified?: boolean
}

/** Résultat du calcul Google Maps pour une adresse donnée. */
type Dist = { km: number; zone: ZoneId; precise: boolean; forAddress: string }

const isRepair = (v: string | null): v is RepairId => REPAIRS.some((r) => r.id === v)
const fmtKm = (km: number) => `${String(km).replace('.', ',')} km`
/** L'adresse contient-elle un code postal ? (calcul lancé automatiquement) */
const looksComplete = (a: string) => /\b\d{5}\b/.test(a) && a.trim().length >= 10

// ─── Formulaire ──────────────────────────────────────────────────────────────

/**
 * `distanceEnabled` : le serveur a une clé Google Maps. Le client saisit son
 * adresse complète et le déplacement est calculé par la route. Sinon, ou si le
 * calcul échoue, le client choisit sa commune dans la liste COM'9.
 */
export default function BookingForm({ distanceEnabled = false }: { distanceEnabled?: boolean }) {
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
  // Zone : distance par la route (Google Maps) si activée, sinon commune de la
  // liste COM'9. Jamais saisie à la main par le client.
  const pCommune = params.get('commune')
  const [commune, setCommune] = useState<CommuneValue>(pCommune && findCommune(pCommune) ? pCommune : null)
  const [address, setAddress] = useState('')
  const [dist, setDist] = useState<Dist | null>(null)
  const [distBusy, setDistBusy] = useState(false)
  const [distError, setDistError] = useState('')
  const [useList, setUseList] = useState(!distanceEnabled) // liste des communes affichée
  const distOk = dist && dist.forAddress === address.trim() ? dist : null
  const communeObj = useList && commune && commune !== NOT_LISTED ? findCommune(commune) : null
  const zone: ZoneId | 'inconnue' | null =
    distOk ? distOk.zone : communeObj ? communeObj.zone : useList && commune === NOT_LISTED ? 'inconnue' : null

  const [date, setDate] = useState('')
  const [period, setPeriod] = useState<PreferredPeriod | 'indifferent' | null>(null)
  const [availability, setAvailability] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
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
  const pendingLabel = useList ? 'Selon votre commune' : 'Selon votre adresse'

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
      commune: useList ? commune ?? '' : '',
      description,
      preferredDate: date,
      preferredPeriod: period && period !== 'indifferent' ? period : null,
      availabilityNote: availability,
    }
  }

  /** Calcul par la route (Google Maps, côté serveur). En cas d'échec : liste des communes. */
  async function computeDistance(): Promise<Dist | null> {
    const a = address.trim()
    if (distOk) return distOk
    if (a.length < 5) { setDistError("Indiquez l'adresse complète : n°, rue, code postal et ville."); return null }
    setDistBusy(true)
    setDistError('')
    try {
      const res = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: a }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && typeof data.km === 'number') {
        const d: Dist = { km: data.km, zone: data.zone, precise: Boolean(data.precise), forAddress: a }
        setDist(d)
        return d
      }
      setDist(null)
      setDistError(data.error ?? 'Calcul momentanément indisponible.')
      if (data.fallback !== false) setUseList(true)
      return null
    } catch {
      setDist(null)
      setDistError('Calcul momentanément indisponible.')
      setUseList(true)
      return null
    } finally {
      setDistBusy(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFallback(false)
    // Adresse pas encore calculée : on calcule avant d'envoyer.
    if (distanceEnabled && !useList && !distOk && address.trim().length >= 5) {
      const d = await computeDistance()
      if (!d) return
    }
    const body = payload()
    const local = parsePublicRequest(body, todayInParis())
    const extra: string[] = []
    if (useList && !distOk && commune === null) extra.push('Indiquez votre commune, ou « Ma commune n’est pas dans la liste ».')
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
                {typeof r.distanceKm === 'number'
                  ? `${fmtKm(r.distanceKm)} par la route · ${r.zoneLabel}` +
                    (r.zoneVerified ? ' · calculé avec Google Maps' : ' · confirmée par COM\u20199 avec votre adresse')
                  : `${r.communeNom ? `${r.communeNom} · ` : ''}${r.zoneLabel} · confirmée par COM\u20199 avec votre adresse`}
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

        {r?.trackPath && (
          <div className="c9-surface flex flex-col gap-3 rounded-[26px] p-6 sm:p-7">
            <p className="font-space text-[1rem] font-semibold" style={{ color: 'var(--c9-text)' }}>Suivre votre demande</p>
            <p className="font-space text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              Ce lien personnel vous permet de voir où en est votre demande et de répondre à COM&apos;9.
              Gardez-le (ajoutez la page à vos favoris) et ne le partagez pas.
            </p>
            <Link href={r.trackPath} className="flex items-center justify-center rounded-2xl px-5 font-space text-[0.9375rem] font-semibold"
              style={{ minHeight: '52px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c9-hairline-lit)', color: 'var(--c9-text)' }}>
              Ouvrir mon suivi
            </Link>
          </div>
        )}

        <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
          Une question ? Appelez COM&apos;9 au{' '}
          <a href={LINKS.phone} className="underline tabular-nums" style={{ color: 'var(--c9-text-2)' }}>{PHONE.display}</a>
          {' '}ou écrivez sur{' '}
          <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--c9-text-2)' }}>WhatsApp</a>.
        </p>

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
        hint={distanceEnabled && !useList
          ? "Le déplacement est calculé par la route depuis l'atelier COM'9 (place Saint-Pol, Nogent-le-Rotrou)."
          : "Indiquez votre commune : une zone de déplacement indicative s'affiche, estimée depuis l'atelier COM'9 (place Saint-Pol, Nogent-le-Rotrou). COM'9 la confirme avec votre adresse."}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-address">{distanceEnabled ? 'Adresse complète' : 'Adresse'}</Label>
          <input id="b-address" className={inputCls} style={inputStyle} autoComplete="street-address"
            placeholder={distanceEnabled ? 'N°, rue, code postal, ville' : 'N°, rue'} value={address} maxLength={200}
            onChange={(e) => { setAddress(e.target.value); setDistError('') }}
            onBlur={() => { if (distanceEnabled && !useList && !distOk && looksComplete(address)) void computeDistance() }} />
          {distanceEnabled && !useList && (
            <div className="flex flex-col gap-2">
              {!distOk && (
                <button type="button" onClick={() => void computeDistance()} disabled={distBusy}
                  className="self-start rounded-2xl px-4 font-space text-[0.9375rem] font-semibold disabled:opacity-60"
                  style={{ minHeight: '48px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c9-hairline-lit)', color: 'var(--c9-text)' }}>
                  {distBusy ? 'Calcul en cours…' : 'Calculer le déplacement'}
                </button>
              )}
              {distOk && zoneObj && (
                <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }} data-zone-result aria-live="polite">
                  <b style={{ color: 'var(--c9-text)' }}>{fmtKm(distOk.km)}</b> par la route depuis l&apos;atelier · {zoneObj.full} —{' '}
                  {zoneObj.fee === null ? 'déplacement sur devis' : `déplacement ${zoneObj.fee} €`}
                  {!distOk.precise && (
                    <span className="block" style={{ color: '#f5b94a' }}>
                      Adresse reconnue approximativement : COM&apos;9 confirmera la zone avec votre adresse exacte.
                    </span>
                  )}
                </p>
              )}
              {distError && (
                <p className="font-space text-[0.875rem]" style={{ color: '#f5b94a' }} role="alert">{distError}</p>
              )}
              <p className="font-space text-[0.75rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
                Pour calculer le trajet, votre adresse est envoyée à Google Maps.{' '}
                <button type="button" className="underline" onClick={() => { setUseList(true); setDist(null); setDistError('') }}>
                  Choisir plutôt ma commune dans la liste
                </button>
              </p>
            </div>
          )}
        </div>

        {useList && (
          <div className="flex flex-col gap-1.5">
            {distanceEnabled && distError && (
              <p className="font-space text-[0.875rem]" style={{ color: '#f5b94a' }} role="alert">
                {`${distError} Choisissez votre commune : COM\u20199 confirmera le déplacement avec votre adresse.`}
              </p>
            )}
            <Label htmlFor="b-commune">Commune</Label>
            <CommuneSearch id="b-commune" value={commune} onChange={(v) => setCommune(v)}
              inputClassName={inputCls} inputStyle={inputStyle} />
            {communeObj && zoneObj && (
              <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }} data-zone-result>
                Zone indicative : <b style={{ color: 'var(--c9-text)' }}>{zoneObj.full}</b> — {zoneObj.fee === null ? 'déplacement sur devis' : `déplacement ${zoneObj.fee} €`}
              </p>
            )}
            {commune === NOT_LISTED && (
              <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }} data-zone-result>
                COM&apos;9 vous indiquera le déplacement après avoir vu votre adresse.
              </p>
            )}
            {distanceEnabled && (
              <button type="button" className="self-start font-space text-[0.8125rem] underline" style={{ color: 'var(--c9-text-3)' }}
                onClick={() => { setUseList(false); setDistError('') }}>
                Calculer plutôt avec mon adresse
              </button>
            )}
          </div>
        )}

        {quote && (
          <div className="c9-surface flex flex-col gap-3 rounded-[22px] p-5" aria-live="polite">
            <Line label="Réparation" value={`${quote.repairPrice} €`} />
            <Line label="Déplacement" value={quote.onQuote ? 'Sur devis' : quote.travelFee === null ? (zone === 'inconnue' ? 'À confirmer' : pendingLabel) : `${quote.travelFee} €`} />
            <div className="c9-divider my-1" />
            {quote.total !== null
              ? <Line label="Total indicatif" value={`${quote.total} €`} strong />
              : <Line label="Total" value={quote.onQuote ? 'Sur devis' : zone === 'inconnue' ? 'À confirmer' : pendingLabel} />}
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
          {fallback && (
            <a href={LINKS.phone} className="text-center font-space text-[0.9375rem] underline tabular-nums" style={{ color: '#fecaca' }}>
              Ou appeler COM&apos;9 : {PHONE.display}
            </a>
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
