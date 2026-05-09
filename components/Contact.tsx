'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { LINKS } from '@/lib/links'

const lines = [
  { text: '> Initialisation système COM\'9...', delay: 0 },
  { text: '> Connexion réseau établie.',        delay: 0.5 },
  { text: '> Protocole de contact activé.',     delay: 1.0 },
  { text: '> En attente de votre message_',     delay: 1.5 },
]

const contacts = [
  {
    name: 'WhatsApp',
    label: 'Message direct',
    href: LINKS.whatsapp,
    desc: 'Réponse rapide garantie',
    style: {
      border: 'rgba(34,197,94,0.22)',
      bg:     'rgba(34,197,94,0.04)',
      hover:  'rgba(34,197,94,0.09)',
      color:  '#4ade80',
      dot:    '#4ade80',
    },
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>),
  },
  {
    name: 'TikTok',
    label: '@utu.electronics',
    href: LINKS.tiktok,
    desc: 'Contenu & coulisses',
    style: {
      border: 'rgba(234,251,255,0.1)',
      bg:     'rgba(234,251,255,0.02)',
      hover:  'rgba(234,251,255,0.05)',
      color:  '#eafbff',
      dot:    '#eafbff',
    },
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.28 8.28 0 004.84 1.54V6.84a4.85 4.85 0 01-1.07-.15z"/></svg>),
  },
  {
    name: 'Snapchat',
    label: 'Ajouter COM\'9',
    href: LINKS.snapchat,
    desc: 'Offres & exclusivités',
    style: {
      border: 'rgba(250,204,21,0.18)',
      bg:     'rgba(250,204,21,0.03)',
      hover:  'rgba(250,204,21,0.07)',
      color:  '#facc15',
      dot:    '#facc15',
    },
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.106-1.123.45-1.679.81-.712.45-1.499.93-2.752.93-1.252 0-2.04-.48-2.751-.93-.556-.36-1.08-.704-1.679-.81a6.9 6.9 0 00-.913-.074c-.508 0-.913.06-1.273.135-.226.043-.403.074-.538.074h-.03c-.285 0-.48-.134-.555-.405-.06-.193-.105-.374-.134-.553-.045-.195-.105-.48-.165-.57-1.872-.283-2.905-.702-3.145-1.271a.544.544 0 01-.045-.225c-.015-.24.165-.465.42-.509 3.264-.539 4.73-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.195-.45-.884-.675-1.333-.81-.135-.044-.255-.09-.345-.12C2.044 9.756 1.64 9.366 1.655 8.917c0-.36.284-.69.733-.838.15-.061.328-.09.51-.09.12 0 .298.016.464.104.373.181.732.285 1.032.301.198 0 .326-.045.401-.09l-.03-.51-.002-.06c-.105-1.628-.23-3.654.298-4.847C5.86 1.069 9.216.793 10.207.793h.001z"/></svg>),
  },
]

function TerminalLine({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(interval)
      }, 22)
      return () => clearInterval(interval)
    }, delay * 1000 + 500)
    return () => clearTimeout(timer)
  }, [text, delay])

  return (
    <div className="font-mono text-[11px] leading-relaxed flex items-center gap-0">
      <span style={{ color: 'rgba(0,209,255,0.58)' }}>{displayed}</span>
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse align-middle"
          style={{ background: 'rgba(0,209,255,0.65)' }} />
      )}
    </div>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '600px', height: '320px', background: 'radial-gradient(ellipse, rgba(0,102,255,0.06) 0%, transparent 70%)' }} />
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.1), transparent)' }} />

      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-5">— Contact —</p>
          <h2 className="font-black font-space text-cold-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Nous <span className="gradient-text">Contacter</span>
          </h2>
          <p className="font-space text-sm" style={{ color: 'rgba(234,251,255,0.62)' }}>
            Nogent-le-Rotrou · Eure-et-Loir
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Terminal top bar */}
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background: 'rgba(0,0,0,0.28)', borderBottom: '1px solid rgba(0,209,255,0.07)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(248,113,113,0.5)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(250,204,21,0.5)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(74,222,128,0.5)' }} />
              <span className="ml-3 font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{ color: 'rgba(234,251,255,0.18)' }}>
                COM&apos;9 — TERMINAL v9.0
              </span>
            </div>

            {/* Terminal output */}
            <div className="p-5 space-y-2.5 min-h-[160px]" style={{ background: 'rgba(0,0,0,0.14)' }}>
              {lines.map((l) => <TerminalLine key={l.text} text={l.text} delay={l.delay} />)}
            </div>

            {/* Info bloc */}
            <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(0,209,255,0.06)' }}>
              {[
                { icon: '◎', label: 'Zone',    value: 'Nogent-le-Rotrou · 28'              },
                { icon: '◷', label: 'Délai',   value: '24 / 48h après réception des pièces' },
                { icon: '◈', label: 'Contact', value: 'WhatsApp — réponse rapide'            },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="font-mono text-xs mt-0.5 shrink-0" style={{ color: 'rgba(0,209,255,0.45)' }}>
                    {item.icon}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider w-12 shrink-0 mt-0.5" style={{ color: 'rgba(234,251,255,0.22)' }}>
                    {item.label}
                  </span>
                  <span className="font-space text-[12px] leading-relaxed" style={{ color: 'rgba(234,251,255,0.72)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            {contacts.map((c, i) => (
              <motion.a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 group"
                style={{
                  border: `1px solid ${c.style.border}`,
                  background: c.style.bg,
                  color: c.style.color,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = c.style.hover)}
                onMouseLeave={e => (e.currentTarget.style.background = c.style.bg)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold font-space text-sm">{c.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: c.style.dot }} />
                  </div>
                  <span className="font-mono text-[9.5px] tracking-wider block truncate" style={{ color: `${c.style.color}55` }}>
                    {c.desc}
                  </span>
                </div>
                <svg viewBox="0 0 20 20" fill="currentColor"
                  className="w-4 h-4 opacity-25 group-hover:opacity-55 group-hover:translate-x-1 transition-all duration-300 shrink-0">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
