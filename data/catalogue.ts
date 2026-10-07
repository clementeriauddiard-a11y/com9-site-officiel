// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — CATALOGUE MULTIMARQUE (source unique du tunnel de réservation)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Structure :
//    BRANDS   → marques affichées au client (ordre = ordre d'affichage)
//               · `families` : regroupements (Galaxy A / S / Z, iPhone 16…)
//               · `catalogue: false` → marque visible mais sans grille :
//                 « Notre catalogue est en cours d'enrichissement », demande
//                 de tarif (jamais de prix inventé).
//    MODELS   → un modèle = une marque, une famille et 3 prestations
//               (écran, batterie, vitre arrière). Chaque prestation a un
//               statut :
//                 'price'       → prix validé (une ou plusieurs qualités)
//                 'quote'       → « Sur devis » : le client demande son tarif
//                 'unavailable' → prestation non proposée (masquée)
//
//  ⚠️  iPhone : les prix restent dans data/tarifs.ts (grille inchangée),
//      ce fichier les reprend automatiquement.
//  ⚠️  Ajouter une marque (Xiaomi, Pixel…) : passer `catalogue: true`, lui
//      donner ses familles et ajouter ses modèles plus bas. Rien d'autre à
//      modifier dans le tunnel.
//  ⚠️  Ne jamais saisir un prix non validé : laisser la prestation en 'quote'.
// ─────────────────────────────────────────────────────────────────────────────

import { MODELS as IPHONE_GRID, getOptions, type GridRepairId, type PriceOption } from '@/data/tarifs'
import { toCents } from '@/lib/money'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrandId = 'apple' | 'samsung' | 'xiaomi' | 'pixel' | 'honor' | 'oppo' | 'autre'

/** Prestations du catalogue (« Vitre arrière » pour toutes les marques). */
export type ServiceId = GridRepairId
export const SERVICES: { id: ServiceId; label: string }[] = [
  { id: 'ecran', label: 'Écran' },
  { id: 'batterie', label: 'Batterie' },
  { id: 'vitre', label: 'Vitre arrière' },
]

export type ServiceStatus = 'price' | 'quote' | 'unavailable'

export type CatalogService = {
  status: ServiceStatus
  /** Qualités proposées et leurs prix — non vide si et seulement si status = 'price' */
  options: PriceOption[]
}

export type Brand = {
  id: BrandId
  /** Nom affiché sur la carte de marque */
  label: string
  /** Préfixe du nom complet enregistré (ex. « Samsung Galaxy A55 ») ; '' pour Apple (« iPhone 13 ») */
  prefix: string
  /** true : grille de modèles disponible ; false : demande de tarif */
  catalogue: boolean
  families: { id: string; label: string }[]
  /** Texte de la barre de recherche */
  searchLabel?: string
  /** Mention discrète sur la qualité des pièces */
  partsNote?: string
}

export type CatalogModel = {
  /** Identifiant stable (URL, tests) */
  id: string
  brand: BrandId
  family: string
  /** Nom court affiché sur la carte (ex. « Galaxy A55 ») */
  name: string
  /** Nom complet enregistré dans la demande et l'agenda (ex. « Samsung Galaxy A55 ») */
  label: string
  services: Record<ServiceId, CatalogService>
}

// ─── Marques ─────────────────────────────────────────────────────────────────

export const SAMSUNG_PARTS_NOTE = 'Pièces Samsung d’origine / Service Pack privilégiées'

export const BRANDS: Brand[] = [
  {
    id: 'apple', label: 'Apple', prefix: '', catalogue: true, searchLabel: 'Rechercher votre iPhone',
    families: [...new Set(IPHONE_GRID.map((m) => m.serie))].reverse().map((s) => ({ id: s, label: s })),
  },
  {
    id: 'samsung', label: 'Samsung', prefix: 'Samsung', catalogue: true, searchLabel: 'Rechercher votre Galaxy',
    families: [
      { id: 'galaxy-a', label: 'Galaxy A' },
      { id: 'galaxy-s', label: 'Galaxy S' },
      { id: 'galaxy-z', label: 'Galaxy Z' },
    ],
    partsNote: SAMSUNG_PARTS_NOTE,
  },
  { id: 'xiaomi', label: 'Xiaomi / Redmi', prefix: 'Xiaomi', catalogue: false, families: [] },
  { id: 'pixel', label: 'Google Pixel', prefix: 'Google', catalogue: false, families: [] },
  { id: 'honor', label: 'Honor', prefix: 'Honor', catalogue: false, families: [] },
  { id: 'oppo', label: 'Oppo', prefix: 'Oppo', catalogue: false, families: [] },
  { id: 'autre', label: 'Autre marque', prefix: '', catalogue: false, families: [] },
]

export const findBrand = (id: string | null | undefined): Brand | undefined => BRANDS.find((b) => b.id === id)

// ─── Apple : repris de la grille iPhone (data/tarifs.ts), prix inchangés ─────

const APPLE: CatalogModel[] = IPHONE_GRID.map((m) => {
  const svc = (s: ServiceId): CatalogService => {
    const options = getOptions(s, m)
    return { status: options.length ? 'price' : 'unavailable', options }
  }
  return {
    id: slug(m.model),
    brand: 'apple',
    family: m.serie,
    name: m.model,
    label: m.model, // les fiches existantes gardent « iPhone 13 »
    services: { ecran: svc('ecran'), batterie: svc('batterie'), vitre: svc('vitre') },
  }
})

// ─── Samsung — tarifs V1 validés (euros, réparation seule, hors déplacement) ─
//     Un prix → 'price'. 'devis' → « Sur devis ». null → non proposé.

type Tarif = number | 'devis' | null
type SamsungRow = { name: string; family: 'galaxy-a' | 'galaxy-s' | 'galaxy-z'; ecran?: Tarif; batterie?: Tarif; vitre?: Tarif }

const SAMSUNG_ROWS: SamsungRow[] = [
  // ── Galaxy A ──
  { name: 'Galaxy A56', family: 'galaxy-a', ecran: 149.90, batterie: 79.90, vitre: 74.90 },
  { name: 'Galaxy A55', family: 'galaxy-a', ecran: 129.90, batterie: 74.90, vitre: 69.90 },
  { name: 'Galaxy A54', family: 'galaxy-a', ecran: 129.90, batterie: 74.90, vitre: 69.90 },
  { name: 'Galaxy A35', family: 'galaxy-a', ecran: 124.90, batterie: 74.90, vitre: 64.90 },
  { name: 'Galaxy A25', family: 'galaxy-a' },
  { name: 'Galaxy A16', family: 'galaxy-a' },
  { name: 'Galaxy A15', family: 'galaxy-a', ecran: 114.90, batterie: 69.90, vitre: 59.90 },

  // ── Galaxy S ──
  { name: 'Galaxy S25 Ultra', family: 'galaxy-s' },
  { name: 'Galaxy S25+', family: 'galaxy-s' },
  { name: 'Galaxy S25', family: 'galaxy-s' },
  { name: 'Galaxy S25 FE', family: 'galaxy-s' },
  { name: 'Galaxy S24 Ultra', family: 'galaxy-s', ecran: 329.90, batterie: 89.90, vitre: 99.90 },
  { name: 'Galaxy S24+', family: 'galaxy-s' },
  { name: 'Galaxy S24', family: 'galaxy-s', ecran: 229.90, batterie: 89.90, vitre: 89.90 },
  { name: 'Galaxy S24 FE', family: 'galaxy-s' },
  { name: 'Galaxy S23 Ultra', family: 'galaxy-s' },
  { name: 'Galaxy S23+', family: 'galaxy-s' },
  { name: 'Galaxy S23', family: 'galaxy-s', ecran: 219.90, batterie: 84.90, vitre: 89.90 },
  { name: 'Galaxy S23 FE', family: 'galaxy-s' },
  { name: 'Galaxy S22 Ultra', family: 'galaxy-s' },
  { name: 'Galaxy S22+', family: 'galaxy-s' },
  { name: 'Galaxy S22', family: 'galaxy-s', ecran: 249.90, batterie: 84.90, vitre: 84.90 },
  { name: 'Galaxy S21 Ultra', family: 'galaxy-s' },
  { name: 'Galaxy S21+', family: 'galaxy-s' },
  { name: 'Galaxy S21', family: 'galaxy-s' },
  { name: 'Galaxy S21 FE', family: 'galaxy-s' },
  { name: 'Galaxy S20 FE', family: 'galaxy-s' },

  // ── Galaxy Z (pliables) — tout sur devis ──
  { name: 'Galaxy Z Fold7', family: 'galaxy-z' },
  { name: 'Galaxy Z Fold6', family: 'galaxy-z' },
  { name: 'Galaxy Z Fold5', family: 'galaxy-z' },
  { name: 'Galaxy Z Fold4', family: 'galaxy-z' },
  { name: 'Galaxy Z Fold3', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip7', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip7 FE', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip6', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip5', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip4', family: 'galaxy-z' },
  { name: 'Galaxy Z Flip3', family: 'galaxy-z' },
]

/** Qualité des pièces Samsung (formulations validées : jamais « neuve d'origine » pour une pièce démontée). */
const SAMSUNG_QUALITY: Record<ServiceId, { label: string; note: string }> = {
  ecran: { label: 'Écran Samsung', note: 'Service Pack Samsung privilégié lorsque disponible' },
  batterie: { label: 'Batterie Samsung', note: 'Origine / Service Pack privilégiée lorsque disponible' },
  vitre: { label: 'Vitre arrière Samsung', note: 'Vitre Samsung d’origine démontée privilégiée lorsque disponible' },
}

function samsungService(service: ServiceId, t: Tarif | undefined): CatalogService {
  if (t === null) return { status: 'unavailable', options: [] }
  if (t === undefined || t === 'devis') return { status: 'quote', options: [] }
  const q = SAMSUNG_QUALITY[service]
  return { status: 'price', options: [{ id: service, label: q.label, note: q.note, priceCents: toCents(t), recommended: false }] }
}

const SAMSUNG: CatalogModel[] = SAMSUNG_ROWS.map((r) => ({
  id: slug(`samsung ${r.name}`),
  brand: 'samsung',
  family: r.family,
  name: r.name,
  label: `Samsung ${r.name}`,
  services: { ecran: samsungService('ecran', r.ecran), batterie: samsungService('batterie', r.batterie), vitre: samsungService('vitre', r.vitre) },
}))

// ─── Catalogue complet ───────────────────────────────────────────────────────

export const CATALOG: CatalogModel[] = [...APPLE, ...SAMSUNG]

export const modelsOf = (brand: BrandId, family?: string): CatalogModel[] =>
  CATALOG.filter((m) => m.brand === brand && (!family || m.family === family))

/** Modèle du catalogue par nom complet enregistré (« iPhone 13 », « Samsung Galaxy A55 ») ou par identifiant. */
export function findCatalogModel(labelOrId: string | null | undefined): CatalogModel | undefined {
  if (!labelOrId) return undefined
  return CATALOG.find((m) => m.label === labelOrId || m.id === labelOrId)
}

const QUOTE: CatalogService = { status: 'quote', options: [] }

/** Statut d'une prestation pour un modèle ; un modèle hors catalogue est toujours « Sur devis ». */
export function serviceOf(model: CatalogModel | undefined, service: ServiceId): CatalogService {
  return model ? model.services[service] : QUOTE
}

/** Qualités et prix validés pour un couple (nom complet, prestation) — [] si sur devis ou inconnu. */
export function priceOptions(label: string, service: string): PriceOption[] {
  const m = findCatalogModel(label)
  if (!m || !isService(service)) return []
  return m.services[service].options
}

export const isService = (v: unknown): v is ServiceId => v === 'ecran' || v === 'batterie' || v === 'vitre'

/** Plus petit prix validé d'une prestation, toutes marques (« à partir de »), en centimes. */
export function priceFrom(service: ServiceId): number {
  return Math.min(...CATALOG.flatMap((m) => m.services[service].options.map((o) => o.priceCents)))
}

/** Plus petit prix validé d'une prestation pour un modèle (centimes) ; null si sur devis ou non proposé. */
export function modelPriceFrom(m: CatalogModel, service: ServiceId): number | null {
  const s = m.services[service]
  return s.status === 'price' ? Math.min(...s.options.map((o) => o.priceCents)) : null
}

// ─── Recherche ───────────────────────────────────────────────────────────────

/** « Galaxy S24 Ultra » → « s24ultra » ; « S23+ » → « s23plus » ; « iPhone 13 Pro » → « 13pro ». */
export function searchKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/\b(samsung|galaxy|apple|iphone)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Modèles d'une marque correspondant à la saisie (ex. « A55 », « s24 ultra », « 13 pro »). */
export function searchModels(brand: BrandId, query: string, limit = 12): CatalogModel[] {
  const q = searchKey(query)
  if (!q) return []
  const list = modelsOf(brand)
  const starts = list.filter((m) => searchKey(m.name).startsWith(q))
  const contains = list.filter((m) => !starts.includes(m) && searchKey(m.name).includes(q))
  return [...starts, ...contains].slice(0, limit)
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function slug(s: string): string {
  return s.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
