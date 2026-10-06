// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Limitation des tentatives de connexion
//
//  Les tentatives sont enregistrées dans Postgres (table auth_attempts) : la
//  limite vaut pour TOUTES les instances Vercel et survit à un redémarrage.
//
//  Deux compteurs indépendants — une attaque sur l'un ne bloque jamais l'autre :
//
//    « responsable »          espace responsable, appareil inconnu
//                             5 échecs / adresse / 15 min · 50 échecs au total
//    « responsable-appareil » espace responsable, appareil de confiance
//                             5 échecs / appareil / 15 min · AUCUNE limite globale
//
//  Le dernier compteur garantit que le responsable peut toujours se connecter
//  depuis un appareil déjà utilisé, même pendant une attaque répartie.
//  Une connexion réussie efface les échecs de sa source.
//  Base indisponible → connexion refusée (la protection n'est jamais coupée).
//  Déblocage : voir docs/SECURITE-CONNEXIONS.md.
// ─────────────────────────────────────────────────────────────────────────────

import { beginAuthAttempt, endAuthAttempt } from '@/lib/agenda/store'
import { clientIp, sourceHash } from './request'

export const LOGIN_LIMITS = { windowMin: 15, perSource: 5, global: 50 } as const

export type GuardScope = 'responsable'
export type CounterScope = GuardScope | 'responsable-appareil'
export const COUNTER_SCOPES: readonly CounterScope[] = ['responsable', 'responsable-appareil']

export type GuardResult =
  | { ok: true }
  | { ok: false; status: 401 | 429 | 503; error: string; retryAfterSec?: number }

export async function guardedPasswordCheck(
  req: Request,
  scope: GuardScope,
  check: () => boolean,
  options: { trustedDeviceId?: string | null } = {},
): Promise<GuardResult> {
  const trusted = scope === 'responsable' && Boolean(options.trustedDeviceId)
  const counter: CounterScope = trusted ? 'responsable-appareil' : scope
  const source = trusted
    ? sourceHash(options.trustedDeviceId as string, 'appareil')
    : sourceHash(clientIp(req), 'login:' + scope)

  let attempt: Awaited<ReturnType<typeof beginAuthAttempt>>
  try {
    attempt = await beginAuthAttempt(counter, source, LOGIN_LIMITS.windowMin)
  } catch (err) {
    console.error("[COM'9 Auth] Journal des tentatives indisponible", err)
    return { ok: false, status: 503, error: 'Connexion momentanément indisponible. Réessayez dans un instant.' }
  }

  const { counts } = attempt
  const window = LOGIN_LIMITS.windowMin * 60
  const sourceBlocked = counts.sourceFailures > LOGIN_LIMITS.perSource
  const globalBlocked = !trusted && counts.allFailures > LOGIN_LIMITS.global
  if (sourceBlocked || globalBlocked) {
    await endAuthAttempt(attempt.id, counter, source, 'bloque').catch(() => undefined)
    let retryAfterSec = window
    if (sourceBlocked && counts.oldestSourceFailureAt) {
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
    await endAuthAttempt(attempt.id, counter, source, 'succes').catch(() => undefined)
    return { ok: true }
  }
  return { ok: false, status: 401, error: 'Mot de passe incorrect' }
}
