'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Éléments d'interface partagés (site public et agenda)
//
//  Une seule source pour les boutons, champs, choix, alertes et lignes de
//  prix. Tout passe par les variables de couleur (globals.css) : un même
//  composant s'affiche correctement en section sombre ou claire (.c9-light).
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

// ─── Boutons ─────────────────────────────────────────────────────────────────

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  /** md = 48 px (outils) · lg = 56 px (actions principales du site) */
  size?: 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  href?: string
  external?: boolean
  title?: string
  'aria-label'?: string
}

const DANGER: CSSProperties = {
  background: 'var(--c9-danger-soft)',
  border: '1px solid var(--c9-danger-line)',
  color: 'var(--c9-danger)',
}

export function Btn({
  children, onClick, variant = 'secondary', size = 'md', disabled, type = 'button', className = '', href, external, title,
  ...rest
}: BtnProps) {
  const cls = `c9-btn ${variant === 'danger' ? '' : `c9-btn-${variant}`} ${className}`
  const style: CSSProperties = {
    ...(size === 'md' ? { minHeight: '48px', padding: '0 1rem', fontSize: '0.9375rem' } : {}),
    ...(variant === 'danger' ? DANGER : {}),
  }
  if (href) {
    const internal = !external && href.startsWith('/')
    if (internal) {
      return <Link href={href} title={title} className={cls} style={style} aria-label={rest['aria-label']}>{children}</Link>
    }
    return (
      <a href={href} title={title} className={cls} style={style} aria-label={rest['aria-label']}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={cls} style={style}
      aria-label={rest['aria-label']}>
      {children}
    </button>
  )
}

// ─── Champs ──────────────────────────────────────────────────────────────────

export const inputCls =
  'w-full rounded-[14px] px-4 text-[1rem] outline-none transition-[border-color,box-shadow] duration-200 ' +
  'placeholder:text-[color:var(--c9-text-3)] focus:border-[color:var(--c9-accent)] focus:shadow-[0_0_0_3px_var(--c9-accent-soft)]'

export const inputStyle: CSSProperties = {
  minHeight: '54px',
  background: 'var(--c9-surface)',
  border: '1px solid var(--c9-hairline)',
  color: 'var(--c9-text)',
}

/** Variante compacte (agenda) */
export const inputStyleSm: CSSProperties = { ...inputStyle, minHeight: '48px', fontSize: '0.9375rem' }

export function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium" style={{ color: 'var(--c9-text-2)' }}>
      {children}
      {optional && <span style={{ color: 'var(--c9-text-3)' }}> · facultatif</span>}
    </label>
  )
}

export function Field({
  label, hint, children, htmlFor, optional,
}: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string; optional?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor} optional={optional}>{label}</Label>
      {children}
      {hint && <p className="text-[0.8125rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>{hint}</p>}
    </div>
  )
}

// ─── Choix exclusif ──────────────────────────────────────────────────────────

/**
 * Tuiles de choix (radiogroup, clavier compris). Au-delà de `columns`, les
 * tuiles passent à la ligne ; sur téléphone elles gardent ≥ 48 px de haut.
 */
export function Choice<T extends string>({
  name, options, value, onChange, columns = 2, minWidth = '8rem', size = 'md',
}: {
  name: string
  options: { id: T; label: ReactNode; sub?: ReactNode; aside?: ReactNode }[]
  value: T | null
  onChange: (v: T) => void
  columns?: number
  /** largeur mini d'une tuile avant passage à la ligne */
  minWidth?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const minH = size === 'lg' ? '72px' : size === 'sm' ? '46px' : '56px'
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(${minWidth}, calc((100% - ${columns - 1} * 0.5rem) / ${columns}))), 1fr))` }}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.id)}
            className="c9-choice flex min-w-0 items-center justify-between gap-3 px-4 py-3 text-left"
            style={{ minHeight: minH }}>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[0.9375rem] font-semibold leading-tight [overflow-wrap:anywhere]">{o.label}</span>
              {o.sub && <span className="text-[0.8125rem] leading-snug" style={{ color: 'var(--c9-text-3)' }}>{o.sub}</span>}
            </span>
            {o.aside && <span className="shrink-0 text-right">{o.aside}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Alertes ─────────────────────────────────────────────────────────────────

export function ErrorBox({ message, errors }: { message: string; errors?: string[] }) {
  return (
    <div role="alert" className="rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed"
      style={{ background: 'var(--c9-danger-soft)', border: '1px solid var(--c9-danger-line)', color: 'var(--c9-text)' }}>
      <p className="font-semibold" style={{ color: 'var(--c9-danger)' }}>{message}</p>
      {errors && errors.length > 0 && (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5" style={{ color: 'var(--c9-text-2)' }}>
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}

export function Notice({ tone = 'info', title, children, role }: {
  tone?: 'info' | 'warn' | 'ok' | 'accent'
  title?: ReactNode
  children?: ReactNode
  role?: 'status' | 'alert'
}) {
  const map = {
    info: { bg: 'var(--c9-elev-1)', line: 'var(--c9-hairline)', head: 'var(--c9-text)' },
    warn: { bg: 'var(--c9-warn-soft)', line: 'var(--c9-warn-line)', head: 'var(--c9-warn)' },
    ok: { bg: 'var(--c9-ok-soft)', line: 'var(--c9-ok-line)', head: 'var(--c9-ok)' },
    accent: { bg: 'var(--c9-accent-soft)', line: 'var(--c9-accent-line)', head: 'var(--c9-accent-text)' },
  }[tone]
  return (
    <div role={role} className="rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed"
      style={{ background: map.bg, border: `1px solid ${map.line}`, color: 'var(--c9-text-2)' }}>
      {title && <p className="font-semibold" style={{ color: map.head }}>{title}</p>}
      {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
    </div>
  )
}

// ─── Lignes de prix ──────────────────────────────────────────────────────────

export function Line({ label, value, strong, muted }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span style={{ color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)', fontWeight: strong ? 600 : 400 }}>{label}</span>
      <span className="text-right tabular-nums"
        style={{
          color: muted ? 'var(--c9-text-3)' : strong ? 'var(--c9-text)' : 'var(--c9-text)',
          fontSize: strong ? '1.5rem' : '1rem',
          fontWeight: strong ? 650 : 500,
          letterSpacing: strong ? '-0.02em' : undefined,
        }}>
        {value}
      </span>
    </div>
  )
}

// ─── Pastille ────────────────────────────────────────────────────────────────

export function Chip({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-medium leading-none"
      style={{ color: tone, background: 'var(--c9-elev-1)', border: `1px solid color-mix(in srgb, ${tone} 40%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  )
}

// ─── Presse-papiers ──────────────────────────────────────────────────────────

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
