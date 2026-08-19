'use client'

import { motion } from 'framer-motion'
import { waLink } from '@/lib/links'

const EASE = [0.22, 1, 0.36, 1] as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-x-hidden"
    >
      {/* Halo unique, statique, très diffus */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 58% 42% at 50% 38%, rgba(58,217,255,0.14) 0%, rgba(26,169,255,0.05) 46%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 pt-28 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div
            variants={item}
            className="relative mb-9 flex items-center justify-center"
            style={{
              width: 'clamp(150px, 30vmin, 260px)',
              height: 'clamp(150px, 30vmin, 260px)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 52%, rgba(58,217,255,0.22) 0%, rgba(26,169,255,0.07) 52%, transparent 72%)',
                filter: 'blur(26px)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Com'9"
              draggable={false}
              className="relative h-full w-full select-none object-contain"
            />
          </motion.div>

          {/* Titre */}
          <motion.h1
            variants={item}
            className="mb-6 font-space"
            style={{
              color: 'var(--c9-text)',
              fontSize: 'clamp(2rem, 6.6vw, 4.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.042em',
              lineHeight: 1.04,
            }}
          >
            Réparation premium.
            <br />
            <span className="gradient-text">Appareils certifiés.</span>
          </motion.h1>

          {/* Accroche */}
          <motion.p
            variants={item}
            className="mb-3 font-space"
            style={{
              color: 'var(--c9-text-2)',
              fontSize: 'clamp(1rem, 2.2vw, 1.1875rem)',
              lineHeight: 1.55,
              maxWidth: '30ch',
            }}
          >
            Écran, batterie, vitre arrière — un tarif clair avant même de nous
            écrire.
          </motion.p>

          {/* Localisation */}
          <motion.p
            variants={item}
            className="mb-11 font-mono uppercase tracking-[0.26em]"
            style={{ fontSize: 'clamp(0.6rem, 1.6vw, 0.6875rem)', color: 'var(--c9-text-3)' }}
          >
            Nogent-le-Rotrou · Eure-et-Loir
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={item}
            className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <motion.a
              href="/#tarifs"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex w-full items-center justify-center rounded-full px-9 font-space text-[0.9375rem] font-semibold sm:w-auto"
              style={{
                minHeight: '54px',
                background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
                color: '#06131f',
                boxShadow: '0 16px 44px -20px rgba(26,169,255,0.85)',
              }}
            >
              Voir les tarifs
            </motion.a>

            <motion.a
              href={waLink("Bonjour, je viens du site Com'9. Je souhaite prendre rendez-vous.")}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex w-full items-center justify-center rounded-full px-9 font-space text-[0.9375rem] font-medium transition-colors duration-300 sm:w-auto"
              style={{
                minHeight: '54px',
                border: '1px solid var(--c9-hairline-lit)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--c9-text)',
              }}
            >
              Prendre rendez-vous
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicateur de défilement — statique, discret */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div
          style={{
            width: '1px',
            height: '38px',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.32), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
