'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const links = [
  { href: '#services',   label: 'Services'    },
  { href: '#tarifs',     label: 'Tarifs'      },
  { href: '#diagnostic', label: 'Diagnostic'  },
  { href: '#occasion',   label: 'Marketplace' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Ferme le menu mobile si on resize vers desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  /**
   * Navigation mobile fiable Android + iOS.
   *
   * Problème : sur Android Chrome, setOpen(false) déclenche l'animation
   * Framer Motion (height: 0 en 280ms). Pendant cette mutation DOM, le
   * navigateur abandonne la navigation d'ancre native (href="#section").
   * Sur iOS/WebKit le comportement est plus tolérant — d'où la différence.
   *
   * Correction : preventDefault() stoppe la navigation native, on ferme
   * le menu, puis après l'animation (320ms) on scroll programmatiquement
   * avec scrollIntoView — API fiable sur tous les moteurs mobiles.
   */
  function handleMobileNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    setOpen(false)
    const id = href.replace('#', '')
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 320) // légèrement supérieur à la durée d'animation (0.28s)
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={scrolled ? {
        background: 'rgba(5,8,22,0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(0,209,255,0.07)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.35)',
      } : {}}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between gap-4">

        {/* Logo */}
        <motion.a
          href="/"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 select-none shrink-0"
        >
          <span className="text-[1.15rem] font-black tracking-tight font-space text-cold-white">
            COM<span className="gradient-text">&apos;9</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="w-px h-3" style={{ background: 'rgba(0,209,255,0.18)' }} />
            <span className="font-mono text-[7.5px] tracking-[0.24em] uppercase" style={{ color: 'rgba(0,209,255,0.82)' }}>
              Mobile Systems
            </span>
          </span>
        </motion.a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-3.5 py-2 rounded-lg text-[11px] font-mono tracking-[0.2em] uppercase transition-colors duration-250 group"
              style={{ color: 'rgba(255,255,255,0.72)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.98)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}
            >
              {l.label}
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                style={{ background: 'rgba(0,209,255,0.04)' }} />
            </a>
          ))}

          <div className="w-px h-3.5 mx-2" style={{ background: 'rgba(0,209,255,0.14)' }} />

          <a
            href="#contact"
            className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
            style={{
              border: '1px solid rgba(0,209,255,0.28)',
              background: 'rgba(0,209,255,0.05)',
              color: '#00d1ff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background    = 'rgba(0,209,255,0.11)'
              e.currentTarget.style.borderColor   = 'rgba(0,209,255,0.55)'
              e.currentTarget.style.boxShadow     = '0 0 18px rgba(0,209,255,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background    = 'rgba(0,209,255,0.05)'
              e.currentTarget.style.borderColor   = 'rgba(0,209,255,0.28)'
              e.currentTarget.style.boxShadow     = 'none'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse shrink-0" />
            Contact
          </a>
        </nav>

        {/* Hamburger */}
        <button
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 -mr-1 rounded-lg transition-colors duration-200"
          style={{ background: open ? 'rgba(0,209,255,0.06)' : 'transparent' }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={
                open
                  ? i === 0 ? { rotate: 45,  y: 10, width: '100%' }
                  : i === 1 ? { opacity: 0,  scaleX: 0 }
                  :           { rotate: -45, y: -10, width: '100%' }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.22 }}
              className="block h-[1.5px] rounded-full bg-neon-blue origin-center mx-auto"
              style={{ width: i === 2 ? '55%' : '70%' }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(5,8,22,0.97)',
              backdropFilter: 'blur(28px)',
              borderTop: '1px solid rgba(0,209,255,0.07)',
            }}
          >
            <div className="px-5 py-4 flex flex-col gap-0.5">
              {[...links, { href: '#contact', label: 'Contact' }].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={(e) => handleMobileNav(e, l.href)}
                  className="flex items-center gap-3 py-4 font-mono text-[11px] tracking-[0.24em] uppercase transition-colors duration-200"
                  style={{
                    color: 'rgba(234,251,255,0.78)',
                    borderBottom: i < links.length ? '1px solid rgba(0,209,255,0.07)' : 'none',
                    minHeight: '48px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00d1ff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(234,251,255,0.78)'}
                >
                  <span className="w-4 h-px shrink-0 transition-all duration-200"
                    style={{ background: 'rgba(0,209,255,0.32)' }} />
                  {l.label}
                  {l.href === '#contact' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                  )}
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
