'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : vues Aujourd'hui, Semaine et Demandes
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { REPAIRS } from '@/data/tarifs'
import { apptTotal, telHref, waHref } from '@/lib/agenda/logic'
import { BLOCKING_STATUSES, type AgendaSettings } from '@/lib/agenda/types'
import type { ApptLite } from './api'
import {
  addDays,
  endIso,
  fmtDayLong,
  fmtDayShort,
  fmtDuration,
  fmtSlotFull,
  fmtTime,
  isoToParis,
  minutesOfDay,
  todayParis,
} from './time'
import { PartChip, STATUS_TONE, StatusChip } from './ui'

const repairLabel = (id: string) => REPAIRS.find((r) => r.id === id)?.label ?? id

/** Créneau à afficher : le créneau fixé, sinon le créneau proposé. */
function slotOf(a: ApptLite): { iso: string | null; proposed: boolean } {
  if (a.startAt) return { iso: a.startAt, proposed: false }
  if (a.proposedStartAt) return { iso: a.proposedStartAt, proposed: true }
  return { iso: null, proposed: false }
}

/** L'état de la pièce ne s'affiche que s'il demande de l'attention. */
const partNeedsAttention = (p: ApptLite['partStatus']) =>
  p === null || p === 'a_commander' || p === 'commandee' || p === 'indisponible'

// ─── Icônes d'action rapide ──────────────────────────────────────────────────

function QuickLinks({ phone }: { phone: string }) {
  const tel = telHref(phone)
  const wa = waHref(phone)
  const cls = 'c9-back flex h-11 w-11 items-center justify-center rounded-xl'
  const st = { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c9-hairline-soft)' }
  return (
    <div className="flex shrink-0 gap-1.5" onClick={(e) => e.stopPropagation()}>
      {tel && (
        <a href={tel} aria-label="Appeler" title="Appeler" className={cls} style={st}>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
          </svg>
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className={cls} style={st}>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.7.31 1.26.49 1.7.63.71.22 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.41" />
          </svg>
        </a>
      )}
    </div>
  )
}

// ─── Carte de rendez-vous (listes) ───────────────────────────────────────────

export function ApptCard({ a, onOpen, showDate = false }: { a: ApptLite; onOpen: (id: string) => void; showDate?: boolean }) {
  const { iso, proposed } = slotOf(a)
  const total = apptTotal(a)
  const cancelled = a.status === 'annule'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(a.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(a.id) }}
      className="flex cursor-pointer gap-4 rounded-[22px] p-4 text-left transition-colors duration-200 focus-visible:outline-2"
      style={{
        background: 'rgba(255,255,255,0.045)',
        border: `1px solid ${proposed ? 'rgba(180,156,255,0.35)' : 'var(--c9-hairline-soft)'}`,
        borderStyle: proposed ? 'dashed' : 'solid',
        opacity: cancelled ? 0.5 : 1,
      }}
    >
      {/* Heure */}
      <div className="flex w-[4.25rem] shrink-0 flex-col whitespace-nowrap pt-0.5">
        {iso ? (
          <>
            <span className="font-space text-[1rem] font-semibold leading-none tabular-nums">{fmtTime(iso)}</span>
            <span className="mt-1 font-space text-[0.75rem] tabular-nums" style={{ color: 'var(--c9-text-3)' }}>
              {fmtTime(endIso(iso, a.durationMin))}
            </span>
            {showDate && (
              <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--c9-text-3)' }}>
                {fmtDayShort(isoToParis(iso).date).dow} {fmtDayShort(isoToParis(iso).date).num}
              </span>
            )}
          </>
        ) : (
          <span className="font-space text-[0.8125rem] leading-tight" style={{ color: 'var(--c9-text-3)' }}>Sans créneau</span>
        )}
        <span className="mt-2 h-full w-[3px] rounded-full" style={{ background: STATUS_TONE[a.status], opacity: 0.8 }} />
      </div>

      {/* Détail */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <p className={`min-w-0 truncate font-space text-[1rem] font-semibold ${cancelled ? 'line-through' : ''}`}>
            {a.clientName}
          </p>
          <QuickLinks phone={a.clientPhone} />
        </div>
        <p className="-mt-1 truncate font-space text-[0.875rem]" style={{ color: 'var(--c9-text-2)' }}>
          {a.model} · {repairLabel(a.repair)} · {a.quality}
        </p>
        <p className="truncate font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>{a.address}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <StatusChip status={a.status} />
          {proposed && <span className="font-space text-[0.75rem]" style={{ color: '#d4c6ff' }}>créneau proposé</span>}
          {partNeedsAttention(a.partStatus) && <PartChip part={a.partStatus} />}
          <span className="ml-auto font-space text-[0.875rem] font-semibold tabular-nums" style={{ color: 'var(--c9-text-2)' }}>
            {total !== null ? `${total} €` : `${a.repairPrice} € + dépl.`}
          </span>
        </div>
      </div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] px-6 py-12 text-center font-space text-[0.9375rem]"
      style={{ border: '1px dashed var(--c9-hairline)', color: 'var(--c9-text-3)' }}>
      {children}
    </div>
  )
}

function Nav({ label, sub, onPrev, onNext, onToday, todayLabel, isToday }: {
  label: string; sub?: string; onPrev: () => void; onNext: () => void; onToday: () => void; todayLabel: string; isToday: boolean
}) {
  const arrow = 'c9-back flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'
  const st = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c9-hairline-soft)' }
  return (
    <div className="mb-5 flex items-center gap-2">
      <button type="button" aria-label="Précédent" onClick={onPrev} className={arrow} style={st}>
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate font-space text-[1.0625rem] font-semibold">{label}</p>
        {sub && <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>{sub}</p>}
      </div>
      <button type="button" aria-label="Suivant" onClick={onNext} className={arrow} style={st}>
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
      </button>
      {!isToday && (
        <button type="button" onClick={onToday} className="c9-back rounded-xl px-3 font-space text-[0.8125rem] font-medium"
          style={{ minHeight: '44px', ...st }}>
          {todayLabel}
        </button>
      )}
    </div>
  )
}

// ─── Vue « Aujourd'hui » (téléphone) ─────────────────────────────────────────

export function DayView({ date, items, onDate, onOpen }: {
  date: string; items: ApptLite[]; onDate: (d: string) => void; onOpen: (id: string) => void
}) {
  const today = todayParis()
  const sorted = useMemo(
    () => [...items].sort((a, b) => (slotOf(a).iso ?? '').localeCompare(slotOf(b).iso ?? '')),
    [items],
  )
  const blocking = items.filter((a) => BLOCKING_STATUSES.includes(a.status) && a.startAt && isoToParis(a.startAt).date === date)
  const minutes = blocking.reduce((s, a) => s + a.durationMin, 0)

  const label = date === today ? "Aujourd'hui" : fmtDayLong(date)
  const sub = date === today
    ? fmtDayLong(date)
    : blocking.length ? `${blocking.length} rendez-vous confirmé${blocking.length > 1 ? 's' : ''}` : undefined

  return (
    <div>
      <Nav label={label} sub={sub} onPrev={() => onDate(addDays(date, -1))} onNext={() => onDate(addDays(date, 1))}
        onToday={() => onDate(today)} todayLabel="Aujourd'hui" isToday={date === today} />

      {blocking.length > 0 && (
        <p className="mb-4 font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
          {blocking.length} intervention{blocking.length > 1 ? 's' : ''} confirmée{blocking.length > 1 ? 's' : ''} · {fmtDuration(minutes)} prévues
        </p>
      )}

      {sorted.length === 0 ? (
        <Empty>Aucun rendez-vous ce jour.</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((a) => <ApptCard key={a.id} a={a} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  )
}

// ─── Vue « Semaine » (ordinateur) ────────────────────────────────────────────

const HOUR_PX = 52

/** Répartit les blocs qui se recouvrent sur plusieurs colonnes. */
function lanes(items: { a: ApptLite; s: number; e: number }[]) {
  const sorted = [...items].sort((x, y) => x.s - y.s)
  const ends: number[] = []
  const placed = sorted.map((it) => {
    let lane = ends.findIndex((end) => end <= it.s)
    if (lane === -1) { lane = ends.length; ends.push(it.e) } else ends[lane] = it.e
    return { ...it, lane }
  })
  return { placed, count: Math.max(1, ends.length) }
}

export function WeekView({ monday, items, settings, onWeek, onOpen }: {
  monday: string; items: ApptLite[]; settings: AgendaSettings; onWeek: (m: string) => void; onOpen: (id: string) => void
}) {
  const today = todayParis()
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const { dayStartHour: h0, dayEndHour: h1 } = settings
  const hours = Array.from({ length: h1 - h0 }, (_, i) => h0 + i)
  const height = (h1 - h0) * HOUR_PX

  const byDay = useMemo(() => {
    const map: Record<string, { a: ApptLite; s: number; e: number }[]> = {}
    for (const a of items) {
      const { iso } = slotOf(a)
      if (!iso) continue
      const d = isoToParis(iso).date
      const s = minutesOfDay(iso)
      ;(map[d] ??= []).push({ a, s, e: s + a.durationMin })
    }
    return map
  }, [items])

  const end = addDays(monday, 6)
  // « du 5 au 11 octobre », ou « du 28 septembre au 4 octobre » à cheval sur deux mois
  const dropDow = (d: string) => fmtDayLong(d).replace(/^\S+\s/, '')
  const sameMonth = monday.slice(0, 7) === end.slice(0, 7)
  const label = `Semaine du ${sameMonth ? fmtDayShort(monday).num : dropDow(monday)} au ${dropDow(end)}`

  return (
    <div>
      <Nav label={label} onPrev={() => onWeek(addDays(monday, -7))} onNext={() => onWeek(addDays(monday, 7))}
        onToday={() => onWeek(today)} todayLabel="Cette semaine" isToday={days.includes(today)} />

      {/* Grille horaire — ordinateur */}
      <div className="hidden overflow-x-auto rounded-[22px] lg:block"
        style={{ border: '1px solid var(--c9-hairline-soft)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid min-w-[880px]" style={{ gridTemplateColumns: '56px repeat(7, minmax(0, 1fr))' }}>
          <div />
          {days.map((d) => {
            const f = fmtDayShort(d)
            const isT = d === today
            return (
              <div key={d} className="flex flex-col items-center gap-0.5 py-3"
                style={{ borderLeft: '1px solid var(--c9-hairline-soft)', borderBottom: '1px solid var(--c9-hairline-soft)' }}>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: isT ? 'var(--c9-accent)' : 'var(--c9-text-3)' }}>{f.dow}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full font-space text-[0.9375rem] font-semibold"
                  style={isT ? { background: 'var(--c9-accent)', color: '#06131f' } : undefined}>{f.num}</span>
              </div>
            )
          })}

          {/* Heures */}
          <div className="relative" style={{ height }}>
            {hours.map((h) => (
              <span key={h} className={`absolute right-2 font-mono text-[10px] tabular-nums ${h === h0 ? 'translate-y-1' : '-translate-y-1/2'}`}
                style={{ top: (h - h0) * HOUR_PX, color: 'var(--c9-text-3)' }}>
                {h} h
              </span>
            ))}
          </div>

          {/* Colonnes */}
          {days.map((d) => {
            const { placed, count } = lanes(byDay[d] ?? [])
            return (
              <div key={d} className="relative" style={{ height, borderLeft: '1px solid var(--c9-hairline-soft)' }}>
                {hours.map((h) => (
                  <div key={h} className="absolute inset-x-0" style={{ top: (h - h0) * HOUR_PX, borderTop: h !== h0 ? '1px solid var(--c9-hairline-soft)' : 'none' }} />
                ))}
                {placed.map(({ a, s, e, lane }) => {
                  const top = Math.max(0, (s / 60 - h0) * HOUR_PX)
                  const bottom = Math.min(height, (e / 60 - h0) * HOUR_PX)
                  const outside = e / 60 <= h0 || s / 60 >= h1
                  const proposed = !a.startAt
                  const tone = STATUS_TONE[a.status]
                  return (
                    <button key={a.id} type="button" onClick={() => onOpen(a.id)}
                      className="absolute overflow-hidden rounded-lg px-2 py-1.5 text-left transition-transform duration-150 hover:scale-[1.02]"
                      title={`${a.clientName} — ${a.model}`}
                      style={{
                        top: outside ? (s / 60 < h0 ? 0 : height - 28) : top,
                        height: outside ? 28 : Math.max(28, bottom - top - 2),
                        left: `calc(${(lane / count) * 100}% + 3px)`,
                        width: `calc(${100 / count}% - 6px)`,
                        background: `${tone}1f`,
                        border: `1px ${proposed ? 'dashed' : 'solid'} ${tone}88`,
                        borderLeft: `3px solid ${tone}`,
                        opacity: a.status === 'annule' ? 0.45 : 1,
                      }}>
                      <p className="truncate font-space text-[0.75rem] font-semibold leading-tight">
                        {fmtTime((a.startAt ?? a.proposedStartAt) as string)} {a.clientName}
                      </p>
                      <p className="truncate font-space text-[0.6875rem] leading-tight" style={{ color: 'var(--c9-text-2)' }}>
                        {a.model} · {repairLabel(a.repair)}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Liste par jour — téléphone et tablette */}
      <div className="flex flex-col gap-6 lg:hidden">
        {days.map((d) => {
          const list = (byDay[d] ?? []).map((x) => x.a)
          return (
            <section key={d}>
              <h3 className="mb-2.5 font-space text-[0.9375rem] font-semibold"
                style={{ color: d === today ? 'var(--c9-accent)' : 'var(--c9-text)' }}>
                {fmtDayLong(d)}
              </h3>
              {list.length === 0
                ? <p className="font-space text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>Aucun rendez-vous.</p>
                : <div className="flex flex-col gap-3">{list.map((a) => <ApptCard key={a.id} a={a} onOpen={onOpen} />)}</div>}
            </section>
          )
        })}
      </div>
    </div>
  )
}

// ─── Vue « Demandes à traiter » ──────────────────────────────────────────────

export function PendingView({ items, onOpen }: { items: ApptLite[]; onOpen: (id: string) => void }) {
  const received = items.filter((a) => a.status === 'demande_recue')
  const waiting = items.filter((a) => a.status === 'creneau_propose')

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-1 font-space text-[1.0625rem] font-semibold">À traiter</h3>
        <p className="mb-3 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
          Demandes reçues, de la plus ancienne à la plus récente. Une demande n&apos;est pas un rendez-vous confirmé.
        </p>
        {received.length === 0 ? <Empty>Aucune demande en attente.</Empty> : (
          <div className="flex flex-col gap-3">
            {received.map((a) => (
              <div key={a.id}>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--c9-text-3)' }}>
                  Reçue {fmtSlotFull(a.createdAt).replace(/^\S+\s/, 'le ')}
                </p>
                <ApptCard a={a} onOpen={onOpen} showDate />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-1 font-space text-[1.0625rem] font-semibold">En attente du client</h3>
        <p className="mb-3 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
          Un autre créneau a été proposé.
        </p>
        {waiting.length === 0 ? <Empty>Aucune proposition en attente.</Empty> : (
          <div className="flex flex-col gap-3">
            {waiting.map((a) => <ApptCard key={a.id} a={a} onOpen={onOpen} showDate />)}
          </div>
        )}
      </section>
    </div>
  )
}
