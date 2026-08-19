'use client'

import { motion } from 'framer-motion'
import { waLink } from '@/lib/links'

// ─────────────────────────────────────────────────────────────────────────────
// Primitives WhatsApp partagées — un seul endroit pour l'icône et les CTA.
// ─────────────────────────────────────────────────────────────────────────────

export function WaIcon({ className = 'w-[17px] h-[17px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

type WaCtaProps = {
  /** Message WhatsApp pré-rempli — toujours contextualisé */
  message: string
  label?: string
  /** primary = surface accent pleine · secondary = contour discret */
  variant?: 'primary' | 'secondary'
  className?: string
}

/**
 * CTA WhatsApp unique du site.
 * Aucune animation permanente : uniquement une micro-interaction au survol.
 */
export function WaCta({
  message,
  label = 'Prendre rendez-vous',
  variant = 'primary',
  className = '',
}: WaCtaProps) {
  const isPrimary = variant === 'primary'

  return (
    <motion.a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-center font-space text-[0.9375rem] font-semibold transition-colors duration-300 ${className}`}
      style={{
        minHeight: '54px',
        background: isPrimary
          ? 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)'
          : 'rgba(255,255,255,0.05)',
        color:  isPrimary ? '#06131f' : 'var(--c9-text)',
        border: isPrimary ? '1px solid transparent' : '1px solid var(--c9-hairline-lit)',
        boxShadow: isPrimary ? '0 14px 40px -18px rgba(26,169,255,0.75)' : 'none',
      }}
    >
      <WaIcon />
      <span className="leading-tight">{label}</span>
    </motion.a>
  )
}
