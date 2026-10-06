'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Choix d'un créneau libre (réservation et lien de suivi)
// Jours disponibles en pastilles, puis heures. Tout en heure de Paris.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'

export type DayAvailability = { day: string; slots: string[] }

const TZ = 'Europe/Paris'
const dow = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'short' })
const dnum = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', day: 'numeric' })
const mon = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', month: 'short' })
const longDay = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
const hhmm = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })

const noon = (d: string) => new Date(d + 'T12:00:00Z')
export const fmtHour = (iso: string) => hhmm.format(new Date(iso)).replace(':', 'h')
export const fmtLongDay = (d: string) => { const t = longDay.format(noon(d)); return t.charAt(0).toUpperCase() + t.slice(1) }

export default function SlotPicker({ days, loading, error, value, onChange }: {
  days: DayAvailability[] | null
  loading: boolean
  error?: string | null
  value: string | null
  onChange: (iso: string) => void
}) {
  const initial = useMemo(() => {
    if (!days?.length) return null
    if (value) return days.find((d) => d.slots.includes(value))?.day ?? days[0].day
    return days[0].day
  }, [days, value])
  const [day, setDay] = useState<string | null>(initial)
  useEffect(() => { if (!day || !days?.some((d) => d.day === day)) setDay(initial) }, [days, initial, day])

  if (loading) return <p style={{ color: 'var(--c9-text-3)' }}>Recherche des créneaux libres…</p>
  if (error) return <p role="alert" style={{ color: 'var(--c9-danger)' }}>{error}</p>
  if (!days || days.length === 0) {
    return <p style={{ color: 'var(--c9-text-2)' }}>Aucun créneau libre pour le moment. Appelez COM&apos;9 : une solution vous sera proposée.</p>
  }
  const current = days.find((d) => d.day === day) ?? days[0]

  return (
    <div className="flex flex-col gap-5" data-slot-picker>
      <div role="radiogroup" aria-label="Jour" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
        style={{ scrollbarWidth: 'none' }}>
        {days.map((d) => {
          const on = d.day === current.day
          return (
            <button key={d.day} type="button" role="radio" aria-checked={on} onClick={() => setDay(d.day)}
              aria-label={`${fmtLongDay(d.day)}, ${d.slots.length} créneau${d.slots.length > 1 ? 'x' : ''}`}
              className="c9-choice flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 py-2.5"
              style={{ minHeight: 84 }}>
              <span className="text-[0.75rem] capitalize" style={{ color: 'var(--c9-text-3)' }}>{dow.format(noon(d.day)).replace('.', '')}</span>
              <span className="text-[1.375rem] font-semibold tabular-nums leading-none">{dnum.format(noon(d.day))}</span>
              <span className="text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>{mon.format(noon(d.day)).replace('.', '')}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[0.9375rem] font-medium">{fmtLongDay(current.day)}</p>
        <div role="radiogroup" aria-label="Heure" className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {current.slots.map((iso) => (
            <button key={iso} type="button" role="radio" aria-checked={iso === value} onClick={() => onChange(iso)}
              className="c9-choice flex items-center justify-center text-[1rem] font-semibold tabular-nums" style={{ minHeight: 52 }}>
              {fmtHour(iso)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
