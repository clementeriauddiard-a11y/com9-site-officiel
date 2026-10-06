// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/creneaux        (publique)
//   GET ?repair=ecran → [{ day: 'AAAA-MM-JJ', slots: [ISO…] }]
//  Créneaux libres selon les horaires publics, les rendez-vous et les plages
//  bloquées. Aucune donnée client n'est renvoyée : seulement des heures libres.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { ALL_REPAIRS, type RepairId } from '@/data/tarifs'
import { getAvailability } from '@/lib/agenda/service'
import { errorResponse } from '@/lib/agenda/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const repair = new URL(req.url).searchParams.get('repair') as RepairId | null
  if (!repair || !ALL_REPAIRS.includes(repair)) {
    return NextResponse.json({ error: 'Prestation inconnue.' }, { status: 400 })
  }
  try {
    const days = await getAvailability(repair)
    return NextResponse.json({ days }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return errorResponse(err)
  }
}
