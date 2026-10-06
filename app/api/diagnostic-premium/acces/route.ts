// ─────────────────────────────────────────────────────────────────────────────
// /api/diagnostic-premium/acces
//   POST { password } → vérifie DIAGNOSTIC_PASSWORD (tentatives limitées)
//   DELETE            → retire l'accès
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { DIAG_COOKIE, DIAG_MAX_AGE, diagnosticPassword, diagnosticToken } from '@/lib/diagnostic-access'
import { guardedPasswordCheck } from '@/lib/security/login-guard'
import { safeEqual } from '@/lib/security/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const expected = diagnosticPassword()
  if (!expected) {
    console.error("[COM'9 Diagnostic] DIAGNOSTIC_PASSWORD non défini")
    return NextResponse.json({ error: 'Accès non configuré' }, { status: 503 })
  }
  let password: unknown
  try {
    password = ((await req.json()) as { password?: unknown }).password
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  if (typeof password !== 'string' || !password || password.length > 200) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const result = await guardedPasswordCheck(req, 'diagnostic', () => safeEqual(password, expected))
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status, headers: result.retryAfterSec ? { 'Retry-After': String(result.retryAfterSec) } : {} },
    )
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(DIAG_COOKIE, diagnosticToken() as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: DIAG_MAX_AGE,
    path: '/',
  })
  return res
}

export function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(DIAG_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
  return res
}
