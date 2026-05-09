'use client'

import { motion } from 'framer-motion'
import { LINKS } from '@/lib/links'

const socials = [
  {
    name: 'WhatsApp',
    href: LINKS.whatsapp,
    style: {
      border: 'rgba(34,197,94,0.32)',
      bg:     'rgba(34,197,94,0.05)',
      hover:  'rgba(34,197,94,0.11)',
      color:  '#4ade80',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: LINKS.tiktok,
    style: {
      border: 'rgba(234,251,255,0.14)',
      bg:     'rgba(234,251,255,0.03)',
      hover:  'rgba(234,251,255,0.07)',
      color:  '#eafbff',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.28 8.28 0 004.84 1.54V6.84a4.85 4.85 0 01-1.07-.15z" />
      </svg>
    ),
  },
  {
    name: 'Snapchat',
    href: LINKS.snapchat,
    style: {
      border: 'rgba(250,204,21,0.24)',
      bg:     'rgba(250,204,21,0.04)',
      hover:  'rgba(250,204,21,0.09)',
      color:  '#facc15',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.106-1.123.45-1.679.81-.712.45-1.499.93-2.752.93-1.252 0-2.04-.48-2.751-.93-.556-.36-1.08-.704-1.679-.81a6.9 6.9 0 00-.913-.074c-.508 0-.913.06-1.273.135-.226.043-.403.074-.538.074h-.03c-.285 0-.48-.134-.555-.405-.06-.193-.105-.374-.134-.553-.045-.195-.105-.48-.165-.57-1.872-.283-2.905-.702-3.145-1.271a.544.544 0 01-.045-.225c-.015-.24.165-.465.42-.509 3.264-.539 4.73-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.195-.45-.884-.675-1.333-.81-.135-.044-.255-.09-.345-.12C2.044 9.756 1.64 9.366 1.655 8.917c0-.36.284-.69.733-.838.15-.061.328-.09.51-.09.12 0 .298.016.464.104.373.181.732.285 1.032.301.198 0 .326-.045.401-.09l-.03-.51-.002-.06c-.105-1.628-.23-3.654.298-4.847C5.86 1.069 9.216.793 10.207.793h.001z" />
      </svg>
    ),
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
}
const item = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.23, 1, 0.32, 1] } },
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-x-hidden"
    >
      {/* ── Background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: [0, 55, -35, 0], y: [0, -38, 55, 0], size: 520, c: '0,102,255',  op: 0.09, d: 24, pos: 'top-1/4 left-1/4'  },
          { x: [0, -45, 30,  0], y: [0, 38, -50, 0], size: 440, c: '0,209,255',  op: 0.06, d: 30, pos: 'bottom-1/4 right-1/4' },
          { x: [0, 30, -50,  0], y: [0, -50, 28, 0], size: 380, c: '0,50,180',   op: 0.05, d: 38, pos: 'top-3/4 left-1/2'   },
        ].map((b, i) => (
          <motion.div
            key={i}
            animate={{ x: b.x, y: b.y }}
            transition={{ duration: b.d, repeat: Infinity, ease: 'linear' }}
            className={`absolute ${b.pos} rounded-full`}
            style={{
              width: b.size, height: b.size,
              background: `radial-gradient(circle, rgba(${b.c},${b.op}) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* ── Scan line ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: ['-5%', '105%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear', repeatDelay: 9 }}
          className="absolute w-full"
          style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.25), rgba(0,209,255,0.5), rgba(0,209,255,0.25), transparent)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-5 max-w-5xl mx-auto pb-24 pt-20">
        {/* Logo */}
        <div
          className="relative mb-7 flex items-center justify-center mx-auto"
          style={{ width: 'clamp(220px, 50vmin, 460px)', height: 'clamp(220px, 50vmin, 460px)' }}
        >
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 52%, rgba(0,102,255,0.28) 0%, rgba(0,209,255,0.1) 48%, transparent 70%)',
              filter: 'blur(16px)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Com'9"
            className="w-full h-full object-contain select-none relative"
            draggable={false}
          />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-neon-blue font-mono uppercase tracking-[0.28em] mb-2.5"
            style={{ fontSize: 'clamp(0.55rem, 1.6vw, 0.75rem)' }}
          >
            Next Generation Mobile Systems
          </motion.p>

          {/* Location */}
          <motion.p
            variants={item}
            className="font-mono tracking-[0.18em] mb-5"
            style={{ fontSize: 'clamp(0.62rem, 1.8vw, 0.72rem)', color: 'rgba(234,251,255,0.62)' }}
          >
            📍 Nogent-le-Rotrou · Eure-et-Loir
          </motion.p>

          {/* Separator */}
          <motion.div
            variants={item}
            className="mb-8"
            style={{
              width: '80px', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.65), transparent)',
            }}
          />

          {/* Social buttons */}
          <motion.div
            variants={item}
            className="flex flex-row items-center justify-center gap-3 flex-wrap"
          >
            {socials.map((s) => (
              <motion.a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full backdrop-blur-sm font-mono text-[10.5px] tracking-[0.18em] uppercase transition-all duration-300"
                style={{
                  width: '145px',
                  border: `1px solid ${s.style.border}`,
                  background: s.style.bg,
                  color: s.style.color,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = s.style.hover }}
                onMouseLeave={e => { e.currentTarget.style.background = s.style.bg }}
              >
                {s.icon}
                {s.name}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-10"
      >
        <motion.div
          animate={{ scaleY: [1, 0.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px', height: '36px',
            background: 'linear-gradient(to bottom, rgba(0,209,255,0.55), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
