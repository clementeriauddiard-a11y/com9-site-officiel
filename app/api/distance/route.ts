// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/distance          (publique : formulaire de réservation)
//   POST { address }  →  { km, zone, zoneLabel, fee, precise }
//
//  Distance par la route entre l'atelier (place Saint-Pol, Nogent-le-Rotrou)
//  et l'adresse du client, calculée par Google Maps (Routes API).
//  Sans clé GOOGLE_MAPS_API_KEY : réponse 503 « not_configured » et le
//  formulaire propose la liste des communes. L'adresse n'est pas enregistrée.
//  Limites : par appareil/réseau et par jour pour tout le site, afin de rester
//  dans le quota gratuit de Google et d'éviter tout usage détourné.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { ZONES } from '@/data/tarifs'
import { DistanceError, distanceConfigured, routeDistance } from '@/lib/distance'
import { countAndLogRequest } from '@/lib/agenda/store'
import { clientIp, sourceHash } from '@/lib/security/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY = 1_000
/** 10 calculs / 10 min et 40 / jour par source ; 300 / jour pour tout le site (≈ 9 000 / mois). */
const DISTANCE_LIMITS = { shortWindowMin: 10, perSourceShort: 10, perSourceDay: 40, allDay: 300 }

const NO_STORE = { 'Cache-Control': 'no-store' }

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

function fail(code: string, error: string, status: number) {
  return NextResponse.json({ error, code, fallback: code !== 'invalid' && code !== 'not_found' }, { status, headers: NO_STORE })
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail('forbidden', 'Origine refusée.', 403)
  if (!distanceConfigured()) {
    return fail('not_configured', 'Le calcul automatique de distance n’est pas encore activé.', 503)
  }

  let address: unknown
  try {
    const text = await req.text()
    if (text.length > MAX_BODY) return fail('invalid', 'Adresse trop longue.', 413)
    address = (JSON.parse(text) as { address?: unknown })?.address
  } catch {
    return fail('invalid', 'Requête invalide.', 400)
  }

  try {
    const counts = await countAndLogRequest(sourceHash(clientIp(req), 'distance'), DISTANCE_LIMITS.shortWindowMin, 'distance')
    if (
      counts.sameSourceShort >= DISTANCE_LIMITS.perSourceShort ||
      counts.sameSourceDay >= DISTANCE_LIMITS.perSourceDay ||
      counts.allDay >= DISTANCE_LIMITS.allDay
    ) {
      return fail('rate_limited', 'Trop de calculs demandés. Choisissez votre commune dans la liste.', 429)
    }

    const r = await routeDistance(address)
    const zone = ZONES.find((z) => z.id === r.zone) ?? null
    return NextResponse.json(
      { ok: true, km: r.km, zone: r.zone, zoneLabel: zone?.full ?? null, fee: zone?.fee ?? null, precise: r.precise },
      { headers: NO_STORE },
    )
  } catch (err) {
    if (err instanceof DistanceError) {
      const status = err.code === 'invalid' ? 400 : err.code === 'not_found' ? 422 : 503
      return fail(err.code, err.message, status)
    }
    console.error("[COM'9 Distance]", err)
    return fail('unavailable', 'Calcul momentanément indisponible.', 503)
  }
}

export function GET() {
  return NextResponse.json({ error: 'Méthode non autorisée.' }, { status: 405, headers: { Allow: 'POST' } })
}
