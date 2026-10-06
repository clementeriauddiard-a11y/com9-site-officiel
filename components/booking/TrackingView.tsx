'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Suivi client (page ouverte depuis le lien personnel)
//
//  Le client voit son rendez-vous, et peut selon le cas : accepter ou refuser
//  le créneau proposé, demander une autre disponibilité, demander un
//  changement ou l'annulation. Une demande ne modifie jamais un rendez-vous
//  confirmé toute seule : COM'9 décide. Aucun paiement en ligne.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, type ReactNode } from 'react'
import type { ClientAction, ClientView } from '@/lib/agenda/service'
import { BOOKING_HORIZON_DAYS, addDaysToDay, todayInParis } from '@/lib/agenda/logic'
import { PREFERRED_PERIODS, PREFERRED_PERIOD_LABEL, type PreferredPeriod } from '@/lib/agenda/types'
import { LINKS, PHONE } from '@/lib/links'
import { Choice, Label, Line, inputCls, inputStyle } from './ui'

const TONE: Record<ClientView['status'], string> = {
  demande_recue: '#f5b94a',
  creneau_propose: '#b49cff',
  confirme: '#3ad9ff',
  en_route: '#6fb4ff',
  en_cours: '#4ade80',
  termine: 'rgba(255,255,255,0.6)',
  annule: '#f87171',
}

function Card({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <div className={`${accent ? 'c9-surface-accent' : 'c9-surface'} flex flex-col gap-3 rounded-[24px] p-5 sm:p-7`}>
      {children}
    </div>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: 'var(--c9-text-3)' }}>{children}</p>
  )
}

function Button({ children, onClick, variant = 'secondary', disabled, type = 'button' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; type?: 'button' | 'submit'
}) {
  const style: React.CSSProperties =
    variant === 'primary'
      ? { background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)', color: '#06131f', boxShadow: '0 14px 40px -18px rgba(26,169,255,0.75)' }
      : variant === 'danger'
        ? { background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)', color: '#fca5a5' }
        : { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c9-hairline-lit)', color: 'var(--c9-text)' }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="flex w-full items-center justify-center rounded-2xl px-5 text-center font-space text-[0.9375rem] font-semibold transition-transform duration-200 active:scale-[0.985] disabled:opacity-50"
      style={{ minHeight: '52px', ...style }}>
      {children}
    </button>
  )
}

type Mode = null | 'refuser' | 'autre_dispo' | 'modification' | 'annulation'

export default function TrackingView({ token, initial }: { token: string; initial: ClientView }) {
  const [view, setView] = useState(initial)
  const [mode, setMode] = useState<Mode>(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState<string | null>(null)

  const today = useMemo(() => todayInParis(), [])
  const [date, setDate] = useState('')
  const [period, setPeriod] = useState<PreferredPeriod | 'indifferent' | null>(null)
  const [message, setMessage] = useState('')

  const can = (a: ClientAction) => view.actions.includes(a)

  async function send(action: ClientAction) {
    setErrors([])
    if ((action === 'autre_dispo' || action === 'modification') && (!date || period === null)) {
      setErrors(['Indiquez le jour souhaité et le moment de la journée.'])
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
          preferredDate: date || undefined,
          preferredPeriod: period && period !== 'indifferent' ? period : null,
          expectedProposal: view.proposal?.iso,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.view) {
        setView(data.view)
        setMode(null)
        setMessage('')
        setDone(
          action === 'accepter'
            ? (data.view.status === 'confirme' ? 'Merci ! Votre rendez-vous est confirmé.' : 'Merci ! Votre accord a été transmis à COM\'9.')
            : 'Votre réponse a bien été transmise à COM\'9.',
        )
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setErrors(Array.isArray(data.errors) && data.errors.length ? data.errors : [data.error ?? "La réponse n'a pas pu être envoyée."])
      if (res.status === 409) {
        // La situation a changé : on recharge la vue à jour.
        setTimeout(() => window.location.reload(), 2500)
      }
    } catch {
      setErrors(["La réponse n'a pas pu être envoyée. Vérifiez votre connexion."])
    } finally {
      setBusy(false)
    }
  }

  const travel = view.onQuote ? 'Sur devis' : view.travelFee === null ? 'À confirmer' : `${view.travelFee} €`

  return (
    <div className="flex flex-col gap-5">
      {/* État */}
      <Card accent={view.status === 'creneau_propose' || view.status === 'confirme'}>
        <span className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 font-space text-[0.8125rem] font-medium"
          style={{ color: TONE[view.status], border: `1px solid ${TONE[view.status]}55`, background: 'rgba(255,255,255,0.04)' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[view.status] }} />
          {view.title}
        </span>
        {view.slot && (
          <p className="font-space text-[1.375rem] font-semibold leading-snug" style={{ color: 'var(--c9-text)' }}>{view.slot}</p>
        )}
        <p className="font-space text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{view.text}</p>
        {done && (
          <p role="status" className="font-space text-[0.9375rem] font-semibold" style={{ color: '#4ade80' }}>{done}</p>
        )}
        {view.pendingRequest && !done && (
          <p className="font-space text-[0.875rem]" style={{ color: '#f5c46e' }}>{view.pendingRequest}</p>
        )}
      </Card>

      {/* Proposition de COM'9 */}
      {view.proposal && (
        <Card>
          <Kicker>Créneau proposé par COM&apos;9</Kicker>
          <p className="font-space text-[1.25rem] font-semibold" style={{ color: 'var(--c9-text)' }}>{view.proposal.label}</p>
          {view.proposal.reason && (
            <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>Motif : {view.proposal.reason}</p>
          )}
          <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
            {view.proposal.firm
              ? 'Si vous acceptez, votre rendez-vous est confirmé à ce créneau.'
              : 'Si vous acceptez, COM\'9 vous confirmera ensuite le rendez-vous.'}
          </p>
          {mode === null && (
            <div className="mt-1 flex flex-col gap-2.5">
              {can('accepter') && <Button variant="primary" disabled={busy} onClick={() => send('accepter')}>{busy ? 'Envoi…' : 'Accepter ce créneau'}</Button>}
              {can('autre_dispo') && <Button disabled={busy} onClick={() => setMode('autre_dispo')}>Demander une autre disponibilité</Button>}
              {can('refuser') && <Button disabled={busy} onClick={() => setMode('refuser')}>Refuser ce créneau</Button>}
            </div>
          )}
        </Card>
      )}

      {/* Formulaires de réponse */}
      {(mode === 'autre_dispo' || mode === 'modification') && (
        <Card>
          <Kicker>{mode === 'modification' ? 'Demander un autre créneau' : 'Autre disponibilité'}</Kicker>
          {mode === 'modification' && (
            <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }}>
              Votre rendez-vous actuel reste prévu tant que COM&apos;9 ne l&apos;a pas modifié.
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-date">Jour souhaité</Label>
            <input id="t-date" type="date" className={inputCls} style={inputStyle} min={today}
              max={addDaysToDay(today, BOOKING_HORIZON_DAYS)} value={date} onChange={(e) => setDate(e.target.value)} />
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
            <Label htmlFor="t-msg" optional>Précisions</Label>
            <textarea id="t-msg" rows={2} maxLength={300} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: '76px' }}
              placeholder="Ex. : plutôt après 17 h" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Button variant="primary" disabled={busy} onClick={() => send(mode)}>{busy ? 'Envoi…' : 'Envoyer ma demande'}</Button>
            <Button disabled={busy} onClick={() => { setMode(null); setErrors([]) }}>Retour</Button>
          </div>
        </Card>
      )}

      {(mode === 'refuser' || mode === 'annulation') && (
        <Card>
          <Kicker>{mode === 'refuser' ? 'Refuser le créneau proposé' : 'Demander l’annulation'}</Kicker>
          <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
            {mode === 'refuser'
              ? 'COM\'9 vous proposera une autre disponibilité.'
              : 'Votre demande est transmise à COM\'9, qui vous confirmera l’annulation.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-msg2" optional>Message</Label>
            <textarea id="t-msg2" rows={2} maxLength={300} className={`${inputCls} py-3`} style={{ ...inputStyle, minHeight: '76px' }}
              value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" disabled={busy} onClick={() => send(mode)}>
              {busy ? 'Envoi…' : mode === 'refuser' ? 'Confirmer le refus' : 'Confirmer la demande d’annulation'}
            </Button>
            <Button disabled={busy} onClick={() => { setMode(null); setErrors([]) }}>Retour</Button>
          </div>
        </Card>
      )}

      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl px-5 py-4 font-space text-[0.9375rem]"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)', color: '#fecaca' }}>
          <ul className="list-disc space-y-1 pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {/* Prestation et prix */}
      <Card>
        <Kicker>Votre réparation</Kicker>
        <p className="font-space text-[1.0625rem] font-semibold" style={{ color: 'var(--c9-text)' }}>{view.model} · {view.repairLabel}</p>
        <p className="font-space text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>{view.quality}</p>
        <div className="c9-divider my-1" />
        <Line label="Réparation" value={`${view.repairPrice} €`} />
        <Line label="Déplacement" value={travel} />
        {view.zoneToConfirm && (
          <p className="text-right font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>Zone à confirmer par COM&apos;9</p>
        )}
        <div className="c9-divider my-1" />
        {view.total !== null
          ? <Line label={view.zoneToConfirm ? 'Total indicatif' : 'Total'} value={`${view.total} €`} strong />
          : <Line label="Total" value={view.onQuote ? 'Sur devis' : 'À confirmer'} />}
        {view.partNote && (
          <p className="font-space text-[0.875rem]" style={{ color: '#f5c46e' }}>
            {view.partNote} <span style={{ color: 'var(--c9-text-3)' }}>Estimation, pas une garantie.</span>
          </p>
        )}
        {view.wish && !view.slot && (
          <>
            <div className="c9-divider my-1" />
            <Line label="Votre souhait" value={view.wish} />
          </>
        )}
      </Card>

      {/* Demandes possibles hors proposition */}
      {mode === null && !view.proposal && (can('autre_dispo') || can('modification') || can('annulation')) && (
        <div className="flex flex-col gap-2.5">
          {can('autre_dispo') && <Button onClick={() => setMode('autre_dispo')}>Indiquer une autre disponibilité</Button>}
          {can('modification') && <Button onClick={() => setMode('modification')}>Demander un autre créneau</Button>}
          {can('annulation') && <Button variant="danger" onClick={() => setMode('annulation')}>Demander l&apos;annulation</Button>}
        </div>
      )}

      <p className="text-center font-space text-[0.8125rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>
        Aucun paiement ni acompte n&apos;est demandé en ligne. Ce lien est personnel : ne le partagez pas.
        <br />
        Une question ?{' '}
        <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--c9-text-2)' }}>
          WhatsApp
        </a>
        {' · '}
        <a href={LINKS.phone} className="underline tabular-nums" style={{ color: 'var(--c9-text-2)' }}>
          {PHONE.display}
        </a>
      </p>
    </div>
  )
}
