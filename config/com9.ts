// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — RÉGLAGES CENTRALISÉS
// ─────────────────────────────────────────────────────────────────────────────
//
//  C'est ici, et seulement ici, que se modifient :
//    • les horaires d'intervention proposés aux clients
//    • les frais de déplacement et la distance maximale
//    • la durée prévue de chaque prestation
//    • le délai de commande d'une pièce
//    • le montant du diagnostic en cas de refus
//    • les modes de paiement acceptés
//
//  Les prix de réparation, eux, sont dans data/tarifs.ts (grille par modèle).
//  Les statuts (rendez-vous, pièce) sont dans lib/agenda/types.ts.
//
//  Montants : toujours en CENTIMES (890 = 8,90 €) pour éviter les arrondis.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Point de départ des déplacements ────────────────────────────────────────

export const ATELIER = {
  /** Adresse envoyée au calcul d'itinéraire */
  adresse: 'Place Saint-Pol, 28400 Nogent-le-Rotrou, France',
  /** Libellé affiché au client */
  libelle: 'Nogent-le-Rotrou',
} as const

// ─── Horaires publics d'intervention ─────────────────────────────────────────
//  Index = jour de la semaine (0 = dimanche … 6 = samedi), heure de Paris.
//  null = aucune intervention proposée ce jour-là.
//  COM'9 peut toujours créer un rendez-vous hors de ces horaires depuis l'agenda.

export type Plage = { debut: string; fin: string } // « HH:MM »

export const HORAIRES: readonly (Plage | null)[] = [
  { debut: '14:00', fin: '23:00' }, // dimanche
  { debut: '19:00', fin: '23:00' }, // lundi
  { debut: '19:00', fin: '23:00' }, // mardi
  { debut: '19:00', fin: '23:00' }, // mercredi
  { debut: '19:00', fin: '23:00' }, // jeudi
  { debut: '14:00', fin: '23:00' }, // vendredi
  { debut: '14:00', fin: '23:00' }, // samedi
]

/** Textes affichés sur le site (à garder cohérents avec HORAIRES). */
export const HORAIRES_TEXTE = {
  accroche: "Jusqu'à 23h",
  detail: 'En semaine dès 19h • Du vendredi au dimanche dès 14h',
  lignes: [
    { jours: 'Lundi → jeudi', heures: '19h00 – 23h00' },
    { jours: 'Vendredi → dimanche', heures: '14h00 – 23h00' },
  ],
} as const

// ─── Créneaux proposés au client ─────────────────────────────────────────────

export const CRENEAUX = {
  /** Pas entre deux heures de début proposées (minutes) */
  pasMin: 30,
  /** Délai minimum entre maintenant et un créneau proposé (minutes) */
  preavisMin: 120,
  /** Jusqu'où le client peut choisir une date (jours) */
  horizonJours: 30,
} as const

// ─── Frais de déplacement ────────────────────────────────────────────────────
//  Distance PAR LA ROUTE depuis l'atelier. Bornes incluses.
//  Un seul déplacement est facturé par intervention.

export type ZoneId = 'z5' | 'z15' | 'z30' | 'hors'

export type Zone = {
  id: ZoneId
  /** Distance maximale couverte (km) — null pour « hors zone » */
  maxKm: number | null
  /** Libellé court, pour les boutons */
  label: string
  /** Libellé complet, pour les récapitulatifs */
  full: string
  /** Forfait en centimes — null : COM'9 n'intervient pas */
  feeCents: number | null
}

export const ZONES: readonly Zone[] = [
  { id: 'z5',   maxKm: 5,    label: '0 à 5 km',      full: "Jusqu'à 5 km",                       feeCents: 890 },
  { id: 'z15',  maxKm: 15,   label: '5 à 15 km',     full: 'De 5 à 15 km',                        feeCents: 1490 },
  { id: 'z30',  maxKm: 30,   label: '15 à 30 km',    full: 'De 15 à 30 km',                       feeCents: 2490 },
  { id: 'hors', maxKm: null, label: 'Plus de 30 km', full: "Au-delà de 30 km : COM'9 n'intervient pas", feeCents: null },
]

/** Au-delà, COM'9 n'intervient pas. */
export const DISTANCE_MAX_KM = 30

// ─── Durées prévues (minutes) ────────────────────────────────────────────────
//  Utilisées pour éviter les chevauchements. Modifiables aussi dans les
//  réglages de l'agenda (ces valeurs servent de départ).

export const DUREES_MIN = {
  ecran: 60,
  batterie: 45,
  vitre: 90,
  module: 60,
  diagnostic: 45,
} as const

// ─── Pièces ──────────────────────────────────────────────────────────────────

export const DELAI_COMMANDE_JOURS = 3

// ─── Diagnostic à domicile ───────────────────────────────────────────────────

export const DIAGNOSTIC = {
  /** Facturé seulement si le client refuse la réparation après le diagnostic */
  refusCents: 290,
} as const

// ─── Paiement (après intervention) ───────────────────────────────────────────

export const PAIEMENT_MODES = ['cb', 'especes', 'virement'] as const
export type PaiementMode = (typeof PAIEMENT_MODES)[number]

export const PAIEMENT_LABEL: Record<PaiementMode, string> = {
  cb: 'Carte bancaire',
  especes: 'Espèces',
  virement: 'Virement',
}

// ─── « Autre problème » : symptômes dont la réparation a un prix connu ───────
//  Si un symptôme correspond à coup sûr à une prestation de la grille, indiquez-la
//  ici (ex. { ne_tient_plus_la_charge: 'batterie' }) : le parcours affichera
//  directement le tarif. Vide = diagnostic à domicile pour tous les symptômes.

export const SYMPTOME_PRESTATION: Partial<Record<string, 'ecran' | 'batterie' | 'vitre'>> = {}
