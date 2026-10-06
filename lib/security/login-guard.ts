// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Limitation des tentatives de connexion
//
//  Les tentatives sont enregistrées dans Postgres (table auth_attempts) : la
//  limite vaut pour TOUTES les instances Vercel et survit à un redémarrage.
//  Une mémoire locale ne suffirait pas : chaque instance aurait son compteur.
//
//  Règles (fenêtre glissante de 15 min) :
//    • 5 échecs depuis une même adresse → cette adresse attend la fin de la fenêtre
//    • 50 échecs toutes adresses confondues → connexion suspendue pour tous
//      (attaque répartie). Contrepartie : pendant une attaque massive, le
//      responsable doit lui aussi patienter.
//  Une connexion réussie efface les échecs de son adresse.
//  Base indisponible → connexion refusée (on ne désactive jamais la protection).
// ─────────────────────────────────────────────────────────────────────────────

import { beginAuthAttempt, endAuthAttempt } from '@/lib/agenda/store'
import { clientIp, sourceHash } from './request'

export const LOGIN_LIMITS = { windowMin: 15, perSource: 5, global: 50 } as const

export type GuardScope = 'responsable' | 'diagnostic'

export type GuardResult =
  | { ok: true }
  | { ok: false; status: 401 | 429 | 503; error: string; retryAfterSec?: number }

export async function guardedPasswordCheck(
  req: Request,
  scope: GuardScope,
  check: () => boolean,
): Promise<GuardResult> {
  const ipHash = sourceHash(clientIp(req), 'login:' + scope)
  let attempt: Awaited<ReturnType<typeof beginAuthAttempt>>
  try {
    attempt = await beginAuthAttempt(scope, ipHash, LOGIN_LIMITS.windowMin)
  } catch (err) {
    console.error("[COM'9 Auth] Journal des tentatives indisponible", err)
    return { ok: false, status: 503, error: 'Connexion momentanément indisponible. Réessayez dans un instant.' }
  }

  const { counts } = attempt
  const window = LOGIN_LIMITS.windowMin * 60
  if (counts.sourceFailures > LOGIN_LIMITS.perSource || counts.allFailures > LOGIN_LIMITS.global) {
    await endAuthAttempt(attempt.id, scope, ipHash, 'bloque').catch(() => undefined)
    let retryAfterSec = window
    if (counts.sourceFailures > LOGIN_LIMITS.perSource && counts.oldestSourceFailureAt) {
      const freeAt = new Date(counts.oldestSourceFailureAt).getTime() + window * 1000
      retryAfterSec = Math.max(60, Math.ceil((freeAt - Date.now()) / 1000))
    }
    const min = Math.ceil(retryAfterSec / 60)
    return {
      ok: false,
      status: 429,
      error: `Trop de tentatives. Réessayez dans ${min} minute${min > 1 ? 's' : ''}.`,
      retryAfterSec,
    }
  }

  if (check()) {
    await endAuthAttempt(attempt.id, scope, ipHash, 'succes').catch(() => undefined)
    return { ok: true }
  }
  // L'échec reste enregistré (statut par défaut).
  return { ok: false, status: 401, error: 'Mot de passe incorrect' }
}
