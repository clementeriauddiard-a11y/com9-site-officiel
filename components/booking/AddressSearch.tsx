'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Recherche d'adresse avec propositions (Base Adresse Nationale)
// Accessible au clavier (combobox). Si le service ne répond pas, l'adresse
// tapée peut être utilisée telle quelle.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useId, useRef, useState } from 'react'
import { inputCls, inputStyle } from '@/components/ui/kit'

export type AddressHit = { label: string; citycode: string; postcode: string; city: string }

export default function AddressSearch({ id, value, onSelect, onClear }: {
  id: string
  value: AddressHit | null
  onSelect: (hit: AddressHit) => void
  onClear: () => void
}) {
  const listId = useId()
  const [text, setText] = useState('')
  const [hits, setHits] = useState<AddressHit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const seq = useRef(0)

  useEffect(() => {
    const q = text.trim()
    if (q.length < 3) { setHits([]); return }
    const n = ++seq.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/adresse?q=${encodeURIComponent(q)}`)
        const data = await res.json().catch(() => ({}))
        if (n !== seq.current) return
        setHits(Array.isArray(data.hits) ? data.hits : [])
        setUnavailable(Boolean(data.unavailable))
        setActive(0)
      } catch {
        if (n === seq.current) { setHits([]); setUnavailable(true) }
      } finally {
        if (n === seq.current) setLoading(false)
      }
    }, 220)
    return () => clearTimeout(t)
  }, [text])

  function pick(h: AddressHit) {
    onSelect(h)
    setOpen(false)
    setText('')
  }

  function pickTyped() {
    const t = text.trim().replace(/\s+/g, ' ')
    if (t.length < 8) return
    pick({ label: t, citycode: '', postcode: (t.match(/\b\d{5}\b/) ?? [''])[0], city: '' })
  }

  if (value) {
    return (
      <div className="c9-choice flex items-center justify-between gap-3 px-4 py-3" data-on="true" data-address-choice>
        <span className="min-w-0 text-[1rem] font-medium leading-snug">{value.label}</span>
        <button type="button" className="shrink-0 text-[0.9375rem] font-medium underline underline-offset-4"
          style={{ color: 'var(--c9-text-2)', minHeight: 44 }}
          onClick={() => { onClear(); setTimeout(() => inputRef.current?.focus(), 0) }}>
          Modifier
        </button>
      </div>
    )
  }

  const showList = open && text.trim().length >= 3
  const canUseTyped = text.trim().length >= 8 && (unavailable || (!loading && hits.length === 0))

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        className={inputCls}
        style={inputStyle}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && hits.length ? `${listId}-${active}` : undefined}
        autoComplete="street-address"
        placeholder="Tapez votre adresse (n°, rue, ville)"
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        onKeyDown={(e) => {
          if (!showList || !hits.length) {
            if (e.key === 'Enter') { e.preventDefault(); if (canUseTyped) pickTyped() }
            return
          }
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % hits.length) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + hits.length) % hits.length) }
          else if (e.key === 'Enter') { e.preventDefault(); pick(hits[active]) }
          else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {showList && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 z-30 mt-2 max-h-80 overflow-auto rounded-2xl p-1.5"
          style={{ background: 'var(--c9-surface)', border: '1px solid var(--c9-hairline)', boxShadow: '0 24px 60px -24px rgba(0,0,0,0.45)' }}>
          {loading && hits.length === 0 && (
            <li className="px-3 py-3 text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }} aria-disabled="true">Recherche…</li>
          )}
          {hits.map((h, i) => (
            <li key={`${h.label}-${i}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(h) }}
              onMouseEnter={() => setActive(i)}
              className="cursor-pointer rounded-xl px-3 py-3 text-[1rem] leading-snug"
              style={{ background: i === active ? 'var(--c9-accent-soft)' : 'transparent', color: 'var(--c9-text)' }}>
              {h.label}
            </li>
          ))}
          {!loading && hits.length === 0 && (
            <li className="px-3 py-3 text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }} aria-disabled="true">
              {unavailable ? 'Propositions indisponibles pour le moment.' : 'Aucune adresse trouvée. Vérifiez la saisie.'}
            </li>
          )}
          {canUseTyped && (
            <li role="option" aria-selected={false} onMouseDown={(e) => { e.preventDefault(); pickTyped() }}
              className="cursor-pointer rounded-xl px-3 py-3 text-[0.9375rem] font-medium underline underline-offset-4"
              style={{ color: 'var(--c9-accent-text)' }}>
              Utiliser l&apos;adresse telle que tapée
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
