'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Page de connexion admin premium
// Design futuriste cohérent avec la DA du site
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Formulaire (séparé pour useSearchParams + Suspense) ─────────────────────

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get('from') || '/responsable'

  const [value,    setValue]    = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [shaking,  setShaking]  = useState(false)
  const [phase,    setPhase]    = useState(0)
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

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!value || loading) return

    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: value }),
      })

      if (res.ok) {
        router.push(from)
      } else {
        setError(true)
        setAttempts(a => a + 1)
        setShaking(true)
        setValue('')
        setTimeout(() => { setShaking(false); inputRef.current?.focus() }, 550)
      }
    } catch {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 550)
    } finally {
      setLoading(false)
    }
  }

  const corners = [
    'top-0 left-0 border-t border-l',
    'top-0 right-0 border-t border-r',
    'bottom-0 left-0 border-b border-l',
    'bottom-0 right-0 border-b border-r',
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#050816' }}
    >
      {/* Grille de fond */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,209,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.025) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Halo central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '600px', height: '600px', background: 'radial-gradient(ellipse,rgba(0,102,255,0.08) 0%,transparent 70%)' }}
      />

      {/* Scan ligne plein écran */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: ['-5%', '105%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear', repeatDelay: 10 }}
          className="absolute w-full"
          style={{ height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.2),rgba(0,209,255,0.4),rgba(0,209,255,0.2),transparent)' }}
        />
      </div>

      {/* Retour au site */}
      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute top-5 left-6 flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] uppercase transition-colors duration-200"
        style={{ color: 'rgba(234,251,255,0.25)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,209,255,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(234,251,255,0.25)')}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
          <path d="M10 4L6 8l4 4"/>
        </svg>
        Retour au site
      </motion.a>

      {/* Panneau principal */}
      <motion.div
        animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg,rgba(0,12,35,0.98) 0%,rgba(5,8,22,0.99) 100%)',
            border:     error ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(0,209,255,0.18)',
            boxShadow:  error
              ? '0 0 60px rgba(248,113,113,0.08)'
              : '0 0 80px rgba(0,102,255,0.12),inset 0 1px 0 rgba(0,209,255,0.1)',
            transition: 'border-color .4s,box-shadow .4s',
          }}
        >
          {/* Ligne supérieure */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-0 inset-x-0 h-px origin-center"
            style={{ background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.7),rgba(0,102,255,0.5),rgba(0,209,255,0.7),transparent)' }}
          />

          {/* Scan interne */}
          <motion.div
            animate={{ y: ['-100%', '500%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 7 }}
            className="absolute inset-x-0 pointer-events-none"
            style={{ height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,209,255,0.35),transparent)' }}
          />

          {/* Coins */}
          {corners.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute ${c} w-5 h-5 pointer-events-none`}
              style={{
                borderColor: 'rgba(0,209,255,0.55)',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                ...(c.includes('border-r') && !c.includes('border-l') ? { borderLeft: 'none' } : {}),
                ...(c.includes('border-l') && !c.includes('border-r') ? { borderRight: 'none' } : {}),
                ...(c.includes('border-b') && !c.includes('border-t') ? { borderTop: 'none' } : {}),
                ...(c.includes('border-t') && !c.includes('border-b') ? { borderBottom: 'none' } : {}),
              }}
            />
          ))}

          {/* Grille intérieure */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,209,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.8) 1px,transparent 1px)',
              backgroundSize:  '30px 30px',
            }}
          />

          <div className="relative z-10 px-8 py-10">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="font-black font-space text-cold-white text-base">
                COM<span className="gradient-text">&apos;9</span>
              </span>
              <span className="w-px h-3.5 mx-1" style={{ background: 'rgba(0,209,255,0.2)' }} />
              <span className="font-mono text-[8px] tracking-[0.28em] uppercase" style={{ color: 'rgba(0,209,255,0.4)' }}>
                Internal System
              </span>
            </motion.div>

            {/* Icône verrou */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.7 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-16 h-16 mx-auto mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg,transparent 65%,rgba(0,209,255,0.4) 80%,transparent 95%)' }}
              />
              <div
                className="absolute inset-1.5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.2)' }}
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-7 h-7"
                  style={{ color: error ? '#f87171' : '#00d1ff', transition: 'color .3s' }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: error ? '0 0 24px rgba(248,113,113,0.25)' : '0 0 24px rgba(0,209,255,0.2)', transition: 'box-shadow .3s' }}
              />
            </motion.div>

            {/* Titre */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-2"
            >
              <div className="font-mono text-[8px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(0,209,255,0.45)' }}>
                Com&apos;9
              </div>
              <h1 className="font-black font-space text-cold-white text-xl mb-1 tracking-tight">
                ESPACE <span className="gradient-text">RESPONSABLE</span>
              </h1>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: phase >= 3 ? 1 : 0, scale: phase >= 3 ? 1 : 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#f87171' }}
                />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: '#f87171' }}>
                  Access Restricted
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="text-center font-space text-xs mb-8 leading-relaxed"
              style={{ color: 'rgba(234,251,255,0.3)' }}
            >
              Espace réservé au responsable Com&apos;9.<br />Authentification requise.
            </motion.p>

            {/* Formulaire */}
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 12 }}
              transition={{ duration: 0.5 }}
              onSubmit={submit}
              className="space-y-3"
            >
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"
                    style={{ color: error ? 'rgba(248,113,113,0.6)' : 'rgba(0,209,255,0.45)', transition: 'color .3s' }}
                  >
                    <rect x="2" y="7" width="12" height="8" rx="1.5"/>
                    <path d="M5 7V5a3 3 0 016 0v2"/>
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => { setValue(e.target.value); setError(false) }}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent rounded-xl pl-10 pr-10 py-3.5 font-mono text-sm outline-none transition-all duration-200 placeholder:text-cold-white/15"
                  style={{
                    border:     error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(0,209,255,0.2)',
                    background: error ? 'rgba(248,113,113,0.04)' : 'rgba(0,209,255,0.03)',
                    color:      '#eafbff',
                    caretColor: '#00d1ff',
                  }}
                  onFocus={e => { if (!error) { e.currentTarget.style.borderColor = 'rgba(0,209,255,0.45)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,209,255,0.08)' } }}
                  onBlur={e => { if (!error) { e.currentTarget.style.borderColor = 'rgba(0,209,255,0.2)'; e.currentTarget.style.boxShadow = 'none' } }}
                />
                {/* Bouton afficher/masquer */}
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity duration-200"
                  style={{ color: 'rgba(0,209,255,0.35)', opacity: value ? 1 : 0.4 }}
                >
                  {show ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5">
                      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/>
                      <path d="M2 2l12 12" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5">
                      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Message d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
                    style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0" style={{ color: '#f87171' }}>
                      <circle cx="8" cy="8" r="6.5"/>
                      <path d="M8 5v3"/>
                      <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
                    </svg>
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: '#f87171' }}>
                      Accès refusé{attempts > 1 ? ` — tentative ${attempts}` : ''}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton submit */}
              <motion.button
                type="submit"
                whileHover={value && !loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={value && !loading ? { scale: 0.97 } : {}}
                disabled={!value || loading}
                className="w-full py-4 rounded-xl font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-3"
                style={{
                  border:     value ? '1px solid rgba(0,209,255,0.4)' : '1px solid rgba(0,209,255,0.12)',
                  background: value ? 'rgba(0,209,255,0.1)'           : 'rgba(0,209,255,0.02)',
                  color:      value ? '#00d1ff'                        : 'rgba(0,209,255,0.3)',
                  cursor:     value && !loading ? 'pointer'            : 'not-allowed',
                  boxShadow:  value ? '0 0 24px rgba(0,102,255,0.1)'  : 'none',
                }}
                onMouseEnter={e => { if (value && !loading) { e.currentTarget.style.background = 'rgba(0,209,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(0,209,255,0.15)' } }}
                onMouseLeave={e => { if (value && !loading) { e.currentTarget.style.background = 'rgba(0,209,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,209,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,102,255,0.1)' } }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 border rounded-full"
                      style={{ borderColor: 'rgba(0,209,255,0.2)', borderTopColor: '#00d1ff' }}
                    />
                    Vérification…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <rect x="2" y="7" width="12" height="8" rx="1.5"/>
                      <path d="M5 7V5a3 3 0 016 0v2"/>
                    </svg>
                    Accéder au dashboard
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-7 pt-5 text-center"
              style={{ borderTop: '1px solid rgba(0,209,255,0.06)' }}
            >
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase" style={{ color: 'rgba(234,251,255,0.15)' }}>
                Com&apos;9 · Session sécurisée · 7 jours
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Page principale (avec Suspense pour useSearchParams) ─────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050816' }}>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(0,209,255,0.4)' }}
        >
          Chargement…
        </motion.span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
