// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Proxy Next.js 16 (Edge Runtime)
// Protège /responsable, /dashboard, /admin
// Redirige vers /login si non authentifié
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE   = 'com9_session'
const PROTECTED_PATHS  = ['/responsable', '/dashboard', '/admin']

/**
 * Calcule le token attendu avec Web Crypto API (compatible Edge Runtime).
 * Même algorithme que lib/auth.ts (Node.js) — résultat identique.
 */
async function computeExpectedToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode('com9_session_v1'),
  )
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const token    = req.cookies.get(SESSION_COOKIE)?.value
  const password = process.env.ADMIN_PASSWORD

  // Pas de token ou pas de mot de passe configuré → login
  if (!token || !password) {
    return redirectToLogin(req, pathname)
  }

  // Vérification cryptographique du token
  try {
    const expected = await computeExpectedToken(password)
    if (token !== expected) return redirectToLogin(req, pathname)
  } catch {
    return redirectToLogin(req, pathname)
  }

  return NextResponse.next()
}

function redirectToLogin(req: NextRequest, from: string) {
  const url = new URL('/login', req.url)
  url.searchParams.set('from', from)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/responsable/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
