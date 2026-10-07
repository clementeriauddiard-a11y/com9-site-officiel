'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Parcours de réservation (une seule page, étape par étape)
//
//   1. Smartphone : marque → famille / recherche → modèle (catalogue multimarque)
//   2. Réparation : écran, batterie, vitre arrière (prix ou « Sur devis ») ou
//      « Autre problème » (symptôme)
//   3. Tarif (qualité et prix, demande de tarif, ou pré-diagnostic)
//   4. Adresse → frais de déplacement calculés
//   5. Créneau libre
//   6. Coordonnées → envoi de la DEMANDE
//
//  Le total est visible en permanence. Le serveur recalcule tout (prix,
//  distance, disponibilité) : rien de ce qui est affiché ici ne fait foi seul.
//  Une demande n'est jamais un rendez-vous confirmé. Aucun paiement en ligne.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DELAI_COMMANDE_JOURS, DIAGNOSTIC, DISTANCE_MAX_KM, SYMPTOME_PRESTATION } from '@/config/com9'
import { REPAIRS, findZone, type GridRepairId, type ZoneId } from '@/data/tarifs'
import { SERVICES, findBrand, findCatalogModel, modelPriceFrom, serviceOf } from '@/data/catalogue'
import { findCommune } from '@/lib/communes'
import { euros } from '@/lib/money'
import { phoneDigits } from '@/lib/agenda/logic'
import { REQUEST_RECEIVED_MESSAGE, SYMPTOMS, SYMPTOM_LABEL, type Symptom } from '@/lib/agenda/types'
import { Btn, Choice, ErrorBox, Field, Line, Notice, inputCls, inputStyle } from '@/components/ui/kit'
import ContactActions from '@/components/ui/ContactActions'
import AddressSearch, { type AddressHit } from './AddressSearch'
import SlotPicker, { fmtHour, fmtLongDay, type DayAvailability } from './SlotPicker'
import DevicePicker, { deviceLabel, type Device } from './DevicePicker'

type Kind = 'reparation' | 'autre'
type StepId = 'modele' | 'reparation' | 'tarif' | 'adresse' | 'creneau' | 'coordonnees'
const ORDER: StepId[] = ['modele', 'reparation', 'tarif', 'adresse', 'creneau', 'coordonnees']

type Travel =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ok'; km: number; zone: ZoneId; feeCents: number | null; precise: boolean }
  | { state: 'out'; km: number }
  | { state: 'estimate'; zone: ZoneId; feeCents: number | null; commune: string }
  | { state: 'unknown'; message: string }

type Recap = {
  model: string
  repairLabel: string
  quality: string
  symptomLabel: string | null
  repairPriceCents: number | null
  zoneLabel: string | null
  travelFeeCents: number | null
  totalCents: number | null
  slot: string
  trackPath: string
  distanceKm: number | null
  zoneVerified: boolean
  quote?: boolean
}

const isGrid = (v: string | null): v is GridRepairId => REPAIRS.some((r) => r.id === v)
const isSymptom = (v: string | null): v is Symptom => (SYMPTOMS as readonly string[]).includes(v ?? '')
const km = (n: number) => `${String(n).replace('.', ',')} km`

// ─── Étape (carte repliable) ─────────────────────────────────────────────────

function Step({ n, id, title, state, summary, onEdit, onBack, children }: {
  n: number
  id: StepId
  title: string
  state: 'active' | 'done' | 'locked'
  summary?: React.ReactNode
  onEdit?: () => void
  /** Étape précédente (bouton « Retour » quand l'étape est ouverte) */
  onBack?: () => void
  children?: React.ReactNode
}) {
  return (
    <section id={`etape-${id}`} aria-labelledby={`t-${id}`} data-step={id} data-state={state}
      className="scroll-mt-24 rounded-[24px] transition-colors duration-300"
      style={{
        background: state === 'active' ? 'var(--c9-surface)' : 'transparent',
        border: `1px solid ${state === 'active' ? 'var(--c9-hairline)' : 'var(--c9-hairline-soft)'}`,
        padding: state === 'active' ? 'clamp(1.25rem, 4vw, 2rem)' : '1rem 1.25rem',
        opacity: state === 'locked' ? 0.55 : 1,
      }}>
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums"
          style={state === 'done'
            ? { background: 'var(--c9-accent)', color: 'var(--c9-accent-ink)' }
            : { border: `1px solid ${state === 'active' ? 'var(--c9-accent)' : 'var(--c9-hairline-lit)'}`, color: state === 'active' ? 'var(--c9-accent-text)' : 'var(--c9-text-3)' }}>
          {state === 'done' ? '✓' : n}
        </span>
        <h2 id={`t-${id}`} className="min-w-0 flex-1 text-[1.125rem] font-semibold tracking-[-0.02em]">{title}</h2>
        {state === 'done' && onEdit && (
          <button type="button" onClick={onEdit} className="shrink-0 rounded-lg px-2 text-[0.9375rem] font-medium underline underline-offset-4"
            style={{ color: 'var(--c9-text-2)', minHeight: 44 }} aria-label={`Modifier : ${title}`}>
            Modifier
          </button>
        )}
        {state === 'active' && onBack && (
          <button type="button" onClick={onBack} className="shrink-0 rounded-lg px-2 text-[0.9375rem] font-medium"
            style={{ color: 'var(--c9-text-2)', minHeight: 44 }} aria-label="Retour à l’étape précédente" data-back>
            <span aria-hidden="true">←</span> Retour
          </button>
        )}
      </div>
      {state === 'done' && summary && (
        <div className="mt-1 pl-10 text-[0.9375rem] leading-snug" style={{ color: 'var(--c9-text-2)' }}>{summary}</div>
      )}
      {state === 'active' && <div className="mt-6 flex flex-col gap-6">{children}</div>}
    </section>
  )
}

// ─── Parcours ────────────────────────────────────────────────────────────────

export default function BookingFlow({ distanceEnabled = false }: { distanceEnabled?: boolean }) {
  const params = useSearchParams()
  const startedAt = useRef(Date.now())

  // Pré-remplissage depuis l'accueil (paramètres vérifiés)
  const pKind: Kind = params.get('parcours') === 'autre' ? 'autre' : 'reparation'
  const pRepair = params.get('reparation') ?? params.get('repair')
  const pSymptom = params.get('symptome')
  const pModel = params.get('model') ?? params.get('modele')

  const [kind, setKind] = useState<Kind>(pKind)
  const [repair, setRepair] = useState<GridRepairId | null>(isGrid(pRepair) ? pRepair : null)
  const [symptom, setSymptom] = useState<Symptom | null>(isSymptom(pSymptom) ? pSymptom : null)
  const [device, setDevice] = useState<Device | null>(() => {
    const m = findCatalogModel(pModel)
    return m ? { kind: 'catalogue', brand: m.brand, model: m } : null
  })
  const [quality, setQuality] = useState<string | null>(null)
  const [quoteSeen, setQuoteSeen] = useState(false)
  const [description, setDescription] = useState('')
  const [tarifSeen, setTarifSeen] = useState(false)

  const [address, setAddress] = useState<AddressHit | null>(null)
  const [access, setAccess] = useState('')
  const [travel, setTravel] = useState<Travel>({ state: 'idle' })

  const [days, setDays] = useState<DayAvailability[] | null>(null)
  const [daysLoading, setDaysLoading] = useState(false)
  const [daysError, setDaysError] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // piège à robots, invisible

  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<{ message: string; list?: string[] } | null>(null)
  const [fallback, setFallback] = useState(false)
  const [done, setDone] = useState<Recap | null>(null)

  // ─── Valeurs dérivées ───
  const serviceRepair = kind === 'autre' ? 'diagnostic' : repair
  const knownRepair: GridRepairId | null = kind === 'autre' && symptom ? SYMPTOME_PRESTATION[symptom] ?? null : null
  const catModel = device?.kind === 'catalogue' ? device.model : undefined
  const brand = findBrand(device?.brand)
  /** Statut de la prestation pour ce modèle : prix validé, sur devis ou non proposé (catalogue) */
  const service = repair ? serviceOf(catModel, repair) : null
  const isQuote = kind === 'reparation' && service?.status === 'quote'
  const options = useMemo(() => (service?.status === 'price' ? service.options : []), [service])
  const option = options.find((o) => o.label === quality) ?? null
  const modelLabel = deviceLabel(device)
  const requestKind = kind === 'autre' ? 'autre' : isQuote ? 'devis' : 'reparation'

  // Une prestation non proposée sur le modèle choisi est désélectionnée.
  useEffect(() => { if (service?.status === 'unavailable') setRepair(null) }, [service])
  useEffect(() => { setQuoteSeen(false) }, [device, repair])

  useEffect(() => {
    // Qualité : conservée si elle existe pour ce modèle, sinon choix unique automatique.
    if (!options.length) { if (quality) setQuality(null); return }
    if (!options.some((o) => o.label === quality)) setQuality(options.length === 1 ? options[0].label : null)
  }, [options, quality])

  const repairCents = kind === 'reparation' ? option?.priceCents ?? null : null
  const travelCents = travel.state === 'ok' || travel.state === 'estimate' ? travel.feeCents : null
  const totalCents = repairCents !== null && travelCents !== null ? repairCents + travelCents : null

  const doneMap: Record<StepId, boolean> = {
    modele: device !== null && modelLabel.length >= 2,
    reparation: kind === 'reparation' ? repair !== null && service?.status !== 'unavailable' : symptom !== null,
    tarif: kind === 'autre' ? tarifSeen && (symptom !== 'autre' || description.trim().length >= 5)
      : isQuote ? quoteSeen : option !== null,
    adresse: address !== null && ['ok', 'estimate', 'unknown'].includes(travel.state),
    creneau: slot !== null,
    coordonnees: false,
  }
  const firstOpen = ORDER.find((s) => !doneMap[s]) ?? 'coordonnees'
  const [active, setActive] = useState<StepId>(firstOpen)
  const go = useCallback((s: StepId) => {
    setActive(s)
    setTimeout(() => document.getElementById(`etape-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [])
  const prev = (s: StepId) => () => go(ORDER[Math.max(0, ORDER.indexOf(s) - 1)])
  /** Après le choix du téléphone : prestation déjà choisie (lien de l'accueil) et proposée → tarif, sinon réparation. */
  const advanceFrom = (_s: 'modele', d: Device) => {
    const m = d.kind === 'catalogue' ? d.model : undefined
    if (kind === 'reparation' && repair && serviceOf(m, repair).status !== 'unavailable') go('tarif')
    else if (kind === 'autre' && symptom) go('tarif')
    else go('reparation')
  }
  const advance = (from: StepId) => {
    const next = ORDER.slice(ORDER.indexOf(from) + 1).find((s) => !doneMap[s]) ?? ORDER[ORDER.indexOf(from) + 1]
    if (next) go(next)
  }
  const stateOf = (s: StepId): 'active' | 'done' | 'locked' => {
    if (s === active) return 'active'
    if (doneMap[s]) return 'done'
    return ORDER.indexOf(s) < ORDER.indexOf(firstOpen) ? 'done' : 'locked'
  }

  // ─── Distance par la route ───
  async function measure(hit: AddressHit) {
    setTravel({ state: 'loading' })
    const fallbackZone = () => {
      const c = hit.citycode ? findCommune(hit.citycode) : null
      if (c) setTravel({ state: 'estimate', zone: c.zone, feeCents: findZone(c.zone)?.feeCents ?? null, commune: c.nom })
      else setTravel({ state: 'unknown', message: 'COM’9 vous confirmera les frais de déplacement avec votre adresse.' })
    }
    if (!distanceEnabled) { fallbackZone(); return }
    try {
      const res = await fetch('/api/distance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: hit.label }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok && typeof d.km === 'number') {
        if (d.outOfArea) setTravel({ state: 'out', km: d.km })
        else setTravel({ state: 'ok', km: d.km, zone: d.zone, feeCents: d.feeCents ?? null, precise: Boolean(d.precise) })
        return
      }
      fallbackZone()
    } catch {
      fallbackZone()
    }
  }

  // ─── Créneaux libres ───
  const loadSlots = useCallback(async () => {
    if (!serviceRepair) return
    setDaysLoading(true)
    setDaysError(null)
    try {
      const res = await fetch(`/api/creneaux?repair=${serviceRepair}`, { cache: 'no-store' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Créneaux indisponibles.')
      setDays(d.days ?? [])
    } catch (e) {
      setDaysError(e instanceof Error ? e.message : 'Créneaux indisponibles.')
    } finally {
      setDaysLoading(false)
    }
  }, [serviceRepair])

  useEffect(() => { if (active === 'creneau') loadSlots() }, [active, loadSlots])
  // La durée dépend de la prestation : un créneau choisi pour une autre ne vaut plus.
  useEffect(() => { setSlot(null); setDays(null) }, [serviceRepair])

  // ─── Envoi ───
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrors(null)
    setFallback(false)
    const local: string[] = []
    if (name.trim().length < 2) local.push('Indiquez votre nom.')
    if (!phoneDigits(phone)) local.push('Indiquez un numéro de téléphone valide.')
    if (!slot) local.push('Choisissez un créneau.')
    if (local.length) { setErrors({ message: 'Il manque quelques informations.', list: local }); return }

    const desc = [description.trim(), access.trim() ? `Accès : ${access.trim()}` : ''].filter(Boolean).join('\n')
    setBusy(true)
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: requestKind,
          repair: kind === 'reparation' ? repair : 'diagnostic',
          model: modelLabel,
          reference: device?.kind === 'manual' ? device.reference : '',
          quality: requestKind === 'reparation' ? quality : '',
          symptom: kind === 'autre' ? symptom : null,
          description: desc,
          address: address?.label ?? '',
          citycode: address?.citycode ?? '',
          startAt: slot,
          clientName: name,
          clientPhone: phone,
          email,
          website,
          elapsedMs: Date.now() - startedAt.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        if (data.recap) setDone(data.recap)
        else setDone({} as Recap)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (res.status === 409) {
        setSlot(null)
        await loadSlots()
        go('creneau')
        setDaysError(null)
        setErrors({ message: data.error ?? 'Ce créneau vient d’être pris. Choisissez-en un autre.' })
        return
      }
      if (res.status === 429 || res.status >= 500) setFallback(true)
      setErrors({ message: data.error ?? "La demande n'a pas pu être envoyée.", list: Array.isArray(data.errors) ? data.errors : undefined })
    } catch {
      setFallback(true)
      setErrors({ message: "La demande n'a pas pu être envoyée. Vérifiez votre connexion." })
    } finally {
      setBusy(false)
    }
  }

  // ─── Demande envoyée ───
  if (done) return <Done recap={done} />

  // ─── Récapitulatif (colonne / barre) ───
  const recapLines = (
    <div className="flex flex-col gap-3">
      <Line label={kind === 'autre' ? 'Diagnostic à domicile' : option ? `${REPAIRS.find((r) => r.id === repair)?.label} · ${option.label}` : isQuote ? REPAIRS.find((r) => r.id === repair)?.label ?? 'Réparation' : 'Réparation'}
        value={kind === 'autre' ? 'Prix sur place' : isQuote ? 'Sur devis' : repairCents !== null ? euros(repairCents) : '—'} muted={repairCents === null && !isQuote} />
      <Line label="Déplacement" muted={travelCents === null}
        value={travelCents !== null ? euros(travelCents) : travel.state === 'unknown' ? 'À confirmer' : '—'} />
      <div className="c9-divider" />
      <Line label="Total" strong value={totalCents !== null ? euros(totalCents) : isQuote ? 'Sur devis' : kind === 'autre' && travelCents !== null ? 'Après diagnostic' : '—'} />
    </div>
  )

  const title = kind === 'autre' ? 'Votre problème' : 'Votre réparation'

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-3">
        {/* 1 — Smartphone : marque → famille / recherche → modèle */}
        <Step n={1} id="modele" title="Votre smartphone" state={stateOf('modele')} onEdit={() => go('modele')} summary={modelLabel}>
          <DevicePicker value={device}
            onChange={(d) => { setDevice(d); setQuality(null); setTimeout(() => advanceFrom('modele', d), 0) }} />
        </Step>

        {/* 2 — Réparation : prestation (prix / sur devis) ou autre problème */}
        <Step n={2} id="reparation" title={kind === 'autre' ? 'Votre problème' : 'Votre réparation'} state={stateOf('reparation')}
          onEdit={() => go('reparation')} onBack={prev('reparation')}
          summary={kind === 'autre' ? (symptom ? SYMPTOM_LABEL[symptom] : 'Autre problème') : REPAIRS.find((r) => r.id === repair)?.label}>
          <Choice name="Réparation" columns={2} minWidth="9rem" size="lg" value={kind === 'autre' ? 'autre' : repair}
            onChange={(v) => {
              if (v === 'autre') { setKind('autre'); setTarifSeen(false); return }
              setKind('reparation'); setRepair(v); setTimeout(() => go('tarif'), 0)
            }}
            options={[
              ...SERVICES.filter((sv) => serviceOf(catModel, sv.id).status !== 'unavailable').map((sv) => {
                const from = catModel ? modelPriceFrom(catModel, sv.id) : null
                return {
                  id: sv.id as GridRepairId | 'autre',
                  label: sv.label,
                  sub: from !== null ? `dès ${euros(from)}` : 'Sur devis',
                }
              }),
              { id: 'autre' as const, label: 'Autre problème', sub: 'Pré-diagnostic gratuit' },
            ]} />
          {kind === 'autre' && (
            <div className="flex flex-col gap-3">
              <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--c9-text-2)' }}>Que se passe-t-il ?</p>
              <Choice name="Problème rencontré" columns={2} value={symptom}
                onChange={(sy) => { setSymptom(sy); setTarifSeen(false); setTimeout(() => go('tarif'), 0) }}
                options={SYMPTOMS.map((sy) => ({ id: sy, label: SYMPTOM_LABEL[sy] }))} />
            </div>
          )}
        </Step>

        {/* 3 — Tarif / demande de tarif / pré-diagnostic */}
        <Step n={3} id="tarif" title={kind === 'autre' ? 'Pré-diagnostic' : isQuote ? 'Votre tarif' : 'Votre tarif'} state={stateOf('tarif')}
          onEdit={() => go('tarif')} onBack={prev('tarif')}
          summary={kind === 'autre' ? 'Diagnostic à domicile' : isQuote ? 'Sur devis' : option ? `${option.label} · ${euros(option.priceCents)}` : ''}>
          {kind === 'reparation' && !isQuote ? (
            <>
              {brand?.partsNote && (
                <p className="-mb-2 text-[0.8125rem] font-medium" style={{ color: 'var(--c9-accent-text)' }}>{brand.partsNote}</p>
              )}
              <Choice name="Qualité de la pièce" columns={options.length > 1 ? 2 : 1} minWidth="16rem" value={quality} size="lg"
                onChange={(q) => { setQuality(q); advance('tarif') }}
                options={options.map((o) => ({
                  id: o.label,
                  label: <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">{o.label}{o.recommended && <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--c9-accent-text)' }}>Recommandé</span>}</span>,
                  sub: o.note,
                  aside: <span className="text-[1.25rem] font-semibold tabular-nums">{euros(o.priceCents)}</span>,
                }))} />
              <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
                Pièce et main-d&apos;œuvre comprises. Les frais de déplacement s&apos;ajoutent selon votre adresse.
              </p>
              {option && <Btn variant="primary" size="lg" onClick={() => advance('tarif')}>Continuer</Btn>}
            </>
          ) : isQuote ? (
            <>
              <div className="flex flex-col gap-2 rounded-2xl p-5" data-quote style={{ border: '1px solid var(--c9-accent-line)', background: 'var(--c9-accent-soft)' }}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold">{REPAIRS.find((r) => r.id === repair)?.label} · {modelLabel}</span>
                  <span className="shrink-0 text-[1.25rem] font-semibold">Sur devis</span>
                </div>
                <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                  Le prix de cette réparation n&apos;est pas encore affiché en ligne pour ce modèle. COM&apos;9 vous communique
                  votre tarif avant toute intervention. Les frais de déplacement s&apos;ajoutent selon votre adresse.
                </p>
                {brand?.partsNote && <p className="text-[0.8125rem] font-medium" style={{ color: 'var(--c9-accent-text)' }}>{brand.partsNote}</p>}
              </div>
              <Field label="Description du problème" htmlFor="b-quote-desc" optional
                hint="Ce qui est cassé, depuis quand… Une photo pourra être envoyée à COM’9 sur WhatsApp.">
                <textarea id="b-quote-desc" rows={3} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: 100 }} maxLength={1000}
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Btn variant="primary" size="lg" onClick={() => { setQuoteSeen(true); setTimeout(() => advance('tarif'), 0) }}>
                Demander mon tarif
              </Btn>
            </>
          ) : (
            <>
              {knownRepair ? (
                <Notice tone="accent" title="Cette panne a un prix connu.">
                  <button type="button" className="c9-link" onClick={() => { setKind('reparation'); setRepair(knownRepair); go('tarif') }}>
                    Voir le tarif {REPAIRS.find((r) => r.id === knownRepair)?.label.toLowerCase()}
                  </button>
                </Notice>
              ) : (
                <Notice tone="accent" title="Diagnostic à domicile">
                  Pour « {symptom ? SYMPTOM_LABEL[symptom].toLowerCase() : 'ce problème'} », le prix dépend de la panne : COM&apos;9 la
                  diagnostique chez vous et vous annonce le prix avant de réparer.
                </Notice>
              )}
              <div className="flex flex-col gap-3 rounded-2xl p-4" style={{ border: '1px solid var(--c9-hairline)' }}>
                <p className="flex gap-3 leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--c9-ok)' }} />
                  <span><b style={{ color: 'var(--c9-text)' }}>Vous acceptez la réparation :</b> vous payez uniquement la réparation et le déplacement.</span>
                </p>
                <p className="flex gap-3 leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--c9-text-3)' }} />
                  <span><b style={{ color: 'var(--c9-text)' }}>Vous refusez après le diagnostic :</b> vous payez le déplacement + {euros(DIAGNOSTIC.refusCents)} de diagnostic.</span>
                </p>
              </div>
              <Field label="Décrivez le problème" htmlFor="b-desc" optional={symptom !== 'autre'}
                hint="Depuis quand, ce qui s'est passé (chute, eau…), ce que fait le téléphone.">
                <textarea id="b-desc" rows={4} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: 120 }} maxLength={1000}
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Btn variant="primary" size="lg" disabled={symptom === 'autre' && description.trim().length < 5}
                onClick={() => { setTarifSeen(true); setTimeout(() => advance('tarif'), 0) }}>
                Continuer
              </Btn>
            </>
          )}
        </Step>

        {/* 4 — Adresse et déplacement */}
        <Step n={4} id="adresse" title="Votre adresse" state={stateOf('adresse')} onEdit={() => go('adresse')} onBack={prev('adresse')}
          summary={address ? <>{address.label}<br />{travelSummary(travel)}</> : ''}>
          <Field label="Adresse de l'intervention" htmlFor="b-address"
            hint={distanceEnabled ? 'Les frais de déplacement sont calculés par la route depuis Nogent-le-Rotrou (Google Maps).' : undefined}>
            <AddressSearch id="b-address" value={address}
              onSelect={(h) => { setAddress(h); measure(h) }}
              onClear={() => { setAddress(null); setTravel({ state: 'idle' }) }} />
          </Field>
          {address && <TravelResult travel={travel} />}
          {address && (travel.state === 'ok' || travel.state === 'estimate' || travel.state === 'unknown') && (
            <>
              <Field label="Accès" htmlFor="b-access" optional hint="Bâtiment, étage, code, interphone…">
                <input id="b-access" className={inputCls} style={inputStyle} value={access} maxLength={150}
                  onChange={(e) => setAccess(e.target.value)} />
              </Field>
              <Btn variant="primary" size="lg" onClick={() => advance('adresse')}>Choisir un créneau</Btn>
            </>
          )}
          <p className="text-[0.8125rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
            Votre adresse est envoyée au service d&apos;adresses de l&apos;État pour les propositions
            {distanceEnabled ? ' et à Google Maps pour le calcul du trajet' : ''}. Elle n&apos;est jamais publiée.
          </p>
        </Step>

        {/* 5 — Créneau */}
        <Step n={5} id="creneau" title="Votre créneau" state={stateOf('creneau')} onEdit={() => go('creneau')} onBack={prev('creneau')}
          summary={slot ? `${fmtLongDay(slotDay(slot))} à ${fmtHour(slot)}` : ''}>
          <SlotPicker days={days} loading={daysLoading} error={daysError} value={slot}
            onChange={(iso) => { setSlot(iso); setErrors(null) }} />
          {errors && active === 'creneau' && <ErrorBox message={errors.message} />}
          <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
            C&apos;est une demande : COM&apos;9 confirme le créneau ou vous en propose un autre. Si la pièce doit être commandée
            {` (délai estimé de ${DELAI_COMMANDE_JOURS} jours)`}, COM&apos;9 vous propose un nouveau rendez-vous. Aucun acompte.
          </p>
          {slot && <Btn variant="primary" size="lg" onClick={() => advance('creneau')}>Continuer</Btn>}
        </Step>

        {/* 6 — Coordonnées et envoi */}
        <Step n={6} id="coordonnees" title="Vos coordonnées" state={stateOf('coordonnees')} onBack={prev('coordonnees')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" htmlFor="b-name">
              <input id="b-name" className={inputCls} style={inputStyle} autoComplete="name" maxLength={80}
                value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Téléphone" htmlFor="b-phone" hint="Pour vous joindre si besoin. Pas d'appel systématique avant le rendez-vous.">
              <input id="b-phone" className={inputCls} style={inputStyle} inputMode="tel" autoComplete="tel" maxLength={30}
                placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>
          <Field label="E-mail" htmlFor="b-email" optional>
            <input id="b-email" type="email" className={inputCls} style={inputStyle} autoComplete="email" maxLength={200}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {/* Piège à robots : invisible pour les personnes */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Site web<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl p-5 lg:hidden" style={{ border: '1px solid var(--c9-hairline)' }}>{recapLines}</div>

          {errors && active !== 'creneau' && <ErrorBox message={errors.message} errors={errors.list} />}
          {fallback && (
            <div className="flex flex-col gap-3">
              <p style={{ color: 'var(--c9-text-2)' }}>Vous pouvez aussi joindre COM&apos;9 directement :</p>
              <ContactActions compact message={`Bonjour COM'9, je souhaite une intervention pour ${modelLabel || 'mon smartphone'}.`} />
            </div>
          )}

          <Btn variant="primary" size="lg" type="submit" disabled={busy}>
            {busy ? 'Envoi…' : isQuote ? 'Recevoir mon tarif' : 'Envoyer ma demande'}
          </Btn>
          <p className="text-center text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
            Ce n&apos;est pas encore un rendez-vous confirmé. Aucun paiement ni acompte en ligne : vous payez après l&apos;intervention.
          </p>
        </Step>
      </form>

      {/* Récapitulatif — ordinateur */}
      <aside className="sticky top-24 hidden flex-col gap-5 rounded-[24px] p-6 lg:flex" style={{ background: 'var(--c9-surface)', border: '1px solid var(--c9-hairline)' }}
        aria-label="Récapitulatif">
        <p className="text-[1rem] font-semibold">Récapitulatif</p>
        <div className="flex flex-col gap-1 text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
          {modelLabel && <p>{modelLabel}</p>}
          {kind === 'autre' && symptom && <p>{SYMPTOM_LABEL[symptom]}</p>}
          {slot && <p>{fmtLongDay(slotDay(slot))} à {fmtHour(slot)}</p>}
        </div>
        {recapLines}
        <p className="text-[0.8125rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
          Paiement après l&apos;intervention : carte bancaire, espèces ou virement.
        </p>
      </aside>

      {/* Barre du bas — téléphone */}
      {active !== 'coordonnees' && (repairCents !== null || isQuote || (kind === 'autre' && symptom)) && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden" data-mobile-total
          style={{ background: 'var(--c9-header)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--c9-hairline)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
                {totalCents !== null ? 'Total' : kind === 'autre' ? 'Diagnostic à domicile' : isQuote ? 'Réparation' : repairCents !== null ? 'Réparation' : 'Votre tarif'}
              </p>
              <p className="truncate text-[1.25rem] font-semibold tabular-nums tracking-[-0.02em]">
                {totalCents !== null ? euros(totalCents) : isQuote ? 'Sur devis' : repairCents !== null ? `${euros(repairCents)} + dépl.` : kind === 'autre' ? 'Prix sur place' : '—'}
              </p>
            </div>
            <p className="shrink-0 text-right text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
              Étape {ORDER.indexOf(active) + 1} / {ORDER.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Morceaux ────────────────────────────────────────────────────────────────

const slotDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(iso))

function travelSummary(t: Travel): string {
  if (t.state === 'ok') return `${km(t.km)} par la route · déplacement ${t.feeCents !== null ? euros(t.feeCents) : 'à confirmer'}`
  if (t.state === 'estimate') return `Déplacement ${t.feeCents !== null ? euros(t.feeCents) : 'à confirmer'} (estimation)`
  if (t.state === 'unknown') return 'Déplacement à confirmer par COM’9'
  return ''
}

function TravelResult({ travel }: { travel: Travel }) {
  if (travel.state === 'loading') return <p style={{ color: 'var(--c9-text-3)' }} aria-live="polite">Calcul du trajet…</p>
  if (travel.state === 'ok') {
    const zone = findZone(travel.zone)
    return (
      <div aria-live="polite" data-travel-result>
        <Notice tone={travel.precise ? 'ok' : 'warn'}
          title={<>{km(travel.km)} par la route · déplacement {travel.feeCents !== null ? euros(travel.feeCents) : 'à confirmer'}</>}>
          {zone?.full}{travel.precise ? '.' : ' — adresse reconnue approximativement : COM’9 confirmera le déplacement.'}
        </Notice>
      </div>
    )
  }
  if (travel.state === 'estimate') {
    return (
      <div aria-live="polite" data-travel-result>
        <Notice tone="warn" title={<>Déplacement estimé : {travel.feeCents !== null ? euros(travel.feeCents) : 'à confirmer'}</>}>
          D&apos;après votre commune ({travel.commune}). Le calcul exact n&apos;est pas disponible pour le moment : COM&apos;9 le confirmera.
        </Notice>
      </div>
    )
  }
  if (travel.state === 'unknown') {
    return <div aria-live="polite" data-travel-result><Notice tone="warn" title="Déplacement à confirmer">{travel.message}</Notice></div>
  }
  if (travel.state === 'out') {
    return (
      <div aria-live="polite" className="flex flex-col gap-3" data-travel-result>
        <Notice tone="warn" title={`Votre adresse est à ${km(travel.km)} par la route.`}>
          {`COM’9 intervient jusqu’à ${DISTANCE_MAX_KM} km de Nogent-le-Rotrou.`} Nous ne pouvons pas nous déplacer à cette adresse.
        </Notice>
        <ContactActions compact message="Bonjour COM'9, j'habite à plus de 30 km. Une solution est-elle possible ?" />
      </div>
    )
  }
  return null
}

function Done({ recap }: { recap: Recap }) {
  const has = recap && recap.trackPath
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6" role="status" aria-live="polite" data-done>
      <div className="c9-surface-accent flex flex-col gap-3 rounded-[24px] p-6 sm:p-8">
        <span className="section-label">Demande envoyée</span>
        <p className="text-[1.375rem] font-semibold leading-snug tracking-[-0.02em]">{REQUEST_RECEIVED_MESSAGE}</p>
        <p style={{ color: 'var(--c9-text-2)' }}>
          Ce n&apos;est pas encore un rendez-vous confirmé. Aucun paiement ni acompte : vous payez après l&apos;intervention.
        </p>
      </div>

      {has && (
        <div className="c9-surface flex flex-col gap-4 rounded-[24px] p-6 sm:p-7">
          <p className="text-[1.0625rem] font-semibold">{recap.model} · {recap.repairLabel}</p>
          {recap.quality && <p className="-mt-3" style={{ color: 'var(--c9-text-2)' }}>{recap.quality}</p>}
          {recap.symptomLabel && <p className="-mt-3" style={{ color: 'var(--c9-text-2)' }}>{recap.symptomLabel}</p>}
          <p style={{ color: 'var(--c9-text-2)' }}>Créneau demandé : <b style={{ color: 'var(--c9-text)' }}>{recap.slot}</b></p>
          <div className="c9-divider" />
          <Line label="Réparation" value={recap.repairPriceCents !== null ? euros(recap.repairPriceCents) : recap.quote ? 'Sur devis' : 'Prix sur place'} />
          <Line label="Déplacement" value={recap.travelFeeCents !== null ? euros(recap.travelFeeCents) : 'À confirmer'} />
          {recap.zoneLabel && (
            <p className="-mt-2 text-right text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
              {typeof recap.distanceKm === 'number' ? `${km(recap.distanceKm)} par la route · ` : ''}{recap.zoneLabel}
              {recap.zoneVerified ? '' : ' · confirmé par COM’9 avec votre adresse'}
            </p>
          )}
          <div className="c9-divider" />
          <Line label="Total" strong value={recap.totalCents !== null ? euros(recap.totalCents) : recap.quote ? 'Sur devis' : recap.repairPriceCents === null ? 'Après diagnostic' : 'À confirmer'} />
          {recap.quote && (
            <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
              COM&apos;9 vous communique votre tarif avant toute intervention.
            </p>
          )}
        </div>
      )}

      {has && (
        <div className="c9-surface flex flex-col gap-3 rounded-[24px] p-6 sm:p-7">
          <p className="text-[1.0625rem] font-semibold">Suivre votre demande</p>
          <p className="leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
            Ce lien personnel vous permet de voir où en est votre demande et de répondre à COM&apos;9.
            Gardez-le (ajoutez la page à vos favoris) et ne le partagez pas.
          </p>
          <Link href={recap.trackPath} className="c9-btn c9-btn-secondary w-full">Ouvrir mon suivi</Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p style={{ color: 'var(--c9-text-2)' }}>Une question ?</p>
        <ContactActions compact />
      </div>
      <Link href="/" className="self-start text-[0.9375rem] font-medium underline underline-offset-4" style={{ color: 'var(--c9-text-2)' }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
