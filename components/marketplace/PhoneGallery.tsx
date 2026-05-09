'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Galerie photos téléphone (client)
// Swipe mobile natif + flèches desktop + dots de navigation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhoneGalleryProps {
  images: string[]
  model:  string
}

export default function PhoneGallery({ images, model }: PhoneGalleryProps) {
  const [active,    setActive]    = useState(0)
  const [direction, setDirection] = useState(0)  // -1 = gauche, 1 = droite
  const touchStartX = useRef<number>(0)
  const dragging    = useRef(false)

  const total = images.length

  function goTo(idx: number, dir: number) {
    setDirection(dir)
    setActive(idx)
  }

  function prev() {
    goTo((active - 1 + total) % total, -1)
  }
  function next() {
    goTo((active + 1) % total, 1)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    dragging.current = false
  }
  function onTouchMove(e: React.TouchEvent) {
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 8) dragging.current = true
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!dragging.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 44) {
      if (diff > 0) next()
      else prev()
    }
    dragging.current = false
  }

  // ── Placeholder (aucune image) ─────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="rounded-2xl flex items-center justify-center select-none"
        style={{
          aspectRatio: '4/3',
          background: 'linear-gradient(160deg,rgba(0,12,30,0.98) 0%,rgba(5,8,22,1) 100%)',
          border:     '1px solid rgba(0,209,255,0.1)',
        }}>
        <div className="flex flex-col items-center gap-3 opacity-25">
          <svg viewBox="0 0 40 72" fill="none" className="h-16">
            <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
            <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
            <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
          </svg>
          <p className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: 'rgba(0,209,255,0.5)' }}>
            Pas de photo
          </p>
        </div>
      </div>
    )
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center:              ({ x: 0, opacity: 1 }),
    exit:  (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div className="relative rounded-2xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg,rgba(0,12,30,0.98) 0%,rgba(5,8,22,1) 100%)',
        border:     '1px solid rgba(0,209,255,0.12)',
      }}>

      {/* ── Zone image ── */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '4/3' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={`${model} — photo ${active + 1}`}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Compteur ── */}
        {total > 1 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg font-mono text-[8.5px] tracking-[0.14em] pointer-events-none"
            style={{ background: 'rgba(5,8,22,0.75)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {active + 1} / {total}
          </div>
        )}

        {/* ── Flèches desktop ── */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-xl transition-all duration-200"
              style={{ background: 'rgba(5,8,22,0.72)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,209,255,0.15)', color: 'rgba(0,209,255,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.12)'; e.currentTarget.style.color = '#00d1ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,8,22,0.72)';  e.currentTarget.style.color = 'rgba(0,209,255,0.7)' }}
              aria-label="Photo précédente"
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-xl transition-all duration-200"
              style={{ background: 'rgba(5,8,22,0.72)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,209,255,0.15)', color: 'rgba(0,209,255,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.12)'; e.currentTarget.style.color = '#00d1ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,8,22,0.72)';  e.currentTarget.style.color = 'rgba(0,209,255,0.7)' }}
              aria-label="Photo suivante"
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M5 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails / dots ── */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3"
          style={{ borderTop: '1px solid rgba(0,209,255,0.07)' }}>
          {total <= 6 ? (
            /* Thumbnails si ≤ 6 photos */
            images.map((url, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                className="rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0"
                style={{
                  width: '48px', height: '36px',
                  border:   i === active ? '1px solid rgba(0,209,255,0.7)'  : '1px solid rgba(255,255,255,0.08)',
                  opacity:  i === active ? 1 : 0.45,
                  transform: i === active ? 'scale(1.04)' : 'scale(1)',
                  background: 'rgba(0,0,0,0.4)',
                }}
                aria-label={`Photo ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))
          ) : (
            /* Dots si > 6 photos */
            images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                className="rounded-full transition-all duration-200 flex-shrink-0"
                style={{
                  width:      i === active ? '18px' : '6px',
                  height:     '6px',
                  background: i === active ? '#00d1ff' : 'rgba(255,255,255,0.2)',
                }}
                aria-label={`Photo ${i + 1}`}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
