// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/agenda/[id]     (administrateur uniquement)
//   GET                              → fiche complète + historique
//   PATCH { patch }                  → modification de la fiche
//   POST  { action, payload }        → changement de statut / proposition
//   POST  { action: 'traiter_demande' } → demande du client marquée traitée
//   POST  { action: 'regenerer_lien' }  → nouveau lien de suivi (l'ancien expire)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import {
  applyAction, getDetail, markClientRequestHandled, regenerateTrackLink, updateAppointment, type ActionPayload,
} from '@/lib/agenda/service'
import { errorResponse, requireAdmin } from '@/lib/agenda/http'
import { ACTIONS, type ActionId, type ApptInput } from '@/lib/agenda/logic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: Request, context: RouteContext) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await context.params
    return NextResponse.json(await getDetail(id))
  } catch (err) {
    return errorResponse(err)
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await context.params
    const body = (await req.json()) as { patch?: Partial<ApptInput> }
    if (!body.patch) return NextResponse.json({ error: 'Modification manquante.' }, { status: 400 })
    const appt = await updateAppointment(id, body.patch)
    return NextResponse.json({ appt })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: Request, context: RouteContext) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await context.params
    const body = (await req.json()) as { action?: string; payload?: ActionPayload }
    if (body.action === 'traiter_demande') {
      return NextResponse.json({ appt: await markClientRequestHandled(id) })
    }
    if (body.action === 'regenerer_lien') {
      return NextResponse.json({ appt: await regenerateTrackLink(id) })
    }
    if (!body.action || !Object.prototype.hasOwnProperty.call(ACTIONS, body.action)) {
      return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
    }
    const appt = await applyAction(id, body.action as ActionId, body.payload ?? {})
    return NextResponse.json({ appt })
  } catch (err) {
    return errorResponse(err)
  }
}
