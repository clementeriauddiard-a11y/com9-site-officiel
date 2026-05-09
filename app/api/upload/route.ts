// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/upload
//   POST : upload d'une image vers Vercel Blob (admin uniquement)
//          Accepte : multipart/form-data avec champ "file"
//          Retourne : { url: string }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/validate-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES  = 5 * 1024 * 1024   // 5 Mo

export async function POST(req: Request) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob non configuré. Créez un Blob Store dans Vercel → Storage.' },
      { status: 503 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }
    if (!VALID_MIME.includes(file.type)) {
      return NextResponse.json({ error: 'Format invalide. JPG, PNG ou WebP uniquement.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 })
    }

    const { put } = await import('@vercel/blob')

    const ext      = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const suffix   = Math.random().toString(36).slice(2, 8)
    const filename = `phones/${Date.now()}-${suffix}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
