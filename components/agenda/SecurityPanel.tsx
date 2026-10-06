'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Réglages : état des connexions et déblocage
// Visible uniquement dans l'espace responsable (session obligatoire).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { Btn, ErrorBox } from './ui'

type ScopeStatus = {
  scope: 'responsable' | 'responsable-appareil' | 'diagnostic'
  failures: number
  sources: number
  blockedSources: number
  globalLocked: boolean
  lastAt: string | null
}

const LABEL: Record<ScopeStatus['scope'], string> = {
  responsable: 'Espace responsable · appareils inconnus',
  'responsable-appareil': 'Espace responsable · vos appareils habituels',
  diagnostic: 'Diagnostic premium',
}

export default function SecurityPanel() {
  const [scopes, setScopes] = useState<ScopeStatus[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/deblocage', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'État indisponible.')
      setScopes(data.scopes)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'État indisponible.')
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function unlock(acces: 'diagnostic' | 'responsable') {
    setBusy(acces)
    setDone(null)
    try {
      const res = await fetch('/api/auth/deblocage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acces }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Déblocage impossible.')
      setScopes(data.scopes)
      setDone(`${acces === 'diagnostic' ? 'Diagnostic premium' : 'Espace responsable'} débloqué (${data.cleared} échec${data.cleared > 1 ? 's' : ''} effacé${data.cleared > 1 ? 's' : ''}).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Déblocage impossible.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3" aria-labelledby="sec-title">
      <h3 id="sec-title" className="font-space text-[1rem] font-semibold">Sécurité des connexions</h3>
      <p className="font-space text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>
        Échecs de mot de passe sur les 15 dernières minutes. Chaque accès a son propre compteur :
        une attaque sur le diagnostic premium ne bloque pas l&apos;espace responsable.
      </p>
      {error && <ErrorBox message={error} />}
      {scopes?.map((s) => (
        <div key={s.scope} className="flex flex-col gap-1 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.globalLocked || s.blockedSources ? 'rgba(248,113,113,0.4)' : 'var(--c9-hairline-soft)'}` }}>
          <p className="font-space text-[0.875rem] font-semibold">{LABEL[s.scope]}</p>
          <p className="font-space text-[0.8125rem] tabular-nums" style={{ color: 'var(--c9-text-2)' }}>
            {s.failures} échec{s.failures > 1 ? 's' : ''} · {s.sources} source{s.sources > 1 ? 's' : ''}
            {s.blockedSources > 0 && <> · <span style={{ color: '#fca5a5' }}>{s.blockedSources} bloquée{s.blockedSources > 1 ? 's' : ''}</span></>}
            {s.globalLocked && <> · <span style={{ color: '#fca5a5' }}>suspendu pour tous</span></>}
          </p>
        </div>
      ))}
      {done && <p role="status" className="font-space text-[0.8125rem]" style={{ color: '#4ade80' }}>{done}</p>}
      <div className="grid grid-cols-2 gap-2">
        <Btn className="text-[0.8125rem]" disabled={busy !== null} onClick={() => unlock('diagnostic')}>
          {busy === 'diagnostic' ? '…' : 'Débloquer le diagnostic'}
        </Btn>
        <Btn className="text-[0.8125rem]" disabled={busy !== null} onClick={() => unlock('responsable')}>
          {busy === 'responsable' ? '…' : 'Débloquer l’espace'}
        </Btn>
      </div>
      <p className="font-space text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>
        Débloquer efface les échecs enregistrés ; cela ne change aucun mot de passe. Si une attaque continue,
        changez plutôt le mot de passe concerné dans Vercel.
      </p>
    </div>
  )
}
