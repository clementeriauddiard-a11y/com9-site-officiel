'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : bloquer une plage horaire (jamais proposée aux clients)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { BLOCK_REASONS, BLOCK_REASON_LABEL, type BlockReason } from '@/lib/agenda/types'
import { ApiError, api } from './api'
import { parisToIso } from './time'
import { Btn, ErrorBox, Field, Segmented, inputCls, inputStyle } from './ui'

export default function BlockForm({ defaultDate, onDone, onCancel }: {
  defaultDate: string
  onDone: () => void
  onCancel: () => void
}) {
  const [date, setDate] = useState(defaultDate)
  const [endDate, setEndDate] = useState(defaultDate)
  const [from, setFrom] = useState('19:00')
  const [to, setTo] = useState('23:00')
  const [reason, setReason] = useState<BlockReason | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; errors?: string[] } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) { setError({ message: 'Choisissez un motif.' }); return }
    if (!date || !from || !to) { setError({ message: 'Indiquez le jour et les heures.' }); return }
    const startAt = parisToIso(date, from)
    const endAt = parisToIso(endDate || date, to)
    if (new Date(endAt) <= new Date(startAt)) { setError({ message: 'La fin doit être après le début.' }); return }
    setBusy(true)
    setError(null)
    try {
      await api.addBlock({ startAt, endAt, reason, note })
      onDone()
    } catch (err) {
      setError({ message: err instanceof ApiError ? err.message : 'Enregistrement impossible.', errors: err instanceof ApiError ? err.errors : [] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <p className="font-space text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
        Une plage bloquée n&apos;est plus proposée aux clients. Vous pouvez la libérer à tout moment depuis l&apos;agenda.
      </p>
      <Field label="Motif">
        <Segmented ariaLabel="Motif" value={reason} onChange={setReason}
          options={BLOCK_REASONS.map((r) => ({ id: r, label: BLOCK_REASON_LABEL[r] }))} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Du" htmlFor="b-date">
          <input id="b-date" type="date" className={inputCls} style={inputStyle} value={date}
            onChange={(e) => { setDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value) }} />
        </Field>
        <Field label="De" htmlFor="b-from">
          <input id="b-from" type="time" step={900} className={inputCls} style={inputStyle} value={from}
            onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Au" htmlFor="b-end-date">
          <input id="b-end-date" type="date" className={inputCls} style={inputStyle} value={endDate} min={date}
            onChange={(e) => setEndDate(e.target.value)} />
        </Field>
        <Field label="À" htmlFor="b-to">
          <input id="b-to" type="time" step={900} className={inputCls} style={inputStyle} value={to}
            onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      <Field label="Précision (facultatif, interne)" htmlFor="b-note">
        <input id="b-note" className={inputCls} style={inputStyle} value={note} maxLength={300}
          onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <ErrorBox message={error.message} errors={error.errors} />}
      <div className="flex gap-3">
        <Btn variant="ghost" className="shrink-0 !px-3" onClick={onCancel}>Annuler</Btn>
        <Btn variant="primary" type="submit" className="flex-1 whitespace-nowrap" disabled={busy}>
          {busy ? 'Enregistrement…' : 'Bloquer cette plage'}
        </Btn>
      </div>
    </form>
  )
}
