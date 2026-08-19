'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const EASE = [0.22, 1, 0.36, 1] as const

// Ordre aligné sur la hiérarchie de l'accueil :
// Tarification (réparer) → Marketplace (acheter) → Diagnostic (analyser)
const links = [
  { href: '/#tarifs',     label: 'Tarifs'      },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/#diagnostic', label: 'Diagnostic'  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  /**
   * Navigation mobile universelle (comportement conservé — fiable Android + iOS).
   *
   * A) Lien de page pure (ex: /marketplace) → ferme le menu, navigation native.
   * B) Ancre absolue depuis l'accueil → scroll programmatique après fermeture
   *    du menu (Android Chrome abandonne l'ancre native pendant la mutation DOM).
   * C) Ancre absolue depuis une autre page → redirection vers /#section.
   */
  function handleMobileNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith('#') && !href.startsWith('/#')) {
      setOpen(false)
      return
    }

    e.preventDefault()
    setOpen(false)

    if (href.startsWith('/#')) {
      const sectionId = href.slice(2)

      if (pathname === '/') {
        setTimeout(() => {
          const el = document.getElementById(sectionId)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 320)
      } else {
        setTimeout(() => { window.location.href = href }, 280)
      }
      return
    }

    const id = href.slice(1)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 320)
  }

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={
        scrolled
          ? {
              background: 'rgba(15,25,41,0.72)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              borderBottom: '1px solid var(--c9-hairline-soft)',
            }
          : { borderBottom: '1px solid transparent' }
      }
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
        {/* Logo */}
        <motion.a
          href="/"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex shrink-0 select-none items-center gap-2.5"
        >
          <span
            className="font-space text-[1.15rem] font-bold tracking-tight"
            style={{ color: 'var(--c9-text)' }}
          >
            COM<span className="gradient-text">&apos;9</span>
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <span className="h-3 w-px" style={{ background: 'var(--c9-hairline)' }} />
            <span
              className="font-mono text-[7.5px] uppercase tracking-[0.24em]"
              style={{ color: 'var(--c9-text-3)' }}
            >
              Mobile Systems
            </span>
          </span>
        </motion.a>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 font-space text-[0.875rem] transition-colors duration-300"
              style={{ color: 'var(--c9-text-2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c9-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c9-text-2)' }}
            >
              {l.label}
            </a>
          ))}

          <span className="mx-2 h-3.5 w-px" style={{ background: 'var(--c9-hairline)' }} />

          {/* Accès espace responsable — discret */}
          <a
            href="/login"
            className="rounded-lg px-3 py-2 font-space text-[0.875rem] transition-colors duration-300"
            style={{ color: 'var(--c9-text-3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c9-text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c9-text-3)' }}
          >
            Connexion
          </a>

          <a
            href="/#contact"
            className="ml-1.5 flex items-center rounded-full px-5 font-space text-[0.875rem] font-medium transition-all duration-300"
            style={{
              minHeight: '40px',
              border: '1px solid var(--c9-hairline-lit)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--c9-text)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >
            Contact
          </a>
        </nav>

        {/* Bouton menu mobile */}
        <button
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-1 flex h-11 w-11 flex-col justify-center gap-[5px] rounded-xl transition-colors duration-300 md:hidden"
          style={{ background: open ? 'rgba(255,255,255,0.07)' : 'transparent' }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={
                open
                  ? i === 0
                    ? { rotate: 45, y: 7, width: '48%' }
                    : i === 1
                      ? { opacity: 0, scaleX: 0 }
                      : { rotate: -45, y: -7, width: '48%' }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1, width: i === 2 ? '32%' : '48%' }
              }
              transition={{ duration: 0.24, ease: EASE }}
              className="mx-auto block h-[1.5px] origin-center rounded-full"
              style={{ background: 'var(--c9-text)' }}
            />
          ))}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden md:hidden"
            style={{
              background: 'rgba(15,25,41,0.96)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              borderTop: '1px solid var(--c9-hairline-soft)',
            }}
          >
            <div className="flex flex-col px-5 py-3">
              {[...links, { href: '/#contact', label: 'Contact' }, { href: '/login', label: 'Connexion' }].map(
                (l, i, arr) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: i * 0.035, ease: EASE }}
                    onClick={(e) => handleMobileNav(e, l.href)}
                    className="flex items-center font-space text-[0.9375rem] transition-colors duration-300"
                    style={{
                      color: l.label === 'Connexion' ? 'var(--c9-text-3)' : 'var(--c9-text-2)',
                      borderBottom:
                        i < arr.length - 1 ? '1px solid var(--c9-hairline-soft)' : 'none',
                      minHeight: '54px',
                    }}
                  >
                    {l.label}
                  </motion.a>
                ),
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
