// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/agenda/blocks   (administrateur uniquement)
//   POST   { startAt, endAt, reason, note } → bloque une plage
//   DELETE ?id=…                            → libère la plage
//  Une plage bloquée n'est jamais proposée aux clients.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createBlock, removeBlock } from '@/lib/agenda/service'
import { errorResponse, requireAdmin } from '@/lib/agenda/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    const block = await createBlock(await req.json())
    return NextResponse.json({ block }, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  try {
    await removeBlock(new URL(req.url).searchParams.get('id') ?? '')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
