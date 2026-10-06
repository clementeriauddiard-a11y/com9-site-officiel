'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : éléments d'interface
// Les éléments génériques viennent de components/ui/kit.tsx (une seule source) ;
// ici ne restent que ce qui est propre à l'agenda.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'
import {
  APPT_STATUS_LABEL,
  PART_STATUS_LABEL,
  type ApptStatus,
  type PartStatus,
} from '@/lib/agenda/types'
import { Chip, inputStyleSm } from '@/components/ui/kit'

export { Btn, Chip, ErrorBox, Field, Notice, copyText, inputCls } from '@/components/ui/kit'
/** Champs compacts dans l'agenda */
export const inputStyle = inputStyleSm

// ─── Couleurs d'état (sémantiques, distinctes de l'accent de marque) ─────────

export const STATUS_TONE: Record<ApptStatus, string> = {
  demande_recue:   '#e2b469', // à traiter
  creneau_propose: '#b9a6e6', // en attente du client
  confirme:        '#4db2ff', // planifié
  en_route:        '#8fb5e3',
  en_cours:        '#93d0a0',
  termine:         '#928d85',
  annule:          '#f0958a',
}

export const PART_TONE: Record<PartStatus, string> = {
  en_stock:     '#93d0a0',
  a_commander:  '#e2b469',
  commandee:    '#8fb5e3',
  recue:        '#93d0a0',
  indisponible: '#f0958a',
}

export function StatusChip({ status }: { status: ApptStatus }) {
  return <Chip tone={STATUS_TONE[status]}>{APPT_STATUS_LABEL[status]}</Chip>
}

export function PartChip({ part }: { part: PartStatus | null }) {
  if (!part) return <Chip tone="#928d85">Pièce à vérifier</Chip>
  return <Chip tone={PART_TONE[part]}>Pièce : {PART_STATUS_LABEL[part].toLowerCase()}</Chip>
}

/** Choix exclusif compact (prestation, qualité, origine…). */
export function Segmented<T extends string>({
  options, value, onChange, ariaLabel,
}: {
  options: { id: T; label: ReactNode }[]
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
        // Au-delà de 3 choix, les boutons passent à la ligne (téléphone).
        gridTemplateColumns: options.length > 3 ? 'repeat(auto-fit, minmax(7.5rem, 1fr))' : `repeat(${options.length}, minmax(0, 1fr))`,
        background: 'var(--c9-elev-1)',
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
            className="rounded-xl px-2 text-center text-[0.8125rem] leading-tight transition-all duration-200"
            style={{
              minHeight: '44px',
              background: on ? 'var(--c9-surface-2)' : 'transparent',
              border: on ? '1px solid var(--c9-accent-line)' : '1px solid transparent',
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
