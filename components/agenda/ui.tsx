'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : éléments d'interface partagés
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'
import {
  APPT_STATUS_LABEL,
  PART_STATUS_LABEL,
  type ApptStatus,
  type PartStatus,
} from '@/lib/agenda/types'

// ─── Couleurs d'état (sémantiques, distinctes de l'accent de marque) ─────────

export const STATUS_TONE: Record<ApptStatus, string> = {
  demande_recue:   '#f5b94a', // à traiter
  creneau_propose: '#b49cff', // en attente du client
  confirme:        '#3ad9ff', // planifié
  en_route:        '#6fb4ff',
  en_cours:        '#4ade80',
  termine:         'rgba(255,255,255,0.55)',
  annule:          '#f87171',
}

export const PART_TONE: Record<PartStatus, string> = {
  en_stock:     '#4ade80',
  a_commander:  '#f5b94a',
  commandee:    '#6fb4ff',
  recue:        '#4ade80',
  indisponible: '#f87171',
}

export function Chip({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-medium leading-none"
      style={{ color: tone, background: 'rgba(255,255,255,0.05)', border: `1px solid ${tone}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  )
}

export function StatusChip({ status }: { status: ApptStatus }) {
  return <Chip tone={STATUS_TONE[status]}>{APPT_STATUS_LABEL[status]}</Chip>
}

export function PartChip({ part }: { part: PartStatus | null }) {
  if (!part) return <Chip tone="rgba(255,255,255,0.55)">Pièce à vérifier</Chip>
  return <Chip tone={PART_TONE[part]}>Pièce : {PART_STATUS_LABEL[part].toLowerCase()}</Chip>
}

// ─── Boutons ─────────────────────────────────────────────────────────────────

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  href?: string
  external?: boolean
  title?: string
}

export function Btn({
  children, onClick, variant = 'secondary', disabled, type = 'button', className = '', href, external, title,
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 font-space text-[0.9375rem] font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45'
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
      color: '#06131f',
      boxShadow: '0 12px 32px -18px rgba(26,169,255,0.9)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid var(--c9-hairline-lit)',
      color: 'var(--c9-text)',
    },
    ghost: { background: 'transparent', color: 'var(--c9-text-2)' },
    danger: {
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.35)',
      color: '#fca5a5',
    },
  }
  const style = { minHeight: '46px', ...styles[variant] }

  if (href) {
    return (
      <a
        href={href}
        title={title}
        className={`${base} ${className}`}
        style={style}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${className}`} style={style}>
      {children}
    </button>
  )
}

// ─── Champs ──────────────────────────────────────────────────────────────────

export const inputCls =
  'w-full rounded-xl px-3.5 font-space text-[0.9375rem] outline-none transition-colors duration-200 focus:border-[color:var(--c9-accent-line)]'

export const inputStyle: React.CSSProperties = {
  minHeight: '46px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--c9-hairline)',
  color: 'var(--c9-text)',
  colorScheme: 'dark',
}

export function Field({
  label, hint, children, htmlFor,
}: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-space text-[0.75rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

/** Choix exclusif en pastilles (prestation, qualité, origine…). */
export function Segmented<T extends string>({
  options, value, onChange, ariaLabel,
}: {
  options: { id: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1.5 rounded-2xl p-1.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--c9-hairline-soft)',
      }}
    >
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className="rounded-xl px-2 text-center font-space text-[0.8125rem] leading-tight transition-all duration-200"
            style={{
              minHeight: '42px',
              background: on ? 'rgba(255,255,255,0.10)' : 'transparent',
              border: on ? '1px solid var(--c9-hairline-lit)' : '1px solid transparent',
              color: on ? 'var(--c9-text)' : 'var(--c9-text-3)',
              fontWeight: on ? 600 : 500,
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Copie un texte, avec repli si le presse-papiers est refusé. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export function ErrorBox({ message, errors }: { message: string; errors?: string[] }) {
  return (
    <div
      role="alert"
      className="rounded-2xl px-4 py-3 font-space text-[0.875rem] leading-relaxed"
      style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)', color: '#fecaca' }}
    >
      <p className="font-semibold">{message}</p>
      {errors && errors.length > 0 && (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}
