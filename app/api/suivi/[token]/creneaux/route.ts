// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/suivi/[token]/creneaux   (publique, via le lien de suivi)
//   GET → créneaux libres pour choisir un autre rendez-vous
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getClientAvailability } from '@/lib/agenda/service'
import { errorResponse } from '@/lib/agenda/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ token: string }> }

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { token } = await context.params
    const days = await getClientAvailability(token)
    if (!days) return NextResponse.json({ error: 'Lien invalide ou action impossible.' }, { status: 404 })
    return NextResponse.json({ days }, { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
  } catch (err) {
    return errorResponse(err)
  }
}
