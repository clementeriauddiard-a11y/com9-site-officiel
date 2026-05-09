'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  FREE_CATEGORIES,
  getFreeResult,
  getOverallSeverity,
  type FreeSeverity,
} from '@/data/diagnostic-free'

// ─── Category icons ───────────────────────────────────────────────────────────

function CategoryIcon({ id, size = 6 }: { id: string; size?: number }) {
  const cls = `w-${size} h-${size}`
  const s   = { color: '#00d1ff' }
  switch (id) {
    case 'batterie': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={cls} style={s}>
        <rect x="2" y="7" width="18" height="10" rx="2"/>
        <path d="M22 11v2"/><path d="M6 12h4M10 10v4"/>
      </svg>
    )
    case 'ecran': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={cls} style={s}>
        <rect x="5" y="2" width="14" height="20" rx="3"/>
        <circle cx="12" cy="18" r="1"/><rect x="9" y="4" width="6" height="1" rx="0.5"/>
      </svg>
    )
    case 'cameras': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={cls} style={s}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    )
    case 'vitre': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={cls} style={s}>
        <rect x="5" y="2" width="14" height="20" rx="3"/>
        <path d="M9 9l6 6M15 9l-6 6"/>
      </svg>
    )
    default: return null
  }
}

// ─── Severity color ───────────────────────────────────────────────────────────

function severityColor(s: FreeSeverity): string {
  return ['#00d1ff','#4ade80','#facc15','#f87171'][s]
}

function severityLabel(s: FreeSeverity): string {
  return ['Optimal','Légère dégradation','Intervention conseillée','Urgent'][s]
}

// ─── Scan intro animation ─────────────────────────────────────────────────────

function ScanIntro({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto px-5 py-10 flex flex-col items-center text-center"
    >
      {/* HUD badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-20 h-20 mb-7"
      >
        {/* Outer ring spin */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,209,255,0.5) 85%, transparent 100%)',
          }}
        />
        {/* Inner ring */}
        <div className="absolute inset-1.5 rounded-full"
          style={{ border: '1px solid rgba(0,209,255,0.2)', background: 'rgba(0,209,255,0.04)' }} />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-8 h-8" style={{ color: '#00d1ff' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/><path d="M11 8v3l2 2"/>
          </svg>
        </div>
        {/* Glow */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: '0 0 30px rgba(0,209,255,0.3)' }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="font-mono text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: 'rgba(0,209,255,0.55)' }}>
          Com&apos;9
        </div>
        <h2 className="font-black font-space text-cold-white mb-1" style={{ fontSize: 'clamp(1.7rem,6vw,2.4rem)', letterSpacing: '-0.02em' }}>
          Diagnostic
        </h2>
        <div className="font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1 rounded-full inline-block mb-4"
          style={{ background: 'rgba(0,209,255,0.07)', border: '1px solid rgba(0,209,255,0.2)', color: 'rgba(0,209,255,0.7)' }}>
          Gratuit
        </div>
      </motion.div>

      {/* Taglines */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="font-space text-sm leading-relaxed mb-2 max-w-xs"
        style={{ color: 'rgba(234,251,255,0.45)' }}
      >
        Analyse rapide de l&apos;état de votre appareil.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-[9px] tracking-[0.18em] uppercase mb-8"
        style={{ color: 'rgba(0,209,255,0.4)' }}
      >
        Première estimation intelligente par le système Com&apos;9.
      </motion.p>

      {/* 4 category preview */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 14 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-4 gap-2.5 w-full mb-8"
      >
        {FREE_CATEGORIES.map((cat, i) => (
          <motion.div key={cat.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.85 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
            style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.1)' }}>
            <CategoryIcon id={cat.id} size={5} />
            <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-center leading-tight"
              style={{ color: 'rgba(234,251,255,0.4)' }}>
              {cat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Inclus */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full rounded-2xl p-4 mb-8"
        style={{ background: 'rgba(0,209,255,0.025)', border: '1px solid rgba(0,209,255,0.08)' }}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            '✔ Batterie',
            '✔ Écran',
            '✔ Caméras',
            '✔ Vitre arrière',
          ].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="font-space text-xs" style={{ color: 'rgba(234,251,255,0.55)' }}>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="w-full py-4 rounded-2xl font-mono text-[11px] tracking-[0.22em] uppercase cursor-pointer transition-all duration-300"
        style={{
          border: '1px solid rgba(0,209,255,0.35)',
          background: 'rgba(0,209,255,0.08)',
          color: '#00d1ff',
          boxShadow: '0 0 30px rgba(0,102,255,0.08)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,209,255,0.14)'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,209,255,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,209,255,0.08)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,102,255,0.08)'
        }}
      >
        <span className="mr-2">▶</span> Lancer l&apos;analyse
      </motion.button>
    </motion.div>
  )
}

// ─── Step ─────────────────────────────────────────────────────────────────────

function StepView({
  cat, stepIndex, total, answer, onAnswer, onNext, onPrev,
}: {
  cat: typeof FREE_CATEGORIES[number]
  stepIndex: number
  total: number
  answer: FreeSeverity | undefined
  onAnswer: (s: FreeSeverity) => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <motion.div
      key={`step-${stepIndex}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-md mx-auto px-5 py-8"
    >
      {/* Category header */}
      <div className="flex items-center gap-4 mb-7">
        {/* Icon container */}
        <div className="relative w-14 h-14 shrink-0">
          <div className="absolute inset-0 rounded-2xl"
            style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.2)' }} />
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
            className="absolute inset-x-0 pointer-events-none"
            style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,209,255,0.5), transparent)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon id={cat.id} size={6} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: 'rgba(0,209,255,0.45)' }}>
            Analyse {stepIndex + 1}/{total}
          </div>
          <h3 className="font-black font-space text-cold-white text-xl leading-tight">{cat.label}</h3>
          <p className="font-space text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(234,251,255,0.35)' }}>
            {cat.subtitle}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-8">
        {cat.options.map((opt, i) => {
          const sel = answer === i
          const col = severityColor(i as FreeSeverity)
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onClick={() => onAnswer(i as FreeSeverity)}
              className="w-full text-left transition-all duration-250 rounded-2xl overflow-hidden"
              style={{
                border: sel ? `1px solid ${col}55` : '1px solid rgba(255,255,255,0.06)',
                background: sel ? `${col}10` : 'rgba(255,255,255,0.02)',
                boxShadow: sel ? `0 0 20px ${col}15` : 'none',
              }}
            >
              <div className="flex items-start gap-3.5 px-4 py-3.5">
                {/* Radio */}
                <div className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: sel ? col : 'rgba(255,255,255,0.2)',
                    background: sel ? col : 'transparent',
                  }}>
                  {sel && <div className="w-1.5 h-1.5 rounded-full bg-[rgba(5,8,22,0.9)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-space text-sm font-semibold leading-tight mb-0.5"
                    style={{ color: sel ? '#eafbff' : 'rgba(234,251,255,0.65)' }}>
                    {opt.label}
                  </div>
                  <div className="font-space text-xs leading-relaxed"
                    style={{ color: sel ? 'rgba(234,251,255,0.5)' : 'rgba(234,251,255,0.3)' }}>
                    {opt.desc}
                  </div>
                </div>
                {/* Severity dot */}
                {sel && (
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                    <span className="font-mono text-[9px] tracking-[0.1em]" style={{ color: col }}>
                      {severityLabel(i as FreeSeverity)}
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={onPrev}
          className="flex-1 py-3.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(234,251,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(234,251,255,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(234,251,255,0.35)' }}
        >
          ← Précédent
        </button>
        <motion.button
          onClick={onNext}
          disabled={answer === undefined}
          whileHover={answer !== undefined ? { scale: 1.02, y: -1 } : {}}
          whileTap={answer !== undefined ? { scale: 0.97 } : {}}
          className="flex-[2] py-3.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
          style={{
            border: answer !== undefined ? '1px solid rgba(0,209,255,0.4)' : '1px solid rgba(0,209,255,0.12)',
            background: answer !== undefined ? 'rgba(0,209,255,0.09)' : 'rgba(0,209,255,0.02)',
            color: answer !== undefined ? '#00d1ff' : 'rgba(0,209,255,0.3)',
            cursor: answer !== undefined ? 'pointer' : 'not-allowed',
          }}
        >
          {stepIndex === total - 1 ? 'Voir l\'analyse →' : 'Suivant →'}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Result screen ─────────────────────────────────────────────────────────────

function ResultView({
  answers, onReset, onClose,
}: {
  answers: Record<string, FreeSeverity>
  onReset: () => void
  onClose: () => void
}) {
  const overall = getOverallSeverity(answers)
  const result  = getFreeResult(overall)

  const waLinkUrl = `https://wa.me/qr/7Z3I2DB3CWKVM1?text=${encodeURIComponent(
    `Bonjour Com'9, j'ai effectué le diagnostic gratuit sur mon téléphone.\n\nRésultat global : ${result.label}\n\nPouvez-vous me donner plus d'informations ?`
  )}`

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto px-5 py-8"
    >
      {/* Main result card */}
      <div className="relative rounded-3xl overflow-hidden mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,12,35,0.98) 0%, rgba(5,8,22,0.99) 100%)',
          border: `1px solid ${result.color}30`,
          boxShadow: `0 0 60px ${result.glow}, inset 0 1px 0 ${result.color}15`,
        }}>
        {/* Top glow line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${result.color}80, transparent)` }} />

        {/* Scan line */}
        <motion.div
          animate={{ y: ['-100%', '300%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
          className="absolute inset-x-0 pointer-events-none"
          style={{ height: '1px', background: `linear-gradient(to right, transparent, ${result.color}40, transparent)` }}
        />

        <div className="px-8 py-8 text-center">
          <div className="font-mono text-[9px] tracking-[0.32em] uppercase mb-3"
            style={{ color: 'rgba(0,209,255,0.45)' }}>
            Analyse complète — Com&apos;9
          </div>
          <div className="font-black font-space mb-1" style={{ fontSize: 'clamp(2rem,8vw,3rem)', color: result.color, lineHeight: 1 }}>
            {result.label}
          </div>
          <p className="font-space text-sm mb-4" style={{ color: 'rgba(234,251,255,0.4)' }}>{result.action}</p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: `${result.color}10`, border: `1px solid ${result.color}30` }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: result.color }}
            />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: result.color }}>
              Estimation Com&apos;9
            </span>
          </div>
        </div>
      </div>

      {/* Per-category breakdown */}
      <div className="space-y-2 mb-5">
        {FREE_CATEGORIES.map((cat, i) => {
          const sev  = answers[cat.id]
          const col  = sev !== undefined ? severityColor(sev) : 'rgba(234,251,255,0.2)'
          const lbl  = sev !== undefined ? severityLabel(sev) : '—'
          const opt  = sev !== undefined ? cat.options[sev] : null
          return (
            <motion.div key={cat.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(0,209,255,0.025)', border: '1px solid rgba(0,209,255,0.07)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.12)' }}>
                <CategoryIcon id={cat.id} size={4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-space text-xs font-semibold" style={{ color: 'rgba(234,251,255,0.75)' }}>{cat.label}</div>
                <div className="font-space text-[11px]" style={{ color: 'rgba(234,251,255,0.35)' }}>{opt?.label || '—'}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: col }}>{lbl}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Premium upsell block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-5 px-5 py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(0,102,255,0.07) 0%, rgba(0,209,255,0.03) 100%)',
          border: '1px solid rgba(0,209,255,0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" style={{ color: '#00d1ff' }}>
              <path d="M8 1l1.9 4 4.1.6-3 3 .7 4.1L8 10.5l-3.7 2.2.7-4.1-3-3L6.1 5z" stroke="currentColor" strokeWidth="1.2" fill="rgba(0,209,255,0.1)"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color: 'rgba(0,209,255,0.5)' }}>
              Aller plus loin
            </div>
            <div className="font-space text-sm font-bold text-cold-white mb-1">
              Diagnostic Premium — 4,99 €
            </div>
            <p className="font-space text-[11px] leading-relaxed" style={{ color: 'rgba(234,251,255,0.4)' }}>
              Analyse complète sur 100 points. Audio, réseau, capteurs, Face ID, performances et plus.
              <span style={{ color: 'rgba(0,209,255,0.7)' }}> Déduit du prix si réparation.</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5">
        <motion.a
          href={waLinkUrl} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
          style={{ border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.07)', color: '#4ade80' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.13)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.07)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contacter Com&apos;9
        </motion.a>
        <button onClick={onReset}
          className="w-full py-3 rounded-xl font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
          style={{ border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(234,251,255,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(234,251,255,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(234,251,255,0.3)' }}
        >
          ↺ Refaire l&apos;analyse
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function DiagnosticFreeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]       = useState<'intro' | number | 'result'>('intro')
  const [answers, setAnswers] = useState<Record<string, FreeSeverity>>({})

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const stepIndex  = typeof step === 'number' ? step : -1
  const catCount   = FREE_CATEGORIES.length
  const progress   = typeof step === 'number' ? Math.round((step / catCount) * 100) : step === 'result' ? 100 : 0

  function setAnswer(sev: FreeSeverity) {
    if (typeof step !== 'number') return
    setAnswers(a => ({ ...a, [FREE_CATEGORIES[step].id]: sev }))
  }

  function handleNext() {
    if (typeof step === 'number') {
      if (step === catCount - 1) setStep('result')
      else setStep(step + 1)
    }
  }

  function handlePrev() {
    if (typeof step === 'number') {
      if (step === 0) setStep('intro')
      else setStep(step - 1)
    }
  }

  function handleReset() { setStep('intro'); setAnswers({}) }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,209,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <span className="font-black font-space text-cold-white text-sm">
            COM<span className="text-neon-blue">&apos;9</span>
          </span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-px h-3.5" style={{ background: 'rgba(0,209,255,0.2)' }} />
            <span className="font-mono text-[9px] tracking-[0.28em] uppercase" style={{ color: 'rgba(0,209,255,0.45)' }}>
              Diagnostic
            </span>
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,209,255,0.07)', border: '1px solid rgba(0,209,255,0.18)', color: 'rgba(0,209,255,0.65)' }}>
              Gratuit
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {step !== 'intro' && (
          <div className="flex items-center gap-3 flex-1 max-w-xs mx-4">
            <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(0,209,255,0.1)' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, rgba(0,102,255,0.8), #00d1ff)' }}
              />
            </div>
            {typeof step === 'number' && (
              <span className="font-mono text-[10px] shrink-0" style={{ color: 'rgba(234,251,255,0.3)' }}>
                {step + 1}/{catCount}
              </span>
            )}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <ScanIntro onStart={() => setStep(0)} />
          )}
          {typeof step === 'number' && (
            <StepView
              cat={FREE_CATEGORIES[step]}
              stepIndex={step}
              total={catCount}
              answer={answers[FREE_CATEGORIES[step].id]}
              onAnswer={setAnswer}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {step === 'result' && (
            <ResultView answers={answers} onReset={handleReset} onClose={onClose} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
