'use client'

/**
 * COM'9 — Cinematic Logo Intro (8 phases, ≈3.6s)
 *
 * 1. Obscurité      0.0–0.3s   Fond noir pur
 * 2. Activation     0.3–0.8s   Faisceau lumineux vertical + lignes circuit
 * 3. Apparition     0.8–1.3s   Construction holographique (scan + aberration chromatique)
 * 4. Vie            1.3–1.8s   Œil qui s'illumine + clin d'œil
 * 5. Mouvements     1.8–2.3s   Jab tournevis + reflet écran fissuré
 * 6. Stabilisation  2.3–2.8s   Glow s'équilibre, logo puissant
 * 7. Transition     2.8–3.2s   Effets secondaires s'estompent
 * 8. Fixe           3.2s+      Logo reste, overlay s'évanouit
 */

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'

type Phase = 'dark' | 'activate' | 'build' | 'alive' | 'move' | 'stabilize' | 'done'

interface Props { onComplete: () => void }

/* ── Circuit SVG paths drawn stroke by stroke ─────────────────── */
const CIRCUIT_PATHS = [
  'M200 390 L200 275 L130 275 L130 195',
  'M200 390 L200 275 L270 275 L270 195',
  'M200 390 L200 255 L155 255 L155 175',
  'M200 390 L200 255 L245 255 L245 175',
  'M10  195 L110 195 L110 245 L155 245',
  'M390 195 L290 195 L290 245 L245 245',
  'M200 390 L200 350 L310 350 L310 300',
  'M200 390 L200 350 L90  350 L90  300',
]
const CIRCUIT_NODES = [
  [200, 275], [130, 195], [270, 195], [155, 175],
  [245, 175], [110, 195], [290, 195], [310, 300], [90, 300],
]

function CircuitLines() {
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 400"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      {CIRCUIT_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="rgba(0,209,255,0.35)"
          strokeWidth="1"
          strokeDasharray="300"
          initial={{ strokeDashoffset: 300 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.45, delay: i * 0.045, ease: 'easeOut' }}
        />
      ))}
      {CIRCUIT_NODES.map(([cx, cy], i) => (
        <motion.circle
          key={`n${i}`}
          cx={cx} cy={cy} r="2.5"
          fill="rgba(0,209,255,0.15)"
          stroke="rgba(0,209,255,0.6)"
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 0.5] }}
          transition={{ duration: 0.25, delay: 0.25 + i * 0.04 }}
        />
      ))}
    </motion.svg>
  )
}

/* ── Scanline overlay (CRT effect during build) ────────────────── */
function ScanlineOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.25, 0.15, 0] }}
      transition={{ duration: 0.5, times: [0, 0.1, 0.7, 1] }}
      className="absolute inset-0 pointer-events-none rounded-lg"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,209,255,0.04) 3px, rgba(0,209,255,0.04) 4px)',
      }}
    />
  )
}

/* ── Main export ───────────────────────────────────────────────── */
export default function LogoIntro({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('dark')
  const [mounted, setMounted] = useState(true)

  const done = useCallback(() => {
    onComplete()
    setTimeout(() => setMounted(false), 600)
  }, [onComplete])

  useEffect(() => {
    const T: [Phase, number][] = [
      ['activate',  300],
      ['build',     800],
      ['alive',    1300],
      ['move',     1800],
      ['stabilize',2300],
      ['done',     2800],
    ]
    const timers = T.map(([p, ms]) => setTimeout(() => setPhase(p), ms))
    const final  = setTimeout(done, 3200)
    return () => { timers.forEach(clearTimeout); clearTimeout(final) }
  }, [done])

  const isVisible = (phases: Phase[]) => phases.includes(phase)

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{ background: '#030610' }}
        >

          {/* ═══ PHASE 2 — Vertical light beam ═══ */}
          <AnimatePresence>
            {isVisible(['activate', 'build']) && (
              <motion.div
                key="beam"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 0.9, 0.55] }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="absolute pointer-events-none"
                style={{
                  bottom: '50%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transformOrigin: 'bottom center',
                  width: '3px',
                  height: '48%',
                  background: 'linear-gradient(to top, transparent, rgba(0,209,255,0.5), rgba(0,209,255,0.95), rgba(255,255,255,0.6), rgba(0,209,255,0.95), rgba(0,209,255,0.5))',
                  filter: 'blur(1.5px)',
                  boxShadow: '0 0 18px rgba(0,209,255,0.7), 0 0 50px rgba(0,102,255,0.4)',
                }}
              />
            )}
          </AnimatePresence>

          {/* ═══ PHASE 2 — Horizontal ring flash ═══ */}
          <AnimatePresence>
            {isVisible(['activate', 'build']) && (
              <motion.div
                key="hring"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1.4, 1.0], opacity: [0, 0.9, 0.35] }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute pointer-events-none"
                style={{
                  width: '55vmin', height: '3px',
                  background: 'radial-gradient(ellipse at center, rgba(0,209,255,0.8) 0%, rgba(0,102,255,0.4) 40%, transparent 70%)',
                  filter: 'blur(2px)',
                }}
              />
            )}
          </AnimatePresence>

          {/* ═══ PHASE 2 — Circuit lines ═══ */}
          <div className="absolute" style={{ width: '58vmin', height: '58vmin' }}>
            <AnimatePresence>
              {isVisible(['activate', 'build']) && <CircuitLines key="circuit" />}
            </AnimatePresence>
          </div>

          {/* ═══ Pulse rings (phases 2–6) ═══ */}
          {isVisible(['activate', 'build', 'alive', 'move', 'stabilize']) &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={`ring${i}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.8, 2.4], opacity: [0, 0.28, 0] }}
                transition={{ duration: 2.4, delay: i * 0.5, ease: 'easeOut' }}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '50vmin', height: '50vmin',
                  border: '1px solid rgba(0,209,255,0.3)',
                }}
              />
            ))}

          {/* ═══ Core ambient glow ═══ */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '60vmin', height: '60vmin',
              background: 'radial-gradient(circle at 50% 52%, rgba(0,80,255,0.22) 0%, rgba(0,209,255,0.09) 45%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{
              opacity:
                phase === 'dark'       ? 0
              : phase === 'activate'   ? 0.7
              : phase === 'build'      ? 0.85
              : phase === 'alive'      ? 0.9
              : phase === 'move'       ? 0.75
              : phase === 'stabilize'  ? 0.6
              : 0.2,
              scale:
                phase === 'dark'     ? 0.2
              : phase === 'activate' ? 1.1
              : 1.0,
            }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />

          {/* ═══════════════════════════════════════════════
               LOGO CONTAINER
          ═══════════════════════════════════════════════ */}
          <div
            className="relative"
            style={{ width: 'clamp(210px, 42vmin, 350px)', height: 'clamp(210px, 42vmin, 350px)' }}
          >

            {/* ── Phase 3 · Chromatic aberration (cyan layer) ── */}
            <AnimatePresence>
              {phase === 'build' && (
                <motion.div
                  key="cyan-layer"
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: -18, opacity: 0 }}
                  animate={{ x: 0, opacity: [0, 0.6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, times: [0, 0.25, 1] }}
                >
                  <Image src="/logo.png" alt="" fill sizes="350px"
                    className="object-contain"
                    style={{ mixBlendMode: 'screen', filter: 'hue-rotate(160deg) saturate(4) brightness(1.5)', opacity: 0.55 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 3 · Chromatic aberration (magenta layer) ── */}
            <AnimatePresence>
              {phase === 'build' && (
                <motion.div
                  key="magenta-layer"
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: 18, opacity: 0 }}
                  animate={{ x: 0, opacity: [0, 0.6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, times: [0, 0.25, 1] }}
                >
                  <Image src="/logo.png" alt="" fill sizes="350px"
                    className="object-contain"
                    style={{ mixBlendMode: 'screen', filter: 'hue-rotate(300deg) saturate(4) brightness(1.5)', opacity: 0.55 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 3 · Scanlines CRT overlay ── */}
            <AnimatePresence>
              {phase === 'build' && <ScanlineOverlay key="scanlines" />}
            </AnimatePresence>

            {/* ══ MAIN LOGO IMAGE ══ */}
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === 'dark' || phase === 'activate' ? 0 : 1,
                clipPath:
                  phase === 'dark' || phase === 'activate'
                    ? 'inset(0% 0% 100% 0%)'   // hidden (bottom inset 100%)
                    : 'inset(0% 0% 0% 0%)',     // fully revealed
                scale:
                  phase === 'alive'    ? [1, 0.965, 1.022, 1.0]
                : phase === 'stabilize'? [1, 1.012, 1.0]
                : 1,
                rotate:
                  phase === 'alive' ? [0, -2.5, 1.8, 0] : 0,
                filter:
                  phase === 'build'      ? 'brightness(1.9) saturate(1.6)'
                : phase === 'alive'      ? 'brightness(1.4) saturate(1.3)'
                : phase === 'move'       ? 'brightness(1.2)'
                : phase === 'stabilize'  ? 'brightness(1.05)'
                : 'brightness(1.0)',
              }}
              transition={{
                opacity:   { duration: 0.2 },
                clipPath:  { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
                scale:     phase === 'alive'     ? { duration: 0.40, ease: [0.23, 1, 0.32, 1] }
                         : phase === 'stabilize' ? { duration: 0.55, ease: [0.23, 1, 0.32, 1] }
                         : {},
                rotate:    phase === 'alive' ? { duration: 0.40 } : {},
                filter:    { duration: 0.35 },
              }}
            >
              <Image
                src="/logo.png"
                alt="Com'9"
                fill priority
                sizes="(max-width: 640px) 210px, 350px"
                className="object-contain select-none"
                style={{ mixBlendMode: 'screen' }}
              />

              {/* ── Phase 3 · Moving scan line during construction ── */}
              <AnimatePresence>
                {phase === 'build' && (
                  <motion.div
                    key="build-scan"
                    className="absolute left-[-6%] right-[-6%] pointer-events-none"
                    initial={{ bottom: '100%' }}
                    animate={{ bottom: '-6%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                      height: '4px',
                      background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.8), rgba(255,255,255,0.85), rgba(0,209,255,0.8), transparent)',
                      filter: 'blur(2px)',
                      boxShadow: '0 0 14px rgba(0,209,255,0.6)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ── Phase 3 · Holographic flicker at end of build ── */}
              <AnimatePresence>
                {phase === 'build' && (
                  <motion.div
                    key="flicker"
                    animate={{ opacity: [0, 0.18, 0, 0.12, 0, 0.06, 0] }}
                    transition={{ duration: 0.38, delay: 0.44, times: [0, 0.1, 0.3, 0.5, 0.7, 0.85, 1] }}
                    className="absolute inset-0 pointer-events-none rounded"
                    style={{ background: 'rgba(0,209,255,0.25)' }}
                  />
                )}
              </AnimatePresence>

              {/* ── Phase 4 · Eye glow flash ── */}
              <AnimatePresence>
                {phase === 'alive' && (
                  <motion.div
                    key="eye-glow"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0.8, 0], scale: [0.4, 1.8, 1.1, 0.4] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.38, times: [0, 0.2, 0.6, 1] }}
                    className="absolute pointer-events-none"
                    style={{
                      left: '46%', top: '15%',
                      width: '18%', height: '12%',
                      background: 'radial-gradient(circle, rgba(0,209,255,1) 0%, rgba(0,102,255,0.4) 40%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(4px)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ── Phase 4 · Wink (eyelid closes over open eye) ── */}
              <AnimatePresence>
                {phase === 'alive' && (
                  <motion.div
                    key="wink"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: [0, 1, 1, 0.05, 0], opacity: [0, 0.96, 0.96, 0.7, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.58, delay: 0.18, ease: [0.23, 1, 0.32, 1], times: [0, 0.18, 0.5, 0.82, 1] }}
                    className="absolute pointer-events-none"
                    style={{
                      left: '49%', top: '17%',
                      width: '13%', height: '9%',
                      backgroundColor: 'rgba(3, 6, 16, 0.97)',
                      borderRadius: '50%',
                      transformOrigin: 'top center',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ── Phase 5 · Screen glass reflection ── */}
              <AnimatePresence>
                {phase === 'move' && (
                  <motion.div
                    key="reflect"
                    initial={{ x: '-160%', opacity: 0 }}
                    animate={{ x: '160%', opacity: [0, 0.95, 0.95, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.42, ease: 'easeInOut', delay: 0.08, times: [0, 0.12, 0.78, 1] }}
                    className="absolute pointer-events-none"
                    style={{
                      left: '5%', top: '9%',
                      width: '34%', height: '46%',
                      background: 'linear-gradient(108deg, transparent 22%, rgba(255,255,255,0.72) 50%, transparent 78%)',
                      transform: 'skewX(-16deg)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ── Phase 6 · Stabilization bright pulse ── */}
              <AnimatePresence>
                {phase === 'stabilize' && (
                  <motion.div
                    key="stabilize-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.14, 0.06, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.2, 0.6, 1] }}
                    className="absolute inset-0 pointer-events-none rounded"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,209,255,0.3) 0%, transparent 70%)' }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── HUD corner brackets ── */}
            {[
              { top: '-7px', left: '-7px', borderTop: '1.5px solid', borderLeft: '1.5px solid' },
              { top: '-7px', right: '-7px', borderTop: '1.5px solid', borderRight: '1.5px solid' },
              { bottom: '-7px', left: '-7px', borderBottom: '1.5px solid', borderLeft: '1.5px solid' },
              { bottom: '-7px', right: '-7px', borderBottom: '1.5px solid', borderRight: '1.5px solid' },
            ].map((s, i) => (
              <motion.div
                key={`hud${i}`}
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{
                  opacity: isVisible(['dark', 'activate']) ? 0 : isVisible(['done']) ? 0 : 0.55,
                  scale: 1,
                }}
                transition={{ duration: 0.35, delay: 0.9 + i * 0.06 }}
                className="absolute w-[18px] h-[18px] pointer-events-none"
                style={{ ...s, borderColor: 'rgba(0,209,255,0.45)', borderRadius: '2px' }}
              />
            ))}
          </div>

          {/* ═══ Brand tagline ═══ */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.55em' }}
            animate={{
              opacity: isVisible(['dark', 'activate', 'done']) ? 0 : 1,
              letterSpacing: '0.3em',
            }}
            transition={{ duration: 0.9, delay: 1.0 }}
            className="absolute font-mono text-neon-blue uppercase pointer-events-none"
            style={{
              bottom: 'calc(50% - clamp(120px, 24vmin, 205px) - 30px)',
              fontSize: 'clamp(0.45rem, 1.05vw, 0.6rem)',
            }}
          >
            Next Generation Mobile Systems
          </motion.p>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
