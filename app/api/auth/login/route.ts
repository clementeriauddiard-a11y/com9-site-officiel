// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Vérifie le mot de passe, pose le cookie de session httpOnly
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { generateSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body as { password?: string }

    const adminPassword = process.env.ADMIN_PASSWORD

    // Validation
    if (!adminPassword) {
      console.error('[COM\'9 Auth] ADMIN_PASSWORD non défini dans les variables d\'environnement')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 },
      )
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 },
      )
    }

    // Génère et pose le cookie
    const token = generateSessionToken()
    const res   = NextResponse.json({ success: true })

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   SESSION_MAX_AGE,
      path:     '/',
    })

    return res

  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
