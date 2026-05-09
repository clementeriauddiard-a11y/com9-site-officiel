'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Espace Responsable
// Accès : /responsable  (non listé dans la navigation)
// Mot de passe : lib/config.ts → ACCESS_PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

import { ACCESS_PASSWORD } from '@/lib/config'
import { usePhones } from '@/context/PhonesContext'
import {
  conditionColor, statusColor,
  type Phone, type PhoneStatus, type PhoneCondition,
} from '@/data/phones'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CONDITIONS: PhoneCondition[] = ['Excellent', 'Très bon', 'Bon', 'Correct']
const STATUSES:   PhoneStatus[]    = ['Disponible', 'Réservé', 'Vendu']

const DEFAULT_LABELS = [
  "Diagnostic Com'9 effectué",
  "Batterie analysée",
  "Écran vérifié",
  "Caméras testées",
  "Nettoyé & optimisé",
]

const STORAGE_SUGGESTIONS = ['64 Go', '128 Go', '256 Go', '512 Go', '1 To']
const BRAND_SUGGESTIONS   = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Huawei']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(brand: string, model: string, storage: string): string {
  return [brand, model, storage, Date.now()]
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

function autoWaMessage(brand: string, model: string, storage: string, color: string, price: number): string {
  const name = [brand, model, storage, color].filter(Boolean).join(' ')
  return `Bonjour Com'9 👋 Je viens du site. Je suis intéressé(e) par le ${name} à ${price} €. Est-il toujours disponible ?`
}

// ─── Styles partagés ─────────────────────────────────────────────────────────

const inputCls = "w-full bg-transparent rounded-xl px-4 py-3 font-space text-sm outline-none transition-all duration-200 placeholder-cold-white/15"
const inputStyle = { border: '1px solid rgba(0,209,255,0.18)', background: 'rgba(0,0,0,0.28)', color: '#eafbff', caretColor: '#00d1ff' }
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(0,209,255,0.45)'
  e.currentTarget.style.boxShadow   = '0 0 16px rgba(0,209,255,0.07)'
}
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(0,209,255,0.18)'
  e.currentTarget.style.boxShadow   = 'none'
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-2"
      style={{ color: 'rgba(0,209,255,0.5)' }}>
      {children}
    </p>
  )
}

// ─── ACCESS GATE ──────────────────────────────────────────────────────────────

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [value,   setValue]   = useState('')
  const [error,   setError]   = useState(false)
  const [attempts,setAttempts]= useState(0)
  const [shaking, setShaking] = useState(false)
  const [phase,   setPhase]   = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => { setPhase(4); inputRef.current?.focus() }, 1500),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (value === ACCESS_PASSWORD) { onUnlock(); return }
    setError(true); setAttempts(a => a + 1); setShaking(true); setValue('')
    setTimeout(() => setShaking(false), 550)
    inputRef.current?.focus()
  }

  const corners = [
    'top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r',
    'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#050816' }}>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,209,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '600px', height: '600px', background: 'radial-gradient(ellipse,rgba(0,102,255,0.08) 0%,transparent 70%)' }} />

      {/* Full-screen scan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: ['-5%', '105%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear', repeatDelay: 10 }}
          className="absolute w-full"
          style={{ height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.2),rgba(0,209,255,0.4),rgba(0,209,255,0.2),transparent)' }}
        />
      </div>

      {/* Back */}
      <motion.a href="/" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute top-5 left-6 flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] uppercase transition-colors duration-200"
        style={{ color: 'rgba(234,251,255,0.25)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(0,209,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(234,251,255,0.25)'}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M10 4L6 8l4 4"/></svg>
        Retour au site
      </motion.a>

      {/* Panel */}
      <motion.div
        animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg,rgba(0,12,35,0.98) 0%,rgba(5,8,22,0.99) 100%)',
            border: error ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(0,209,255,0.18)',
            boxShadow: error ? '0 0 60px rgba(248,113,113,0.08)' : '0 0 80px rgba(0,102,255,0.12),inset 0 1px 0 rgba(0,209,255,0.1)',
            transition: 'border-color .4s,box-shadow .4s',
          }}>

          {/* Top line */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: phase >= 1 ? 1 : 0 }} transition={{ duration: 0.8, ease: [0.23,1,0.32,1] }}
            className="absolute top-0 inset-x-0 h-px origin-center"
            style={{ background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.7),rgba(0,102,255,0.5),rgba(0,209,255,0.7),transparent)' }} />

          {/* Scan */}
          <motion.div animate={{ y: ['-100%', '500%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 7 }}
            className="absolute inset-x-0 pointer-events-none"
            style={{ height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.35),transparent)' }} />

          {/* Corners */}
          {corners.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.23,1,0.32,1] }}
              className={`absolute ${c} w-5 h-5 pointer-events-none`}
              style={{ borderColor: 'rgba(0,209,255,0.55)', borderWidth: '1.5px', borderStyle: 'solid',
                ...(c.includes('border-r') && !c.includes('border-l') ? { borderLeft: 'none' } : {}),
                ...(c.includes('border-l') && !c.includes('border-r') ? { borderRight: 'none' } : {}),
                ...(c.includes('border-b') && !c.includes('border-t') ? { borderTop: 'none' } : {}),
                ...(c.includes('border-t') && !c.includes('border-b') ? { borderBottom: 'none' } : {}),
              }} />
          ))}

          {/* Inner grid */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(0,209,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.8) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="relative z-10 px-8 py-10">

            {/* Logo */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 1 ? 1 : 0 }} transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-8">
              <span className="font-black font-space text-cold-white text-base">COM<span className="gradient-text">&apos;9</span></span>
              <span className="w-px h-3.5 mx-1" style={{ background: 'rgba(0,209,255,0.2)' }} />
              <span className="font-mono text-[8px] tracking-[0.28em] uppercase" style={{ color: 'rgba(0,209,255,0.4)' }}>Internal System</span>
            </motion.div>

            {/* Lock icon */}
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.7 }} transition={{ duration: 0.6, ease: [0.23,1,0.32,1] }}
              className="relative w-16 h-16 mx-auto mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg,transparent 65%,rgba(0,209,255,0.4) 80%,transparent 95%)' }} />
              <div className="absolute inset-1.5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-7 h-7"
                  style={{ color: error ? '#f87171' : '#00d1ff', transition: 'color .3s' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <motion.div animate={{ opacity: [0.3,0.8,0.3] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: error ? '0 0 24px rgba(248,113,113,0.25)' : '0 0 24px rgba(0,209,255,0.2)', transition: 'box-shadow .3s' }} />
            </motion.div>

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }} transition={{ duration: 0.5 }}
              className="text-center mb-2">
              <div className="font-mono text-[8px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(0,209,255,0.45)' }}>Com&apos;9</div>
              <h1 className="font-black font-space text-cold-white text-xl mb-1 tracking-tight">
                RESPONSABLE <span className="gradient-text">COM&apos;9</span>
              </h1>
            </motion.div>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: phase >= 3 ? 1 : 0, scale: phase >= 3 ? 1 : 0.9 }} transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}>
                <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: '#f87171' }}>Access Restricted</span>
              </div>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.5 }}
              className="text-center font-space text-xs mb-8 leading-relaxed" style={{ color: 'rgba(234,251,255,0.3)' }}>
              Espace réservé au responsable Com&apos;9.<br />Authentification requise.
            </motion.p>

            {/* Form */}
            <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 12 }} transition={{ duration: 0.5 }}
              onSubmit={submit} className="space-y-3">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"
                    style={{ color: error ? 'rgba(248,113,113,0.6)' : 'rgba(0,209,255,0.45)', transition: 'color .3s' }}>
                    <rect x="2" y="7" width="12" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/>
                  </svg>
                </div>
                <input ref={inputRef} type="password" value={value}
                  onChange={e => { setValue(e.target.value); setError(false) }}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••••••••" autoComplete="off"
                  className="w-full bg-transparent rounded-xl pl-10 pr-4 py-3.5 font-mono text-sm outline-none transition-all duration-200 placeholder:text-cold-white/15"
                  style={{ border: error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(0,209,255,0.2)', background: error ? 'rgba(248,113,113,0.04)' : 'rgba(0,209,255,0.03)', color: '#eafbff', caretColor: '#00d1ff' }}
                  onFocus={e => { if (!error) { e.currentTarget.style.borderColor = 'rgba(0,209,255,0.45)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,209,255,0.08)' }}}
                  onBlur={e => { if (!error) { e.currentTarget.style.borderColor = 'rgba(0,209,255,0.2)'; e.currentTarget.style.boxShadow = 'none' }}}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
                    style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0" style={{ color: '#f87171' }}>
                      <circle cx="8" cy="8" r="6.5"/><path d="M8 5v3"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
                    </svg>
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: '#f87171' }}>
                      Accès refusé{attempts > 1 ? ` — tentative ${attempts}` : ''}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                disabled={!value}
                className="w-full py-4 rounded-xl font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-3"
                style={{ border: value ? '1px solid rgba(0,209,255,0.4)' : '1px solid rgba(0,209,255,0.12)', background: value ? 'rgba(0,209,255,0.1)' : 'rgba(0,209,255,0.02)', color: value ? '#00d1ff' : 'rgba(0,209,255,0.3)', cursor: value ? 'pointer' : 'not-allowed', boxShadow: value ? '0 0 24px rgba(0,102,255,0.1)' : 'none' }}
                onMouseEnter={e => { if (value) { e.currentTarget.style.background = 'rgba(0,209,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(0,209,255,0.15)' }}}
                onMouseLeave={e => { if (value) { e.currentTarget.style.background = 'rgba(0,209,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,102,255,0.1)' }}}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                  <rect x="2" y="7" width="12" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/>
                </svg>
                Accéder au dashboard
              </motion.button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 4 ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-7 pt-5 text-center" style={{ borderTop: '1px solid rgba(0,209,255,0.06)' }}>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase" style={{ color: 'rgba(234,251,255,0.15)' }}>
                Com&apos;9 · Gestion interne
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── LABELS EDITOR ────────────────────────────────────────────────────────────

function LabelsEditor({ labels, onChange }: { labels: string[]; onChange: (l: string[]) => void }) {
  function update(i: number, val: string) { const n = [...labels]; n[i] = val; onChange(n) }
  function remove(i: number)              { onChange(labels.filter((_, j) => j !== i)) }
  function add()                          { onChange([...labels, '']) }

  return (
    <div className="space-y-2">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
            style={{ border: '1px solid rgba(0,209,255,0.18)', background: 'rgba(0,0,0,0.28)' }}>
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 shrink-0" style={{ color: '#00d1ff' }}>
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input value={label} onChange={e => update(i, e.target.value)}
              placeholder="Point de certification..."
              className="flex-1 bg-transparent font-space text-sm outline-none"
              style={{ color: '#eafbff', caretColor: '#00d1ff' }}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(0,209,255,0.45)')}
              onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(0,209,255,0.18)')}
            />
          </div>
          <button onClick={() => remove(i)}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
            style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)', color: 'rgba(248,113,113,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.05)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)' }}
            type="button">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M3 3l8 8M11 3l-8 8"/></svg>
          </button>
        </div>
      ))}
      <button onClick={add} type="button"
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-200"
        style={{ border: '1px solid rgba(0,209,255,0.15)', background: 'transparent', color: 'rgba(0,209,255,0.55)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.35)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.15)' }}>
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M7 2v10M2 7h10"/></svg>
        Ajouter un point
      </button>
    </div>
  )
}

// ─── STATUS PILLS ─────────────────────────────────────────────────────────────

function StatusPills({ value, onChange }: { value: PhoneStatus; onChange: (s: PhoneStatus) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map(s => {
        const active = value === s
        const col = statusColor[s]
        return (
          <button key={s} type="button" onClick={() => onChange(s)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[9.5px] tracking-[0.15em] uppercase transition-all duration-200"
            style={{
              border: active ? `1px solid ${col}50` : '1px solid rgba(255,255,255,0.07)',
              background: active ? `${col}12` : 'rgba(255,255,255,0.02)',
              color: active ? col : 'rgba(234,251,255,0.3)',
            }}>
            {active && <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.8, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col }} />}
            {s}
          </button>
        )
      })}
    </div>
  )
}

// ─── PHONE FORM MODAL ─────────────────────────────────────────────────────────

type FormData = Omit<Phone, 'id'>

const EMPTY_FORM: FormData = {
  brand: 'Apple', model: '', storage: '128 Go', color: '',
  battery: 90, condition: 'Très bon', com9Score: 90, price: 0,
  status: 'Disponible', image: '', description: '',
  labels: [...DEFAULT_LABELS],
  whatsappMessage: '',
}

function PhoneFormModal({
  initial, onSave, onClose,
}: {
  initial?: Phone
  onSave:  (data: FormData, id?: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<FormData>(
    initial ? (({ id: _id, ...rest }) => rest)(initial) : { ...EMPTY_FORM, labels: [...DEFAULT_LABELS] }
  )

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(f => ({ ...f, [k]: v }))
  }, [])

  function autoGenerate() {
    set('whatsappMessage', autoWaMessage(form.brand, form.model, form.storage, form.color, form.price))
  }

  function save() {
    const wam = form.whatsappMessage.trim() ||
      autoWaMessage(form.brand, form.model, form.storage, form.color, form.price)
    onSave({ ...form, whatsappMessage: wam }, initial?.id)
  }

  const isEdit = !!initial

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
      style={{ background: 'rgba(5,8,22,0.9)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3, ease: [0.23,1,0.32,1] }}
        className="w-full max-w-2xl relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,rgba(0,12,30,0.99) 0%,rgba(5,8,22,1) 100%)', border: '1px solid rgba(0,209,255,0.2)', boxShadow: '0 0 80px rgba(0,102,255,0.15),inset 0 1px 0 rgba(0,209,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.7),rgba(0,102,255,0.5),rgba(0,209,255,0.7),transparent)' }} />

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,209,255,0.08)' }}>
          <div>
            <p className="font-mono text-[8.5px] tracking-[0.28em] uppercase mb-0.5" style={{ color: 'rgba(0,209,255,0.5)' }}>
              {isEdit ? 'Modification' : 'Nouveau téléphone'}
            </p>
            <h2 className="font-black font-space text-cold-white text-lg">
              {isEdit ? `${initial.brand} ${initial.model}` : 'Ajouter un téléphone'}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(234,251,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(234,251,255,0.4)' }}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M2 2l10 10M12 2L2 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Groupe 1 : Identité */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(0,209,255,0.3)' }}>— Identité du produit</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Marque</FieldLabel>
                <input list="brands-list" value={form.brand} onChange={e => set('brand', e.target.value)}
                  placeholder="Apple" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                <datalist id="brands-list">{BRAND_SUGGESTIONS.map(b => <option key={b} value={b} />)}</datalist>
              </div>
              <div>
                <FieldLabel>Modèle</FieldLabel>
                <input value={form.model} onChange={e => set('model', e.target.value)}
                  placeholder="iPhone 15 Pro" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <FieldLabel>Stockage</FieldLabel>
                <input list="storage-list" value={form.storage} onChange={e => set('storage', e.target.value)}
                  placeholder="128 Go" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                <datalist id="storage-list">{STORAGE_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div>
                <FieldLabel>Couleur</FieldLabel>
                <input value={form.color} onChange={e => set('color', e.target.value)}
                  placeholder="Noir sidéral" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
          </div>

          {/* Groupe 2 : État technique */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(0,209,255,0.3)' }}>— État technique</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Batterie */}
              <div>
                <FieldLabel>Santé batterie — {form.battery} %</FieldLabel>
                <div className="space-y-2">
                  <input type="range" min={0} max={100} value={form.battery}
                    onChange={e => set('battery', Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer" />
                  <input type="number" min={0} max={100} value={form.battery}
                    onChange={e => set('battery', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputCls} style={{ ...inputStyle, padding: '8px 16px' }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              {/* Score */}
              <div>
                <FieldLabel>Score Com&apos;9 — {form.com9Score} / 100</FieldLabel>
                <div className="space-y-2">
                  <input type="range" min={0} max={100} value={form.com9Score}
                    onChange={e => set('com9Score', Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer" />
                  <input type="number" min={0} max={100} value={form.com9Score}
                    onChange={e => set('com9Score', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputCls} style={{ ...inputStyle, padding: '8px 16px' }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              {/* Condition */}
              <div>
                <FieldLabel>État général</FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {CONDITIONS.map(c => {
                    const active = form.condition === c
                    const col = conditionColor[c]
                    return (
                      <button key={c} type="button" onClick={() => set('condition', c)}
                        className="px-3 py-1.5 rounded-lg font-mono text-[9.5px] tracking-[0.12em] uppercase transition-all duration-200"
                        style={{ border: active ? `1px solid ${col}55` : '1px solid rgba(255,255,255,0.07)', background: active ? `${col}12` : 'rgba(255,255,255,0.02)', color: active ? col : 'rgba(234,251,255,0.3)' }}>
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prix */}
              <div>
                <FieldLabel>Prix (€)</FieldLabel>
                <input type="number" min={0} value={form.price || ''}
                  onChange={e => set('price', Number(e.target.value))}
                  placeholder="299" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
          </div>

          {/* Groupe 3 : Vente */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(0,209,255,0.3)' }}>— Disponibilité & visuel</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Statut</FieldLabel>
                <StatusPills value={form.status} onChange={v => set('status', v)} />
              </div>
              <div>
                <FieldLabel>Image <span style={{ color: 'rgba(234,251,255,0.25)' }}>(optionnel)</span></FieldLabel>
                <input value={form.image ?? ''} onChange={e => set('image', e.target.value)}
                  placeholder="/phones/iphone-15-noir.jpg" className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                <p className="font-mono text-[8px] mt-1.5" style={{ color: 'rgba(234,251,255,0.2)' }}>
                  Placer le fichier dans /public/phones/
                </p>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Description courte <span style={{ color: 'rgba(234,251,255,0.25)' }}>(optionnel)</span></FieldLabel>
                <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
                  placeholder="Face ID parfait. Légères micro-rayures sur châssis." rows={2}
                  className={`${inputCls} resize-none`} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
          </div>

          {/* Groupe 4 : Certification */}
          <div>
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(0,209,255,0.3)' }}>— Points de certification</p>
            <LabelsEditor labels={form.labels} onChange={v => set('labels', v)} />
          </div>

          {/* Groupe 5 : WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Message WhatsApp</FieldLabel>
              <button type="button" onClick={autoGenerate}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[8.5px] tracking-[0.15em] uppercase transition-all duration-200"
                style={{ border: '1px solid rgba(0,209,255,0.2)', background: 'rgba(0,209,255,0.05)', color: 'rgba(0,209,255,0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.2)' }}>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M2 7h10M7 2l5 5-5 5"/></svg>
                Auto-générer
              </button>
            </div>
            <textarea value={form.whatsappMessage} onChange={e => set('whatsappMessage', e.target.value)}
              placeholder="Bonjour Com'9 👋 Je suis intéressé(e) par..." rows={3}
              className={`${inputCls} resize-none`} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            <p className="font-mono text-[8px] mt-1.5" style={{ color: 'rgba(234,251,255,0.2)' }}>
              Laisse vide pour générer automatiquement depuis les infos du téléphone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(0,209,255,0.08)' }}>
          <button onClick={onClose} type="button"
            className="px-5 py-2.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(234,251,255,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
            Annuler
          </button>
          <motion.button onClick={save} type="button" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
            style={{ border: '1px solid rgba(0,209,255,0.4)', background: 'rgba(0,209,255,0.1)', color: '#00d1ff', boxShadow: '0 0 20px rgba(0,102,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,209,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,102,255,0.1)' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M2.5 8.5l3.5 3.5 7.5-7.5"/>
            </svg>
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────

function DeleteModal({ phone, onConfirm, onClose }: { phone: Phone; onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(5,8,22,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.23,1,0.32,1] }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,rgba(0,12,30,0.99) 0%,rgba(5,8,22,1) 100%)', border: '1px solid rgba(248,113,113,0.25)', boxShadow: '0 0 60px rgba(248,113,113,0.08)' }}
      >
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right,transparent,rgba(248,113,113,0.5),transparent)' }} />
        <div className="p-7 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-7 h-7" style={{ color: '#f87171' }}>
              <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h3 className="font-black font-space text-cold-white text-lg mb-2">Supprimer ce téléphone ?</h3>
          <p className="font-space text-sm mb-1" style={{ color: 'rgba(234,251,255,0.55)' }}>
            {phone.brand} {phone.model} — {phone.storage}
          </p>
          <p className="font-mono text-[9px] tracking-[0.15em] mb-7" style={{ color: 'rgba(248,113,113,0.6)' }}>
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(234,251,255,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Annuler
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{ border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.16)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)' }}>
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── PHONE CARD (dashboard) ───────────────────────────────────────────────────

function PhoneDashCard({
  phone, onEdit, onDelete, onStatusChange,
}: {
  phone: Phone
  onEdit:        () => void
  onDelete:      () => void
  onStatusChange: (s: PhoneStatus) => void
}) {
  const condCol = conditionColor[phone.condition]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.23,1,0.32,1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg,rgba(0,12,30,0.97) 0%,rgba(5,8,22,0.99) 100%)', border: '1px solid rgba(0,209,255,0.1)', boxShadow: '0 0 30px rgba(0,0,0,0.4),inset 0 1px 0 rgba(0,209,255,0.06)' }}
    >
      {/* Top line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.3),transparent)' }} />

      <div className="p-4">
        {/* Row 1: photo + info + actions */}
        <div className="flex items-start gap-3 mb-4">

          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(0,209,255,0.04)', border: '1px solid rgba(0,209,255,0.1)' }}>
            {phone.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={phone.image} alt={phone.model} className="w-full h-full object-contain p-1.5" />
            ) : (
              <svg viewBox="0 0 40 72" fill="none" className="h-8 opacity-20">
                <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
                <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
                <circle cx="20" cy="62" r="3" stroke="#00d1ff" strokeWidth="1"/>
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black font-space text-cold-white text-sm leading-tight truncate">
              {phone.brand} {phone.model}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {[phone.storage, phone.color].map(t => (
                <span key={t} className="font-mono text-[8.5px] tracking-[0.12em] px-1.5 py-0.5 rounded"
                  style={{ color: 'rgba(234,251,255,0.38)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {t}
                </span>
              ))}
              <span className="font-mono text-[8.5px] px-1.5 py-0.5 rounded"
                style={{ color: condCol, background: `${condCol}10`, border: `1px solid ${condCol}30` }}>
                {phone.condition}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onEdit} title="Modifier"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(0,209,255,0.18)', background: 'rgba(0,209,255,0.04)', color: 'rgba(0,209,255,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'; e.currentTarget.style.color = '#00d1ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.18)'; e.currentTarget.style.color = 'rgba(0,209,255,0.6)' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M10 2l2 2L5 11l-3 1 1-3z"/><path d="M9 3l2 2"/>
              </svg>
            </button>
            <button onClick={onDelete} title="Supprimer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(248,113,113,0.18)', background: 'rgba(248,113,113,0.04)', color: 'rgba(248,113,113,0.5)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.04)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.18)'; e.currentTarget.style.color = 'rgba(248,113,113,0.5)' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <polyline points="2,3 3,3 12,3"/><path d="M11 3l-.7 8a1 1 0 01-1 .9H4.7a1 1 0 01-1-.9L3 3"/><path d="M5.5 3V2h3v1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: score + batterie + prix */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: 'rgba(0,209,255,0.4)' }}>Score</span>
            <span className="font-black font-space text-neon-blue text-sm">{phone.com9Score}</span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(234,251,255,0.2)' }}>/100</span>
          </div>
          <div className="w-px h-3" style={{ background: 'rgba(0,209,255,0.15)' }} />
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: 'rgba(0,209,255,0.4)' }}>Batterie</span>
            <span className="font-bold font-space text-sm" style={{ color: phone.battery >= 85 ? '#00d1ff' : phone.battery >= 75 ? '#a0b4d0' : '#facc15' }}>
              {phone.battery} %
            </span>
          </div>
          <div className="ml-auto">
            <span className="font-black font-space text-neon-blue text-lg leading-none">{phone.price} €</span>
          </div>
        </div>

        {/* Row 3: statut rapide */}
        <div style={{ borderTop: '1px solid rgba(0,209,255,0.06)', paddingTop: '10px' }}>
          <p className="font-mono text-[7.5px] tracking-[0.22em] uppercase mb-2" style={{ color: 'rgba(0,209,255,0.3)' }}>Statut</p>
          <div className="flex gap-1.5">
            {STATUSES.map(s => {
              const active = phone.status === s
              const col = statusColor[s]
              return (
                <button key={s} onClick={() => onStatusChange(s)}
                  className="flex-1 py-1.5 rounded-lg font-mono text-[8.5px] tracking-[0.1em] uppercase transition-all duration-200"
                  style={{ border: active ? `1px solid ${col}50` : '1px solid rgba(255,255,255,0.06)', background: active ? `${col}12` : 'rgba(255,255,255,0.02)', color: active ? col : 'rgba(234,251,255,0.25)' }}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────

function StatsBar({ phones }: { phones: Phone[] }) {
  const total      = phones.length
  const available  = phones.filter(p => p.status === 'Disponible').length
  const reserved   = phones.filter(p => p.status === 'Réservé').length
  const sold       = phones.filter(p => p.status === 'Vendu').length

  const stats = [
    { label: 'Total',      value: total,     color: 'rgba(0,209,255,0.7)',    icon: 'grid' },
    { label: 'Disponible', value: available,  color: '#00d1ff',                icon: 'check' },
    { label: 'Réservé',    value: reserved,   color: '#facc15',                icon: 'clock' },
    { label: 'Vendu',      value: sold,       color: 'rgba(234,251,255,0.35)', icon: 'x' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
          className="relative rounded-2xl px-5 py-4 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(0,12,30,0.97) 0%,rgba(5,8,22,0.99) 100%)', border: '1px solid rgba(0,209,255,0.09)', boxShadow: 'inset 0 1px 0 rgba(0,209,255,0.06)' }}>
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right,transparent,${s.color}40,transparent)` }} />
          <p className="font-mono text-[8.5px] tracking-[0.22em] uppercase mb-2" style={{ color: 'rgba(234,251,255,0.28)' }}>{s.label}</p>
          <p className="font-black font-space text-3xl leading-none" style={{ color: s.color }}>{s.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { phones, addPhone, updatePhone, deletePhone } = usePhones()

  const [formOpen,    setFormOpen]    = useState(false)
  const [editPhone,   setEditPhone]   = useState<Phone | undefined>()
  const [deletePhone_, setDeletePhone] = useState<Phone | undefined>()
  const [saved,       setSaved]       = useState(false)

  function handleSave(data: FormData, id?: string) {
    if (id) {
      updatePhone(id, data)
    } else {
      addPhone({ id: generateId(data.brand, data.model, data.storage), ...data })
    }
    setFormOpen(false)
    setEditPhone(undefined)
    // Confirmation flash
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  function handleEdit(phone: Phone) {
    setEditPhone(phone)
    setFormOpen(true)
  }

  function handleDelete(phone: Phone) {
    setDeletePhone(phone)
  }

  function confirmDelete() {
    if (deletePhone_) { deletePhone(deletePhone_.id); setDeletePhone(undefined) }
  }

  function openAdd() {
    setEditPhone(undefined)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen" style={{ background: '#050816' }}>

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,209,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.018) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '800px', height: '500px', background: 'radial-gradient(ellipse,rgba(0,102,255,0.06) 0%,transparent 70%)' }} />

      {/* Header */}
      <header className="sticky top-0 z-40 transition-all duration-300"
        style={{ background: 'rgba(5,8,22,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,209,255,0.08)', boxShadow: '0 4px 40px rgba(0,0,0,0.3)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-black font-space text-cold-white text-base">COM<span className="gradient-text">&apos;9</span></span>
            </a>
            <span className="w-px h-4" style={{ background: 'rgba(0,209,255,0.18)' }} />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.18)' }}>
              <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d1ff' }} />
              <span className="font-mono text-[8.5px] tracking-[0.22em] uppercase" style={{ color: 'rgba(0,209,255,0.75)' }}>
                Responsable Com&apos;9
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Confirmation saved */}
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3" style={{ color: '#4ade80' }}>
                    <path d="M2 6l2.5 2.5 5.5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-mono text-[8.5px] tracking-[0.15em] uppercase" style={{ color: '#4ade80' }}>Enregistré</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View site */}
            <a href="/#occasion" target="_blank"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{ border: '1px solid rgba(0,209,255,0.15)', background: 'rgba(0,209,255,0.04)', color: 'rgba(0,209,255,0.55)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.3)'; e.currentTarget.style.color = '#00d1ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.15)'; e.currentTarget.style.color = 'rgba(0,209,255,0.55)' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <path d="M7 1a6 6 0 100 12A6 6 0 007 1z"/><path d="M1 7h12M7 1c-1.5 2-2.5 3.9-2.5 6s1 4 2.5 6M7 1c1.5 2 2.5 3.9 2.5 6s-1 4-2.5 6"/>
              </svg>
              Voir le site
            </a>

            {/* Logout */}
            <button onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{ border: '1px solid rgba(248,113,113,0.18)', background: 'rgba(248,113,113,0.04)', color: 'rgba(248,113,113,0.55)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.04)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.18)'; e.currentTarget.style.color = 'rgba(248,113,113,0.55)' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* Stats */}
        <StatsBar phones={phones} />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-black font-space text-cold-white text-xl mb-0.5">Catalogue téléphones</h1>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(0,209,255,0.4)' }}>
              {phones.length} appareil{phones.length !== 1 ? 's' : ''} dans la marketplace
            </p>
          </div>
          <motion.button onClick={openAdd} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-200"
            style={{ border: '1px solid rgba(0,209,255,0.4)', background: 'rgba(0,209,255,0.08)', color: '#00d1ff', boxShadow: '0 0 24px rgba(0,102,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(0,209,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,209,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,102,255,0.1)' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M8 2v12M2 8h12"/>
            </svg>
            Ajouter un téléphone
          </motion.button>
        </div>

        {/* Grid */}
        {phones.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 rounded-2xl"
            style={{ border: '1px dashed rgba(0,209,255,0.12)', background: 'rgba(0,209,255,0.02)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.12)' }}>
              <svg viewBox="0 0 40 72" fill="none" className="h-9 opacity-25">
                <rect x="2" y="2" width="36" height="68" rx="6" stroke="#00d1ff" strokeWidth="1.5"/>
                <rect x="8" y="10" width="24" height="44" rx="2" stroke="#00d1ff" strokeWidth="1"/>
              </svg>
            </div>
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: 'rgba(0,209,255,0.35)' }}>Aucun téléphone</p>
            <p className="font-space text-sm mb-6" style={{ color: 'rgba(234,251,255,0.28)' }}>
              Clique sur &ldquo;Ajouter un téléphone&rdquo; pour commencer.
            </p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{ border: '1px solid rgba(0,209,255,0.3)', background: 'rgba(0,209,255,0.07)', color: '#00d1ff' }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M7 1v12M1 7h12"/></svg>
              Premier téléphone
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {phones.map(phone => (
                <PhoneDashCard
                  key={phone.id} phone={phone}
                  onEdit={() => handleEdit(phone)}
                  onDelete={() => handleDelete(phone)}
                  onStatusChange={s => updatePhone(phone.id, { status: s })}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {formOpen && (
          <PhoneFormModal
            key="form"
            initial={editPhone}
            onSave={handleSave}
            onClose={() => { setFormOpen(false); setEditPhone(undefined) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletePhone_ && (
          <DeleteModal
            key="delete"
            phone={deletePhone_}
            onConfirm={confirmDelete}
            onClose={() => setDeletePhone(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ResponsablePage() {
  const [unlocked, setUnlocked] = useState(false)

  // Mémoriser la session (reste connecté si on refresh la page)
  useEffect(() => {
    if (sessionStorage.getItem('com9_admin') === '1') setUnlocked(true)
  }, [])

  function unlock() {
    sessionStorage.setItem('com9_admin', '1')
    setUnlocked(true)
  }

  function logout() {
    sessionStorage.removeItem('com9_admin')
    setUnlocked(false)
  }

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Dashboard onLogout={logout} />
        </motion.div>
      ) : (
        <motion.div key="gate" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.3 }}>
          <AccessGate onUnlock={unlock} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
