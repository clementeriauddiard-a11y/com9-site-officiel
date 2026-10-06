'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : formulaire de rendez-vous (création et modification)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { REPAIRS, SERIES, ZONES, type RepairId, type ZoneId } from '@/data/tarifs'
import {
  apptTotal,
  gridPrice,
  qualitiesFor,
  validateInput,
  zoneFee,
  type ApptInput,
} from '@/lib/agenda/logic'
import {
  ORDER_DELAY_NOTE,
  ORIGIN_LABEL,
  PART_STATUSES,
  PART_STATUS_LABEL,
  partNeedsOrder,
  type AgendaSettings,
  type Appointment,
  type Origin,
  type PartStatus,
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
  const [address, setAddress] = useState(init?.address ?? '')

  const [model, setModel] = useState(init?.model ?? '')
  const [repair, setRepair] = useState<RepairId>(init?.repair ?? 'ecran')
  const [quality, setQuality] = useState<string | null>(init?.quality ?? null)

  // En modification, le prix convenu est conservé tel quel.
  const [repairPrice, setRepairPrice] = useState(init ? String(init.repairPrice) : '')
  const [priceTouched, setPriceTouched] = useState(Boolean(init))

  const [zone, setZone] = useState<ZoneId | null>(init?.zone ?? null)
  const [travelFee, setTravelFee] = useState(init?.travelFee === null || init?.travelFee === undefined ? '' : String(init.travelFee))
  const [travelTouched, setTravelTouched] = useState(Boolean(init))
  const [zoneVerified, setZoneVerified] = useState(init ? init.zoneVerified : true)

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
  const qualities = useMemo(() => (model ? qualitiesFor(model, repair) : []), [model, repair])

  useEffect(() => {
    if (!model) return
    if (quality && qualities.some((q) => q.label === quality)) return
    setQuality(qualities.length === 1 ? qualities[0].label : null)
  }, [model, repair, qualities, quality])

  // ─── Prix de la grille ───
  const grid = model && quality ? gridPrice(model, repair, quality) : null
  useEffect(() => {
    if (!priceTouched && grid !== null) setRepairPrice(String(grid))
  }, [grid, priceTouched])

  // ─── Déplacement selon la zone ───
  useEffect(() => {
    if (travelTouched) return
    const fee = zoneFee(zone)
    setTravelFee(fee === null ? '' : String(fee))
  }, [zone, travelTouched])

  // ─── Durée selon la prestation ───
  useEffect(() => {
    if (!durationTouched) setDuration(String(settings.durations[repair]))
  }, [repair, durationTouched, settings.durations])

  const priceN = toInt(repairPrice)
  const travelN = travelFee.trim() === '' ? null : toInt(travelFee)
  const total = priceN === null ? null : apptTotal({ repairPrice: priceN, travelFee: travelN })

  function buildInput(): ApptInput {
    return {
      clientName,
      clientPhone,
      address,
      model,
      repair,
      quality: quality ?? '',
      description,
      repairPrice: priceN ?? -1,
      zone,
      zoneVerified,
      travelFee: travelN,
      startAt: date && time ? parisToIso(date, time) : null,
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
    if (travelFee.trim() !== '' && travelN === null) errors.push('Le déplacement doit être un nombre entier.')
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
    ? (['telephone', 'whatsapp'] as Origin[])
    : (['site', 'telephone', 'whatsapp'] as Origin[])
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
        <Field label="Adresse d'intervention" htmlFor="f-address">
          <input id="f-address" className={inputCls} style={inputStyle} value={address}
            onChange={(e) => setAddress(e.target.value)} autoComplete="off" maxLength={300} />
        </Field>
      </div>

      {/* ── Prestation ── */}
      <div className={section}>
        {sectionTitle('Réparation')}
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
        <Field label="Prestation">
          <Segmented ariaLabel="Prestation" value={repair} onChange={setRepair}
            options={REPAIRS.map((r) => ({ id: r.id, label: r.label }))} />
        </Field>
        {qualities.length > 1 && (
          <Field label="Qualité de pièce">
            <Segmented ariaLabel="Qualité" value={quality} onChange={setQuality}
              options={qualities.map((q) => ({ id: q.label, label: `${q.label} · ${q.price} €` }))} />
          </Field>
        )}
        {qualities.length === 1 && (
          <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
            Qualité : {qualities[0].label}
          </p>
        )}
      </div>

      {/* ── Prix ── */}
      <div className={section}>
        {sectionTitle('Prix')}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prix de réparation convenu (€)"
            htmlFor="f-price"
            hint={grid !== null && priceN !== grid ? (
              <>Prix grille : {grid} € ·{' '}
                <button type="button" className="underline underline-offset-2"
                  onClick={() => { setRepairPrice(String(grid)); setPriceTouched(false) }}>
                  rétablir
                </button>
              </>
            ) : grid !== null ? 'Prix de la grille' : undefined}
          >
            <input id="f-price" className={inputCls} style={inputStyle} inputMode="numeric" value={repairPrice}
              onChange={(e) => { setRepairPrice(e.target.value); setPriceTouched(true) }} />
          </Field>
          <Field label="Zone de déplacement" htmlFor="f-zone" hint={zone ? ZONES.find((z) => z.id === zone)?.full : undefined}>
            <select id="f-zone" className={inputCls} style={inputStyle} value={zone ?? ''}
              onChange={(e) => { setZone((e.target.value || null) as ZoneId | null); setTravelTouched(false) }}>
              <option value="">Non définie</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>{z.label} — {z.fee === null ? 'sur devis' : `${z.fee} €`}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Déplacement (€)" htmlFor="f-travel"
            hint={zone === 'devis' ? 'Sur devis : saisissez le montant une fois chiffré.' : undefined}>
            <input id="f-travel" className={inputCls} style={inputStyle} inputMode="numeric" value={travelFee}
              placeholder={zone === 'devis' ? 'À chiffrer' : ''}
              onChange={(e) => { setTravelFee(e.target.value); setTravelTouched(true) }} />
          </Field>
          <label className="flex items-center gap-3 self-end pb-3 font-space text-[0.875rem]"
            style={{ color: 'var(--c9-text-2)' }}>
            <input type="checkbox" checked={zoneVerified} onChange={(e) => setZoneVerified(e.target.checked)}
              className="h-5 w-5 accent-[#3ad9ff]" />
            Zone vérifiée par COM&apos;9
          </label>
        </div>

        <div className="flex items-baseline justify-between rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--c9-hairline-soft)' }}>
          <span className="font-space text-[0.9375rem] font-semibold">Total</span>
          <span className="font-space text-lg font-semibold tabular-nums">
            {total !== null ? `${total} €` : travelN === null && zone === 'devis' ? 'Déplacement sur devis' : '—'}
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
          hint={partNeedsOrder(partStatus) ? ORDER_DELAY_NOTE + ' Estimation, pas une garantie de livraison.' : undefined}>
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
