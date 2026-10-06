'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Suivi client (page ouverte depuis le lien personnel)
//
//  Selon l'état : « Accepter » la proposition de COM'9, « Choisir un autre
//  créneau » parmi les créneaux libres, ou demander l'annulation.
//  Un rendez-vous confirmé ne bouge jamais tout seul : COM'9 valide.
//  Aucun paiement en ligne.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { ClientAction, ClientView } from '@/lib/agenda/service'
import { euros } from '@/lib/money'
import { Btn, ErrorBox, Field, Line, Notice, inputCls, inputStyle } from '@/components/ui/kit'
import ContactActions from '@/components/ui/ContactActions'
import SlotPicker, { type DayAvailability } from './SlotPicker'

const TONE: Record<ClientView['status'], string> = {
  demande_recue: 'var(--c9-warn)',
  creneau_propose: 'var(--c9-accent-text)',
  confirme: 'var(--c9-ok)',
  en_route: 'var(--c9-ok)',
  en_cours: 'var(--c9-ok)',
  termine: 'var(--c9-text-3)',
  annule: 'var(--c9-danger)',
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`${accent ? 'c9-surface-accent' : 'c9-surface'} flex flex-col gap-3 rounded-[24px] p-5 sm:p-7`}>{children}</div>
  )
}

type Mode = null | 'autre_creneau' | 'annulation'

export default function TrackingView({ token, initial }: { token: string; initial: ClientView }) {
  const [view, setView] = useState(initial)
  const [mode, setMode] = useState<Mode>(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [days, setDays] = useState<DayAvailability[] | null>(null)
  const [daysLoading, setDaysLoading] = useState(false)
  const [daysError, setDaysError] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)

  const can = (a: ClientAction) => view.actions.includes(a)

  async function openSlots() {
    setMode('autre_creneau')
    setErrors([])
    setDone(null)
    setSlot(null)
    setDaysLoading(true)
    setDaysError(null)
    try {
      const res = await fetch(`/api/suivi/${token}/creneaux`, { cache: 'no-store' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Créneaux indisponibles.')
      setDays(d.days ?? [])
    } catch (e) {
      setDaysError(e instanceof Error ? e.message : 'Créneaux indisponibles.')
    } finally {
      setDaysLoading(false)
    }
  }

  async function send(action: ClientAction) {
    setErrors([])
    if (action === 'autre_creneau' && !slot) {
      setErrors(['Choisissez un créneau.'])
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/suivi/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          message,
          expectedProposal: view.proposal?.iso,
          startAt: action === 'autre_creneau' ? slot : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors(Array.isArray(data.errors) && data.errors.length ? data.errors : [data.error ?? 'Envoi impossible.'])
        if (data.view) setView(data.view)
        if (res.status === 409 && action === 'autre_creneau') await openSlots()
        return
      }
      setView(data.view)
      setMode(null)
      setMessage('')
      setDone(
        action === 'accepter'
          ? (data.view.status === 'confirme' ? 'Rendez-vous confirmé. À bientôt !' : 'Votre accord a été transmis à COM’9.')
          : action === 'autre_creneau' ? 'Votre nouveau créneau a été transmis à COM’9.'
          : 'Votre demande d’annulation a été transmise à COM’9.',
      )
    } catch {
      setErrors(['Connexion impossible. Vérifiez le réseau puis réessayez.'])
    } finally {
      setBusy(false)
    }
  }

  const travelLabel = view.outOfArea ? 'Hors zone' : view.travelFeeCents !== null ? euros(view.travelFeeCents) : 'À confirmer'

  return (
    <div className="flex flex-col gap-5" data-tracking>
      {/* ── État ── */}
      <Card accent={view.status === 'creneau_propose'}>
        <span className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold" style={{ color: TONE[view.status] }}>
          <span className="h-2 w-2 rounded-full" style={{ background: TONE[view.status] }} />
          {view.title}
        </span>
        {view.slot && <p className="text-[1.375rem] font-semibold leading-snug tracking-[-0.02em]">{view.slot}</p>}
        {view.requestedSlot && (
          <p className="text-[1.125rem] font-medium leading-snug">Créneau demandé : <b>{view.requestedSlot}</b></p>
        )}
        {view.proposal && (
          <div className="flex flex-col gap-1">
            <p className="text-[1.375rem] font-semibold leading-snug tracking-[-0.02em]">{view.proposal.label}</p>
            {view.proposal.reason && <p style={{ color: 'var(--c9-text-2)' }}>Motif : {view.proposal.reason}</p>}
          </div>
        )}
        <p style={{ color: 'var(--c9-text-2)' }}>{view.text}</p>
        {view.clientSlot && (
          <Notice tone="warn" title="Changement demandé">Vous avez demandé : {view.clientSlot}. COM&apos;9 va vous répondre.</Notice>
        )}
        {view.pendingRequest && !view.clientSlot && <Notice tone="info">{view.pendingRequest}</Notice>}
        {view.partNote && <Notice tone="warn">{view.partNote}</Notice>}
      </Card>

      {done && <Notice tone="ok" role="status" title={done} />}

      {/* ── Actions ── */}
      {view.actions.length > 0 && !mode && (
        <div className="flex flex-col gap-2.5">
          {can('accepter') && (
            <Btn variant="primary" size="lg" disabled={busy} onClick={() => send('accepter')}>
              {busy ? '…' : 'Accepter'}
            </Btn>
          )}
          {can('autre_creneau') && (
            <Btn variant={can('accepter') ? 'secondary' : 'primary'} size="lg" disabled={busy} onClick={openSlots}>
              Choisir un autre créneau
            </Btn>
          )}
          {can('annulation') && (
            <button type="button" className="self-center rounded-xl px-3 text-[0.9375rem] font-medium underline underline-offset-4"
              style={{ color: 'var(--c9-text-3)', minHeight: 44 }} onClick={() => { setMode('annulation'); setErrors([]); setDone(null) }}>
              Demander l&apos;annulation
            </button>
          )}
        </div>
      )}

      {mode === 'autre_creneau' && (
        <Card>
          <p className="text-[1.0625rem] font-semibold">Choisir un autre créneau</p>
          {view.status === 'confirme' && (
            <p style={{ color: 'var(--c9-text-2)' }}>Votre rendez-vous actuel reste prévu tant que COM&apos;9 n&apos;a pas validé le changement.</p>
          )}
          <SlotPicker days={days} loading={daysLoading} error={daysError} value={slot} onChange={setSlot} />
          <Field label="Message" htmlFor="t-msg" optional>
            <input id="t-msg" className={inputCls} style={inputStyle} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          {errors.length > 0 && <ErrorBox message={errors[0]} errors={errors.slice(1)} />}
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Btn variant="primary" size="lg" className="sm:flex-1" disabled={busy || !slot} onClick={() => send('autre_creneau')}>
              {busy ? 'Envoi…' : 'Envoyer ce créneau'}
            </Btn>
            <Btn variant="ghost" size="lg" onClick={() => setMode(null)}>Retour</Btn>
          </div>
        </Card>
      )}

      {mode === 'annulation' && (
        <Card>
          <p className="text-[1.0625rem] font-semibold">Demander l&apos;annulation</p>
          <p style={{ color: 'var(--c9-text-2)' }}>COM&apos;9 recevra votre demande et vous confirmera l&apos;annulation.</p>
          <Field label="Message" htmlFor="t-cancel" optional>
            <input id="t-cancel" className={inputCls} style={inputStyle} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          {errors.length > 0 && <ErrorBox message={errors[0]} />}
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Btn variant="danger" size="lg" className="sm:flex-1" disabled={busy} onClick={() => send('annulation')}>
              {busy ? 'Envoi…' : 'Envoyer la demande d’annulation'}
            </Btn>
            <Btn variant="ghost" size="lg" onClick={() => setMode(null)}>Retour</Btn>
          </div>
        </Card>
      )}

      {errors.length > 0 && !mode && <ErrorBox message={errors[0]} />}

      {/* ── Prestation ── */}
      <Card>
        <p className="text-[1.0625rem] font-semibold">{view.model} · {view.repairLabel}</p>
        {view.quality && <p className="-mt-2" style={{ color: 'var(--c9-text-2)' }}>{view.quality}</p>}
        {view.symptomLabel && <p className="-mt-2" style={{ color: 'var(--c9-text-2)' }}>{view.symptomLabel}</p>}
        <div className="c9-divider" />
        <Line label="Réparation" value={view.repairPriceCents !== null ? euros(view.repairPriceCents) : 'Prix sur place'} />
        <Line label="Déplacement" value={travelLabel} />
        {view.zoneToConfirm && (
          <p className="-mt-2 text-right text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>confirmé par COM&apos;9 avec votre adresse</p>
        )}
        <div className="c9-divider" />
        <Line label="Total" strong value={view.totalCents !== null ? euros(view.totalCents) : view.repairPriceCents === null ? 'Après diagnostic' : 'À confirmer'} />
        {view.diagnosticRule && <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>{view.diagnosticRule}</p>}
        <p className="text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
          Paiement après l&apos;intervention : carte bancaire, espèces ou virement. Aucun acompte.
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <p style={{ color: 'var(--c9-text-2)' }}>Une question ?</p>
        <ContactActions compact />
      </div>
      <p className="text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
        Ce lien est personnel : ne le partagez pas.
      </p>
    </div>
  )
}
