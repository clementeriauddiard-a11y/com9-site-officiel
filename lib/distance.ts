// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Distance par la route atelier → client (Google Maps Platform)
//
//  Service : Routes API (computeRoutes), mode voiture, sans trafic
//  (TRAFFIC_UNAWARE). Clé serveur : variable GOOGLE_MAPS_API_KEY, jamais
//  envoyée au navigateur. Sans clé, rien n'est calculé automatiquement : le
//  site se replie sur la liste des communes validée par COM'9.
//
//  Confidentialité : l'adresse est transmise à Google pour le calcul. Le cache
//  ne garde qu'une empreinte de l'adresse et la distance, jamais l'adresse.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'crypto'
import { zoneForDistance, type ZoneId } from '@/data/tarifs'
import { cacheDistance, getCachedDistance } from '@/lib/agenda/store'

/** Point de départ des déplacements. */
export const ATELIER_ADRESSE = 'Place Saint-Pol, 28400 Nogent-le-Rotrou, France'

const ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes'
const CACHE_DAYS = 90

export type DistanceResult = {
  km: number
  zone: ZoneId
  /** false : Google n'a trouvé qu'un lieu approximatif (ville, code postal…) */
  precise: boolean
  source: 'google'
}

export class DistanceError extends Error {
  constructor(public code: 'not_configured' | 'invalid' | 'not_found' | 'unavailable', message: string) {
    super(message)
    this.name = 'DistanceError'
  }
}

export function distanceConfigured(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY)
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) =>
  Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>
let fetchImpl: FetchLike | null = null
/** Réservé aux tests : remplace l'appel réseau vers Google. */
export function setDistanceFetchForTests(f: FetchLike | null) { fetchImpl = f }

/** Normalise une adresse pour le cache (casse, accents, espaces). */
export function addressKey(address: string): string {
  const n = address.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim()
  return createHash('sha256').update('com9-distance:' + n).digest('hex')
}

/** Types Google considérés comme une adresse précise (rue, numéro, bâtiment). */
const PRECISE = new Set(['street_address', 'premise', 'subpremise', 'route', 'intersection', 'establishment', 'point_of_interest'])

export function validateAddress(address: unknown): string {
  const a = typeof address === 'string' ? address.trim().replace(/\s+/g, ' ') : ''
  if (a.length < 5 || a.length > 200) throw new DistanceError('invalid', "Indiquez l'adresse complète (rue, code postal, ville).")
  return a
}

/**
 * Distance par la route entre l'atelier et `address`.
 * Utilise le cache si l'adresse a déjà été calculée (aucun appel à Google).
 */
export async function routeDistance(rawAddress: unknown): Promise<DistanceResult & { cached: boolean }> {
  const address = validateAddress(rawAddress)
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new DistanceError('not_configured', 'Calcul de distance non configuré.')

  const k = addressKey(address)
  const hit = await getCachedDistance(k, CACHE_DAYS).catch(() => null)
  if (hit) {
    const km = Math.round(hit.meters / 100) / 10
    return { km, zone: zoneForDistance(km), precise: hit.precise, source: 'google', cached: true }
  }

  const f: FetchLike = fetchImpl ?? (fetch as unknown as FetchLike)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  let data: {
    routes?: { distanceMeters?: number }[]
    geocodingResults?: { destination?: { type?: string[]; partialMatch?: boolean; geocoderStatus?: { code?: number } } }
  }
  try {
    const res = await f(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'routes.distanceMeters,geocodingResults',
      },
      body: JSON.stringify({
        origin: { address: ATELIER_ADRESSE },
        destination: { address },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
        languageCode: 'fr-FR',
        regionCode: 'FR',
        units: 'METRIC',
      }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string; status?: string } } | null
      const msg = body?.error?.message ?? ''
      // 400 sans rapport avec la clé : Google n'a pas compris l'adresse.
      if (res.status === 400 && !/api key|billing|permission/i.test(msg)) {
        throw new DistanceError('not_found', 'Adresse introuvable. Vérifiez la rue, le code postal et la ville.')
      }
      // Clé refusée, facturation inactive, quota… : visible dans les journaux Vercel, jamais côté client.
      console.error(`[COM'9 Distance] Google a répondu ${res.status} ${body?.error?.status ?? ''}`.trim())
      throw new DistanceError('unavailable', 'Calcul momentanément indisponible.')
    }
    data = (await res.json()) as typeof data
  } catch (err) {
    if (err instanceof DistanceError) throw err
    throw new DistanceError('unavailable', 'Calcul momentanément indisponible.')
  } finally {
    clearTimeout(timer)
  }

  const dest = data.geocodingResults?.destination
  const meters = data.routes?.[0]?.distanceMeters
  if ((dest?.geocoderStatus?.code ?? 0) !== 0 || typeof meters !== 'number' || !Number.isFinite(meters)) {
    throw new DistanceError('not_found', 'Aucun itinéraire trouvé pour cette adresse.')
  }
  const precise = Boolean(dest && !dest.partialMatch && (dest.type ?? []).some((t) => PRECISE.has(t)))
  await cacheDistance(k, meters, precise).catch(() => undefined)
  const km = Math.round(meters / 100) / 10
  return { km, zone: zoneForDistance(km), precise, source: 'google', cached: false }
}
