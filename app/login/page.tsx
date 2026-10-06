'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Connexion à l'espace COM'9 (agenda)
// Sobre, lisible au téléphone. La limitation des essais est côté serveur.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BackLink from '@/components/ui/BackLink'
import { Wordmark } from '@/components/Navbar'
import Logo from '@/components/ui/Logo'
import { Btn, ErrorBox, inputCls, inputStyle } from '@/components/ui/kit'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get('from') || '/responsable/agenda'
  // Retour uniquement vers une page du site (jamais un autre domaine).
  const from = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/responsable/agenda'

  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      })
      if (res.ok) {
        router.push(from)
        return
      }
      const data = await res.json().catch(() => ({}))
      setError(res.status === 401 ? 'Mot de passe incorrect.' : (data.error ?? 'Connexion impossible.'))
      setValue('')
      inputRef.current?.focus()
    } catch {
      setError('Connexion impossible. Vérifiez le réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="absolute left-4 top-4" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
        <BackLink href="/" label="Accueil" />
      </div>

      <form onSubmit={submit} className="c9-surface flex w-full max-w-sm flex-col gap-6 rounded-[24px] p-7" noValidate>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-3"><Logo size={56} priority decorative /><Wordmark className="text-[1.75rem]" /></span>
          <h1 className="text-[1.25rem] font-semibold tracking-[-0.02em]">Espace COM&apos;9</h1>
          <p className="text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }}>Agenda et rendez-vous. Accès réservé.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[0.8125rem] font-medium" style={{ color: 'var(--c9-text-2)' }}>Mot de passe</label>
          <div className="relative">
            <input ref={inputRef} id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
              className={`${inputCls} pr-24`} style={inputStyle} value={value} onChange={(e) => setValue(e.target.value)} />
            <button type="button" onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-10 rounded-lg px-3 text-[0.875rem] font-medium"
              style={{ color: 'var(--c9-text-2)' }} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              {show ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <Btn variant="primary" size="lg" type="submit" disabled={loading || !value}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Btn>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
