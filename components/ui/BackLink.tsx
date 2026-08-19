'use client'

import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Retour unifié
// Un seul composant pour toutes les pages secondaires : aucune page ne doit
// être une impasse. Sobre par principe — pas de carte, pas de bordure lourde.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  /** Destination du retour (page parente logique, jamais l'historique) */
  href: string
  /** Libellé court : « Accueil », « Marketplace », « Diagnostic »… */
  label: string
  className?: string
}

export default function BackLink({ href, label, className = '' }: Props) {
  return (
    <Link
      href={href}
      // -ml-2 : compense le padding interne pour un alignement optique
      // parfait avec le contenu de la page.
      className={`c9-back group -ml-2 inline-flex items-center gap-2 rounded-xl pl-2 pr-3 ${className}`}
      style={{ minHeight: '44px', color: 'var(--c9-text)' }}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
        aria-hidden="true"
      >
        <path d="M9.5 3.5L5 8l4.5 4.5" />
      </svg>
      <span className="font-space text-[0.9375rem] font-medium leading-none">
        {label}
      </span>
    </Link>
  )
}
