// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/upload
//   POST : upload d'une image vers Supabase Storage (admin uniquement)
//          Accepte : multipart/form-data avec champ "file"
//          Retourne : { url: string }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/validate-admin'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET     = 'phones-images'
const VALID_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES  = 5 * 1024 * 1024   // 5 Mo

export async function POST(req: Request) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const sb = getSupabase()
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase non configuré — ajoutez SUPABASE_URL et SUPABASE_SERVICE_KEY dans Vercel.' },
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

    const ext    = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const suffix = Math.random().toString(36).slice(2, 8)
    const path   = `${Date.now()}-${suffix}.${ext}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
