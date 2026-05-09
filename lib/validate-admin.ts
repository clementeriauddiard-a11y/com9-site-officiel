// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Validation session admin pour les API routes (Node.js runtime)
// ─────────────────────────────────────────────────────────────────────────────

import { SESSION_COOKIE, generateSessionToken } from './auth'

/**
 * Vérifie le cookie de session depuis un objet Request standard.
 * Compatible avec les API Route Handlers Next.js App Router.
 */
export function validateAdmin(req: Request): boolean {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const cookies = parseCookies(cookieHeader)
    const token = cookies[SESSION_COOKIE]
    if (!token) return false
    const expected = generateSessionToken()
    return token === expected
  } catch {
    return false
  }
}

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(';').map(pair => {
      const idx = pair.indexOf('=')
      if (idx === -1) return [pair.trim(), '']
      return [pair.slice(0, idx).trim(), pair.slice(idx + 1).trim()]
    })
  )
}
