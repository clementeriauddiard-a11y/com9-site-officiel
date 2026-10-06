'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Éléments d'interface des pages client (réservation, suivi)
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'

// ─── Petits éléments ─────────────────────────────────────────────────────────

export const inputCls =
  'w-full rounded-2xl px-4 font-space text-[1rem] outline-none transition-colors duration-200 focus:border-[color:var(--c9-accent-line)]'
export const inputStyle: React.CSSProperties = {
  minHeight: '52px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--c9-hairline)',
  color: 'var(--c9-text)',
  colorScheme: 'dark',
}

export function Step({ n, title, hint, children }: { n: string; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby={`step-${n}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-[0.28em]" style={{ color: 'var(--c9-accent)' }}>{n}</span>
          <h2 id={`step-${n}`} className="font-space text-[1.1875rem] font-semibold" style={{ color: 'var(--c9-text)' }}>
            {title}
          </h2>
        </div>
        {hint && (
          <p className="font-space text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>{hint}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--c9-text-3)' }}>
      {children}
      {optional && <span className="normal-case tracking-normal"> · facultatif</span>}
    </label>
  )
}

/** Choix exclusif en pastilles, accessible au clavier (radiogroup). */
export function Choice<T extends string>({
  name, options, value, onChange, columns,
}: {
  name: string
  options: { id: T; label: ReactNode; sub?: ReactNode }[]
  value: T | null
  onChange: (v: T) => void
  columns: number
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className="flex min-w-0 flex-col items-start justify-center gap-0.5 rounded-2xl px-4 py-3 text-left transition-all duration-200"
            style={{
              minHeight: '52px',
              background: on ? 'rgba(58,217,255,0.10)' : 'rgba(255,255,255,0.04)',
              border: on ? '1px solid var(--c9-accent-line)' : '1px solid var(--c9-hairline)',
            }}
          >
            <span className="font-space text-[0.9375rem] font-semibold leading-tight" style={{ color: on ? 'var(--c9-text)' : 'var(--c9-text-2)' }}>
              {o.label}
            </span>
            {o.sub && (
              <span className="font-space text-[0.8125rem] leading-tight" style={{ color: 'var(--c9-text-3)' }}>{o.sub}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-space" style={{ color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)', fontWeight: strong ? 600 : 400 }}>
        {label}
      </span>
      <span className="whitespace-nowrap font-space tabular-nums"
        style={{ color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)', fontSize: strong ? '1.375rem' : '0.9375rem', fontWeight: strong ? 600 : 500 }}>
        {value}
      </span>
    </div>
  )
}

