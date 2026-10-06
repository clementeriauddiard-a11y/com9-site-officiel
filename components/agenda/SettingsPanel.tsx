'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : réglages du planning (durées, marge, plage affichée)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ALL_REPAIRS, REPAIR_LABEL, type RepairId } from '@/data/tarifs'
import { HORAIRES_TEXTE } from '@/config/com9'
import { validateSettings } from '@/lib/agenda/logic'
import type { AgendaSettings } from '@/lib/agenda/types'
import { ApiError, api } from './api'
import { Btn, ErrorBox, Field, inputCls, inputStyle } from './ui'
import SecurityPanel from './SecurityPanel'

export default function SettingsPanel({ settings, onSaved, onClose }: {
  settings: AgendaSettings
  onSaved: (s: AgendaSettings) => void
  onClose: () => void
}) {
  const [d, setD] = useState<Record<RepairId, string>>(
    Object.fromEntries(ALL_REPAIRS.map((r) => [r, String(settings.durations[r])])) as Record<RepairId, string>,
  )
  const [margin, setMargin] = useState(String(settings.marginMin))
  const [h0, setH0] = useState(String(settings.dayStartHour))
  const [h1, setH1] = useState(String(settings.dayEndHour))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; errors?: string[] } | null>(null)

  const n = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v) : -1)

  async function save() {
    const next: AgendaSettings = {
      durations: Object.fromEntries(ALL_REPAIRS.map((r) => [r, n(d[r])])) as Record<RepairId, number>,
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ALL_REPAIRS.map((r) => (
            <Field key={r} label={`${REPAIR_LABEL[r]} (min)`} htmlFor={`s-${r}`}>
              <input id={`s-${r}`} className={inputCls} style={inputStyle} inputMode="numeric"
                value={d[r]} onChange={(e) => setD({ ...d, [r]: e.target.value })} />
            </Field>
          ))}
        </div>
      </div>

      <Field label="Marge entre deux rendez-vous confirmés (min)" htmlFor="s-margin"
        hint="Temps réservé au trajet et à l'installation entre deux interventions. Les créneaux proposés aux clients en tiennent compte.">
        <input id="s-margin" className={inputCls} style={inputStyle} inputMode="numeric"
          value={margin} onChange={(e) => setMargin(e.target.value)} />
      </Field>

      <div className="rounded-2xl p-4" style={{ border: '1px solid var(--c9-hairline-soft)' }}>
        <h3 className="mb-1 font-space text-[1rem] font-semibold">Horaires proposés aux clients</h3>
        {HORAIRES_TEXTE.lignes.map((l) => (
          <p key={l.jours} className="font-space text-[0.875rem] tabular-nums" style={{ color: 'var(--c9-text-2)' }}>
            {l.jours} : {l.heures}
          </p>
        ))}
        <p className="mt-1 font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
          Modifiables dans config/com9.ts. Vous pouvez toujours créer un rendez-vous hors de ces horaires, et bloquer une plage depuis l&apos;agenda.
        </p>
      </div>

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

      <div className="c9-divider" />
      <SecurityPanel />
    </div>
  )
}
