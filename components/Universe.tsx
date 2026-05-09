'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const keywords = [
  { label: 'TECHNOLOGY', x: '8%', y: '18%', size: 'lg', delay: 0 },
  { label: 'NETWORK', x: '60%', y: '10%', size: 'sm', delay: 0.2 },
  { label: 'SYSTEM', x: '32%', y: '40%', size: 'xl', delay: 0.15 },
  { label: 'EVOLUTION', x: '72%', y: '45%', size: 'md', delay: 0.3 },
  { label: 'MOBILE FUTURE', x: '14%', y: '68%', size: 'md', delay: 0.1 },
  { label: 'INTELLIGENCE', x: '56%', y: '72%', size: 'sm', delay: 0.35 },
  { label: 'PROTOCOL', x: '82%', y: '22%', size: 'sm', delay: 0.25 },
  { label: 'INNOVATION', x: '42%', y: '80%', size: 'lg', delay: 0.4 },
]

const sizeMap: Record<string, string> = {
  sm:  'text-[10px] md:text-xs text-neon-blue/30',
  md:  'text-sm md:text-base text-neon-blue/50',
  lg:  'text-base md:text-xl text-neon-blue/70 font-semibold',
  xl:  'text-xl md:text-3xl text-neon-blue font-black',
}

const stats = [
  { value: 500, suffix: '+', label: 'Réparations' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
  { value: 24, suffix: '/48h*', label: 'Délai moyen' },
  { value: 3, suffix: 'ans', label: "D'expérience" },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

export default function Universe() {
  return (
    <section id="univers" className="relative py-24 overflow-hidden">
      {/* Top separator */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.15), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">— Univers COM&apos;9 —</p>
          <h2 className="font-black font-space text-cold-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Un <span className="gradient-text">Réseau</span> en Construction
          </h2>
          <p className="text-cold-white/40 font-space max-w-md mx-auto text-sm">
            COM&apos;9 n&apos;est pas un réparateur. C&apos;est une infrastructure technologique mobile en expansion.
          </p>
        </motion.div>

        {/* Keyword cloud — visible desktop */}
        <div className="relative h-80 mb-20 hidden md:block">
          {/* SVG connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="20%" x2="38%" y2="42%" stroke="rgba(0,209,255,0.08)" strokeWidth="1"/>
            <line x1="65%" y1="12%" x2="38%" y2="42%" stroke="rgba(0,209,255,0.06)" strokeWidth="1"/>
            <line x1="38%" y1="42%" x2="77%" y2="47%" stroke="rgba(0,209,255,0.07)" strokeWidth="1"/>
            <line x1="38%" y1="42%" x2="20%" y2="70%" stroke="rgba(0,209,255,0.07)" strokeWidth="1"/>
            <line x1="77%" y1="47%" x2="60%" y2="74%" stroke="rgba(0,209,255,0.06)" strokeWidth="1"/>
            <line x1="20%" y1="70%" x2="47%" y2="82%" stroke="rgba(0,209,255,0.05)" strokeWidth="1"/>
            <line x1="60%" y1="74%" x2="47%" y2="82%" stroke="rgba(0,209,255,0.06)" strokeWidth="1"/>
            <line x1="87%" y1="24%" x2="77%" y2="47%" stroke="rgba(0,209,255,0.05)" strokeWidth="1"/>
          </svg>

          {keywords.map((k) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: k.delay }}
              animate={{ y: [0, -6, 0] }}
              style={{ position: 'absolute', left: k.x, top: k.y, transform: 'translate(-50%, -50%)' }}
            >
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay: k.delay }}
                className={`font-mono font-bold tracking-widest whitespace-nowrap select-none cursor-default ${sizeMap[k.size]}`}
                style={{ display: 'inline-block' }}
              >
                {k.label}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Keyword list mobile */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 md:hidden">
          {keywords.map((k) => (
            <motion.span
              key={k.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: k.delay }}
              className="font-mono text-neon-blue/60 text-xs tracking-widest border border-neon-blue/15 rounded-full px-4 py-1.5"
            >
              {k.label}
            </motion.span>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="font-black font-space text-neon-blue mb-1"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-cold-white/40 font-mono text-[10px] tracking-[0.2em] uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Asterisk note */}
        <p className="mt-4 text-center text-cold-white/40 font-mono tracking-[0.15em]" style={{ fontSize: '0.7rem' }}>
          * Délai après réception des pièces
        </p>
      </div>

      {/* Bottom separator */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.1), transparent)' }}
      />
    </section>
  )
}
