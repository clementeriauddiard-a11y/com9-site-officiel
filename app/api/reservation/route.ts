// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/reservation        (publique : formulaire du site)
//   POST { kind, repair, model, quality, symptom, description, address, citycode,
//          startAt, clientName, clientPhone, email }
//
//  Crée une DEMANDE (statut « demande reçue »), jamais un rendez-vous confirmé.
//  Renvoie un récapitulatif et le lien de suivi personnel de la demande
//  (remis à son seul auteur) ; jamais l'identifiant interne ni la fiche.
//  Le prix est recalculé ici depuis la grille ; celui envoyé par le navigateur
//  est ignoré.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createPublicRequest } from '@/lib/agenda/service'
import { errorResponse } from '@/lib/agenda/http'
import { REQUEST_RECEIVED_MESSAGE } from '@/lib/agenda/types'
import { clientIp } from '@/lib/security/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY = 8_000 // octets
const MIN_FILL_MS = 2_500 // un humain met plus longtemps à remplir le formulaire

/** Refuse les envois provenant d'un autre site (le formulaire est sur ce domaine). */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // certains navigateurs ne l'envoient pas en même origine
  try {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: 'Origine refusée.' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    const text = await req.text()
    if (text.length > MAX_BODY) {
      return NextResponse.json({ error: 'Demande trop volumineuse.' }, { status: 413 })
    }
    body = JSON.parse(text)
    if (!body || typeof body !== 'object') throw new Error()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Pièges à robots : champ caché rempli, ou formulaire envoyé trop vite.
  // On répond comme si tout allait bien, sans rien enregistrer.
  const elapsed = typeof body.elapsedMs === 'number' ? body.elapsedMs : 0
  if ((typeof body.website === 'string' && body.website.trim() !== '') || elapsed < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, message: REQUEST_RECEIVED_MESSAGE, recap: null }, { status: 201 })
  }

  try {
    const recap = await createPublicRequest(body, clientIp(req))
    return NextResponse.json({ ok: true, message: REQUEST_RECEIVED_MESSAGE, recap }, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}

export function GET() {
  return NextResponse.json({ error: 'Méthode non autorisée.' }, { status: 405, headers: { Allow: 'POST' } })
}
