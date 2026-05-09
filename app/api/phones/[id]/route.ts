// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/phones/[id]
//   PATCH  : met à jour un téléphone (admin uniquement)
//   DELETE : supprime un téléphone (admin uniquement)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { updatePhone, deletePhone } from '@/lib/phones-db'
import { validateAdmin } from '@/lib/validate-admin'
import type { Phone } from '@/data/phones'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(req: Request, context: RouteContext) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const data = (await req.json()) as Partial<Phone>
    const updated = await updatePhone(id, data)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(req: Request, context: RouteContext) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const updated = await deletePhone(id)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
