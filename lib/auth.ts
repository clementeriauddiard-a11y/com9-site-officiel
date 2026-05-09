// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Auth utilities (Node.js runtime — API routes only)
// Ne jamais importer depuis middleware.ts (Edge runtime incompatible)
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac } from 'crypto'

export const SESSION_COOKIE  = 'com9_session'
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60   // 7 jours en secondes

/**
 * Génère un token de session déterministe basé sur le mot de passe admin.
 * Changer ADMIN_PASSWORD invalide automatiquement toutes les sessions.
 */
export function generateSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD manquant dans les variables d\'environnement')
  return createHmac('sha256', password)
    .update('com9_session_v1')
    .digest('hex')
}
