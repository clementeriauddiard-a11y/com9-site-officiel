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
import { DELAI_COMMANDE_JOURS, DUREES_MIN, type PaiementMode } from '@/config/com9'

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
export const ORDER_DELAY_NOTE = `Pièce sur commande — délai estimé ${DELAI_COMMANDE_JOURS} jours.`

export function partNeedsOrder(p: PartStatus | null): boolean {
  return p === 'a_commander' || p === 'commandee'
}

// ─── Origine ─────────────────────────────────────────────────────────────────

export const ORIGINS = ['site', 'telephone', 'whatsapp', 'manuel'] as const
export type Origin = (typeof ORIGINS)[number]

export const ORIGIN_LABEL: Record<Origin, string> = {
  site:      'Site',
  telephone: 'Téléphone',
  whatsapp:  'WhatsApp',
  manuel:    'Ajout manuel',
}

// ─── Symptômes (« Autre problème ») ──────────────────────────────────────────

export const SYMPTOMS = [
  'charge', 'chauffe', 'camera', 'micro', 'haut_parleur', 'face_id',
  'ne_s_allume_plus', 'liquide', 'autre', 'ne_sais_pas',
] as const
export type Symptom = (typeof SYMPTOMS)[number]

export const SYMPTOM_LABEL: Record<Symptom, string> = {
  charge:           'Ne charge plus',
  chauffe:          'Chauffe',
  camera:           'Problème caméra',
  micro:            'Problème microphone',
  haut_parleur:     'Problème haut-parleur',
  face_id:          'Face ID / Touch ID',
  ne_s_allume_plus: 'Ne s\'allume plus',
  liquide:          'Dommage liquide',
  autre:            'Autre',
  ne_sais_pas:      'Je ne sais pas',
}

// ─── Souhait du client (demande depuis le site) ───────────────────────────────

/**
 * Moment de la journée souhaité par le client. Volontairement sans heures :
 * les plages horaires d'intervention ne sont pas encore fixées par COM'9.
 * C'est un souhait, jamais un créneau réservé.
 */
export const PREFERRED_PERIODS = ['matin', 'apres_midi', 'fin_journee'] as const
export type PreferredPeriod = (typeof PREFERRED_PERIODS)[number]

export const PREFERRED_PERIOD_LABEL: Record<PreferredPeriod, string> = {
  matin:       'Matin',
  apres_midi:  'Après-midi',
  fin_journee: 'Fin de journée',
}

/** Message affiché au client après l'envoi d'une demande (texte validé par COM'9). */
export const REQUEST_RECEIVED_MESSAGE =
  'Votre demande a bien été reçue. COM\'9 vous confirmera le créneau ou vous proposera une autre disponibilité.'

/** Demande de tarif (« Sur devis ») : message après envoi et rappel sur le créneau. */
export const QUOTE_RECEIVED_MESSAGE =
  'Votre demande de tarif a bien été reçue.'
export const QUOTE_SLOT_NOTE =
  'COM’9 vous communique d’abord le prix de la réparation. Après votre accord, nous confirmons le créneau souhaité ou vous en proposons un autre.'

// ─── Réponse du client (lien de suivi) ───────────────────────────────────────

/**
 * Ce que le client a demandé depuis son lien de suivi et que COM'9 doit traiter.
 * null = rien en attente. Une demande de modification ou d'annulation ne change
 * jamais le rendez-vous toute seule : COM'9 décide.
 */
export const CLIENT_REQUESTS = ['acceptation', 'refus', 'autre_dispo', 'modification', 'annulation'] as const
// « refus » est conservé pour les fiches existantes ; le client choisit désormais un autre créneau.
export type ClientRequest = (typeof CLIENT_REQUESTS)[number]

export const CLIENT_REQUEST_LABEL: Record<ClientRequest, string> = {
  acceptation:  'Le client accepte le créneau indicatif — à confirmer',
  refus:        'Le client refuse le créneau proposé',
  autre_dispo:  'Le client a choisi un autre créneau',
  modification: 'Le client demande à changer le rendez-vous',
  annulation:   "Le client demande l'annulation",
}

// ─── Messages WhatsApp (envoi manuel) ────────────────────────────────────────

export const MESSAGE_KINDS = ['reception', 'proposition', 'confirmation', 'rappel', 'en_route', 'suivi', 'annulation'] as const
export type MessageKind = (typeof MESSAGE_KINDS)[number]

export const MESSAGE_LABEL: Record<MessageKind, string> = {
  reception:    'Accusé de réception',
  proposition:  'Proposition de créneau',
  confirmation: 'Confirmation',
  rappel:       'Rappel',
  en_route:     'En route',
  suivi:        'Suivi après intervention',
  annulation:   "Confirmation d'annulation",
}

/** Messages utiles selon l'état du rendez-vous, dans l'ordre d'affichage. */
export const MESSAGES_FOR_STATUS: Record<ApptStatus, MessageKind[]> = {
  demande_recue:   ['reception'],
  creneau_propose: ['proposition'],
  confirme:        ['confirmation', 'rappel'],
  en_route:        ['en_route'],
  en_cours:        [],
  termine:         ['suivi'],
  annule:          ['annulation'],
}

/**
 * Trace des messages notés « envoyés » par COM'9. `slot` = créneau concerné au
 * moment de l'envoi : si le rendez-vous est déplacé, confirmation et rappel
 * redeviennent « à envoyer ».
 */
export type MessagesLog = Partial<Record<MessageKind, { at: string; slot: string | null }>>

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
  /** Facultatif */
  email: string
  address: string

  // Prestation
  model: string
  repair: RepairId
  /** Libellé de la qualité retenue (« OLED », « Soft OLED Premium »…) */
  quality: string
  /** Description du problème, fournie par le client */
  description: string

  /** Symptôme choisi (parcours « Autre problème ») ; null sinon */
  symptom: Symptom | null

  // Prix — montants en CENTIMES
  /** Prix de réparation convenu. null = à déterminer (diagnostic, petite pièce). */
  repairPriceCents: number | null
  zone: ZoneId | null
  /** true quand la zone est sûre (distance calculée sur l'adresse précise, ou vérifiée par COM'9) */
  zoneVerified: boolean
  /** Forfait de déplacement. null = pas encore défini ou hors zone : aucun total. */
  travelFeeCents: number | null

  // Après l'intervention
  /** Montant final encaissé (centimes) */
  finalAmountCents: number | null
  paymentMode: PaiementMode | null
  paid: boolean
  paidAt: string | null

  // Planning
  /** Début prévu (ISO). null tant qu'aucun créneau n'est fixé. */
  startAt: string | null
  durationMin: number

  // Proposition d'un autre créneau
  proposedStartAt: string | null
  proposedReason: string
  /** Proposition ferme : son acceptation confirme le rendez-vous. */
  proposalFirm: boolean

  // Souhait exprimé par le client (demandes du site). Jamais un créneau réservé.
  /** Jour souhaité (AAAA-MM-JJ, heure de Paris) */
  preferredDate: string | null
  /** Moment souhaité ; null = indifférent */
  preferredPeriod: PreferredPeriod | null
  /** Autres disponibilités indiquées par le client */
  availabilityNote: string

  /** Demande du client en attente de traitement par COM'9 */
  clientRequest: ClientRequest | null
  /** Message libre du client joint à sa demande */
  clientMessage: string
  clientRequestAt: string | null
  /** Créneau choisi par le client depuis son lien (changement d'un rendez-vous confirmé) */
  clientSlot: string | null

  /** Commune de la liste COM'9 (null : hors liste ou non précisée) */
  communeId: string | null
  communeNom: string
  /** Distance par la route depuis l'atelier (km), si calculée */
  distanceKm: number | null
  /** 'google' : calculée par Google Maps · 'liste' : zone d'après la liste des communes */
  distanceSource: 'google' | 'liste' | null

  /** Messages WhatsApp notés comme envoyés (envoi manuel) */
  messagesLog: MessagesLog

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
  kind: 'creation' | 'statut' | 'modification' | 'proposition' | 'piece' | 'message' | 'paiement'
  /** Résumé lisible de ce qui a changé */
  summary: string
}

// ─── Plages bloquées par COM'9 ───────────────────────────────────────────────

export const BLOCK_REASONS = ['indisponible', 'personnel', 'trajet', 'piece', 'autre'] as const
export type BlockReason = (typeof BLOCK_REASONS)[number]

export const BLOCK_REASON_LABEL: Record<BlockReason, string> = {
  indisponible: 'Indisponible',
  personnel:    'Personnel',
  trajet:       'Trajet',
  piece:        'Récupération pièce',
  autre:        'Autre',
}

export type Block = {
  id: string
  startAt: string
  endAt: string
  reason: BlockReason
  /** Précision interne, jamais visible par les clients */
  note: string
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
  durations: { ...DUREES_MIN },
  marginMin: 30,
  // Vue semaine : couvre les horaires publics (14 h – 23 h) avec un peu de marge.
  dayStartHour: 13,
  dayEndHour: 24,
}
