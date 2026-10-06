// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/agenda/settings (administrateur uniquement)
//   GET → durées par prestation, marge, plage horaire
//   PUT → enregistre les réglages
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getSettings, saveSettings } from '@/lib/agenda/service'
import { errorResponse, requireAdmin, storageInfo } from '@/lib/agenda/http'
import type { AgendaSettings } from '@/lib/agenda/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    return NextResponse.json({ settings: await getSettings(), storage: storageInfo() })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function PUT(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    const body = (await req.json()) as { settings?: AgendaSettings }
    if (!body.settings) return NextResponse.json({ error: 'Réglages manquants.' }, { status: 400 })
    return NextResponse.json({ settings: await saveSettings(body.settings) })
  } catch (err) {
    return errorResponse(err)
  }
}
