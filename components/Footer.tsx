'use client'

import { motion } from 'framer-motion'
import { LINKS } from '@/lib/links'

const navLinks = [
  { href: '#services',   label: 'Services'    },
  { href: '#tarifs',     label: 'Tarifs'      },
  { href: '#diagnostic', label: 'Diagnostic'  },
  { href: '#occasion',   label: 'Marketplace' },
  { href: '#contact',    label: 'Contact'     },
]

const socials = [
  {
    name: 'WhatsApp',
    href: LINKS.whatsapp,
    color: '#4ade80',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: LINKS.tiktok,
    color: 'rgba(234,251,255,0.7)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.28 8.28 0 004.84 1.54V6.84a4.85 4.85 0 01-1.07-.15z"/>
      </svg>
    ),
  },
  {
    name: 'Snapchat',
    href: LINKS.snapchat,
    color: '#facc15',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.106-1.123.45-1.679.81-.712.45-1.499.93-2.752.93-1.252 0-2.04-.48-2.751-.93-.556-.36-1.08-.704-1.679-.81a6.9 6.9 0 00-.913-.074c-.508 0-.913.06-1.273.135-.226.043-.403.074-.538.074h-.03c-.285 0-.48-.134-.555-.405-.06-.193-.105-.374-.134-.553-.045-.195-.105-.48-.165-.57-1.872-.283-2.905-.702-3.145-1.271a.544.544 0 01-.045-.225c-.015-.24.165-.465.42-.509 3.264-.539 4.73-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.195-.45-.884-.675-1.333-.81-.135-.044-.255-.09-.345-.12C2.044 9.756 1.64 9.366 1.655 8.917c0-.36.284-.69.733-.838.15-.061.328-.09.51-.09.12 0 .298.016.464.104.373.181.732.285 1.032.301.198 0 .326-.045.401-.09l-.03-.51-.002-.06c-.105-1.628-.23-3.654.298-4.847C5.86 1.069 9.216.793 10.207.793h.001z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.14), transparent)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '500px', height: '200px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto px-5 md:px-10">

        {/* Main grid */}
        <div className="py-12 md:py-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6"
          style={{ borderBottom: '1px solid rgba(0,209,255,0.06)' }}>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3">
              <span className="text-xl font-black font-space text-cold-white tracking-tight">
                COM<span className="gradient-text">&apos;9</span>
              </span>
            </div>
            <p className="font-mono text-[8.5px] tracking-[0.28em] uppercase mb-4"
              style={{ color: 'rgba(0,209,255,0.45)' }}>
              Next Generation Mobile Systems
            </p>
            <p className="font-space text-xs leading-relaxed" style={{ color: 'rgba(234,251,255,0.25)' }}>
              Réparation & reconditionnement<br />de smartphones.
              <span style={{ color: 'rgba(234,251,255,0.18)' }}> Nogent-le-Rotrou · 28.</span>
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              {socials.map((s) => (
                <motion.a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-250"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: s.color,
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="md:mx-auto"
          >
            <p className="font-mono text-[8.5px] tracking-[0.28em] uppercase mb-5"
              style={{ color: 'rgba(0,209,255,0.38)' }}>Navigation</p>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-250"
                  style={{ color: 'rgba(234,251,255,0.26)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00d1ff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(234,251,255,0.26)'}
                >
                  <span className="w-3.5 h-px transition-all duration-250 group-hover:w-5"
                    style={{ background: 'rgba(0,209,255,0.38)' }} />
                  {l.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="md:ml-auto"
          >
            <p className="font-mono text-[8.5px] tracking-[0.28em] uppercase mb-5"
              style={{ color: 'rgba(0,209,255,0.38)' }}>Informations</p>
            <div className="space-y-4">
              {[
                { icon: '◎', label: 'Zone',    value: 'Nogent-le-Rotrou · 28400'  },
                { icon: '◷', label: 'Délai',   value: '24 / 48h après réception'  },
                { icon: '◈', label: 'Contact', value: 'WhatsApp prioritaire'       },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="font-mono text-xs mt-0.5 shrink-0" style={{ color: 'rgba(0,209,255,0.4)' }}>
                    {info.icon}
                  </span>
                  <div>
                    <span className="block font-mono text-[8.5px] tracking-[0.2em] uppercase mb-0.5"
                      style={{ color: 'rgba(234,251,255,0.18)' }}>{info.label}</span>
                    <span className="font-space text-[12px]" style={{ color: 'rgba(234,251,255,0.42)' }}>
                      {info.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(234,251,255,0.15)' }}>
            © {new Date().getFullYear()} COM&apos;9 — Tous droits réservés
          </p>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-1 h-1 rounded-full"
              style={{ background: 'rgba(0,209,255,0.55)' }}
            />
            <span className="font-mono text-[8.5px] tracking-[0.2em] uppercase"
              style={{ color: 'rgba(0,209,255,0.3)' }}>
              Système opérationnel
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
