// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/phones
//   GET  : retourne tous les téléphones (public)
//   POST : ajoute un téléphone (admin uniquement)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getPhones, addPhone } from '@/lib/phones-db'
import { validateAdmin } from '@/lib/validate-admin'
import type { Phone } from '@/data/phones'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const phones = await getPhones()
    return NextResponse.json(phones)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const phone = (await req.json()) as Phone
    const updated = await addPhone(phone)
    return NextResponse.json(updated, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
