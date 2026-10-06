'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Champ « Votre commune » : recherche par nom ou code postal,
// zone de déplacement d'après la liste validée par COM'9.
// Accessible au clavier (liste déroulante ARIA « combobox »).
// ─────────────────────────────────────────────────────────────────────────────

import { useId, useMemo, useRef, useState } from 'react'
import type { CommuneZone } from '@/data/communes-zones'
import { communeLabel, findCommune, searchCommunes } from '@/lib/communes'

export const NOT_LISTED = 'hors-liste'
export type CommuneValue = string | null // id de commune, NOT_LISTED, ou null (rien choisi)

type Props = {
  id: string
  value: CommuneValue
  onChange: (value: CommuneValue, commune: CommuneZone | null) => void
  inputClassName: string
  inputStyle: React.CSSProperties
  placeholder?: string
}

export default function CommuneSearch({ id, value, onChange, inputClassName, inputStyle, placeholder }: Props) {
  const listId = useId()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => searchCommunes(text), [text])
  const chosen = value && value !== NOT_LISTED ? findCommune(value) : null

  function pick(c: CommuneZone | null) {
    onChange(c ? c.id : NOT_LISTED, c)
    setOpen(false)
    setText('')
  }

  if (chosen || value === NOT_LISTED) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
        style={{ ...inputStyle, minHeight: inputStyle.minHeight }} data-commune-choice>
        <span className="min-w-0 font-space text-[0.9375rem]" style={{ color: 'var(--c9-text)' }}>
          {chosen ? communeLabel(chosen) : 'Commune hors de la liste'}
        </span>
        <button type="button" className="shrink-0 font-space text-[0.875rem] underline" style={{ color: 'var(--c9-text-2)' }}
          onClick={() => { onChange(null, null); setTimeout(() => inputRef.current?.focus(), 0) }}>
          Changer
        </button>
      </div>
    )
  }

  const optionCount = results.length + 1 // + « pas dans la liste »

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        className={inputClassName}
        style={inputStyle}
        role="combobox"
        aria-expanded={open && text.trim().length >= 2}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder ?? 'Nom de la commune ou code postal'}
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % optionCount) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + optionCount) % optionCount) }
          else if (e.key === 'Enter' && text.trim().length >= 2) { e.preventDefault(); pick(active < results.length ? results[active] : null) }
          else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && text.trim().length >= 2 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 z-20 mt-1 max-h-72 overflow-auto rounded-2xl p-1.5"
          style={{ background: 'var(--c9-bg, #111f35)', border: '1px solid var(--c9-hairline-lit)', boxShadow: '0 24px 60px -24px rgba(0,0,0,0.7)' }}>
          {results.map((c, i) => (
            <li key={c.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(c) }}
              onMouseEnter={() => setActive(i)}
              className="cursor-pointer rounded-xl px-3 py-2.5 font-space text-[0.9375rem]"
              style={{ background: i === active ? 'rgba(58,217,255,0.12)' : 'transparent', color: 'var(--c9-text)' }}>
              {communeLabel(c)}
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }} aria-disabled="true">
              Aucune commune trouvée dans la liste.
            </li>
          )}
          <li id={`${listId}-${results.length}`} role="option" aria-selected={active === results.length}
            onMouseDown={(e) => { e.preventDefault(); pick(null) }}
            onMouseEnter={() => setActive(results.length)}
            className="cursor-pointer rounded-xl px-3 py-2.5 font-space text-[0.875rem]"
            style={{ background: active === results.length ? 'rgba(58,217,255,0.12)' : 'transparent', color: 'var(--c9-text-2)' }}>
            Ma commune n&apos;est pas dans la liste
          </li>
        </ul>
      )}
    </div>
  )
}
