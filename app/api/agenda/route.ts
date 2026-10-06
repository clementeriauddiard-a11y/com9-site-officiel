// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/agenda          (administrateur uniquement)
//   GET  ?view=pending                    → demandes à traiter
//   GET  ?view=range&from=ISO&to=ISO      → rendez-vous d'une période
//   POST { input, status }                → création manuelle
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createAppointment, listPending, listRange } from '@/lib/agenda/service'
import { errorResponse, requireAdmin, storageInfo, withoutToken } from '@/lib/agenda/http'
import type { ApptInput } from '@/lib/agenda/logic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const url = new URL(req.url)
    const view = url.searchParams.get('view')

    if (view === 'pending') {
      const items = await listPending()
      return NextResponse.json({ items: items.map(withoutToken), storage: storageInfo() })
    }

    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const valid = (v: string | null) => v !== null && !Number.isNaN(new Date(v).getTime())
    if (!valid(from) || !valid(to)) {
      return NextResponse.json({ error: 'Période invalide.' }, { status: 400 })
    }
    // Garde-fou : une requête ne couvre pas plus de 62 jours.
    if (new Date(to as string).getTime() - new Date(from as string).getTime() > 62 * 86_400_000) {
      return NextResponse.json({ error: 'Période trop longue.' }, { status: 400 })
    }

    const items = await listRange(from as string, to as string)
    return NextResponse.json({ items: items.map(withoutToken), storage: storageInfo() })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const body = (await req.json()) as { input?: ApptInput; status?: string }
    const status = body.status === 'confirme' ? 'confirme' : 'demande_recue'
    if (!body.input) return NextResponse.json({ error: 'Fiche manquante.' }, { status: 400 })
    const appt = await createAppointment(body.input, status)
    return NextResponse.json({ appt }, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
