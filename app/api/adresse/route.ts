// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — API /api/adresse          (publique : propositions d'adresses)
//   GET ?q=12 rue de… → [{ label, citycode, postcode, city }]
//
//  Service gratuit de l'État : Base Adresse Nationale (Géoplateforme IGN),
//  sans clé. Les propositions sont orientées autour de Nogent-le-Rotrou.
//  L'adresse tapée est transmise à ce service ; rien n'est enregistré ici.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Centre de recherche : atelier COM'9 (Nogent-le-Rotrou). */
const NEAR = { lat: 48.3217, lon: 0.8217 }
const ENDPOINTS = [
  'https://data.geopf.fr/geocodage/search',     // Géoplateforme (IGN)
  'https://api-adresse.data.gouv.fr/search/',   // ancienne adresse, en secours
]

type AddressHit = { label: string; citycode: string; postcode: string; city: string }

type Feature = { properties?: { label?: string; citycode?: string; postcode?: string; city?: string; type?: string } }

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim().replace(/\s+/g, ' ')
  if (q.length < 3 || q.length > 200) return NextResponse.json({ hits: [] }, { headers: { 'Cache-Control': 'no-store' } })

  for (const base of ENDPOINTS) {
    const url = `${base}?${new URLSearchParams({
      q, autocomplete: '1', limit: '6', lat: String(NEAR.lat), lon: String(NEAR.lon),
    })}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      if (!res.ok) continue
      const data = (await res.json()) as { features?: Feature[] }
      const hits: AddressHit[] = (data.features ?? [])
        .map((x) => x.properties ?? {})
        .filter((p) => p.label && p.citycode)
        .map((p) => ({ label: String(p.label), citycode: String(p.citycode), postcode: String(p.postcode ?? ''), city: String(p.city ?? '') }))
      return NextResponse.json({ hits }, { headers: { 'Cache-Control': 'no-store' } })
    } catch {
      // service suivant
    } finally {
      clearTimeout(timer)
    }
  }
  return NextResponse.json({ hits: [], unavailable: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
