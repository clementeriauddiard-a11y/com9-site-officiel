// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Outils de sécurité communs aux routes API (Node.js uniquement)
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, createHmac, timingSafeEqual } from 'crypto'

/**
 * Adresse IP du visiteur. Sur Vercel, `x-vercel-forwarded-for`, `x-real-ip` et
 * `x-forwarded-for` sont posés par la plateforme, qui écrase toute valeur
 * envoyée par le navigateur (protection contre l'usurpation d'adresse).
 */
export function clientIp(req: Request): string {
  const h = req.headers
  const first = (v: string | null) => (v ? v.split(',')[0].trim() : '')
  return first(h.get('x-vercel-forwarded-for')) || first(h.get('x-real-ip')) || first(h.get('x-forwarded-for')) || 'inconnue'
}

/** Empreinte non réversible d'une adresse IP : on ne stocke jamais l'adresse elle-même. */
export function sourceHash(ip: string, purpose: string): string {
  const key = process.env.ADMIN_PASSWORD || 'com9-source'
  return createHmac('sha256', key).update(`${purpose}:${ip}`).digest('hex').slice(0, 32)
}

/** Comparaison à temps constant : la durée ne révèle rien du secret. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a, 'utf8').digest()
  const hb = createHash('sha256').update(b, 'utf8').digest()
  return timingSafeEqual(ha, hb) && a.length === b.length
}
