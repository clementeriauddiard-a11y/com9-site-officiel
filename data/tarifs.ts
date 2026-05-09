// ─────────────────────────────────────────────────────────────────────────────
// Fichier central des tarifs COM'9
// Modifie uniquement ce fichier pour mettre à jour les prix — le design ne change pas.
// ─────────────────────────────────────────────────────────────────────────────

export type PriceRow = {
  model: string
  compatible: number
  premium: number
}

export type PriceSerie = {
  serie: string       // ex: "Série iPhone 13"
  icon: string        // emoji affiché devant le nom de série
  rows: PriceRow[]
}

export type RepairCategory = {
  id: 'ecrans' | 'batteries'
  label: string
  tierLabels: { compatible: string; premium: string }
  tierDesc: { compatible: string; premium: string }
  series: PriceSerie[]
}

export type DiagnosticTarif = {
  prix: number        // en euros
  label: string
  note: string
  inclus: string[]
}

// ─── ÉCRANS ──────────────────────────────────────────────────────────────────

const ecrans: RepairCategory = {
  id: 'ecrans',
  label: 'Écrans',
  tierLabels: {
    compatible: 'Compatible',
    premium:    'Premium OLED',
  },
  tierDesc: {
    compatible: 'Prix le plus bas',
    premium:    'Rendu identique à l\'original',
  },
  series: [
    {
      serie: 'Série iPhone X',
      icon: '📱',
      rows: [
        { model: 'iPhone X / XS / XR',  compatible:  89, premium: 139 },
        { model: 'iPhone XS Max',        compatible:  99, premium: 149 },
      ],
    },
    {
      serie: 'Série iPhone 11',
      icon: '📱',
      rows: [
        { model: 'iPhone 11',            compatible: 109, premium: 159 },
        { model: 'iPhone 11 Pro',        compatible: 129, premium: 189 },
        { model: 'iPhone 11 Pro Max',    compatible: 139, premium: 199 },
      ],
    },
    {
      serie: 'Série iPhone 12',
      icon: '📱',
      rows: [
        { model: 'iPhone 12 / 12 Pro',   compatible: 119, premium: 189 },
        { model: 'iPhone 12 Mini',       compatible: 129, premium: 199 },
        { model: 'iPhone 12 Pro Max',    compatible: 149, premium: 219 },
      ],
    },
    {
      serie: 'Série iPhone 13',
      icon: '📱',
      rows: [
        { model: 'iPhone 13',            compatible: 129, premium: 199 },
        { model: 'iPhone 13 Mini',       compatible: 139, premium: 209 },
        { model: 'iPhone 13 Pro',        compatible: 149, premium: 229 },
        { model: 'iPhone 13 Pro Max',    compatible: 159, premium: 239 },
      ],
    },
    {
      serie: 'Série iPhone 14',
      icon: '📱',
      rows: [
        { model: 'iPhone 14',            compatible: 139, premium: 209 },
        { model: 'iPhone 14 Plus',       compatible: 159, premium: 229 },
        { model: 'iPhone 14 Pro',        compatible: 169, premium: 249 },
        { model: 'iPhone 14 Pro Max',    compatible: 179, premium: 259 },
      ],
    },
    {
      serie: 'Série iPhone 15',
      icon: '📱',
      rows: [
        { model: 'iPhone 15',            compatible: 149, premium: 229 },
        { model: 'iPhone 15 Plus',       compatible: 179, premium: 269 },
        { model: 'iPhone 15 Pro',        compatible: 189, premium: 269 },
        { model: 'iPhone 15 Pro Max',    compatible: 219, premium: 319 },
      ],
    },
    {
      serie: 'Série iPhone 16',
      icon: '📱',
      rows: [
        { model: 'iPhone 16',            compatible: 169, premium: 249 },
        { model: 'iPhone 16 Plus',       compatible: 189, premium: 269 },
        { model: 'iPhone 16 Pro',        compatible: 199, premium: 299 },
        { model: 'iPhone 16 Pro Max',    compatible: 219, premium: 329 },
      ],
    },
    {
      serie: 'Série iPhone 17',
      icon: '📱',
      rows: [
        { model: 'iPhone 17',            compatible: 189, premium: 269 },
        { model: 'iPhone 17 Plus',       compatible: 209, premium: 289 },
        { model: 'iPhone 17 Pro',        compatible: 229, premium: 319 },
        { model: 'iPhone 17 Pro Max',    compatible: 249, premium: 349 },
      ],
    },
  ],
}

// ─── BATTERIES ───────────────────────────────────────────────────────────────

const batteries: RepairCategory = {
  id: 'batteries',
  label: 'Batteries',
  tierLabels: {
    compatible: 'Compatible',
    premium:    'Premium HC',
  },
  tierDesc: {
    compatible: 'Prix le plus bas',
    premium:    'Haute capacité — autonomie maximale',
  },
  series: [
    {
      serie: 'Série iPhone 7 / 8 / SE',
      icon: '🔋',
      rows: [
        { model: 'iPhone 7 / 8 / SE (2020 / 2022)', compatible: 49, premium: 69 },
      ],
    },
    {
      serie: 'Série iPhone X',
      icon: '🔋',
      rows: [
        { model: 'iPhone X / XS',  compatible: 59, premium:  79 },
        { model: 'iPhone XR',      compatible: 59, premium:  79 },
        { model: 'iPhone XS Max',  compatible: 69, premium:  89 },
      ],
    },
    {
      serie: 'Série iPhone 11',
      icon: '🔋',
      rows: [
        { model: 'iPhone 11',          compatible: 69, premium:  89 },
        { model: 'iPhone 11 Pro',      compatible: 79, premium:  99 },
        { model: 'iPhone 11 Pro Max',  compatible: 79, premium:  99 },
      ],
    },
    {
      serie: 'Série iPhone 12',
      icon: '🔋',
      rows: [
        { model: 'iPhone 12',          compatible: 79, premium:  99 },
        { model: 'iPhone 12 Mini',     compatible: 79, premium:  99 },
        { model: 'iPhone 12 Pro',      compatible: 79, premium:  99 },
        { model: 'iPhone 12 Pro Max',  compatible: 89, premium: 109 },
      ],
    },
    {
      serie: 'Série iPhone 13',
      icon: '🔋',
      rows: [
        { model: 'iPhone 13',          compatible:  89, premium: 109 },
        { model: 'iPhone 13 Mini',     compatible:  89, premium: 109 },
        { model: 'iPhone 13 Pro',      compatible:  99, premium: 119 },
        { model: 'iPhone 13 Pro Max',  compatible:  99, premium: 119 },
      ],
    },
    {
      serie: 'Série iPhone 14',
      icon: '🔋',
      rows: [
        { model: 'iPhone 14',          compatible:  89, premium: 109 },
        { model: 'iPhone 14 Plus',     compatible:  99, premium: 119 },
        { model: 'iPhone 14 Pro',      compatible: 109, premium: 129 },
        { model: 'iPhone 14 Pro Max',  compatible: 109, premium: 129 },
      ],
    },
    {
      serie: 'Série iPhone 15',
      icon: '🔋',
      rows: [
        { model: 'iPhone 15',          compatible:  99, premium: 119 },
        { model: 'iPhone 15 Plus',     compatible: 109, premium: 129 },
        { model: 'iPhone 15 Pro',      compatible: 119, premium: 139 },
        { model: 'iPhone 15 Pro Max',  compatible: 119, premium: 139 },
      ],
    },
    {
      serie: 'Série iPhone 16',
      icon: '🔋',
      rows: [
        { model: 'iPhone 16',          compatible: 109, premium: 129 },
        { model: 'iPhone 16 Plus',     compatible: 119, premium: 139 },
        { model: 'iPhone 16 Pro',      compatible: 129, premium: 149 },
        { model: 'iPhone 16 Pro Max',  compatible: 129, premium: 149 },
      ],
    },
    {
      serie: 'Série iPhone 17',
      icon: '🔋',
      rows: [
        { model: 'iPhone 17',          compatible: 119, premium: 139 },
        { model: 'iPhone 17 Plus',     compatible: 129, premium: 149 },
        { model: 'iPhone 17 Pro',      compatible: 139, premium: 159 },
        { model: 'iPhone 17 Pro Max',  compatible: 139, premium: 159 },
      ],
    },
  ],
}

// ─── DIAGNOSTIC ──────────────────────────────────────────────────────────────

export const diagnostic: DiagnosticTarif = {
  prix:  0,
  label: 'Diagnostic Com\'9 Expert',
  note:  'Service offert avec chaque réparation',
  inclus: [
    'Score sur 100',
    'Feuille officielle Com\'9',
    'Analyse batterie, écran, caméras, audio, réseau, capteurs',
    'Résultat immédiat',
  ],
}

// ─── EXPORT PRINCIPAL ────────────────────────────────────────────────────────

export const tarifsRepair: RepairCategory[] = [ecrans, batteries]
