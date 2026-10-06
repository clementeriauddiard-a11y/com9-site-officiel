// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — SOURCE DE VÉRITÉ TARIFAIRE
// ─────────────────────────────────────────────────────────────────────────────
//
//  ⚠️  C'est LE seul fichier à modifier pour mettre à jour les prix du site.
//      Aucun tarif ni forfait de déplacement n'est écrit en dur ailleurs.
//
//  Tableau à maintenir :
//    • MODELS  → la grille réparation (pièce + main-d'œuvre, hors déplacement),
//                en euros entiers.
//  Les frais de déplacement, durées et horaires sont dans config/com9.ts.
//
//  Pour ajouter un modèle : ajouter une ligne dans MODELS (l'ordre affiché
//  est l'ordre du tableau). `null` = prestation non proposée sur ce modèle,
//  elle est alors masquée dans le choix des réparations.
//
//  Libellés de qualité écran — règle appliquée automatiquement :
//    • LCD                      → « LCD Incell »
//    • OLED des mini / standard / Plus → « OLED »
//    • Écrans des Pro et Pro Max       → « Soft OLED Premium »
//
//  Batterie : « Batterie compatible Premium ».
//  Vitre arrière : remplacement de la vitre uniquement — ce tarif ne couvre
//  ni le châssis ni un module arrière complet.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

import { ZONES, type Zone, type ZoneId } from '@/config/com9'
import { euros, toCents } from '@/lib/money'

export { ZONES, type Zone, type ZoneId }

/**
 * Prestations. Les trois premières ont un prix dans la grille ; « module »
 * (petite pièce) et « diagnostic » se chiffrent sur place.
 */
export type RepairId = 'ecran' | 'batterie' | 'vitre' | 'module' | 'diagnostic'
/** Prestations dont le prix est dans la grille */
export type GridRepairId = 'ecran' | 'batterie' | 'vitre'

export type ModelTarif = {
  /** Nom commercial exact affiché au client */
  model: string
  /** Série d'appartenance (regroupement visuel) */
  serie: string
  /** Gamme : décide du libellé de l'écran OLED */
  gamme: 'standard' | 'pro'
  /** Écran LCD Incell — null si non proposé */
  lcd: number | null
  /** Écran OLED — null si non proposé */
  oled: number | null
  /** Batterie compatible Premium — null si non proposé */
  batterie: number | null
  /** Vitre arrière — null si non proposé */
  vitre: number | null
}

export type PriceOption = {
  /** Identifiant technique de l'option */
  id: string
  /** Libellé affiché (ex. « Soft OLED Premium ») */
  label: string
  /** Prix de la réparation en centimes — pièce et main-d'œuvre, hors déplacement */
  priceCents: number
  /** Ligne d'explication courte sous le libellé */
  note: string
  /** Mise en avant sobre « Recommandé » */
  recommended: boolean
}

// ─── Prestations ─────────────────────────────────────────────────────────────

/** Prestations à prix fixe, proposées dans le parcours principal. */
export const REPAIRS: { id: GridRepairId; label: string }[] = [
  { id: 'ecran',    label: 'Écran'         },
  { id: 'batterie', label: 'Batterie'      },
  { id: 'vitre',    label: 'Vitre arrière' },
]

/** Libellé de toutes les prestations (agenda, récapitulatifs). */
export const REPAIR_LABEL: Record<RepairId, string> = {
  ecran: 'Écran',
  batterie: 'Batterie',
  vitre: 'Vitre arrière',
  module: 'Petite pièce / module',
  diagnostic: 'Diagnostic à domicile',
}

export const ALL_REPAIRS = Object.keys(REPAIR_LABEL) as RepairId[]

export const isGridRepair = (r: RepairId): r is GridRepairId =>
  r === 'ecran' || r === 'batterie' || r === 'vitre'

// ─── Libellés qualité ────────────────────────────────────────────────────────

export const QUALITY = {
  lcd:      { label: 'LCD Incell',                  note: 'Solution économique'      },
  oled:     { label: 'OLED',                        note: 'Affichage OLED'           },
  oledPro:  { label: 'Soft OLED Premium',           note: 'Affichage OLED'           },
  batterie: { label: 'Batterie compatible Premium', note: 'Autonomie restaurée'      },
  vitre:    { label: 'Vitre arrière',               note: 'Remplacement de la vitre' },
} as const

// ─── GRILLE OFFICIELLE COM'9 ─────────────────────────────────────────────────
//     23 modèles — iPhone 11 → iPhone 16 Pro Max
//     Montants en euros, pièce et main-d'œuvre comprises, hors déplacement.

export const MODELS: ModelTarif[] = [
  // ── Série iPhone 11 ──
  { model: 'iPhone 11',         serie: 'iPhone 11', gamme: 'standard', lcd:  89, oled: null, batterie: 59, vitre:  79 },
  { model: 'iPhone 11 Pro',     serie: 'iPhone 11', gamme: 'pro',      lcd: null, oled: 129, batterie: 69, vitre:  99 },
  { model: 'iPhone 11 Pro Max', serie: 'iPhone 11', gamme: 'pro',      lcd: null, oled: 139, batterie: 69, vitre: 109 },

  // ── Série iPhone 12 ──
  { model: 'iPhone 12 mini',    serie: 'iPhone 12', gamme: 'standard', lcd:  99, oled: 119, batterie: 69, vitre:  89 },
  { model: 'iPhone 12',         serie: 'iPhone 12', gamme: 'standard', lcd:  99, oled: 119, batterie: 69, vitre:  89 },
  { model: 'iPhone 12 Pro',     serie: 'iPhone 12', gamme: 'pro',      lcd: null, oled: 139, batterie: 69, vitre:  99 },
  { model: 'iPhone 12 Pro Max', serie: 'iPhone 12', gamme: 'pro',      lcd: null, oled: 149, batterie: 79, vitre: 109 },

  // ── Série iPhone 13 ──
  { model: 'iPhone 13 mini',    serie: 'iPhone 13', gamme: 'standard', lcd: 109, oled: 129, batterie: 69, vitre:  99 },
  { model: 'iPhone 13',         serie: 'iPhone 13', gamme: 'standard', lcd: 109, oled: 129, batterie: 69, vitre:  99 },
  { model: 'iPhone 13 Pro',     serie: 'iPhone 13', gamme: 'pro',      lcd: null, oled: 149, batterie: 79, vitre: 119 },
  { model: 'iPhone 13 Pro Max', serie: 'iPhone 13', gamme: 'pro',      lcd: null, oled: 169, batterie: 79, vitre: 129 },

  // ── Série iPhone 14 ──
  { model: 'iPhone 14',         serie: 'iPhone 14', gamme: 'standard', lcd: 119, oled: 139, batterie: 79, vitre: 109 },
  { model: 'iPhone 14 Plus',    serie: 'iPhone 14', gamme: 'standard', lcd: 129, oled: 149, batterie: 79, vitre: 119 },
  { model: 'iPhone 14 Pro',     serie: 'iPhone 14', gamme: 'pro',      lcd: null, oled: 169, batterie: 89, vitre: 129 },
  { model: 'iPhone 14 Pro Max', serie: 'iPhone 14', gamme: 'pro',      lcd: null, oled: 189, batterie: 89, vitre: 139 },

  // ── Série iPhone 15 ──
  { model: 'iPhone 15',         serie: 'iPhone 15', gamme: 'standard', lcd: 139, oled: 159, batterie: 89, vitre: 119 },
  { model: 'iPhone 15 Plus',    serie: 'iPhone 15', gamme: 'standard', lcd: 149, oled: 169, batterie: 89, vitre: 129 },
  { model: 'iPhone 15 Pro',     serie: 'iPhone 15', gamme: 'pro',      lcd: null, oled: 179, batterie: 99, vitre: 139 },
  { model: 'iPhone 15 Pro Max', serie: 'iPhone 15', gamme: 'pro',      lcd: null, oled: 199, batterie: 99, vitre: 149 },

  // ── Série iPhone 16 ──
  { model: 'iPhone 16',         serie: 'iPhone 16', gamme: 'standard', lcd: 139, oled: 169, batterie:  89, vitre: 129 },
  { model: 'iPhone 16 Plus',    serie: 'iPhone 16', gamme: 'standard', lcd: 149, oled: 179, batterie:  99, vitre: 139 },
  { model: 'iPhone 16 Pro',     serie: 'iPhone 16', gamme: 'pro',      lcd: null, oled: 199, batterie: 109, vitre: 149 },
  { model: 'iPhone 16 Pro Max', serie: 'iPhone 16', gamme: 'pro',      lcd: null, oled: 219, batterie: 109, vitre: 159 },
]

// ─── FORFAITS DE DÉPLACEMENT (définis dans config/com9.ts) ───────────────────

export function findZone(id: ZoneId | null): Zone | null {
  if (!id) return null
  return ZONES.find((z) => z.id === id) ?? null
}

/**
 * Zone correspondant à une distance PAR LA ROUTE depuis l'atelier, en km.
 * Bornes incluses : 5 km → « jusqu'à 5 km », 15 km → « 5 à 15 km »…
 */
export function zoneForDistance(km: number): ZoneId {
  for (const z of ZONES) if (z.maxKm !== null && km <= z.maxKm) return z.id
  return 'hors'
}

/** Forfait d'une zone en centimes ; null si inconnue ou hors zone. */
export function zoneFeeCents(zone: ZoneId | null | undefined): number | null {
  return findZone(zone ?? null)?.feeCents ?? null
}

/** Mention affichée près des tarifs. */
export const PRICE_NOTE =
  'Pièce et main-d\'œuvre comprises. Frais de déplacement selon la distance.'

/** Règle de facturation du déplacement. */
export const TRAVEL_RULE =
  'Un seul déplacement est facturé par intervention, même avec plusieurs réparations.'

// ─── Regroupement par série (ordre du tableau conservé) ──────────────────────

export const SERIES: { serie: string; models: ModelTarif[] }[] = MODELS.reduce(
  (acc, m) => {
    const last = acc[acc.length - 1]
    if (last && last.serie === m.serie) last.models.push(m)
    else acc.push({ serie: m.serie, models: [m] })
    return acc
  },
  [] as { serie: string; models: ModelTarif[] }[],
)

// ─── Options tarifaires pour un couple (prestation, modèle) ──────────────────

/**
 * Retourne les offres réellement proposées.
 * Un tiret dans la grille (null) signifie « non proposé » : l'option n'est
 * jamais affichée, même grisée.
 */
export function getOptions(repair: RepairId, m: ModelTarif): PriceOption[] {
  if (repair === 'ecran') {
    const out: PriceOption[] = []
    const hasBoth = m.lcd !== null && m.oled !== null
    // Le libellé OLED dépend de la gamme du modèle.
    const oledQuality = m.gamme === 'pro' ? QUALITY.oledPro : QUALITY.oled

    if (m.lcd !== null) {
      out.push({
        id: 'lcd',
        label: QUALITY.lcd.label,
        priceCents: toCents(m.lcd),
        note: QUALITY.lcd.note,
        recommended: false,
      })
    }
    if (m.oled !== null) {
      out.push({
        id: 'oled',
        label: oledQuality.label,
        priceCents: toCents(m.oled),
        note: oledQuality.note,
        // Mis en avant uniquement lorsque le client a réellement un choix.
        recommended: hasBoth,
      })
    }
    return out
  }

  if (repair === 'batterie') {
    if (m.batterie === null) return []
    return [{
      id: 'batterie',
      label: QUALITY.batterie.label,
      priceCents: toCents(m.batterie),
      note: QUALITY.batterie.note,
      recommended: false,
    }]
  }

  if (repair !== 'vitre' || m.vitre === null) return []
  return [{
    id: 'vitre',
    label: QUALITY.vitre.label,
    priceCents: toCents(m.vitre),
    note: QUALITY.vitre.note,
    recommended: false,
  }]
}

/** Modèles proposant réellement la prestation demandée. */
export function modelsFor(repair: RepairId): ModelTarif[] {
  return MODELS.filter((m) => getOptions(repair, m).length > 0)
}

/** Prix d'appel « à partir de » d'une prestation (centimes) — hors déplacement. */
export function priceFrom(repair: GridRepairId): number {
  const all = MODELS.flatMap((m) => getOptions(repair, m).map((o) => o.priceCents))
  return Math.min(...all)
}

/** Recherche d'un modèle par son nom exact. */
export function findModel(model: string): ModelTarif | undefined {
  return MODELS.find((m) => m.model === model)
}

// ─── Calcul du total ─────────────────────────────────────────────────────────

export type Quote = {
  /** Prix de la réparation seule (centimes) */
  repairCents: number
  /** Forfait de déplacement (centimes) — null tant qu'aucune zone n'est connue ou hors zone */
  travelCents: number | null
  /** Total à payer (centimes) — null si zone inconnue ou hors zone */
  totalCents: number | null
  /** true au-delà de 30 km : COM'9 n'intervient pas */
  outOfArea: boolean
}

export function buildQuote(option: PriceOption, zone: Zone | null): Quote {
  if (!zone) {
    return { repairCents: option.priceCents, travelCents: null, totalCents: null, outOfArea: false }
  }
  if (zone.feeCents === null) {
    return { repairCents: option.priceCents, travelCents: null, totalCents: null, outOfArea: true }
  }
  return {
    repairCents: option.priceCents,
    travelCents: zone.feeCents,
    totalCents: option.priceCents + zone.feeCents,
    outOfArea: false,
  }
}

// ─── Messages WhatsApp contextualisés ────────────────────────────────────────

const WA_INTRO = "Bonjour, je viens du site Com'9. Je souhaite prendre rendez-vous pour"

function repairPhrase(repair: RepairId, model: string, quality?: string): string {
  if (repair === 'ecran') {
    const q = quality ? ` en ${quality}` : ''
    return `le remplacement de l'écran de mon ${model}${q}`
  }
  if (repair === 'batterie') return `le remplacement de la batterie de mon ${model}`
  if (repair === 'vitre') return `le remplacement de la vitre arrière de mon ${model}`
  if (repair === 'module') return `le remplacement d'une petite pièce de mon ${model}`
  return `un diagnostic à domicile de mon ${model}`
}

/** Message générique, sans modèle — utilisé par les liens de repli. */
export function buildRepairMessage(repair: RepairId): string {
  if (repair === 'ecran')    return `${WA_INTRO} le remplacement d'un écran.`
  if (repair === 'batterie') return `${WA_INTRO} le remplacement d'une batterie.`
  if (repair === 'vitre')    return `${WA_INTRO} le remplacement d'une vitre arrière.`
  if (repair === 'module')   return `${WA_INTRO} le remplacement d'une petite pièce.`
  return `${WA_INTRO} un diagnostic à domicile.`
}

/**
 * Message complet d'une prise de rendez-vous.
 * Reprend le modèle, la prestation, la qualité, le prix de réparation et,
 * dès qu'une zone est choisie, le déplacement et le total.
 */
export function buildQuoteMessage(
  repair: RepairId,
  model: string,
  option: PriceOption,
  zone: Zone | null,
): string {
  // La qualité n'est précisée que pour l'écran : ailleurs elle est unique.
  const quality = repair === 'ecran' ? option.label : undefined
  let msg = `${WA_INTRO} ${repairPhrase(repair, model, quality)}.`

  msg += `\n\nRéparation : ${euros(option.priceCents)}`

  if (!zone || zone.feeCents === null) return msg

  msg += `\nDéplacement (${zone.full}) : ${euros(zone.feeCents)}`
  msg += `\nTotal : ${euros(option.priceCents + zone.feeCents)}`
  return msg
}
