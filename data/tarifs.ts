// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — SOURCE DE VÉRITÉ TARIFAIRE
// ─────────────────────────────────────────────────────────────────────────────
//
//  ⚠️  C'est LE seul fichier à modifier pour mettre à jour les prix du site.
//      Aucun tarif ne doit être écrit en dur ailleurs dans l'application.
//
//  Pour ajouter un modèle : ajouter une ligne dans MODELS (l'ordre affiché
//  est l'ordre du tableau). `null` = prestation non proposée sur ce modèle.
//
//  Doctrine qualité Com'9 :
//    • LCD Incell        → solution économique, jamais présentée comme
//                          équivalente à l'OLED d'origine.
//    • Soft OLED Premium → offre écran cœur de gamme Com'9 sur appareils OLED.
//                          Recommandée dès que les deux qualités coexistent.
//    • Sur Pro / Pro Max : aucun LCD n'est proposé (null) — on n'affiche donc
//                          PAS d'option grisée, uniquement l'offre réelle.
//
//  Batterie : uniquement « Batterie compatible Premium ».
//  La batterie d'origine Apple n'est PAS proposée sur le site pour l'instant.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

export type RepairId = 'ecran' | 'batterie' | 'vitre'

export type ScreenQualityId = 'lcd' | 'oled'

export type ModelTarif = {
  /** Nom commercial exact affiché au client */
  model: string
  /** Série d'appartenance (regroupement visuel) */
  serie: string
  /** Écran LCD Incell — null si non proposé */
  lcd: number | null
  /** Écran Soft OLED Premium — null si non proposé */
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
  /** Prix TTC en euros */
  price: number
  /** Ligne d'explication courte sous le libellé */
  note: string
  /** Mise en avant sobre « Recommandé » */
  recommended: boolean
  /** Message WhatsApp pré-rempli, contextualisé */
  waMessage: string
}

// ─── Prestations ─────────────────────────────────────────────────────────────

export const REPAIRS: { id: RepairId; label: string; short: string }[] = [
  { id: 'ecran',    label: 'Écran',         short: 'Écran'         },
  { id: 'batterie', label: 'Batterie',      short: 'Batterie'      },
  { id: 'vitre',    label: 'Vitre arrière', short: 'Vitre arrière' },
]

// ─── Libellés qualité ────────────────────────────────────────────────────────

export const QUALITY = {
  lcd: {
    label: 'LCD Incell',
    note:  'Solution économique',
  },
  oled: {
    label: 'Soft OLED Premium',
    note:  'Qualité d\'affichage OLED',
  },
  batterie: {
    label: 'Batterie compatible Premium',
    note:  'Autonomie restaurée',
  },
  vitre: {
    label: 'Vitre arrière',
    note:  'Remplacement complet',
  },
} as const

// ─── GRILLE OFFICIELLE COM'9 ─────────────────────────────────────────────────
//     23 modèles — iPhone 11 → iPhone 16 Pro Max

export const MODELS: ModelTarif[] = [
  // ── Série iPhone 11 ──
  { model: 'iPhone 11',         serie: 'iPhone 11', lcd:  89, oled: null, batterie: 69, vitre:  89 },
  { model: 'iPhone 11 Pro',     serie: 'iPhone 11', lcd: null, oled: 139, batterie: 79, vitre: 109 },
  { model: 'iPhone 11 Pro Max', serie: 'iPhone 11', lcd: null, oled: 149, batterie: 79, vitre: 119 },

  // ── Série iPhone 12 ──
  { model: 'iPhone 12 mini',    serie: 'iPhone 12', lcd:  99, oled: 139, batterie: 79, vitre:  99 },
  { model: 'iPhone 12',         serie: 'iPhone 12', lcd:  99, oled: 129, batterie: 79, vitre:  99 },
  { model: 'iPhone 12 Pro',     serie: 'iPhone 12', lcd: null, oled: 139, batterie: 79, vitre: 109 },
  { model: 'iPhone 12 Pro Max', serie: 'iPhone 12', lcd: null, oled: 159, batterie: 89, vitre: 119 },

  // ── Série iPhone 13 ──
  { model: 'iPhone 13 mini',    serie: 'iPhone 13', lcd: 109, oled: 149, batterie: 79, vitre: 109 },
  { model: 'iPhone 13',         serie: 'iPhone 13', lcd: 109, oled: 139, batterie: 79, vitre: 109 },
  { model: 'iPhone 13 Pro',     serie: 'iPhone 13', lcd: null, oled: 169, batterie: 89, vitre: 129 },
  { model: 'iPhone 13 Pro Max', serie: 'iPhone 13', lcd: null, oled: 189, batterie: 89, vitre: 139 },

  // ── Série iPhone 14 ──
  { model: 'iPhone 14',         serie: 'iPhone 14', lcd: 119, oled: 149, batterie:  89, vitre: 119 },
  { model: 'iPhone 14 Plus',    serie: 'iPhone 14', lcd: 129, oled: 159, batterie:  89, vitre: 129 },
  { model: 'iPhone 14 Pro',     serie: 'iPhone 14', lcd: null, oled: 199, batterie:  99, vitre: 149 },
  { model: 'iPhone 14 Pro Max', serie: 'iPhone 14', lcd: null, oled: 219, batterie:  99, vitre: 159 },

  // ── Série iPhone 15 ──
  { model: 'iPhone 15',         serie: 'iPhone 15', lcd: 139, oled: 169, batterie:  99, vitre: 139 },
  { model: 'iPhone 15 Plus',    serie: 'iPhone 15', lcd: 149, oled: 179, batterie:  99, vitre: 149 },
  { model: 'iPhone 15 Pro',     serie: 'iPhone 15', lcd: null, oled: 219, batterie: 109, vitre: 159 },
  { model: 'iPhone 15 Pro Max', serie: 'iPhone 15', lcd: null, oled: 239, batterie: 109, vitre: 169 },

  // ── Série iPhone 16 ──
  { model: 'iPhone 16',         serie: 'iPhone 16', lcd: 139, oled: 179, batterie:  99, vitre: 149 },
  { model: 'iPhone 16 Plus',    serie: 'iPhone 16', lcd: 149, oled: 189, batterie: 109, vitre: 159 },
  { model: 'iPhone 16 Pro',     serie: 'iPhone 16', lcd: null, oled: 239, batterie: 119, vitre: 179 },
  { model: 'iPhone 16 Pro Max', serie: 'iPhone 16', lcd: null, oled: 259, batterie: 119, vitre: 189 },
]

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

// ─── Messages WhatsApp contextualisés ────────────────────────────────────────

const WA_INTRO = "Bonjour, je viens du site Com'9. Je souhaite prendre rendez-vous pour"

/**
 * Construit le message WhatsApp d'une prise de rendez-vous réparation.
 * `quality` n'est utilisé que pour l'écran (deux qualités possibles).
 */
export function buildRepairMessage(
  repair: RepairId,
  model?: string,
  quality?: string,
): string {
  if (!model) {
    if (repair === 'ecran')    return `${WA_INTRO} le remplacement d'un écran.`
    if (repair === 'batterie') return `${WA_INTRO} le remplacement d'une batterie.`
    return `${WA_INTRO} le remplacement d'une vitre arrière.`
  }

  if (repair === 'ecran') {
    const q = quality ? ` en ${quality}` : ''
    return `${WA_INTRO} le remplacement de l'écran de mon ${model}${q}.`
  }
  if (repair === 'batterie') {
    return `${WA_INTRO} le remplacement de la batterie de mon ${model}.`
  }
  return `${WA_INTRO} le remplacement de la vitre arrière de mon ${model}.`
}

// ─── Options tarifaires pour un couple (prestation, modèle) ──────────────────

/**
 * Retourne les offres réellement proposées.
 * Aucune option indisponible n'est renvoyée : le client ne voit jamais
 * une prestation grisée qui laisserait croire qu'elle existe.
 */
export function getOptions(repair: RepairId, m: ModelTarif): PriceOption[] {
  if (repair === 'ecran') {
    const out: PriceOption[] = []
    const hasBoth = m.lcd !== null && m.oled !== null

    if (m.lcd !== null) {
      out.push({
        id:          'lcd',
        label:       QUALITY.lcd.label,
        price:       m.lcd,
        note:        QUALITY.lcd.note,
        recommended: false,
        waMessage:   buildRepairMessage('ecran', m.model, QUALITY.lcd.label),
      })
    }
    if (m.oled !== null) {
      out.push({
        id:          'oled',
        label:       QUALITY.oled.label,
        price:       m.oled,
        note:        QUALITY.oled.note,
        // Mis en avant uniquement lorsque le client a réellement un choix à faire.
        recommended: hasBoth,
        waMessage:   buildRepairMessage('ecran', m.model, QUALITY.oled.label),
      })
    }
    return out
  }

  if (repair === 'batterie') {
    if (m.batterie === null) return []
    return [{
      id:          'batterie',
      label:       QUALITY.batterie.label,
      price:       m.batterie,
      note:        QUALITY.batterie.note,
      recommended: false,
      waMessage:   buildRepairMessage('batterie', m.model),
    }]
  }

  if (m.vitre === null) return []
  return [{
    id:          'vitre',
    label:       QUALITY.vitre.label,
    price:       m.vitre,
    note:        QUALITY.vitre.note,
    recommended: false,
    waMessage:   buildRepairMessage('vitre', m.model),
  }]
}

/** Modèles proposant réellement la prestation demandée. */
export function modelsFor(repair: RepairId): ModelTarif[] {
  return MODELS.filter((m) => getOptions(repair, m).length > 0)
}

/** Prix d'appel « à partir de » d'une prestation, tous modèles confondus. */
export function priceFrom(repair: RepairId): number {
  const all = MODELS.flatMap((m) => getOptions(repair, m).map((o) => o.price))
  return Math.min(...all)
}

/** Recherche d'un modèle par son nom exact. */
export function findModel(model: string): ModelTarif | undefined {
  return MODELS.find((m) => m.model === model)
}

// ─── DIAGNOSTIC ──────────────────────────────────────────────────────────────
//     Le diagnostic n'est PAS une catégorie de réparation.
//     Il possède sa propre section, plus bas sur la page d'accueil.

export const DIAGNOSTIC = {
  free: {
    // Le caractère gratuit est porté par le prix affiché juste en dessous.
    label: 'Diagnostic simplifié',
    price: 'Gratuit',
    desc:  'Analyse simplifiée réalisée directement depuis le site. Résultat immédiat.',
    points: ['Batterie', 'Écran', 'Caméras', 'Vitre arrière'],
  },
  premium: {
    label: 'Diagnostic Premium Com\'9',
    price: '4,99 €',
    desc:  'Analyse complète réalisée en atelier dans le cadre du service Com\'9.',
    note:  'Montant déduit du prix final en cas de réparation.',
    points: [
      'Batterie',
      'Écran',
      'Caméras',
      'Audio',
      'Réseau',
      'Capteurs',
      'Performances',
      'État physique',
    ],
    highlights: ['Score sur 100', 'Feuille officielle Com\'9', 'Résultat immédiat'],
    waMessage:
      "Bonjour, je viens du site Com'9. Je souhaite prendre rendez-vous pour un Diagnostic Premium Com'9 (4,99 €).",
  },
} as const
