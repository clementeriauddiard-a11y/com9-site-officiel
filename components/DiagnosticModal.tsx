'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DIAG_CATEGORIES, getRating } from '@/data/diagnostic-categories'

// ─── Types ────────────────────────────────────────────────────────────────────

type Scores = Record<string, { base: number; malus: number }>
type Info   = { client: string; modele: string; technicien: string }

const TOTAL_STEPS = DIAG_CATEGORIES.length

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function computeTotal(scores: Scores) {
  return DIAG_CATEGORIES.reduce((acc, cat) => {
    const s = scores[cat.id]
    if (!s) return acc
    return acc + clamp(s.base + s.malus, 0, cat.max)
  }, 0)
}

// ─── PrintSheet — feuille de résultat une page ────────────────────────────────

function PrintSheet({ scores, info, total }: { scores: Scores; info: Info; total: number }) {
  const rating = getRating(total)
  const date   = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const ref    = useRef<HTMLDivElement>(null)

  return (
    <div className="diag-print-sheet" ref={ref} style={{ padding: '0', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── En-tête ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,209,255,0.25)', paddingBottom: '10px', marginBottom: '14px',
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#eafbff', letterSpacing: '-0.02em' }}>
            COM<span style={{ color: '#00d1ff' }}>&apos;9</span>
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(0,209,255,0.6)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '2px' }}>
            Feuille officielle de diagnostic
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: 'rgba(234,251,255,0.35)', letterSpacing: '0.12em' }}>{date}</div>
          {info.technicien && (
            <div style={{ fontSize: '9px', color: 'rgba(234,251,255,0.35)', letterSpacing: '0.1em', marginTop: '2px' }}>
              Technicien : {info.technicien}
            </div>
          )}
        </div>
      </div>

      {/* ── Infos appareil ── */}
      {(info.client || info.modele) && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          background: 'rgba(0,209,255,0.04)', border: '1px solid rgba(0,209,255,0.12)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
        }}>
          {info.client && (
            <div>
              <div style={{ fontSize: '8px', color: 'rgba(0,209,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2px' }}>Client</div>
              <div style={{ fontSize: '12px', color: '#eafbff', fontWeight: 700 }}>{info.client}</div>
            </div>
          )}
          {info.modele && (
            <div>
              <div style={{ fontSize: '8px', color: 'rgba(0,209,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2px' }}>Modèle</div>
              <div style={{ fontSize: '12px', color: '#eafbff', fontWeight: 700 }}>{info.modele}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Score principal ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(0,209,255,0.05) 100%)',
        border: '1px solid rgba(0,209,255,0.2)', borderRadius: '14px',
        padding: '14px 20px', marginBottom: '14px', gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '8px', color: 'rgba(0,209,255,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '4px' }}>Score total</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '56px', fontWeight: 900, color: rating.color, lineHeight: 1 }}>{total}</span>
            <span style={{ fontSize: '18px', color: 'rgba(234,251,255,0.3)', fontWeight: 700 }}>/100</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '5px 14px', borderRadius: '20px',
            color: rating.color, border: `1px solid ${rating.color}40`, background: `${rating.color}12`,
          }}>
            {rating.label}
          </div>
          {/* Barème rapide */}
          <div style={{ marginTop: '8px', fontSize: '8px', color: 'rgba(234,251,255,0.25)', lineHeight: 1.8, textAlign: 'right' }}>
            {[['90–100','Excellent'],['75–89','Bon état'],['60–74','Correct'],['40–59','Fragile'],['0–39','Dégradé']].map(([range, lbl]) => (
              <div key={range}>{range} — {lbl}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Détail catégories ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '8px', color: 'rgba(0,209,255,0.45)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Détail par catégorie
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {DIAG_CATEGORIES.map((cat) => {
            const s    = scores[cat.id]
            const note = s ? clamp(s.base + s.malus, 0, cat.max) : 0
            const pct  = (note / cat.max) * 100
            const obs  = s ? cat.options.find(o => o.value === s.base) : null
            return (
              <div key={cat.id} style={{
                background: 'rgba(0,209,255,0.025)', border: '1px solid rgba(0,209,255,0.1)',
                borderRadius: '10px', padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#eafbff' }}>{cat.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#00d1ff' }}>{note}<span style={{ fontSize: '9px', color: 'rgba(0,209,255,0.4)', fontWeight: 400 }}>/{cat.max}</span></span>
                </div>
                {/* Barre */}
                <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(0,209,255,0.1)', overflow: 'hidden', marginBottom: '5px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, rgba(0,102,255,0.8), #00d1ff)', borderRadius: '2px' }} />
                </div>
                {obs && (
                  <div style={{ fontSize: '8px', color: 'rgba(234,251,255,0.3)', lineHeight: 1.3 }}>
                    {obs.label}{obs.desc ? ` — ${obs.desc}` : ''}{s && s.malus < 0 ? ` (malus ${s.malus})` : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Pied de page ── */}
      <div style={{
        borderTop: '1px solid rgba(0,209,255,0.1)', paddingTop: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '8px', color: 'rgba(234,251,255,0.2)', letterSpacing: '0.12em' }}>
          Diagnostic réalisé selon la méthode officielle Com&apos;9
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid rgba(234,251,255,0.15)', width: '80px', marginBottom: '3px' }} />
            <div style={{ fontSize: '7px', color: 'rgba(234,251,255,0.2)', letterSpacing: '0.1em' }}>Signature technicien</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid rgba(234,251,255,0.15)', width: '80px', marginBottom: '3px' }} />
            <div style={{ fontSize: '7px', color: 'rgba(234,251,255,0.2)', letterSpacing: '0.1em' }}>Lu et approuvé</div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── DiagnosticModal ──────────────────────────────────────────────────────────

export default function DiagnosticModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]     = useState(-1)
  const [scores, setScores] = useState<Scores>({})
  const [info, setInfo]     = useState<Info>({ client: '', modele: '', technicien: '' })
  const [mounted, setMounted] = useState(false)

  const cat     = step >= 0 && step < TOTAL_STEPS ? DIAG_CATEGORIES[step] : null
  const current = cat ? (scores[cat.id] ?? { base: cat.options[0].value, malus: 0 }) : null
  const total   = computeTotal(scores)
  const rating  = getRating(total)
  const progress = step < 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (cat && !scores[cat.id]) {
      setScores(s => ({ ...s, [cat.id]: { base: cat.options[0].value, malus: 0 } }))
    }
  }, [step, cat, scores])

  function setBase(val: number)  { if (!cat) return; setScores(s => ({ ...s, [cat.id]: { ...s[cat.id], base: val } })) }
  function setMalus(val: number) { if (!cat) return; setScores(s => ({ ...s, [cat.id]: { ...s[cat.id], malus: val } })) }

  function handlePrint() { window.print() }
  function handleReset() { setStep(-1); setScores({}); setInfo({ client: '', modele: '', technicien: '' }) }

  return (
    <>
      {/* ── Portal print — invisible à l'écran, affiché uniquement à l'impression ── */}
      {mounted && step === TOTAL_STEPS && createPortal(
        <div id="diag-print-portal" style={{ display: 'none' }}>
          <PrintSheet scores={scores} info={info} total={total} />
        </div>,
        document.body
      )}

      {/* ── Modal écran ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(0,209,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <span className="font-black font-space text-cold-white text-sm">COM<span className="text-neon-blue">&apos;9</span></span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-px h-3.5" style={{ background: 'rgba(0,209,255,0.2)' }} />
              <span className="font-mono text-[9px] tracking-[0.28em] uppercase" style={{ color: 'rgba(0,209,255,0.45)' }}>Diagnostic</span>
              <span className="font-mono text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.25)', color: '#00d1ff' }}>
                Premium
              </span>
            </div>
          </div>

          {step >= 0 && step < TOTAL_STEPS && (
            <div className="flex items-center gap-3 flex-1 max-w-xs mx-4">
              <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(0,209,255,0.1)' }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, rgba(0,102,255,0.8), #00d1ff)' }}
                />
              </div>
              <span className="font-mono text-[10px] text-cold-white/30 tabular-nums shrink-0">{step + 1}/{TOTAL_STEPS}</span>
            </div>
          )}

          <button onClick={onClose}
            className="font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: 'rgba(234,251,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(234,251,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(234,251,255,0.3)'}
          >
            ✕ Fermer
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {step === -1 && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="max-w-lg mx-auto px-5 py-10 flex flex-col items-center text-center">

                {/* Premium badge */}
                <div className="relative w-20 h-20 mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'conic-gradient(from 0deg, transparent 60%, rgba(0,209,255,0.5) 80%, transparent 100%)' }} />
                  <div className="absolute inset-1.5 rounded-full" style={{ border: '1px solid rgba(0,209,255,0.2)', background: 'rgba(0,209,255,0.05)' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-8 h-8" style={{ color: '#00d1ff' }}>
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v3l2 2"/>
                    </svg>
                  </div>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ boxShadow: '0 0 30px rgba(0,209,255,0.3)' }} />
                </div>

                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(0,209,255,0.5)' }}>Com&apos;9</div>
                <h2 className="font-black font-space text-cold-white mb-1" style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)', letterSpacing: '-0.02em' }}>
                  Diagnostic <span className="gradient-text">Premium</span>
                </h2>

                {/* Prix */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.25)' }}>
                    <span className="font-black font-space text-neon-blue text-lg leading-none">4,99 €</span>
                  </div>
                  <span className="font-space text-xs" style={{ color: 'rgba(234,251,255,0.35)' }}>
                    Déduit si réparation
                  </span>
                </div>

                <p className="font-space text-sm mb-8 max-w-sm" style={{ color: 'rgba(234,251,255,0.4)' }}>
                  Analyse avancée sur 100 points. Validation complète de tous les composants.
                </p>

                <div className="w-full rounded-2xl p-5 mb-8 text-left space-y-3" style={{ border: '1px solid rgba(0,209,255,0.1)', background: 'rgba(0,209,255,0.02)' }}>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cold-white/30 mb-4">Informations (optionnel)</p>
                  {(['client', 'modele', 'technicien'] as const).map((key) => (
                    <div key={key}>
                      <label className="block font-mono text-[10px] tracking-widest uppercase text-cold-white/30 mb-1.5">
                        {key === 'client' ? 'Client' : key === 'modele' ? 'Modèle' : 'Technicien'}
                      </label>
                      <input type="text" value={info[key]}
                        onChange={e => setInfo(i => ({ ...i, [key]: e.target.value }))}
                        placeholder={key === 'client' ? 'Nom du client' : key === 'modele' ? 'ex : iPhone 15 Pro' : 'Nom du technicien'}
                        className="w-full bg-transparent border rounded-lg px-3 py-2.5 font-space text-sm text-cold-white placeholder-cold-white/20 outline-none focus:border-neon-blue/40 transition-colors"
                        style={{ borderColor: 'rgba(0,209,255,0.15)' }}
                      />
                    </div>
                  ))}
                </div>

                <motion.button onClick={() => setStep(0)} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-full border border-neon-blue/40 bg-neon-blue/8 text-neon-blue font-mono text-sm tracking-[0.2em] uppercase hover:bg-neon-blue/15 transition-all duration-300">
                  <span className="mr-2">▶</span> Lancer le diagnostic
                </motion.button>

                <div className="mt-8 grid grid-cols-4 gap-2 w-full">
                  {DIAG_CATEGORIES.map(c => (
                    <div key={c.id} className="flex flex-col items-center gap-1 py-2 rounded-xl" style={{ border: '1px solid rgba(0,209,255,0.06)', background: 'rgba(0,209,255,0.02)' }}>
                      <span className="text-lg">{c.icon}</span>
                      <span className="font-mono text-[9px] text-neon-blue/60">/{c.max}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CATÉGORIE */}
            {step >= 0 && step < TOTAL_STEPS && cat && current && (
              <motion.div key={`cat-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
                className="max-w-lg mx-auto px-5 py-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-black font-space text-cold-white text-lg leading-tight">{cat.label}</h3>
                      <p className="font-mono text-[10px] text-cold-white/30 tracking-widest">Note sur {cat.max} pts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black font-space text-neon-blue text-2xl">{clamp(current.base + current.malus, 0, cat.max)}</div>
                    <div className="font-mono text-[10px] text-cold-white/20">/ {cat.max}</div>
                  </div>
                </div>

                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cold-white/30 mb-3">État observé</p>
                <div className="space-y-2 mb-6">
                  {cat.options.map((opt, oi) => {
                    const sel = current.base === opt.value
                    return (
                      <button key={`opt-${oi}`} onClick={() => setBase(opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-200 ${sel ? 'border-neon-blue/50 bg-neon-blue/8 text-cold-white' : 'border-white/6 bg-white/2 text-cold-white/50 hover:border-white/15 hover:text-cold-white/70'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full border-2 shrink-0 transition-colors ${sel ? 'border-neon-blue bg-neon-blue' : 'border-white/20'}`} />
                          <div>
                            <span className="font-space text-sm">{opt.label}</span>
                            {opt.desc && <span className="font-mono text-[10px] text-cold-white/30 ml-2">{opt.desc}</span>}
                          </div>
                        </div>
                        <span className={`font-mono text-xs font-bold tabular-nums shrink-0 ${sel ? 'text-neon-blue' : 'text-cold-white/25'}`}>{opt.value}/{cat.max}</span>
                      </button>
                    )
                  })}
                </div>

                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cold-white/30 mb-3">Malus expert</p>
                <div className="space-y-2 mb-8">
                  {cat.malus.map((m, mi) => {
                    const sel = current.malus === m.value
                    return (
                      <button key={`malus-${mi}`} onClick={() => setMalus(m.value)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all duration-200 ${sel ? 'border-neon-blue/40 bg-neon-blue/5 text-cold-white' : 'border-white/6 bg-transparent text-cold-white/40 hover:border-white/12'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${sel ? 'border-neon-blue bg-neon-blue' : 'border-white/15'}`} />
                          <span className="font-space text-sm">{m.label}</span>
                        </div>
                        <span className={`font-mono text-xs font-bold tabular-nums shrink-0 ${m.value < 0 ? 'text-red-400/70' : sel ? 'text-neon-blue/60' : 'text-cold-white/20'}`}>
                          {m.value === 0 ? '—' : m.value}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-3.5 rounded-full border border-white/10 text-cold-white/40 font-mono text-[11px] tracking-[0.2em] uppercase hover:border-white/20 hover:text-cold-white/60 transition-all">
                    ← Précédent
                  </button>
                  <motion.button onClick={() => setStep(s => s + 1)} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                    className="flex-[2] py-3.5 rounded-full border border-neon-blue/40 bg-neon-blue/8 text-neon-blue font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-neon-blue/15 transition-all">
                    {step === TOTAL_STEPS - 1 ? 'Voir le résultat →' : 'Suivant →'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* RÉSULTAT ÉCRAN */}
            {step === TOTAL_STEPS && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                className="max-w-lg mx-auto px-5 py-8">

                {/* Score */}
                <div className="rounded-3xl p-8 text-center mb-6" style={{ border: '1px solid rgba(0,209,255,0.2)', background: 'linear-gradient(135deg, rgba(0,102,255,0.08) 0%, rgba(0,209,255,0.03) 100%)' }}>
                  {info.modele && <p className="font-mono text-[10px] tracking-widest uppercase text-cold-white/30 mb-1">{info.modele}</p>}
                  {info.client && <p className="font-space text-sm text-cold-white/50 mb-3">{info.client}</p>}
                  <div className="font-black font-space leading-none mb-1" style={{ fontSize: 'clamp(4rem,15vw,6rem)', color: rating.color }}>{total}</div>
                  <div className="font-mono text-cold-white/30 text-sm mb-3">/ 100</div>
                  <div className="inline-block font-mono text-sm font-bold tracking-[0.15em] uppercase px-5 py-1.5 rounded-full"
                    style={{ color: rating.color, border: `1px solid ${rating.color}30`, background: `${rating.color}10` }}>
                    {rating.label}
                  </div>
                </div>

                {/* Détail */}
                <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid rgba(0,209,255,0.08)' }}>
                  <div className="px-5 py-3" style={{ background: 'rgba(0,209,255,0.03)', borderBottom: '1px solid rgba(0,209,255,0.06)' }}>
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cold-white/30">Détail des scores</p>
                  </div>
                  {DIAG_CATEGORIES.map((c, i) => {
                    const s    = scores[c.id]
                    const note = s ? clamp(s.base + s.malus, 0, c.max) : 0
                    const pct  = (note / c.max) * 100
                    return (
                      <div key={c.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(0,209,255,0.04)' : undefined }}>
                        <span className="text-base shrink-0">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-space text-xs text-cold-white/60 truncate">{c.label}</span>
                            <span className="font-mono text-xs font-bold text-neon-blue shrink-0 ml-2">{note}/{c.max}</span>
                          </div>
                          <div className="h-px rounded-full overflow-hidden" style={{ background: 'rgba(0,209,255,0.08)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'rgba(0,209,255,0.6)' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <motion.button onClick={handlePrint} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-full border border-neon-blue/40 bg-neon-blue/8 text-neon-blue font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-neon-blue/15 transition-all">
                    🖨 Imprimer / Exporter PDF
                  </motion.button>
                  <button onClick={handleReset}
                    className="w-full py-3 rounded-full border border-white/8 text-cold-white/30 font-mono text-[11px] tracking-[0.2em] uppercase hover:border-white/15 hover:text-cold-white/50 transition-all">
                    ↺ Nouveau diagnostic
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
