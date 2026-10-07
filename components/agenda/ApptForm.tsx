'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : formulaire de rendez-vous (création et modification)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { ALL_REPAIRS, MODELS, REPAIR_LABEL, SERIES, ZONES, isGridRepair, type RepairId, type ZoneId } from '@/data/tarifs'
import { DIAGNOSTIC } from '@/config/com9'
import { centsToInput, euros, parseEuros } from '@/lib/money'
import {
  apptTotal,
  gridPriceCents,
  qualitiesFor,
  validateInput,
  zoneFee,
  type ApptInput,
} from '@/lib/agenda/logic'
import { withinPublicHours } from '@/lib/agenda/slots'
import {
  ORDER_DELAY_NOTE,
  ORIGIN_LABEL,
  PART_STATUSES,
  PART_STATUS_LABEL,
  SYMPTOMS,
  SYMPTOM_LABEL,
  partNeedsOrder,
  type AgendaSettings,
  type Appointment,
  type Origin,
  type PartStatus,
  type Symptom,
} from '@/lib/agenda/types'
import { ApiError, type ConflictInfo } from './api'
import { fmtSlotFull, isoToParis, parisToIso, todayParis } from './time'
import { Btn, ErrorBox, Field, Segmented, inputCls, inputStyle } from './ui'

type Props = {
  mode: 'create' | 'edit'
  initial?: Appointment
  settings: AgendaSettings
  /** Date proposée par défaut à la création (jour affiché dans l'agenda) */
  defaultDate?: string
  onSubmit: (input: ApptInput, status: 'demande_recue' | 'confirme') => Promise<void>
  onCancel: () => void
}

const toInt = (s: string): number | null => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : null)

export default function ApptForm({ mode, initial, settings, defaultDate, onSubmit, onCancel }: Props) {
  const init = initial
  const initSlot = init?.startAt ? isoToParis(init.startAt) : null

  const [origin, setOrigin] = useState<Origin>(init?.origin ?? 'telephone')
  const [clientName, setClientName] = useState(init?.clientName ?? '')
  const [clientPhone, setClientPhone] = useState(init?.clientPhone ?? '')
  const [email, setEmail] = useState(init?.email ?? '')
  const [address, setAddress] = useState(init?.address ?? '')

  const [model, setModel] = useState(init?.model ?? '')
  const [repair, setRepair] = useState<RepairId>(init?.repair ?? 'ecran')
  const [quality, setQuality] = useState<string | null>(init?.quality ?? null)
  const [symptom, setSymptom] = useState<Symptom | null>(init?.symptom ?? null)
  const grid = isGridRepair(repair)

  // En modification, le prix convenu est conservé tel quel.
  const [repairPrice, setRepairPrice] = useState(init ? centsToInput(init.repairPriceCents) : '')
  const [priceTouched, setPriceTouched] = useState(Boolean(init))

  const [zone, setZone] = useState<ZoneId | null>(init?.zone ?? null)
  const [travelFee, setTravelFee] = useState(init ? centsToInput(init.travelFeeCents) : '')
  const [travelTouched, setTravelTouched] = useState(Boolean(init))
  const [zoneVerified, setZoneVerified] = useState(init ? init.zoneVerified : true)
  const [distInfo, setDistInfo] = useState<{ busy: boolean; text: string; warn: boolean }>({ busy: false, text: '', warn: false })

  /** Distance par la route (Google Maps) → zone et déplacement pré-remplis. */
  async function computeZone() {
    setDistInfo({ busy: true, text: '', warn: false })
    try {
      const res = await fetch('/api/distance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok && typeof d.km === 'number') {
        setZone(d.zone as ZoneId)
        setTravelTouched(false)
        setZoneVerified(Boolean(d.precise))
        setDistInfo({
          busy: false, warn: !d.precise,
          text: `${String(d.km).replace('.', ',')} km par la route (Google Maps)` +
            (d.precise ? '' : ' — adresse approximative, à vérifier'),
        })
      } else {
        setDistInfo({ busy: false, warn: true, text: d.error ?? 'Calcul indisponible.' })
      }
    } catch {
      setDistInfo({ busy: false, warn: true, text: 'Calcul indisponible.' })
    }
  }

  const [date, setDate] = useState(initSlot?.date ?? init?.preferredDate ?? defaultDate ?? todayParis())
  const [time, setTime] = useState(initSlot?.time ?? '')
  const [duration, setDuration] = useState(String(init?.durationMin ?? settings.durations.ecran))
  const [durationTouched, setDurationTouched] = useState(Boolean(init))

  const [partStatus, setPartStatus] = useState<PartStatus | null>(init ? init.partStatus : null)
  const [description, setDescription] = useState(init?.description ?? '')
  const [internalNotes, setInternalNotes] = useState(init?.internalNotes ?? '')
  const [initialStatus, setInitialStatus] = useState<'demande_recue' | 'confirme'>('confirme')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; errors?: string[]; conflicts?: ConflictInfo[] } | null>(null)

  // ─── Qualités disponibles pour le couple modèle / prestation ───
  const qualities = useMemo(() => (model && grid ? qualitiesFor(model, repair) : []), [model, repair, grid])

  useEffect(() => {
    if (!grid || !model) return
    if (quality && qualities.some((q) => q.label === quality)) return
    setQuality(qualities.length === 1 ? qualities[0].label : null)
  }, [model, repair, qualities, quality, grid])

  // ─── Prix de la grille ───
  const gridCents = grid && model && quality ? gridPriceCents(model, repair, quality) : null
  useEffect(() => {
    if (!priceTouched && gridCents !== null) setRepairPrice(centsToInput(gridCents))
  }, [gridCents, priceTouched])

  // ─── Déplacement selon la zone ───
  useEffect(() => {
    if (travelTouched) return
    setTravelFee(centsToInput(zoneFee(zone)))
  }, [zone, travelTouched])

  // ─── Durée selon la prestation ───
  useEffect(() => {
    if (!durationTouched) setDuration(String(settings.durations[repair]))
  }, [repair, durationTouched, settings.durations])

  const priceC = parseEuros(repairPrice)
  const travelC = parseEuros(travelFee)
  const okNum = (v: number | null) => v === null || Number.isFinite(v)
  const total = okNum(priceC) && okNum(travelC) ? apptTotal({ repairPriceCents: priceC, travelFeeCents: travelC }) : null
  const startIso = date && time ? parisToIso(date, time) : null
  const durN = toInt(duration)
  const offHours = startIso && durN ? !withinPublicHours(startIso, durN) : false

  function buildInput(): ApptInput {
    return {
      clientName,
      clientPhone,
      email,
      address,
      model,
      repair,
      quality: quality ?? '',
      description,
      symptom: repair === 'diagnostic' ? symptom : null,
      repairPriceCents: priceC === null || Number.isNaN(priceC) ? (grid ? -1 : null) : priceC,
      zone,
      zoneVerified,
      travelFeeCents: travelC === null ? null : Number.isNaN(travelC) ? -1 : travelC,
      startAt: startIso,
      durationMin: toInt(duration) ?? -1,
      origin,
      partStatus,
      internalNotes,
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const input = buildInput()
    const errors = validateInput(input)
    if (Number.isNaN(priceC)) errors.push('Le prix doit être un montant (ex. 129 ou 129,90).')
    if (Number.isNaN(travelC)) errors.push('Le déplacement doit être un montant (ex. 14,90).')
    if (mode === 'create' && initialStatus === 'confirme' && !input.startAt)
      errors.push('Un rendez-vous confirmé doit avoir une date et une heure.')
    if (errors.length) {
      setError({ message: 'Complétez la fiche.', errors })
      return
    }
    setBusy(true)
    try {
      await onSubmit(input, initialStatus)
    } catch (err) {
      if (err instanceof ApiError) setError({ message: err.message, errors: err.errors, conflicts: err.conflicts })
      else setError({ message: 'Enregistrement impossible.' })
    } finally {
      setBusy(false)
    }
  }

  const originOptions = (mode === 'create'
    ? (['telephone', 'whatsapp', 'manuel'] as Origin[])
    : (['site', 'telephone', 'whatsapp', 'manuel'] as Origin[])
  ).map((o) => ({ id: o, label: ORIGIN_LABEL[o] }))

  const section = 'flex flex-col gap-4'
  const sectionTitle = (t: string) => (
    <h3 className="font-space text-[0.9375rem] font-semibold" style={{ color: 'var(--c9-text)' }}>{t}</h3>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-7" noValidate>
      {/* ── Origine ── */}
      <div className={section}>
        <Field label="Origine de la demande">
          <Segmented ariaLabel="Origine" options={originOptions} value={origin} onChange={setOrigin} />
        </Field>
      </div>

      {/* ── Client ── */}
      <div className={section}>
        {sectionTitle('Client')}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" htmlFor="f-name">
            <input id="f-name" className={inputCls} style={inputStyle} value={clientName}
              onChange={(e) => setClientName(e.target.value)} autoComplete="off" maxLength={120} />
          </Field>
          <Field label="Téléphone" htmlFor="f-phone">
            <input id="f-phone" className={inputCls} style={inputStyle} value={clientPhone} inputMode="tel"
              onChange={(e) => setClientPhone(e.target.value)} autoComplete="off" placeholder="06 12 34 56 78" />
          </Field>
        </div>
        <Field label="E-mail (facultatif)" htmlFor="f-email">
          <input id="f-email" type="email" className={inputCls} style={inputStyle} value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="off" maxLength={200} />
        </Field>
        <Field label="Adresse d'intervention" htmlFor="f-address">
          <input id="f-address" className={inputCls} style={inputStyle} value={address}
            onChange={(e) => setAddress(e.target.value)} autoComplete="off" maxLength={300} />
        </Field>
      </div>

      {/* ── Prestation ── */}
      <div className={section}>
        {sectionTitle('Réparation')}
        <Field label="Prestation">
          <Segmented ariaLabel="Prestation" value={repair}
            onChange={(r) => { setRepair(r); if (!isGridRepair(r)) { setQuality(''); setPriceTouched(false); setRepairPrice('') } }}
            options={ALL_REPAIRS.map((r) => ({ id: r, label: REPAIR_LABEL[r] }))} />
        </Field>
        {grid ? (
          <Field label="Modèle" htmlFor="f-model">
            <select id="f-model" className={inputCls} style={inputStyle} value={model}
              onChange={(e) => setModel(e.target.value)}>
              <option value="">Choisir un modèle</option>
              {SERIES.map((s) => (
                <optgroup key={s.serie} label={s.serie}>
                  {s.models.map((m) => <option key={m.model} value={m.model}>{m.model}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Modèle" htmlFor="f-model" hint="Tout modèle (iPhone, Samsung, Pixel…).">
            <input id="f-model" className={inputCls} style={inputStyle} value={model} list="f-models"
              onChange={(e) => setModel(e.target.value)} maxLength={80} autoComplete="off" />
            <datalist id="f-models">{MODELS.map((m) => <option key={m.model} value={m.model} />)}</datalist>
          </Field>
        )}
        {grid && qualities.length > 1 && (
          <Field label="Qualité de pièce">
            <Segmented ariaLabel="Qualité" value={quality} onChange={setQuality}
              options={qualities.map((q) => ({ id: q.label, label: `${q.label} · ${euros(q.priceCents)}` }))} />
          </Field>
        )}
        {grid && qualities.length === 1 && (
          <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
            Qualité : {qualities[0].label}
          </p>
        )}
        {repair === 'module' && (
          <Field label="Pièce concernée" htmlFor="f-quality" hint="Ex. connecteur de charge, caméra arrière, haut-parleur.">
            <input id="f-quality" className={inputCls} style={inputStyle} value={quality ?? ''} maxLength={80}
              onChange={(e) => setQuality(e.target.value)} />
          </Field>
        )}
        {repair === 'diagnostic' && (
          <Field label="Symptôme" htmlFor="f-symptom"
            hint={`Réparation acceptée : réparation + déplacement. Refusée : déplacement + ${euros(DIAGNOSTIC.refusCents)}.`}>
            <select id="f-symptom" className={inputCls} style={inputStyle} value={symptom ?? ''}
              onChange={(e) => setSymptom((e.target.value || null) as Symptom | null)}>
              <option value="">Non précisé</option>
              {SYMPTOMS.map((x) => <option key={x} value={x}>{SYMPTOM_LABEL[x]}</option>)}
            </select>
          </Field>
        )}
      </div>

      {/* ── Prix ── */}
      <div className={section}>
        {sectionTitle('Prix')}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prix de réparation convenu (€)"
            htmlFor="f-price"
            hint={gridCents !== null && priceC !== gridCents ? (
              <>Prix grille : {euros(gridCents)} ·{' '}
                <button type="button" className="underline underline-offset-2"
                  onClick={() => { setRepairPrice(centsToInput(gridCents)); setPriceTouched(false) }}>
                  rétablir
                </button>
              </>
            ) : gridCents !== null ? 'Prix de la grille' : !grid ? 'Laisser vide si le prix sera fixé sur place.' : undefined}
          >
            <input id="f-price" className={inputCls} style={inputStyle} inputMode="decimal" value={repairPrice}
              placeholder={grid ? '' : 'À définir'}
              onChange={(e) => { setRepairPrice(e.target.value); setPriceTouched(true) }} />
          </Field>
          <Field label="Zone de déplacement" htmlFor="f-zone" hint={
            <>
              {distInfo.text
                ? <span style={{ color: distInfo.warn ? 'var(--c9-warn)' : undefined }} data-distance-info>{distInfo.text}</span>
                : zone ? ZONES.find((z) => z.id === zone)?.full : null}
              {' '}
              <button type="button" className="underline underline-offset-2" disabled={distInfo.busy || address.trim().length < 5}
                onClick={() => void computeZone()}>
                {distInfo.busy ? 'calcul…' : 'calculer depuis l\u2019adresse'}
              </button>
            </>
          }>
            <select id="f-zone" className={inputCls} style={inputStyle} value={zone ?? ''}
              onChange={(e) => { setZone((e.target.value || null) as ZoneId | null); setTravelTouched(false) }}>
              <option value="">Non définie</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>{z.label} — {z.feeCents === null ? "pas d'intervention" : euros(z.feeCents)}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Déplacement (€)" htmlFor="f-travel"
            hint={zone === 'hors' ? "Au-delà de 30 km : saisissez un montant seulement si vous intervenez exceptionnellement." : undefined}>
            <input id="f-travel" className={inputCls} style={inputStyle} inputMode="decimal" value={travelFee}
              placeholder={zone === 'hors' ? '—' : ''}
              onChange={(e) => { setTravelFee(e.target.value); setTravelTouched(true) }} />
          </Field>
          <label className="flex items-center gap-3 self-end pb-3 font-space text-[0.875rem]"
            style={{ color: 'var(--c9-text-2)' }}>
            <input type="checkbox" checked={zoneVerified} onChange={(e) => setZoneVerified(e.target.checked)}
              className="h-5 w-5 accent-[#e59864]" />
            Zone vérifiée par COM&apos;9
          </label>
        </div>

        <div className="flex items-baseline justify-between rounded-2xl px-4 py-3"
          style={{ background: 'var(--c9-elev-1)', border: '1px solid var(--c9-hairline-soft)' }}>
          <span className="font-space text-[0.9375rem] font-semibold">Total</span>
          <span className="font-space text-lg font-semibold tabular-nums">
            {total !== null ? euros(total) : priceC === null && !grid ? 'Après diagnostic' : '—'}
          </span>
        </div>
      </div>

      {/* ── Planning ── */}
      <div className={section}>
        {sectionTitle('Créneau')}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Date" htmlFor="f-date">
            <input id="f-date" type="date" className={inputCls} style={inputStyle} value={date}
              onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Heure" htmlFor="f-time">
            <input id="f-time" type="time" step={900} className={inputCls} style={inputStyle} value={time}
              onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Durée (min)" htmlFor="f-duration">
            <input id="f-duration" className={inputCls} style={inputStyle} inputMode="numeric" value={duration}
              onChange={(e) => { setDuration(e.target.value); setDurationTouched(true) }} />
          </Field>
        </div>
        {offHours && (
          <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-warn)' }} data-off-hours>
            Hors des horaires publics : possible pour COM&apos;9, ce créneau n&apos;est jamais proposé aux clients.
          </p>
        )}
        {mode === 'create' && (
          <Field label="Statut à l'enregistrement">
            <Segmented ariaLabel="Statut initial" value={initialStatus} onChange={setInitialStatus}
              options={[
                { id: 'confirme', label: 'Rendez-vous confirmé' },
                { id: 'demande_recue', label: 'Demande à traiter' },
              ]} />
          </Field>
        )}
      </div>

      {/* ── Pièce ── */}
      <div className={section}>
        {sectionTitle('Pièce')}
        <Field label="État de la pièce" htmlFor="f-part"
          hint={partNeedsOrder(partStatus) ? ORDER_DELAY_NOTE : undefined}>
          <select id="f-part" className={inputCls} style={inputStyle} value={partStatus ?? ''}
            onChange={(e) => setPartStatus((e.target.value || null) as PartStatus | null)}>
            <option value="">À vérifier</option>
            {PART_STATUSES.map((p) => <option key={p} value={p}>{PART_STATUS_LABEL[p]}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Textes ── */}
      <div className={section}>
        <Field label="Description du problème" htmlFor="f-desc">
          <textarea id="f-desc" rows={3} className={`${inputCls} py-3`} style={inputStyle} value={description}
            onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </Field>
        <Field label="Notes internes" htmlFor="f-notes" hint="Jamais visibles par le client.">
          <textarea id="f-notes" rows={3} className={`${inputCls} py-3`} style={inputStyle} value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)} maxLength={4000} />
        </Field>
      </div>

      {error && (
        <div className="flex flex-col gap-2">
          <ErrorBox message={error.message} errors={error.errors} />
          {error.conflicts && error.conflicts.length > 0 && (
            <ul className="space-y-1 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-2)' }}>
              {error.conflicts.map((c) => (
                <li key={c.id}>Déjà prévu : {c.clientName} — {fmtSlotFull(c.startAt)} ({c.durationMin} min)</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 flex gap-3 px-5 py-4 sm:-mx-7 sm:px-7"
        style={{ background: 'linear-gradient(to top, var(--c9-bg) 70%, transparent)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <Btn variant="ghost" onClick={onCancel} className="shrink-0 !px-3">Annuler</Btn>
        <Btn variant="primary" type="submit" disabled={busy} className="flex-1 whitespace-nowrap">
          {busy ? 'Enregistrement…' : mode === 'create' ? 'Enregistrer le rendez-vous' : 'Enregistrer les modifications'}
        </Btn>
      </div>
    </form>
  )
}
