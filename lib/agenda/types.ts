// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : types et libellés
// ─────────────────────────────────────────────────────────────────────────────
//
//  Deux statuts indépendants par intervention :
//    • le statut du RENDEZ-VOUS  (où en est l'intervention)
//    • l'état de la PIÈCE        (où en est l'approvisionnement)
//
//  Ce fichier ne contient aucune logique : il décrit les données.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { RepairId, ZoneId } from '@/data/tarifs'

// ─── Statut du rendez-vous ───────────────────────────────────────────────────

export const APPT_STATUSES = [
  'demande_recue',
  'creneau_propose',
  'confirme',
  'en_route',
  'en_cours',
  'termine',
  'annule',
] as const

export type ApptStatus = (typeof APPT_STATUSES)[number]

export const APPT_STATUS_LABEL: Record<ApptStatus, string> = {
  demande_recue:   'Demande reçue',
  creneau_propose: 'Créneau proposé',
  confirme:        'Confirmé',
  en_route:        'En route',
  en_cours:        'Intervention en cours',
  termine:         'Terminé',
  annule:          'Annulé',
}

/** Statuts qui réservent réellement du temps dans le planning. */
export const BLOCKING_STATUSES: readonly ApptStatus[] = ['confirme', 'en_route', 'en_cours']

/** Statuts qui apparaissent dans la liste « Demandes à traiter ». */
export const PENDING_STATUSES: readonly ApptStatus[] = ['demande_recue', 'creneau_propose']

// ─── État de la pièce ────────────────────────────────────────────────────────

export const PART_STATUSES = [
  'en_stock',
  'a_commander',
  'commandee',
  'recue',
  'indisponible',
] as const

export type PartStatus = (typeof PART_STATUSES)[number]

export const PART_STATUS_LABEL: Record<PartStatus, string> = {
  en_stock:     'En stock',
  a_commander:  'À commander',
  commandee:    'Commandée',
  recue:        'Reçue',
  indisponible: 'Indisponible',
}

/** Mention affichée quand la pièce n'est pas encore là. Estimation, pas garantie. */
export const ORDER_DELAY_NOTE = 'Sur commande — délai estimé de 3 jours.'

export function partNeedsOrder(p: PartStatus | null): boolean {
  return p === 'a_commander' || p === 'commandee'
}

// ─── Origine ─────────────────────────────────────────────────────────────────

export const ORIGINS = ['site', 'telephone', 'whatsapp'] as const
export type Origin = (typeof ORIGINS)[number]

export const ORIGIN_LABEL: Record<Origin, string> = {
  site:      'Site',
  telephone: 'Téléphone',
  whatsapp:  'WhatsApp',
}

// ─── Rendez-vous ─────────────────────────────────────────────────────────────

export type Appointment = {
  id: string
  /** Jeton aléatoire du lien de suivi client (étape 3). Jamais exposé en liste. */
  trackToken: string
  createdAt: string
  updatedAt: string

  // Client — données personnelles, accessibles à l'administrateur seulement
  clientName: string
  clientPhone: string
  address: string

  // Prestation
  model: string
  repair: RepairId
  /** Libellé de la qualité retenue (« OLED », « Soft OLED Premium »…) */
  quality: string
  /** Description du problème, fournie par le client */
  description: string

  // Prix — montants en euros entiers
  /** Prix de réparation convenu. Pré-rempli depuis la grille, modifiable. */
  repairPrice: number
  zone: ZoneId | null
  /** true quand COM'9 a vérifié la zone (une zone choisie par le client est provisoire) */
  zoneVerified: boolean
  /** Forfait de déplacement. null = sur devis ou pas encore défini : aucun total. */
  travelFee: number | null

  // Planning
  /** Début prévu (ISO). null tant qu'aucun créneau n'est fixé. */
  startAt: string | null
  durationMin: number

  // Proposition d'un autre créneau
  proposedStartAt: string | null
  proposedReason: string
  /** Proposition ferme : son acceptation confirme le rendez-vous. */
  proposalFirm: boolean

  origin: Origin
  status: ApptStatus
  /** null = pas encore vérifié */
  partStatus: PartStatus | null

  /** Notes internes — jamais visibles par le client */
  internalNotes: string
}

export type ApptEvent = {
  id: number
  apptId: string
  at: string
  kind: 'creation' | 'statut' | 'modification' | 'proposition' | 'piece'
  /** Résumé lisible de ce qui a changé */
  summary: string
}

// ─── Réglages planning ───────────────────────────────────────────────────────

export type AgendaSettings = {
  /** Durée prévue par prestation, en minutes */
  durations: Record<RepairId, number>
  /** Marge minimale entre deux rendez-vous confirmés, en minutes */
  marginMin: number
  /** Plage affichée dans la vue semaine (heures entières, 0–24) */
  dayStartHour: number
  dayEndHour: number
}

/**
 * Valeurs de départ, à ajuster par COM'9 dans les réglages de l'agenda.
 * Ce sont des propositions, pas des durées validées.
 */
export const DEFAULT_SETTINGS: AgendaSettings = {
  durations: { ecran: 60, batterie: 45, vitre: 90 },
  marginMin: 30,
  dayStartHour: 8,
  dayEndHour: 20,
}
