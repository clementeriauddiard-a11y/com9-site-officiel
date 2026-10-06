// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : réponses HTTP communes aux routes API
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/validate-admin'
import { AgendaError } from './service'
import { StoreUnavailableError, storageKind } from './store'
import type { Appointment } from './types'

/**
 * Refuse toute requête sans session administrateur.
 * Les données clients (nom, téléphone, adresse, notes) ne sortent jamais
 * de ces routes sans ce contrôle.
 */
export function requireAdmin(req: Request): NextResponse | null {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return null
}

/** Le jeton du lien de suivi n'apparaît que dans la fiche détaillée. */
export function withoutToken(a: Appointment): Omit<Appointment, 'trackToken'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { trackToken, ...rest } = a
  return rest
}

/** Indique au client si les données survivent à un redémarrage du serveur. */
export function storageInfo(): 'durable' | 'memoire' {
  try {
    return storageKind()
  } catch {
    return 'durable'
  }
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AgendaError) {
    const status =
      err.code === 'not_found' ? 404 :
      err.code === 'invalid' ? 400 :
      err.code === 'rate_limited' ? 429 :
      409 // conflict, transition
    return NextResponse.json({ error: err.message, code: err.code, ...err.details }, { status })
  }
  if (err instanceof StoreUnavailableError) {
    return NextResponse.json({ error: err.message, code: 'unavailable' }, { status: 503 })
  }
  console.error("[COM'9 Agenda]", err)
  return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
}
