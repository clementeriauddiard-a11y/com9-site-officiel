'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : fiche d'un rendez-vous
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { REPAIRS, ZONES } from '@/data/tarifs'
import {
  ACTIONS,
  apptTotal,
  availableActions,
  telHref,
  waHref,
  type ActionId,
} from '@/lib/agenda/logic'
import {
  ORDER_DELAY_NOTE,
  ORIGIN_LABEL,
  PART_STATUSES,
  PART_STATUS_LABEL,
  partNeedsOrder,
  type AgendaSettings,
  type ApptEvent,
  type Appointment,
  type PartStatus,
} from '@/lib/agenda/types'
import ApptForm from './ApptForm'
import { ApiError, api, type ConflictInfo } from './api'
import { endIso, fmtDuration, fmtSlotFull, fmtTime, isoToParis, parisToIso } from './time'
import { Btn, Chip, ErrorBox, Field, PartChip, StatusChip, copyText, inputCls, inputStyle } from './ui'

type Props = {
  id: string
  settings: AgendaSettings
  onClose: () => void
  onChanged: () => void
}

const repairLabel = (id: string) => REPAIRS.find((r) => r.id === id)?.label ?? id

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

function Block({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] p-5"
      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--c9-hairline-soft)' }}>
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

  // Proposition d'un autre créneau
  const [pDate, setPDate] = useState('')
  const [pTime, setPTime] = useState('')
  const [pReason, setPReason] = useState('')
  const [pFirm, setPFirm] = useState(true)

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
        style={{ background: 'rgba(5,10,20,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-y-auto sm:max-w-[540px]"
        style={{ background: 'var(--c9-bg)', borderLeft: '1px solid var(--c9-hairline)', boxShadow: '-30px 0 80px -30px rgba(0,0,0,0.7)' }}>
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
  const total = apptTotal(appt)
  const zone = ZONES.find((z) => z.id === appt.zone)
  const actions = availableActions(appt.status).filter((a) => a !== 'annuler')
  const canCancel = availableActions(appt.status).includes('annuler')

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
            <Chip tone="rgba(255,255,255,0.6)">{ORIGIN_LABEL[appt.origin]}</Chip>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer la fiche"
          className="c9-back flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
        {/* ── Contact ── */}
        <Block title="Contact">
          <p className="select-all font-space text-lg font-semibold tabular-nums">{appt.clientPhone}</p>
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
          <p className="-mt-1 font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>{appt.quality}</p>
          <div className="c9-divider my-1" />
          <Row label="Réparation">{appt.repairPrice} €</Row>
          <Row label="Déplacement">
            {appt.travelFee !== null ? `${appt.travelFee} €` : zone?.id === 'devis' ? 'Sur devis' : 'Non défini'}
          </Row>
          {zone && (
            <p className="-mt-1 text-right font-space text-[0.75rem]"
              style={{ color: appt.zoneVerified ? 'var(--c9-text-3)' : '#f5b94a' }}>
              {zone.full}{appt.zoneVerified ? '' : ' — zone provisoire, à vérifier'}
            </p>
          )}
          <div className="c9-divider my-1" />
          <div className="flex items-baseline justify-between">
            <span className="font-space font-semibold">Total</span>
            <span className="font-space text-xl font-semibold tabular-nums">
              {total !== null ? `${total} €` : 'Déplacement sur devis'}
            </span>
          </div>
        </Block>

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
          {appt.proposedStartAt && (
            <div className="mt-1 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(180,156,255,0.08)', border: '1px solid rgba(180,156,255,0.35)' }}>
              <p className="font-space text-[0.875rem] font-semibold" style={{ color: '#d4c6ff' }}>
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
            <p className="font-space text-[0.8125rem]" style={{ color: '#f5b94a' }}>
              {ORDER_DELAY_NOTE} <span style={{ color: 'var(--c9-text-3)' }}>Estimation, pas une garantie.</span>
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

          {proposing ? (
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
              <Field label="Motif (facultatif)" htmlFor="p-reason">
                <input id="p-reason" className={inputCls} style={inputStyle} value={pReason} maxLength={500}
                  onChange={(e) => setPReason(e.target.value)} />
              </Field>
              <label className="flex items-start gap-3 font-space text-[0.875rem] leading-snug" style={{ color: 'var(--c9-text-2)' }}>
                <input type="checkbox" checked={pFirm} onChange={(e) => setPFirm(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#3ad9ff]" />
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
                Le client n&apos;est pas prévenu automatiquement : envoyez-lui la proposition par WhatsApp ou par téléphone.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {actions.map((a) => (
                <Btn key={a}
                  variant={a === 'confirmer' || a === 'accepter_proposition' || a === 'terminer' ? 'primary' : 'secondary'}
                  disabled={busy !== null}
                  onClick={() => (a === 'proposer' ? openPropose() : run(a))}>
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
                <div className="flex flex-col gap-2 rounded-2xl p-3" style={{ border: '1px solid rgba(248,113,113,0.35)' }}>
                  <p className="font-space text-[0.875rem]" style={{ color: '#fecaca' }}>
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
