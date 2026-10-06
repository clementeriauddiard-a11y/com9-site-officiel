// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Créneaux libres proposés aux clients (fonctions pures)
//
//  Un créneau est proposé s'il :
//    • tient entièrement dans les horaires publics du jour (config/com9.ts) ;
//    • commence après le préavis minimum ;
//    • ne chevauche (marge comprise) aucun rendez-vous confirmé, aucune demande
//      en attente sur ce créneau, aucune proposition envoyée à un autre client ;
//    • ne chevauche aucune plage bloquée par COM'9.
//  Toutes les heures sont celles de Paris, changement d'heure compris.
// ─────────────────────────────────────────────────────────────────────────────

import { CRENEAUX, HORAIRES, type Plage } from '@/config/com9'
import type { Appointment, Block } from './types'

const MIN = 60_000

// ─── Heure de Paris ⇄ instant ────────────────────────────────────────────────

const parisParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
})

/** Décalage de Paris par rapport à UTC (minutes) à un instant donné. */
function parisOffsetMin(ms: number): number {
  const p = Object.fromEntries(parisParts.formatToParts(new Date(ms)).map((x) => [x.type, x.value]))
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute)
  return Math.round((asUtc - Math.floor(ms / MIN) * MIN) / MIN)
}

/** « 2026-10-13 » + « 19:30 » (heure de Paris) → ISO UTC. */
export function parisToIso(day: string, hm: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const [h, mi] = hm.split(':').map(Number)
  const naive = Date.UTC(y, m - 1, d, h, mi)
  let t = naive - parisOffsetMin(naive) * MIN
  t = naive - parisOffsetMin(t) * MIN // second passage : exact autour du changement d'heure
  return new Date(t).toISOString()
}

/** Jour (AAAA-MM-JJ) et heure (HH:MM) de Paris d'un instant. */
export function isoToParisParts(iso: string): { day: string; hm: string; weekday: number } {
  const p = Object.fromEntries(parisParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday)
  return { day: `${p.year}-${p.month}-${p.day}`, hm: `${p.hour}:${p.minute}`, weekday: wd }
}

export function weekdayOf(day: string): number {
  return new Date(day + 'T12:00:00Z').getUTCDay()
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Horaires publics du jour ; null = pas d'intervention. */
export function plageDuJour(day: string, horaires: readonly (Plage | null)[] = HORAIRES): Plage | null {
  return horaires[weekdayOf(day)] ?? null
}

// ─── Occupations ─────────────────────────────────────────────────────────────

export type Busy = { start: number; end: number; margin: boolean }

/**
 * Ce qui occupe le planning du point de vue d'un client :
 * rendez-vous confirmés, demandes avec créneau, propositions envoyées.
 */
export function busyFrom(appts: Appointment[], blocks: Block[], excludeId?: string): Busy[] {
  const out: Busy[] = []
  for (const a of appts) {
    if (a.id === excludeId) continue
    if (a.status === 'annule' || a.status === 'termine') continue
    const at = a.status === 'creneau_propose' ? (a.proposedStartAt ?? a.startAt) : a.startAt
    if (!at) continue
    const s = new Date(at).getTime()
    out.push({ start: s, end: s + a.durationMin * MIN, margin: true })
  }
  for (const b of blocks) {
    out.push({ start: new Date(b.startAt).getTime(), end: new Date(b.endAt).getTime(), margin: false })
  }
  return out
}

function isFree(start: number, end: number, busy: Busy[], marginMin: number): boolean {
  return busy.every((b) => {
    const m = b.margin ? marginMin * MIN : 0
    return !(start < b.end + m && b.start < end + m)
  })
}

// ─── Créneaux d'un jour ──────────────────────────────────────────────────────

export type SlotParams = {
  day: string
  durationMin: number
  busy: Busy[]
  marginMin: number
  now?: Date
  horaires?: readonly (Plage | null)[]
  pasMin?: number
  preavisMin?: number
}

/** Heures de début libres (ISO), dans l'ordre. */
export function freeSlots(p: SlotParams): string[] {
  const plage = plageDuJour(p.day, p.horaires)
  if (!plage) return []
  const pas = p.pasMin ?? CRENEAUX.pasMin
  const earliest = (p.now ?? new Date()).getTime() + (p.preavisMin ?? CRENEAUX.preavisMin) * MIN
  const open = new Date(parisToIso(p.day, plage.debut)).getTime()
  // 23:00 (ou 24:00) : fin de journée, calculée depuis l'ouverture.
  const [fh, fm] = plage.fin.split(':').map(Number)
  const [dh, dm] = plage.debut.split(':').map(Number)
  const close = open + ((fh * 60 + fm) - (dh * 60 + dm)) * MIN

  const out: string[] = []
  for (let s = open; s + p.durationMin * MIN <= close; s += pas * MIN) {
    if (s < earliest) continue
    if (isFree(s, s + p.durationMin * MIN, p.busy, p.marginMin)) out.push(new Date(s).toISOString())
  }
  return out
}

/** Le créneau demandé est-il encore libre et dans les horaires publics ? */
export function isSlotAvailable(startIso: string, p: Omit<SlotParams, 'day'>): boolean {
  const { day } = isoToParisParts(startIso)
  return freeSlots({ ...p, day }).includes(new Date(startIso).toISOString())
}

/** Le créneau est-il entièrement dans les horaires publics ? (indication pour l'agenda) */
export function withinPublicHours(startIso: string, durationMin: number,
  horaires: readonly (Plage | null)[] = HORAIRES): boolean {
  const { day } = isoToParisParts(startIso)
  const plage = plageDuJour(day, horaires)
  if (!plage) return false
  const s = new Date(startIso).getTime()
  const open = new Date(parisToIso(day, plage.debut)).getTime()
  const [fh, fm] = plage.fin.split(':').map(Number)
  const [dh, dm] = plage.debut.split(':').map(Number)
  const close = open + ((fh * 60 + fm) - (dh * 60 + dm)) * MIN
  return s >= open && s + durationMin * MIN <= close
}

/** Une intervention [start, start+durée[ chevauche-t-elle une plage bloquée ? */
export function overlapsBlock(startIso: string, durationMin: number, b: Pick<Block, 'startAt' | 'endAt'>): boolean {
  const s = new Date(startIso).getTime()
  const e = s + durationMin * MIN
  return s < new Date(b.endAt).getTime() && new Date(b.startAt).getTime() < e
}
