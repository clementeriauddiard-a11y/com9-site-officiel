// ─────────────────────────────────────────────────────────────────────────────
// COM'9 MARKETPLACE — Téléphones certifiés
// ─────────────────────────────────────────────────────────────────────────────
//
//  ✅ AJOUTER un téléphone  →  Copie-colle un bloc dans le tableau `phones`
//  ✅ RETIRER un téléphone  →  Supprime l'objet OU passe status: "Vendu"
//  ✅ RÉSERVÉ               →  status: "Réservé"   → badge orange, bouton actif
//  ✅ VENDU                 →  status: "Vendu"     → badge rouge, bouton désactivé
//
//  IMAGE : Place le fichier dans /public/phones/
//          puis renseigne image: "/phones/nom-du-fichier.jpg"
//          Si pas d'image, omets le champ ou mets image: undefined
//
//  BATTERIE  : Entrer le chiffre seul, sans %, ex: 89
//  PRIX      : Entrer le montant en euros sans symbole, ex: 299
//  COM9SCORE : Score diagnostic sur 100, ex: 92
//
// ─────────────────────────────────────────────────────────────────────────────

export type PhoneStatus    = 'Disponible' | 'Réservé' | 'Vendu'
export type PhoneCondition = 'Excellent'  | 'Très bon' | 'Bon'  | 'Correct'

export type Phone = {
  /** Identifiant unique, ex: "iphone-13-128-bleu-001" */
  id:              string

  /** Marque, ex: "Apple" — utilisée pour le filtre par marque */
  brand:           string

  /** Modèle affiché sur la carte, ex: "iPhone 13" */
  model:           string

  /** Capacité de stockage, ex: "128 Go" */
  storage:         string

  /** Couleur, ex: "Bleu Alpine" */
  color:           string

  /** Santé de la batterie en %, entrer le chiffre seul, ex: 89 */
  battery:         number

  /** État général de l'appareil */
  condition:       PhoneCondition

  /** Score diagnostic Com'9 sur 100 */
  com9Score:       number

  /** Prix de vente en euros, entrer le chiffre seul, ex: 299 */
  price:           number

  /** Statut de disponibilité */
  status:          PhoneStatus

  /** Chemin de l'image depuis /public, ex: "/phones/iphone-13-blue.jpg" */
  image?:          string

  /** Description courte optionnelle affichée sur la carte */
  description?:    string

  /**
   * Points de certification affichés sur la carte.
   * Liste personnalisable par téléphone.
   * Ex: ["Diagnostic Com'9 effectué", "Batterie analysée", "Écran vérifié"]
   */
  labels:          string[]

  /**
   * Message pré-rédigé envoyé via WhatsApp au clic sur le bouton.
   * Ex: "Bonjour Com'9, je suis intéressé(e) par l'iPhone 13 128 Go à 299 €."
   */
  whatsappMessage: string
}

// ─── Couleurs par état ────────────────────────────────────────────────────────

export const conditionColor: Record<PhoneCondition, string> = {
  'Excellent': '#00d1ff',
  'Très bon':  '#4da6ff',
  'Bon':       '#a0b4d0',
  'Correct':   'rgba(234,251,255,0.38)',
}

export const statusColor: Record<PhoneStatus, string> = {
  'Disponible': '#00d1ff',
  'Réservé':    '#facc15',
  'Vendu':      'rgba(234,251,255,0.25)',
}

// ─── Téléphones en vente ──────────────────────────────────────────────────────
//
//  Pour ajouter un téléphone : copie le bloc d'exemple ci-dessous,
//  décommente-le et remplis les champs. C'est tout.
//
// ─────────────────────────────────────────────────────────────────────────────

export const phones: Phone[] = [

  // ── Exemple iPhone 13 ────────────────────────────────────────────────────
  // {
  //   id:              'iphone-13-128-bleu-001',
  //   brand:           'Apple',
  //   model:           'iPhone 13',
  //   storage:         '128 Go',
  //   color:           'Bleu',
  //   battery:         89,
  //   condition:       'Très bon',
  //   com9Score:       92,
  //   price:           299,
  //   status:          'Disponible',
  //   image:           '/phones/iphone-13-blue.jpg',
  //   description:     'Face ID parfait. Micro-rayures légères sur châssis.',
  //   labels: [
  //     "Diagnostic Com'9 effectué",
  //     "Batterie analysée",
  //     "Écran vérifié",
  //     "Caméras testées",
  //     "Nettoyé & optimisé",
  //   ],
  //   whatsappMessage: "Bonjour Com'9 👋 Je viens du site. Je suis intéressé(e) par l'iPhone 13 128 Go Bleu à 299 €. Est-il toujours disponible ?",
  // },

  // ── Exemple iPhone 14 Pro ────────────────────────────────────────────────
  // {
  //   id:              'iphone-14-pro-256-noir-001',
  //   brand:           'Apple',
  //   model:           'iPhone 14 Pro',
  //   storage:         '256 Go',
  //   color:           'Noir sidéral',
  //   battery:         94,
  //   condition:       'Excellent',
  //   com9Score:       96,
  //   price:           549,
  //   status:          'Disponible',
  //   image:           '/phones/iphone-14-pro-black.jpg',
  //   labels: [
  //     "Diagnostic Com'9 effectué",
  //     "Batterie analysée",
  //     "Écran OLED vérifié",
  //     "Caméras testées",
  //     "Réseau & 5G validés",
  //     "Nettoyé & optimisé",
  //   ],
  //   whatsappMessage: "Bonjour Com'9 👋 Je viens du site. Je suis intéressé(e) par l'iPhone 14 Pro 256 Go à 549 €. Est-il toujours disponible ?",
  // },

  // ── Exemple Samsung Galaxy S23 ────────────────────────────────────────────
  // {
  //   id:              'samsung-s23-128-vert-001',
  //   brand:           'Samsung',
  //   model:           'Galaxy S23',
  //   storage:         '128 Go',
  //   color:           'Vert',
  //   battery:         87,
  //   condition:       'Très bon',
  //   com9Score:       88,
  //   price:           349,
  //   status:          'Disponible',
  //   image:           '/phones/samsung-s23-green.jpg',
  //   labels: [
  //     "Diagnostic Com'9 effectué",
  //     "Batterie analysée",
  //     "Écran AMOLED vérifié",
  //     "Caméras testées",
  //     "Nettoyé & optimisé",
  //   ],
  //   whatsappMessage: "Bonjour Com'9 👋 Je viens du site. Je suis intéressé(e) par le Samsung Galaxy S23 128 Go à 349 €. Est-il toujours disponible ?",
  // },

]
