// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : heures de l'atelier (Europe/Paris)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Toutes les heures saisies et affichées sont celles de Paris, même si le
//  téléphone ou l'ordinateur est réglé sur un autre fuseau. Les changements
//  d'heure (été / hiver) sont gérés.
//
// ─────────────────────────────────────────────────────────────────────────────

import { PREFERRED_PERIOD_LABEL, type PreferredPeriod } from '@/lib/agenda/types'

export const TZ = 'Europe/Paris'

type Parts = { y: number; m: number; d: number; h: number; mi: number }

function partsAt(ms: number): Parts {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(ms))
  const g = (t: string) => Number(f.find((p) => p.type === t)?.value)
  return { y: g('year'), m: g('month'), d: g('day'), h: g('hour'), mi: g('minute') }
}

/** « 2026-10-07 » + « 14:30 » (heure de Paris) → instant ISO. */
export function parisToIso(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const wall = Date.UTC(y, m - 1, d, h, mi)
  // Deux passes pour tomber juste autour des changements d'heure.
  let guess = wall
  for (let i = 0; i < 2; i++) {
    const p = partsAt(guess)
    const shown = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi)
    guess = guess - (shown - wall)
  }
  return new Date(guess).toISOString()
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Instant ISO → { date: 'YYYY-MM-DD', time: 'HH:MM' } à Paris. */
export function isoToParis(iso: string): { date: string; time: string } {
  const p = partsAt(new Date(iso).getTime())
  return { date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.mi)}` }
}

/** Date du jour à Paris, au format 'YYYY-MM-DD'. */
export function todayParis(): string {
  return isoToParis(new Date().toISOString()).date
}

/** Ajoute des jours à une date 'YYYY-MM-DD' (calendrier, sans fuseau). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** Lundi de la semaine contenant `date`. */
export function mondayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = dimanche
  return addDays(date, dow === 0 ? -6 : 1 - dow)
}

/** Bornes ISO [début, fin[ d'une journée de Paris. */
export function dayRange(date: string): { from: string; to: string } {
  return { from: parisToIso(date, '00:00'), to: parisToIso(addDays(date, 1), '00:00') }
}

/** Minutes écoulées depuis minuit (Paris) pour un instant. */
export function minutesOfDay(iso: string): number {
  const p = partsAt(new Date(iso).getTime())
  return p.h * 60 + p.mi
}

// ─── Libellés ────────────────────────────────────────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso))
    .replace(':', ' h ')
    .replace(/^0(\d)/, '$1')
}

export function fmtDayLong(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return cap(
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
      .format(new Date(Date.UTC(y, m - 1, d))),
  )
}

export function fmtDayShort(date: string): { dow: string; num: string } {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  return {
    dow: cap(new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'short' }).format(t).replace('.', '')),
    num: String(d),
  }
}

/** Souhait du client : « Mardi 13 octobre · matin » (ou « · moment indifférent »). */
export function fmtWish(date: string, period: PreferredPeriod | null): string {
  return `${fmtDayLong(date)} · ${period ? PREFERRED_PERIOD_LABEL[period].toLowerCase() : 'moment indifférent'}`
}

export function fmtSlotFull(iso: string): string {
  const { date } = isoToParis(iso)
  return `${fmtDayLong(date)} à ${fmtTime(iso)}`
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h} h ${pad(r)}` : `${h} h`
}

export function endIso(startIso: string, durationMin: number): string {
  return new Date(new Date(startIso).getTime() + durationMin * 60_000).toISOString()
}
