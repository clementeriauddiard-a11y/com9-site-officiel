// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Vérifie le mot de passe responsable, pose le cookie de session httpOnly.
// Les tentatives sont limitées (voir lib/security/login-guard.ts).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { generateSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'
import { guardedPasswordCheck } from '@/lib/security/login-guard'
import { safeEqual } from '@/lib/security/request'
import {
  DEVICE_COOKIE, DEVICE_COOKIE_PATH, DEVICE_MAX_AGE, newDeviceCookie, verifiedDeviceId,
} from '@/lib/security/device'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let password: unknown
  try {
    password = ((await req.json()) as { password?: unknown }).password
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error("[COM'9 Auth] ADMIN_PASSWORD non défini dans les variables d'environnement")
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }
  if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  // Appareil déjà utilisé avec succès → compteur à part, insensible aux attaques venues d'ailleurs.
  const deviceId = verifiedDeviceId(req.cookies.get(DEVICE_COOKIE)?.value)
  const result = await guardedPasswordCheck(req, 'responsable', () => safeEqual(password, adminPassword), {
    trustedDeviceId: deviceId,
  })
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status, headers: result.retryAfterSec ? { 'Retry-After': String(result.retryAfterSec) } : {} },
    )
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE, generateSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  if (!deviceId) {
    const device = newDeviceCookie()
    if (device) {
      res.cookies.set(DEVICE_COOKIE, device, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: DEVICE_MAX_AGE,
        path: DEVICE_COOKIE_PATH,
      })
    }
  }
  return res
}
