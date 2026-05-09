// ─────────────────────────────────────────────────────────────────────────────
// COM'9 CERTIFIED — Annonces téléphones reconditionnés
// Pour ajouter un téléphone : duplique un bloc et remplis les champs.
// sold: true  →  affiché comme "Vendu"
// photo       →  place l'image dans /public/occasion/  (ex: "/occasion/iphone15.jpg")
// ─────────────────────────────────────────────────────────────────────────────

export type PhoneAnnonce = {
  id:           string
  brand:        string
  model:        string
  storage:      string
  color:        string
  battery:      number        // % de santé batterie  (ex: 91)
  condition:    'Excellent' | 'Très bon' | 'Bon' | 'Correct'
  score:        number        // score diagnostic /100
  price:        number        // prix en euros
  photo?:       string        // chemin dans /public/  (ex: "/occasion/iphone15.jpg")
  description?: string
  sold?:        boolean
}

export const annonces: PhoneAnnonce[] = [
  // ── Ajoute tes téléphones ici ──────────────────────────────────────────────
  //
  // {
  //   id:          'iphone-14-128-noir',
  //   brand:       'Apple',
  //   model:       'iPhone 14',
  //   storage:     '128 Go',
  //   color:       'Noir sidéral',
  //   battery:     89,
  //   condition:   'Très bon',
  //   score:       85,
  //   price:       549,
  //   photo:       '/occasion/iphone14-noir.jpg',
  //   description: 'Face ID parfait. Micro-rayures légères sur châssis.',
  //   sold:        false,
  // },
  //
  // ──────────────────────────────────────────────────────────────────────────
]

export const CERTIFICATIONS = [
  'Diagnostic validé',
  'Caméras testées',
  'Batterie vérifiée',
  'Face ID contrôlé',
  'Appareil nettoyé',
]

export const conditionColor: Record<PhoneAnnonce['condition'], string> = {
  'Excellent': '#00d1ff',
  'Très bon':  '#00d1ff',
  'Bon':       '#a0b4d0',
  'Correct':   'rgba(234,251,255,0.4)',
}
