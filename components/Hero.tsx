'use client'

import { motion } from 'framer-motion'
import { waLink } from '@/lib/links'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 1, ease: [0.23, 1, 0.32, 1] } },
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-x-hidden"
    >
      {/* ── Halo unique, statique, très subtil ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 62% 44% at 50% 40%, rgba(0,102,255,0.10) 0%, rgba(0,209,255,0.03) 45%, transparent 68%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24 pb-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Logo — mascotte mise en scène sobrement */}
          <motion.div
            variants={item}
            className="relative mb-10 flex items-center justify-center"
            style={{ width: 'clamp(180px, 36vmin, 320px)', height: 'clamp(180px, 36vmin, 320px)' }}
          >
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 55%, rgba(0,102,255,0.22) 0%, rgba(0,209,255,0.07) 50%, transparent 72%)',
                filter: 'blur(20px)',
              }}
            />
            <motion.img
              src="/logo.png"
              alt="Com'9"
              draggable={false}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full object-contain select-none relative"
            />
          </motion.div>

          {/* Slogan monumental */}
          <motion.h1
            variants={item}
            className="font-black font-space text-cold-white mb-5"
            style={{
              fontSize: 'clamp(1.9rem, 5.5vw, 3.6rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
            }}
          >
            Réparation premium.
            <br />
            <span className="gradient-text">Appareils certifiés.</span>
          </motion.h1>

          {/* Localisation */}
          <motion.p
            variants={item}
            className="font-mono uppercase tracking-[0.26em] mb-12"
            style={{ fontSize: 'clamp(0.6rem, 1.6vw, 0.7rem)', color: 'rgba(255,255,255,0.55)' }}
          >
            Nogent-le-Rotrou · Eure-et-Loir
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            {/* Primaire */}
            <motion.a
              href={waLink("Bonjour Com'9, je souhaite prendre rendez-vous.")}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 px-9 rounded-full font-space font-semibold text-[0.95rem] transition-all duration-500 w-full sm:w-auto"
              style={{
                minHeight: '54px',
                background: 'linear-gradient(120deg, #00d1ff 0%, #0080ff 100%)',
                color: '#041018',
                boxShadow: '0 8px 40px rgba(0,140,255,0.28)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 52px rgba(0,160,255,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,140,255,0.28)' }}
            >
              Prendre rendez-vous
            </motion.a>

            {/* Secondaire */}
            <motion.a
              href="/#tarifs"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-9 rounded-full font-space text-[0.95rem] transition-all duration-500 w-full sm:w-auto"
              style={{
                minHeight: '54px',
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.92)',
                background: 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.34)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.02)'
              }}
            >
              Voir les tarifs
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-10"
      >
        <motion.div
          animate={{ scaleY: [1, 0.25, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px', height: '36px',
            background: 'linear-gradient(to bottom, rgba(0,209,255,0.5), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
