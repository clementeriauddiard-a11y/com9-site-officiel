'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Joindre COM'9, selon l'appareil
//
//  Téléphone : « Appeler COM'9 » (l'appel part directement) + WhatsApp.
//  Ordinateur : le numéro bien visible, « Copier le numéro », WhatsApp Web —
//  sans dépendre d'un lien tel: qui ne fait rien sur un ordinateur.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { LINKS, PHONE } from '@/lib/links'
import { copyText } from './kit'
import { WaIcon } from './Wa'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
    </svg>
  )
}

export default function ContactActions({ message, compact = false, secondary = false }: {
  /** Message WhatsApp pré-rempli (facultatif) */
  message?: string
  /** Version courte (pied de parcours, page de suivi) */
  compact?: boolean
  /** Téléphone : numéro en tête + « Appeler » et « WhatsApp » côte à côte, en boutons secondaires
   *  (quand un autre bouton principal suit, ex. « Réserver une intervention ») */
  secondary?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const wa = message ? `${LINKS.whatsapp}?text=${encodeURIComponent(message)}` : LINKS.whatsapp
  const waWeb = message ? `${LINKS.whatsappWeb}&text=${encodeURIComponent(message)}` : LINKS.whatsappWeb

  async function copy() {
    if (await copyText(PHONE.display)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-3" data-contact>
      {/* ── Téléphone ── */}
      {secondary ? (
        <div className="c9-touch-only flex-col gap-3">
          <p className="flex items-center gap-2.5 text-[1.375rem] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: 'var(--c9-text)' }}>
            <PhoneIcon /> {PHONE.display}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={LINKS.phone} className="c9-btn c9-btn-secondary !px-3" data-call style={{ minHeight: 52 }}>
              <PhoneIcon /> Appeler
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="c9-btn c9-btn-secondary !px-3" style={{ minHeight: 52 }}>
              <WaIcon /> WhatsApp
            </a>
          </div>
        </div>
      ) : (
      <div className="c9-touch-only flex-col gap-2.5">
        <a href={LINKS.phone} className="c9-btn c9-btn-primary w-full" data-call>
          <PhoneIcon /> Appeler COM&apos;9
        </a>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="c9-btn c9-btn-secondary w-full">
          <WaIcon /> Écrire sur WhatsApp
        </a>
        {!compact && (
          <p className="text-center text-[0.875rem] tabular-nums" style={{ color: 'var(--c9-text-3)' }}>{PHONE.display}</p>
        )}
      </div>
      )}

      {/* ── Ordinateur ── */}
      <div className="c9-desk-only flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-2.5 whitespace-nowrap"><span style={{ color: 'var(--c9-text)' }}><PhoneIcon /></span>
          <span className="select-all text-[1.375rem] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: 'var(--c9-text)' }}
            data-phone>
            {PHONE.display}
          </span></span>
          <button type="button" onClick={copy} className="c9-btn c9-btn-secondary whitespace-nowrap" style={{ minHeight: 36, padding: '0 0.85rem', fontSize: '0.8125rem', borderRadius: 999 }}>
            {copied ? 'Numéro copié' : 'Copier le numéro'}
          </button>
        </div>
        <a href={waWeb} target="_blank" rel="noopener noreferrer" className="c9-btn c9-btn-secondary self-start whitespace-nowrap"
          style={{ minHeight: 40, padding: '0 1rem', fontSize: '0.875rem', borderRadius: 999 }}>
          <WaIcon /> Ouvrir WhatsApp Web
        </a>
      </div>
    </div>
  )
}
