'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : fiche d'un rendez-vous
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { REPAIR_LABEL, findZone } from '@/data/tarifs'
import { DIAGNOSTIC, PAIEMENT_LABEL, PAIEMENT_MODES, type PaiementMode } from '@/config/com9'
import { centsToInput, euros, parseEuros } from '@/lib/money'
import { withinPublicHours } from '@/lib/agenda/slots'
import {
  ACTIONS,
  apptTotal,
  availableActions,
  telHref,
  waHref,
  type ActionId,
} from '@/lib/agenda/logic'
import {
  CLIENT_REQUEST_LABEL,
  MESSAGES_FOR_STATUS,
  MESSAGE_LABEL,
  type MessageKind,
  ORDER_DELAY_NOTE,
  ORIGIN_LABEL,
  PART_STATUSES,
  PART_STATUS_LABEL,
  SYMPTOM_LABEL,
  partNeedsOrder,
  type AgendaSettings,
  type ApptEvent,
  type Appointment,
  type PartStatus,
} from '@/lib/agenda/types'
import ApptForm from './ApptForm'
import { buildMessage, trackUrl } from './messages'
import { messagePending } from '@/lib/agenda/messages-state'
import { ApiError, api, type ConflictInfo } from './api'
import { endIso, fmtDuration, fmtSlotFull, fmtTime, fmtWish, isoToParis, parisToIso } from './time'
import { Btn, Chip, ErrorBox, Field, PartChip, Segmented, StatusChip, copyText, inputCls, inputStyle } from './ui'

type Props = {
  id: string
  settings: AgendaSettings
  onClose: () => void
  onChanged: () => void
}

const repairLabel = (id: Appointment['repair']) => REPAIR_LABEL[id] ?? id

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>{label}</span>
      <span className="min-w-0 text-right font-space text-[0.9375rem] tabular-nums" style={{ color: 'var(--c9-text)' }}>
        {children}
      </span>
    </div>
  )
}

/** « le mardi 13 octobre à 10 h 05 » */
const lowerFirstSlot = (iso: string) => {
  const t = fmtSlotFull(iso)
  return 'le ' + t.charAt(0).toLowerCase() + t.slice(1)
}

function Block({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] p-5"
      style={{ background: 'var(--c9-elev-1)', border: '1px solid var(--c9-hairline-soft)' }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--c9-text-3)' }}>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function ApptSheet({ id, settings, onClose, onChanged }: Props) {
  const [appt, setAppt] = useState<Appointment | null>(null)
  const [events, setEvents] = useState<ApptEvent[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [proposing, setProposing] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<{ message: string; conflicts?: ConflictInfo[] } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmRelink, setConfirmRelink] = useState(false)

  // Proposition d'un autre créneau
  const [pDate, setPDate] = useState('')
  const [pTime, setPTime] = useState('')
  const [pReason, setPReason] = useState('')
  const [pFirm, setPFirm] = useState(true)

  // Fin d'intervention / paiement
  const [finishing, setFinishing] = useState<'terminer' | 'paiement' | null>(null)
  const [fAmount, setFAmount] = useState('')
  const [fMode, setFMode] = useState<PaiementMode | null>(null)
  const [fPaid, setFPaid] = useState(true)

  const load = useCallback(async () => {
    try {
      const d = await api.detail(id)
      setAppt(d.appt)
      setEvents(d.events)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Chargement impossible.')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  // Échap ferme la fiche
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !editing) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editing])

  async function run(action: ActionId, payload?: Parameters<typeof api.action>[2]) {
    setBusy(action)
    setActionError(null)
    try {
      const { appt: next } = await api.action(id, action, payload)
      setAppt(next)
      setProposing(false)
      setConfirmCancel(false)
      await load()
      onChanged()
    } catch (e) {
      if (e instanceof ApiError) setActionError({ message: e.message, conflicts: e.conflicts })
      else setActionError({ message: 'Action impossible.' })
    } finally {
      setBusy(null)
    }
  }

  function openFinish(kind: 'terminer' | 'paiement') {
    if (!appt) return
    const t = apptTotal(appt)
    setFAmount(centsToInput(appt.finalAmountCents ?? t))
    setFMode(appt.paymentMode)
    setFPaid(kind === 'terminer' ? true : appt.paid)
    setFinishing(kind)
    setActionError(null)
  }

  async function submitFinish() {
    const cents = parseEuros(fAmount)
    if (cents === null || Number.isNaN(cents)) {
      setActionError({ message: 'Indiquez le montant final (ex. 137,90).' })
      return
    }
    const payload = { finalAmountCents: cents, paymentMode: fMode, paid: fPaid }
    if (finishing === 'terminer') {
      await run('terminer', payload)
      setFinishing(null)
      return
    }
    setBusy('paiement')
    setActionError(null)
    try {
      await api.payment(id, payload)
      setFinishing(null)
      await load()
      onChanged()
    } catch (e) {
      setActionError({ message: e instanceof ApiError ? e.message : 'Enregistrement impossible.' })
    } finally {
      setBusy(null)
    }
  }

  async function special(action: 'traiter_demande' | 'regenerer_lien') {
    setBusy(action)
    setActionError(null)
    try {
      await api.special(id, action)
      setConfirmRelink(false)
      await load()
      onChanged()
    } catch (e) {
      setActionError({ message: e instanceof ApiError ? e.message : 'Action impossible.' })
    } finally {
      setBusy(null)
    }
  }

  async function noteSent(k: MessageKind) {
    setBusy('msg-' + k)
    setActionError(null)
    try {
      await api.messageSent(id, k)
      await load()
      onChanged()
    } catch (e) {
      setActionError({ message: e instanceof ApiError ? e.message : 'Action impossible.' })
    } finally {
      setBusy(null)
    }
  }

  async function changePart(p: PartStatus | null) {
    if (!appt) return
    setBusy('piece')
    setActionError(null)
    try {
      await api.update(id, { partStatus: p })
      await load()
      onChanged()
    } catch (e) {
      setActionError({ message: e instanceof ApiError ? e.message : 'Modification impossible.' })
    } finally {
      setBusy(null)
    }
  }

  async function doCopy(text: string, key: string) {
    if (await copyText(text)) {
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    }
  }

  function openPropose() {
    if (!appt) return
    // Pré-remplit avec le créneau actuel décalé de 3 jours (délai de commande estimé)
    const base = appt.startAt ?? new Date().toISOString()
    const shifted = new Date(new Date(base).getTime() + 3 * 86_400_000).toISOString()
    const s = isoToParis(shifted)
    setPDate(s.date)
    setPTime(appt.startAt ? s.time : '09:00')
    setPReason(partNeedsOrder(appt.partStatus) ? 'Pièce à commander' : '')
    setPFirm(true)
    setProposing(true)
    setActionError(null)
  }

  // ─── Panneau ───
  const shell = (content: React.ReactNode) => (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Fiche rendez-vous">
      <button type="button" aria-label="Fermer" className="absolute inset-0 cursor-default"
        style={{ background: 'var(--c9-scrim)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-y-auto sm:max-w-[540px]"
        style={{ background: 'var(--c9-bg)', borderLeft: '1px solid var(--c9-hairline)', boxShadow: '-30px 0 80px -30px rgba(0,0,0,0.6)' }}>
        {content}
      </div>
    </div>
  )

  if (loadError) {
    return shell(
      <div className="flex flex-col gap-4 p-6">
        <ErrorBox message={loadError} />
        <Btn onClick={onClose}>Fermer</Btn>
      </div>,
    )
  }

  if (!appt) {
    return shell(<p className="p-6 font-space" style={{ color: 'var(--c9-text-3)' }}>Chargement…</p>)
  }

  if (editing) {
    return shell(
      <div className="flex flex-col gap-6 px-5 pt-6 sm:px-7" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-space text-xl font-semibold">Modifier la fiche</h2>
        </div>
        <ApptForm
          mode="edit"
          initial={appt}
          settings={settings}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await api.update(id, input)
            await load()
            onChanged()
            setEditing(false)
          }}
        />
      </div>,
    )
  }

  const tel = telHref(appt.clientPhone)
  const wa = waHref(appt.clientPhone)
  const link = trackUrl(typeof window !== 'undefined' ? window.location.origin : '', appt.trackToken)
  const msgKinds = MESSAGES_FOR_STATUS[appt.status]
  const total = apptTotal(appt)
  const zone = findZone(appt.zone)
  const actions = availableActions(appt.status).filter((a) =>
    a !== 'annuler' && (a !== 'valider_choix_client' || Boolean(appt.clientSlot)))
  const offHours = appt.startAt ? !withinPublicHours(appt.startAt, appt.durationMin) : false
  const canCancel = availableActions(appt.status).includes('annuler')

  const finishForm = (
            <div className="flex flex-col gap-4" data-finish>
              <p className="font-space text-[0.9375rem] font-semibold">
                {finishing === 'terminer' ? "Terminer l'intervention" : 'Paiement'}
              </p>
              {finishing === 'paiement' && actionError && <ErrorBox message={actionError.message} />}
              <Field label="Montant final (€)" htmlFor="f-final" hint={total !== null ? `Total prévu : ${euros(total)}` : undefined}>
                <input id="f-final" className={inputCls} style={inputStyle} inputMode="decimal" value={fAmount}
                  onChange={(e) => setFAmount(e.target.value)} />
              </Field>
              <Field label="Mode de paiement">
                <Segmented ariaLabel="Mode de paiement" value={fMode} onChange={setFMode}
                  options={PAIEMENT_MODES.map((m) => ({ id: m, label: PAIEMENT_LABEL[m] }))} />
              </Field>
              <label className="flex items-center gap-3 font-space text-[0.9375rem]" style={{ color: 'var(--c9-text)' }}>
                <input type="checkbox" checked={fPaid} onChange={(e) => setFPaid(e.target.checked)} className="h-5 w-5 accent-[#e59864]" />
                Payé
              </label>
              <div className="flex gap-2">
                <Btn variant="ghost" className="shrink-0 !px-3" onClick={() => setFinishing(null)}>Retour</Btn>
                <Btn variant="primary" className="flex-1 whitespace-nowrap" disabled={busy !== null} onClick={submitFinish}>
                  {busy ? '…' : finishing === 'terminer' ? "Terminer l'intervention" : 'Enregistrer'}
                </Btn>
              </div>
            </div>
  )

  return shell(
    <>
      {/* ── En-tête ── */}
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 pb-4 sm:px-7"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))', background: 'var(--c9-bg)', borderBottom: '1px solid var(--c9-hairline-soft)' }}>
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="truncate font-space text-[1.375rem] font-semibold leading-tight" style={{ letterSpacing: '-0.02em' }}>
            {appt.clientName}
          </h2>
          <div className="flex flex-wrap gap-2">
            <StatusChip status={appt.status} />
            <Chip tone="#928d85">{ORIGIN_LABEL[appt.origin]}</Chip>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer la fiche"
          className="c9-back flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--c9-elev-2)' }}>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
        {/* ── Demande du client (lien de suivi) ── */}
        {appt.clientRequest && (
          <div role="status" className="flex flex-col gap-2 rounded-[22px] p-4"
            style={{ background: 'var(--c9-warn-soft)', border: '1px solid var(--c9-warn-line)' }}>
            <p className="font-space text-[0.9375rem] font-semibold" style={{ color: 'var(--c9-warn)' }}>
              {CLIENT_REQUEST_LABEL[appt.clientRequest]}
            </p>
            {appt.clientMessage && (
              <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }}>« {appt.clientMessage} »</p>
            )}
            {appt.clientRequestAt && (
              <p className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>Reçue {lowerFirstSlot(appt.clientRequestAt)}</p>
            )}
            <Btn variant="secondary" disabled={busy !== null} onClick={() => special('traiter_demande')}>
              {busy === 'traiter_demande' ? '…' : 'Marquer comme traitée'}
            </Btn>
          </div>
        )}

        {/* ── Contact ── */}
        <Block title="Contact">
          <p className="select-all font-space text-lg font-semibold tabular-nums">{appt.clientPhone}</p>
          {appt.email && (
            <p className="-mt-1 select-all break-all font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }}>{appt.email}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {tel ? <Btn href={tel} className="text-[0.875rem]">Appeler</Btn> : <Btn disabled>Appeler</Btn>}
            {wa ? <Btn href={wa} external className="text-[0.875rem]">WhatsApp</Btn> : <Btn disabled>WhatsApp</Btn>}
            <Btn onClick={() => doCopy(appt.clientPhone, 'tel')} className="text-[0.875rem]">
              {copied === 'tel' ? 'Copié' : 'Copier'}
            </Btn>
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="min-w-0 select-all font-space text-[0.9375rem] leading-snug" style={{ color: 'var(--c9-text-2)' }}>
              {appt.address}
            </p>
            <div className="flex shrink-0 gap-2">
              <Btn variant="ghost" className="px-2 text-[0.8125rem]" onClick={() => doCopy(appt.address, 'adr')}>
                {copied === 'adr' ? 'Copiée' : 'Copier'}
              </Btn>
              <Btn variant="ghost" className="px-2 text-[0.8125rem]" external
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.address)}`}>
                Plan
              </Btn>
            </div>
          </div>
        </Block>

        {/* ── Réparation & prix ── */}
        <Block title="Réparation">
          <p className="font-space text-[1.0625rem] font-semibold">
            {appt.model} · {repairLabel(appt.repair)}
          </p>
          {appt.quality && (
            <p className="-mt-1 font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>{appt.quality}</p>
          )}
          {appt.symptom && (
            <p className="-mt-1 font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }}>
              Problème : {SYMPTOM_LABEL[appt.symptom]}
            </p>
          )}
          <div className="c9-divider my-1" />
          <Row label="Réparation">{appt.repairPriceCents !== null ? euros(appt.repairPriceCents) : 'Après diagnostic'}</Row>
          <Row label="Déplacement">
            {appt.travelFeeCents !== null ? euros(appt.travelFeeCents) : zone?.id === 'hors' ? 'Hors zone (> 30 km)' : 'Non défini'}
          </Row>
          {zone && (
            <p className="-mt-1 text-right font-space text-[0.75rem]"
              style={{ color: appt.zoneVerified ? 'var(--c9-text-3)' : 'var(--c9-warn)' }}>
              {zone.full}{appt.zoneVerified ? '' : ' — zone provisoire, à vérifier'}
            </p>
          )}
          {appt.distanceKm !== null && appt.distanceSource === 'google' ? (
            <p className="-mt-1 text-right font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }} data-distance>
              {`${String(appt.distanceKm).replace('.', ',')} km par la route depuis l\u2019atelier (Google Maps)`}
            </p>
          ) : appt.distanceSource === 'liste' ? (
            <p className="-mt-1 text-right font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }} data-distance>
              Zone d&apos;après la commune{appt.communeNom ? ` (${appt.communeNom})` : ''} — distance non calculée
            </p>
          ) : null}
          <div className="c9-divider my-1" />
          <div className="flex items-baseline justify-between">
            <span className="font-space font-semibold">Total</span>
            <span className="font-space text-xl font-semibold tabular-nums">
              {total !== null ? euros(total) : '—'}
            </span>
          </div>
          {appt.repair === 'diagnostic' && (
            <p className="font-space text-[0.75rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>
              Réparation acceptée : réparation + déplacement. Refusée : déplacement + {euros(DIAGNOSTIC.refusCents)} de diagnostic.
            </p>
          )}
        </Block>

        {/* ── Paiement (après l'intervention) ── */}
        {appt.status === 'termine' && (
          <Block title="Paiement" aside={
            <span className="font-space text-[0.75rem] font-semibold"
              style={{ color: appt.paid ? 'var(--c9-ok)' : 'var(--c9-warn)' }}>
              {appt.paid ? 'Payé' : 'Non payé'}
            </span>}>
            <Row label="Montant final">{appt.finalAmountCents !== null ? euros(appt.finalAmountCents) : '—'}</Row>
            <Row label="Mode">{appt.paymentMode ? PAIEMENT_LABEL[appt.paymentMode] : '—'}</Row>
            {finishing === 'paiement' && finishForm}
            {finishing !== 'paiement' && (
              <Btn variant="secondary" disabled={busy !== null} onClick={() => openFinish('paiement')}>
                {appt.paid ? 'Corriger le paiement' : 'Enregistrer le paiement'}
              </Btn>
            )}
          </Block>
        )}

        {/* ── Créneau ── */}
        <Block title="Créneau">
          {appt.startAt ? (
            <>
              <p className="font-space text-[1.0625rem] font-semibold">{fmtSlotFull(appt.startAt)}</p>
              <p className="-mt-1 font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
                Fin prévue {fmtTime(endIso(appt.startAt, appt.durationMin))} · {fmtDuration(appt.durationMin)}
              </p>
            </>
          ) : (
            <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }}>
              Aucun créneau fixé · durée prévue {fmtDuration(appt.durationMin)}
            </p>
          )}
          {offHours && (
            <p className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>Hors des horaires publics.</p>
          )}
          {appt.startAt && appt.status === 'demande_recue' && appt.origin === 'site' && (
            <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-warn)' }}>
              Créneau demandé par le client, pas encore confirmé.
            </p>
          )}
          {appt.clientSlot && appt.status === 'confirme' && (
            <div className="mt-1 rounded-2xl px-4 py-3" data-client-slot
              style={{ background: 'var(--c9-warn-soft)', border: '1px solid var(--c9-warn-line)' }}>
              <p className="font-space text-[0.875rem] font-semibold" style={{ color: 'var(--c9-warn)' }}>
                Le client souhaite déplacer au {lowerFirstSlot(appt.clientSlot).slice(3)}
              </p>
              <p className="mt-0.5 font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
                Le rendez-vous actuel reste prévu tant que vous ne validez pas.
              </p>
            </div>
          )}
          {appt.preferredDate && !appt.startAt && (
            <div className="mt-1 rounded-2xl px-4 py-3"
              style={{ background: 'var(--c9-warn-soft)', border: '1px solid var(--c9-warn-line)' }}>
              <p className="font-space text-[0.875rem] font-semibold" style={{ color: 'var(--c9-warn)' }}>
                Souhait du client : {fmtWish(appt.preferredDate, appt.preferredPeriod)}
              </p>
              {appt.availabilityNote && (
                <p className="mt-0.5 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-2)' }}>
                  Autres disponibilités : {appt.availabilityNote}
                </p>
              )}
              {!appt.startAt && (
                <p className="mt-1 font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
                  Rien n&apos;est réservé. Fixez l&apos;heure avec « Modifier », puis confirmez — ou proposez un autre créneau.
                </p>
              )}
            </div>
          )}
          {appt.proposedStartAt && (
            <div className="mt-1 rounded-2xl px-4 py-3"
              style={{ background: 'var(--c9-elev-1)', border: '1px solid var(--c9-hairline-lit)' }}>
              <p className="font-space text-[0.875rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
                Proposé : {fmtSlotFull(appt.proposedStartAt)}
              </p>
              <p className="mt-0.5 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-2)' }}>
                {appt.proposalFirm ? 'Proposition ferme' : 'Proposition indicative'}
                {appt.proposedReason ? ` · ${appt.proposedReason}` : ''}
              </p>
            </div>
          )}
        </Block>

        {/* ── Pièce ── */}
        <Block title="Pièce" aside={<PartChip part={appt.partStatus} />}>
          <select aria-label="État de la pièce" className={inputCls} style={inputStyle}
            value={appt.partStatus ?? ''} disabled={busy === 'piece'}
            onChange={(e) => changePart((e.target.value || null) as PartStatus | null)}>
            <option value="">À vérifier</option>
            {PART_STATUSES.map((p) => <option key={p} value={p}>{PART_STATUS_LABEL[p]}</option>)}
          </select>
          {partNeedsOrder(appt.partStatus) && (
            <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-warn)' }}>
              {ORDER_DELAY_NOTE} <span style={{ color: 'var(--c9-text-3)' }}>Estimation.</span>
            </p>
          )}
        </Block>

        {/* ── Textes ── */}
        {appt.description && (
          <Block title="Description du client">
            <p className="whitespace-pre-wrap font-space text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              {appt.description}
            </p>
          </Block>
        )}
        <Block title="Notes internes" aside={<span className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>Invisibles au client</span>}>
          <p className="whitespace-pre-wrap font-space text-[0.9375rem] leading-relaxed"
            style={{ color: appt.internalNotes ? 'var(--c9-text-2)' : 'var(--c9-text-3)' }}>
            {appt.internalNotes || 'Aucune note.'}
          </p>
        </Block>

        {/* ── Messages WhatsApp (étape 4) et lien de suivi ── */}
        <Block title="Messages WhatsApp" aside={<span className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>Envoi manuel</span>}>
          {msgKinds.length === 0 && (
            <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>Aucun message prévu pendant l&apos;intervention.</p>
          )}
          {msgKinds.map((k) => {
            const text = buildMessage(k, appt, link)
            const href = waHref(appt.clientPhone, text)
            const log = appt.messagesLog?.[k]
            const pending = messagePending(appt, k)
            return (
              <div key={k} className="flex flex-col gap-2 rounded-2xl p-3" data-message={k}
                style={{ border: `1px solid ${pending ? 'var(--c9-hairline-lit)' : 'var(--c9-hairline-soft)'}`, background: 'var(--c9-elev-1)' }}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-space text-[0.9375rem] font-semibold">{MESSAGE_LABEL[k]}</p>
                  <span className="shrink-0 font-space text-[0.75rem]" style={{ color: pending ? 'var(--c9-warn)' : 'var(--c9-ok)' }}>
                    {pending ? (log ? 'À renvoyer (créneau changé)' : 'À envoyer') : `Envoyé ${lowerFirstSlot(log!.at)}`}
                  </span>
                </div>
                <details>
                  <summary className="cursor-pointer font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>Voir le texte</summary>
                  <p className="mt-2 whitespace-pre-wrap font-space text-[0.8125rem] leading-relaxed [overflow-wrap:anywhere]" style={{ color: 'var(--c9-text-2)' }}>{text}</p>
                </details>
                <div className="grid grid-cols-2 gap-2">
                  {href
                    ? <Btn href={href} external className="text-[0.875rem]" title={`Ouvrir WhatsApp avec le message « ${MESSAGE_LABEL[k]} »`}>WhatsApp</Btn>
                    : <Btn disabled className="text-[0.875rem]">WhatsApp</Btn>}
                  <Btn className="text-[0.875rem]" onClick={() => doCopy(text, 'msg-' + k)}>{copied === 'msg-' + k ? 'Copié ✓' : 'Copier'}</Btn>
                </div>
                <Btn className="text-[0.875rem]" variant={pending ? 'primary' : 'ghost'} disabled={busy !== null}
                  onClick={() => noteSent(k)}>
                  {busy === 'msg-' + k ? '…' : pending ? 'Noter envoyé' : 'Noter un nouvel envoi'}
                </Btn>
              </div>
            )
          })}
          <p className="font-space text-[0.75rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>
            « WhatsApp » ouvre la conversation avec le client et le texte déjà rempli : c&apos;est vous qui relisez et envoyez.
            « Noter envoyé » garde la trace dans l&apos;historique (le site ne peut pas vérifier l&apos;envoi).
          </p>

          <div className="c9-divider my-1" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--c9-text-3)' }}>Lien de suivi du client</p>
          <p className="break-all font-mono text-[0.75rem]" data-track-link style={{ color: 'var(--c9-text-2)' }}>{link}</p>
          <div className="grid grid-cols-2 gap-2">
            <Btn className="text-[0.8125rem]" onClick={() => doCopy(link, 'lien')}>{copied === 'lien' ? 'Copié ✓' : 'Copier le lien'}</Btn>
            <Btn href={link} external className="text-[0.8125rem]">Ouvrir</Btn>
          </div>
          <p className="font-space text-[0.75rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>
            Le client y voit son rendez-vous (sans notes internes ni coordonnées) et peut répondre à une proposition.
          </p>
          {!confirmRelink ? (
            <Btn variant="ghost" className="self-start !px-0 text-[0.8125rem]" onClick={() => setConfirmRelink(true)}>
              Générer un nouveau lien…
            </Btn>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl p-3" style={{ border: '1px solid var(--c9-hairline-lit)' }}>
              <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-2)' }}>
                L&apos;ancien lien cessera immédiatement de fonctionner. À utiliser si le lien a été envoyé à la mauvaise personne.
              </p>
              <div className="flex gap-2">
                <Btn variant="ghost" className="flex-1" onClick={() => setConfirmRelink(false)}>Annuler</Btn>
                <Btn variant="primary" className="flex-1" disabled={busy === 'regenerer_lien'} onClick={() => special('regenerer_lien')}>
                  Nouveau lien
                </Btn>
              </div>
            </div>
          )}
        </Block>

        {/* ── Actions ── */}
        <Block title="Actions">
          {actionError && (
            <div className="flex flex-col gap-2">
              <ErrorBox message={actionError.message} />
              {actionError.conflicts?.map((c) => (
                <p key={c.id} className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-2)' }}>
                  Déjà prévu : {c.clientName} — {fmtSlotFull(c.startAt)} ({c.durationMin} min)
                </p>
              ))}
            </div>
          )}

          {finishing === 'terminer' ? (
            finishForm
          ) : proposing ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nouvelle date" htmlFor="p-date">
                  <input id="p-date" type="date" className={inputCls} style={inputStyle} value={pDate}
                    onChange={(e) => setPDate(e.target.value)} />
                </Field>
                <Field label="Nouvelle heure" htmlFor="p-time">
                  <input id="p-time" type="time" step={900} className={inputCls} style={inputStyle} value={pTime}
                    onChange={(e) => setPTime(e.target.value)} />
                </Field>
              </div>
              <Field label="Motif (facultatif, visible par le client)" htmlFor="p-reason">
                <input id="p-reason" className={inputCls} style={inputStyle} value={pReason} maxLength={500}
                  onChange={(e) => setPReason(e.target.value)} />
              </Field>
              <label className="flex items-start gap-3 font-space text-[0.875rem] leading-snug" style={{ color: 'var(--c9-text-2)' }}>
                <input type="checkbox" checked={pFirm} onChange={(e) => setPFirm(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#e59864]" />
                Proposition ferme : si le client l&apos;accepte, le rendez-vous est confirmé.
              </label>
              <div className="flex gap-2">
                <Btn variant="ghost" className="shrink-0 !px-3" onClick={() => setProposing(false)}>Retour</Btn>
                <Btn variant="primary" className="flex-1 whitespace-nowrap" disabled={!pDate || !pTime || busy === 'proposer'}
                  onClick={() => run('proposer', { proposedStartAt: parisToIso(pDate, pTime), reason: pReason, firm: pFirm })}>
                  Enregistrer la proposition
                </Btn>
              </div>
              <p className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
                Le client n&apos;est pas prévenu automatiquement : envoyez-lui le message « Proposition de créneau » (bloc Messages WhatsApp). Il pourra accepter ou choisir un autre créneau.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {actions.map((a) => (
                <Btn key={a}
                  variant={a === 'confirmer' || a === 'accepter_proposition' || a === 'terminer' || a === 'valider_choix_client' ? 'primary' : 'secondary'}
                  disabled={busy !== null}
                  onClick={() => (a === 'proposer' ? openPropose() : a === 'terminer' ? openFinish('terminer') : run(a))}>
                  {busy === a ? '…' : ACTIONS[a].label}
                </Btn>
              ))}
              <Btn variant="secondary" disabled={busy !== null} onClick={() => setEditing(true)}>
                Modifier la fiche et le prix
              </Btn>

              {canCancel && !confirmCancel && (
                <Btn variant="danger" disabled={busy !== null} onClick={() => setConfirmCancel(true)}>
                  Annuler le rendez-vous
                </Btn>
              )}
              {confirmCancel && (
                <div className="flex flex-col gap-2 rounded-2xl p-3" style={{ border: '1px solid var(--c9-danger-line)' }}>
                  <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-danger)' }}>
                    Annuler ce rendez-vous ? Le dossier est conservé et pourra être rouvert.
                  </p>
                  <div className="flex gap-2">
                    <Btn variant="ghost" className="flex-1" onClick={() => setConfirmCancel(false)}>Non</Btn>
                    <Btn variant="danger" className="flex-1" disabled={busy === 'annuler'} onClick={() => run('annuler')}>
                      Oui, annuler
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          )}
        </Block>

        {/* ── Historique ── */}
        <Block title="Historique">
          <ol className="flex flex-col gap-3">
            {events.slice().reverse().map((ev) => (
              <li key={ev.id} className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--c9-text-3)' }}>
                  {fmtSlotFull(ev.at)}
                </span>
                <span className="font-space text-[0.875rem] leading-snug" style={{ color: 'var(--c9-text-2)' }}>
                  {ev.summary}
                </span>
              </li>
            ))}
          </ol>
        </Block>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </>,
  )
}
