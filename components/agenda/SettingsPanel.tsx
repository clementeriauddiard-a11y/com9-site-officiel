'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : réglages du planning (durées, marge, plage affichée)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { REPAIRS } from '@/data/tarifs'
import { validateSettings } from '@/lib/agenda/logic'
import type { AgendaSettings } from '@/lib/agenda/types'
import { ApiError, api } from './api'
import { Btn, ErrorBox, Field, inputCls, inputStyle } from './ui'

export default function SettingsPanel({ settings, onSaved, onClose }: {
  settings: AgendaSettings
  onSaved: (s: AgendaSettings) => void
  onClose: () => void
}) {
  const [d, setD] = useState({
    ecran: String(settings.durations.ecran),
    batterie: String(settings.durations.batterie),
    vitre: String(settings.durations.vitre),
  })
  const [margin, setMargin] = useState(String(settings.marginMin))
  const [h0, setH0] = useState(String(settings.dayStartHour))
  const [h1, setH1] = useState(String(settings.dayEndHour))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; errors?: string[] } | null>(null)

  const n = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v) : -1)

  async function save() {
    const next: AgendaSettings = {
      durations: { ecran: n(d.ecran), batterie: n(d.batterie), vitre: n(d.vitre) },
      marginMin: n(margin),
      dayStartHour: n(h0),
      dayEndHour: n(h1),
    }
    const errors = validateSettings(next)
    if (errors.length) { setError({ message: 'Réglages invalides.', errors }); return }
    setBusy(true)
    setError(null)
    try {
      const { settings: saved } = await api.saveSettings(next)
      onSaved(saved)
    } catch (e) {
      setError({ message: e instanceof ApiError ? e.message : 'Enregistrement impossible.', errors: e instanceof ApiError ? e.errors : [] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-1 font-space text-[1rem] font-semibold">Durée prévue par prestation</h3>
        <p className="mb-3 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
          Proposée à la création d&apos;un rendez-vous, modifiable fiche par fiche.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {REPAIRS.map((r) => (
            <Field key={r.id} label={`${r.label} (min)`} htmlFor={`s-${r.id}`}>
              <input id={`s-${r.id}`} className={inputCls} style={inputStyle} inputMode="numeric"
                value={d[r.id]} onChange={(e) => setD({ ...d, [r.id]: e.target.value })} />
            </Field>
          ))}
        </div>
      </div>

      <Field label="Marge entre deux rendez-vous confirmés (min)" htmlFor="s-margin"
        hint="Temps réservé au trajet et à l'installation. Il n'est pas calculé automatiquement : aucun service d'itinéraire n'est configuré.">
        <input id="s-margin" className={inputCls} style={inputStyle} inputMode="numeric"
          value={margin} onChange={(e) => setMargin(e.target.value)} />
      </Field>

      <div>
        <h3 className="mb-3 font-space text-[1rem] font-semibold">Plage affichée dans la vue semaine</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Début (heure)" htmlFor="s-h0">
            <input id="s-h0" className={inputCls} style={inputStyle} inputMode="numeric" value={h0} onChange={(e) => setH0(e.target.value)} />
          </Field>
          <Field label="Fin (heure)" htmlFor="s-h1">
            <input id="s-h1" className={inputCls} style={inputStyle} inputMode="numeric" value={h1} onChange={(e) => setH1(e.target.value)} />
          </Field>
        </div>
      </div>

      {error && <ErrorBox message={error.message} errors={error.errors} />}

      <div className="flex gap-3">
        <Btn variant="ghost" className="shrink-0 !px-3" onClick={onClose}>Fermer</Btn>
        <Btn variant="primary" className="flex-1 whitespace-nowrap" disabled={busy} onClick={save}>
          {busy ? 'Enregistrement…' : 'Enregistrer les réglages'}
        </Btn>
      </div>
    </div>
  )
}
