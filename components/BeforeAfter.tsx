'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const transformations = [
  {
    model: 'iPhone 14 Pro',
    service: 'Écran OLED',
    before: {
      label: 'AVANT',
      screen: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #1a0a0a 100%)',
      crack: true,
    },
    after: {
      label: 'APRÈS',
      screen: 'linear-gradient(135deg, #050816 0%, #001a33 50%, #00101f 100%)',
      glow: 'rgba(0,209,255,0.4)',
    },
    accent: '#ff4444',
  },
  {
    model: 'Samsung S23 Ultra',
    service: 'Batterie',
    before: {
      label: 'AVANT',
      screen: 'linear-gradient(135deg, #0d1a0d 0%, #1a2d0f 50%, #0d1a0d 100%)',
      crack: false,
    },
    after: {
      label: 'APRÈS',
      screen: 'linear-gradient(135deg, #050a16 0%, #001020 50%, #000d1a 100%)',
      glow: 'rgba(0,209,255,0.35)',
    },
    accent: '#00ff88',
  },
  {
    model: 'iPhone 13',
    service: 'Vitre arrière',
    before: {
      label: 'AVANT',
      screen: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d0f 50%, #1a1a0a 100%)',
      crack: true,
    },
    after: {
      label: 'APRÈS',
      screen: 'linear-gradient(135deg, #050816 0%, #000d1a 50%, #00101f 100%)',
      glow: 'rgba(0,209,255,0.45)',
    },
    accent: '#ffaa00',
  },
]

function PhoneCard({
  transformation,
  index,
}: {
  transformation: (typeof transformations)[number]
  index: number
}) {
  const [flipped, setFlipped] = useState(false)
  const { model, service, before, after, accent } = transformation

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-6"
    >
      {/* Toggle buttons */}
      <div className="flex gap-1 glass-card rounded-full p-1">
        {(['AVANT', 'APRÈS'] as const).map((label) => (
          <button
            key={label}
            onClick={() => setFlipped(label === 'APRÈS')}
            className={`px-5 py-1.5 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
              (flipped && label === 'APRÈS') || (!flipped && label === 'AVANT')
                ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30'
                : 'text-cold-white/30 hover:text-cold-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Phone mockup */}
      <motion.div
        animate={flipped ? { y: [-5, 5, -5] } : { y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
        className="relative"
        style={{ filter: flipped ? `drop-shadow(0 0 30px ${after.glow})` : 'none', transition: 'filter 0.5s' }}
      >
        {/* Phone body */}
        <div className="phone-mockup">
          <div className="phone-notch" />
          {/* Screen */}
          <div className="phone-screen">
            <motion.div
              animate={{ background: flipped ? after.screen : before.screen }}
              transition={{ duration: 0.6 }}
              className="w-full h-full"
            >
              {/* Before: crack overlay */}
              {before.crack && !flipped && (
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 140 280">
                  <path d="M70 20 L55 80 L75 90 L45 180 L60 185 L40 260" stroke={accent} strokeWidth="1" fill="none" opacity="0.7"/>
                  <path d="M55 80 L30 100 M75 90 L95 110 M45 180 L20 200 M60 185 L85 205" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.4"/>
                </svg>
              )}
              {/* After: glow effect */}
              {flipped && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full opacity-20 animate-pulse"
                    style={{ background: `radial-gradient(circle, ${after.glow} 0%, transparent 70%)` }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-neon-blue font-mono text-[8px] tracking-widest opacity-50">COM&apos;9</span>
                    <div className="w-8 h-px bg-neon-blue/30" />
                    <span className="text-cold-white/20 font-mono text-[7px] tracking-wider">RESTORED</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          {/* Side button */}
          <div className="absolute right-[-3px] top-16 w-[3px] h-10 bg-neon-blue/20 rounded-r-sm" />
          <div className="absolute left-[-3px] top-12 w-[3px] h-6 bg-neon-blue/15 rounded-l-sm" />
          <div className="absolute left-[-3px] top-20 w-[3px] h-6 bg-neon-blue/15 rounded-l-sm" />
        </div>

        {/* Status badge */}
        <motion.div
          initial={false}
          animate={{ scale: flipped ? [0.8, 1.1, 1] : 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center border"
          style={{
            background: flipped ? 'rgba(0,209,255,0.15)' : 'rgba(255,80,80,0.15)',
            borderColor: flipped ? 'rgba(0,209,255,0.4)' : 'rgba(255,80,80,0.4)',
          }}
        >
          <span className="text-[10px]">{flipped ? '✓' : '!'}</span>
        </motion.div>
      </motion.div>

      {/* Info */}
      <div className="text-center">
        <div className="text-cold-white font-bold font-space text-sm mb-1">{model}</div>
        <div className="section-label" style={{ fontSize: '9px' }}>{service}</div>
      </div>
    </motion.div>
  )
}

export default function BeforeAfter() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="section-label mb-4">— Transformations —</p>
          <h2 className="font-black font-space text-cold-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Avant / <span className="gradient-text">Après</span>
          </h2>
          <p className="text-cold-white/40 font-space max-w-sm mx-auto text-sm">
            Cliquez sur les boutons pour voir la transformation. Chaque appareil redevient neuf.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 justify-items-center">
          {transformations.map((t, i) => (
            <PhoneCard key={t.model} transformation={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
