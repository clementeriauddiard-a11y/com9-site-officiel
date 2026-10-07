'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Barre de navigation
// Sobre, toujours accessible : la réservation reste à un geste.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HORAIRES_TEXTE } from '@/config/com9'

const LINKS = [
  { href: '/#fonctionnement', label: 'Comment ça marche' },
  { href: '/#tarifs',         label: 'Tarifs' },
  { href: '/#autre-probleme', label: 'Autre problème' },
  { href: '/#contact',        label: 'Contact' },
]

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[1.25rem] font-semibold tracking-[-0.04em] ${className}`} style={{ color: 'var(--c9-text)' }}>
      COM&apos;<span style={{ color: 'var(--c9-accent)' }}>9</span>
    </span>
  )
}

/** `hideCta` : sur la page de réservation, le bouton « Réserver » est inutile. */
export default function Navbar({ hideCta = false }: { hideCta?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: scrolled || open ? 'var(--c9-header)' : 'transparent',
        backdropFilter: scrolled || open ? 'blur(18px) saturate(140%)' : undefined,
        WebkitBackdropFilter: scrolled || open ? 'blur(18px) saturate(140%)' : undefined,
        borderBottom: `1px solid ${scrolled || open ? 'var(--c9-hairline-soft)' : 'transparent'}`,
      }}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8" aria-label="Navigation principale">
        <Link href="/" className="c9-back -ml-2 flex items-center gap-3 rounded-xl px-2 py-2" onClick={() => setOpen(false)}
          aria-label="COM'9 — accueil">
          <Wordmark />
          <span className="hidden text-[0.75rem] sm:inline" style={{ color: 'var(--c9-text-3)' }}>
            Réparation à domicile · {HORAIRES_TEXTE.accroche.toLowerCase()}
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="c9-back rounded-xl px-3 py-2 text-[0.9375rem]" style={{ color: 'var(--c9-text-2)' }}>
              {l.label}
            </Link>
          ))}
          {!hideCta && (
            <Link href="/reservation" className="c9-btn c9-btn-primary ml-3" style={{ minHeight: 44, padding: '0 1.25rem', fontSize: '0.875rem' }}>
              Réserver une intervention
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {!hideCta && (
            <Link href="/reservation" className="c9-btn c9-btn-primary" style={{ minHeight: 44, padding: '0 1rem', fontSize: '0.9375rem' }}
              onClick={() => setOpen(false)}>
              Réserver
            </Link>
          )}
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="c9-back flex h-11 w-11 items-center justify-center rounded-xl" style={{ border: '1px solid var(--c9-hairline)' }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-mobile" className="lg:hidden" style={{ height: 'calc(100dvh - 64px - env(safe-area-inset-top, 0px))', overflowY: 'auto' }}>
          <div className="flex flex-col gap-1 px-5 pb-10 pt-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="c9-back rounded-2xl px-3 py-4 text-[1.375rem] font-medium tracking-[-0.02em]"
                style={{ color: 'var(--c9-text)', borderBottom: '1px solid var(--c9-hairline-soft)' }}>
                {l.label}
              </Link>
            ))}
            <Link href="/reservation" onClick={() => setOpen(false)} className="c9-btn c9-btn-primary mt-6 w-full">
              Réserver une intervention
            </Link>
            <p className="mt-4 text-center text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>{HORAIRES_TEXTE.detail}</p>
          </div>
        </div>
      )}
    </header>
  )
}
