// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Accès au Diagnostic Premium (serveur uniquement)
//
//  Mot de passe : variable d'environnement DIAGNOSTIC_PASSWORD (jamais dans le
//  code). Sans elle, la page reste fermée. Changer la variable invalide
//  aussitôt tous les accès déjà accordés.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac } from 'crypto'
import { safeEqual } from './security/request'

export const DIAG_COOKIE = 'com9_diag'
export const DIAG_MAX_AGE = 12 * 60 * 60 // 12 h

export function diagnosticPassword(): string | null {
  const p = process.env.DIAGNOSTIC_PASSWORD
  return p && p.length > 0 ? p : null
}

function expectedToken(password: string): string {
  return createHmac('sha256', password).update('com9_diag_v1').digest('hex')
}

export function diagnosticToken(): string | null {
  const p = diagnosticPassword()
  return p ? expectedToken(p) : null
}

export function hasDiagnosticAccess(cookieValue: string | undefined): boolean {
  const t = diagnosticToken()
  return Boolean(t && cookieValue && safeEqual(cookieValue, t))
}
