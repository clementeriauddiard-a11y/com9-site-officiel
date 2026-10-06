// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/deblocage            (responsable connecté uniquement)
//   GET                          → état des compteurs (nombres seulement)
//   POST { acces }               → efface les échecs : 'responsable' | 'tous'
//
//  Procédure complète, y compris sans accès à l'espace : docs/SECURITE-CONNEXIONS.md
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/agenda/http'
import { authStatus, clearAuthFailures } from '@/lib/agenda/store'
import { COUNTER_SCOPES, LOGIN_LIMITS } from '@/lib/security/login-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function status() {
  const scopes = await authStatus(COUNTER_SCOPES, LOGIN_LIMITS.windowMin, LOGIN_LIMITS.perSource)
  return scopes.map((s) => ({
    ...s,
    globalLocked: s.scope !== 'responsable-appareil' && s.failures >= LOGIN_LIMITS.global,
  }))
}

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    return NextResponse.json({ limits: LOGIN_LIMITS, scopes: await status() })
  } catch {
    return NextResponse.json({ error: 'État indisponible.' }, { status: 503 })
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  let acces: unknown
  try {
    acces = ((await req.json()) as { acces?: unknown }).acces
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }
  const targets =
    acces === 'responsable' ? ['responsable', 'responsable-appareil'] :
    acces === 'tous' ? [...COUNTER_SCOPES] : null
  if (!targets) return NextResponse.json({ error: 'Accès inconnu.' }, { status: 400 })
  try {
    const cleared = await clearAuthFailures(targets)
    console.warn(`[COM'9 Auth] Déblocage manuel (${acces}) : ${cleared} échec(s) effacé(s)`)
    return NextResponse.json({ cleared, scopes: await status() })
  } catch {
    return NextResponse.json({ error: 'Déblocage impossible.' }, { status: 503 })
  }
}
