// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Appareils de confiance (espace responsable)
//
//  Après une connexion réussie, l'appareil reçoit un cookie signé. Il ne donne
//  AUCUN accès : il sert seulement à compter ses essais à part. Ainsi, une
//  attaque menée depuis d'autres adresses ne peut pas empêcher le responsable
//  de se connecter depuis son téléphone ou son ordinateur habituels.
//
//  Signature dérivée d'ADMIN_PASSWORD : changer le mot de passe invalide aussi
//  tous les appareils de confiance.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, createHmac, randomBytes } from 'crypto'
import { safeEqual } from './request'

export const DEVICE_COOKIE = 'com9_appareil'
export const DEVICE_MAX_AGE = 180 * 24 * 60 * 60 // 180 jours
/** Le cookie n'est envoyé qu'aux routes de connexion. */
export const DEVICE_COOKIE_PATH = '/api/auth'

function key(): Buffer | null {
  const p = process.env.ADMIN_PASSWORD
  return p ? createHash('sha256').update('com9_appareil_v1:' + p).digest() : null
}

function sign(id: string, k: Buffer): string {
  return createHmac('sha256', k).update(id).digest('base64url')
}

/** Nouveau cookie d'appareil : identifiant aléatoire + signature. */
export function newDeviceCookie(): string | null {
  const k = key()
  if (!k) return null
  const id = randomBytes(16).toString('base64url')
  return `${id}.${sign(id, k)}`
}

/** Identifiant de l'appareil si le cookie est authentique, sinon null. */
export function verifiedDeviceId(value: string | undefined | null): string | null {
  const k = key()
  if (!k || !value || value.length > 200) return null
  const [id, sig] = value.split('.')
  if (!id || !sig || !/^[A-Za-z0-9_-]{22}$/.test(id)) return null
  return safeEqual(sig, sign(id, k)) ? id : null
}
