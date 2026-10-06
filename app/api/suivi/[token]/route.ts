// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/suivi/[jeton]      (publique, réservée au détenteur du lien)
//   POST { action: accepter | autre_creneau | annulation, message?, startAt?, expectedProposal? }
//
//  Le jeton ne donne accès qu'à SON rendez-vous. La réponse est la vue client
//  (liste blanche) : jamais de coordonnées, d'adresse ni de notes internes.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { clientRespond } from '@/lib/agenda/service'
import { errorResponse } from '@/lib/agenda/http'
import { clientIp } from '@/lib/security/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origine refusée.' }, { status: 403, headers: NO_STORE })
  const { token } = await ctx.params
  let body: unknown
  try {
    const text = await req.text()
    if (text.length > 4_000) return NextResponse.json({ error: 'Demande trop volumineuse.' }, { status: 413, headers: NO_STORE })
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400, headers: NO_STORE })
  }
  try {
    const view = await clientRespond(token, body, clientIp(req))
    return NextResponse.json({ view }, { headers: NO_STORE })
  } catch (err) {
    const res = errorResponse(err)
    Object.entries(NO_STORE).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }
}
