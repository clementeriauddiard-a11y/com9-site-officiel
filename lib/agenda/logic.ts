// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : règles métier (fonctions pures, sans base de données)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Tout ce qui décide (transitions, chevauchements, prix, validation) vit ici,
//  en fonctions pures. Le stockage ne fait qu'enregistrer et relire.
//  Avantage : chaque règle est testable sans serveur ni base.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  ALL_REPAIRS,
  ZONES,
  isGridRepair,
  zoneFeeCents,
  type RepairId,
  type ZoneId,
} from '@/data/tarifs'
import { findCatalogModel, priceOptions } from '@/data/catalogue'
import {
  APPT_STATUSES,
  BLOCKING_STATUSES,
  ORIGINS,
  PART_STATUSES,
  PREFERRED_PERIODS,
  SYMPTOMS,
  type AgendaSettings,
  type Symptom,
  type ApptStatus,
  type Appointment,
  type Origin,
  type PartStatus,
  type PreferredPeriod,
} from './types'
import { findCommune } from '@/lib/communes'
import { CRENEAUX } from '@/config/com9'

// ─── Transitions de statut ───────────────────────────────────────────────────

export type ActionId =
  | 'confirmer'
  | 'proposer'
  | 'accepter_proposition'
  | 'en_route'
  | 'en_cours'
  | 'terminer'
  | 'valider_choix_client'
  | 'annuler'
  | 'rouvrir'

type ActionDef = {
  label: string
  from: readonly ApptStatus[]
  to: ApptStatus
}

export const ACTIONS: Record<ActionId, ActionDef> = {
  confirmer: {
    label: 'Confirmer le rendez-vous',
    from: ['demande_recue', 'creneau_propose'],
    to: 'confirme',
  },
  proposer: {
    label: 'Proposer un autre créneau',
    from: ['demande_recue', 'creneau_propose', 'confirme'],
    to: 'creneau_propose',
  },
  accepter_proposition: {
    label: 'Le client accepte la proposition',
    from: ['creneau_propose'],
    to: 'confirme',
  },
  en_route: {
    label: 'En route',
    from: ['confirme'],
    to: 'en_route',
  },
  en_cours: {
    label: 'Intervention en cours',
    from: ['confirme', 'en_route'],
    to: 'en_cours',
  },
  terminer: {
    label: "Terminer l'intervention",
    from: ['confirme', 'en_route', 'en_cours'],
    to: 'termine',
  },
  valider_choix_client: {
    label: 'Valider le créneau choisi par le client',
    from: ['confirme'],
    to: 'confirme',
  },
  annuler: {
    label: 'Annuler le rendez-vous',
    from: ['demande_recue', 'creneau_propose', 'confirme', 'en_route', 'en_cours'],
    to: 'annule',
  },
  rouvrir: {
    label: 'Rouvrir le dossier',
    from: ['annule'],
    to: 'demande_recue',
  },
}

export function availableActions(status: ApptStatus): ActionId[] {
  return (Object.keys(ACTIONS) as ActionId[]).filter((id) =>
    ACTIONS[id].from.includes(status),
  )
}

// ─── Planning : fin d'intervention et chevauchements ─────────────────────────

const MIN = 60_000

export function endMs(startIso: string, durationMin: number): number {
  return new Date(startIso).getTime() + durationMin * MIN
}

/**
 * Deux interventions se chevauchent si l'écart entre elles est inférieur à la
 * marge. Avec une marge de 30 min, un rendez-vous de 9 h à 10 h laisse le
 * suivant commencer à 10 h 30 au plus tôt.
 */
export function overlaps(
  aStart: string,
  aDurationMin: number,
  bStart: string,
  bDurationMin: number,
  marginMin: number,
): boolean {
  const aS = new Date(aStart).getTime()
  const bS = new Date(bStart).getTime()
  const aE = aS + aDurationMin * MIN
  const bE = bS + bDurationMin * MIN
  const m = marginMin * MIN
  return aS < bE + m && bS < aE + m
}

/** Rendez-vous confirmés qui entreraient en conflit avec le créneau candidat. */
export function findConflicts(
  candidate: { id?: string; startAt: string; durationMin: number },
  others: Appointment[],
  marginMin: number,
): Appointment[] {
  return others.filter(
    (o) =>
      o.id !== candidate.id &&
      BLOCKING_STATUSES.includes(o.status) &&
      o.startAt !== null &&
      overlaps(candidate.startAt, candidate.durationMin, o.startAt, o.durationMin, marginMin),
  )
}

// ─── Prix ────────────────────────────────────────────────────────────────────

/** Qualités à prix validé pour un couple modèle / prestation (catalogue multimarque). [] = sur devis ou hors catalogue. */
export function qualitiesFor(model: string, repair: RepairId) {
  return priceOptions(model, repair)
}

/** Prix de la grille en centimes, ou null si la combinaison n'existe pas. */
export function gridPriceCents(model: string, repair: RepairId, quality: string): number | null {
  const opt = qualitiesFor(model, repair).find((o) => o.label === quality)
  return opt ? opt.priceCents : null
}

/** Forfait de la zone en centimes. null = hors zone ou zone inconnue. */
export const zoneFee = (zone: ZoneId | null): number | null => zoneFeeCents(zone)

/** Total à payer (centimes). null tant que réparation ou déplacement ne sont pas chiffrés. */
export function apptTotal(a: Pick<Appointment, 'repairPriceCents' | 'travelFeeCents'>): number | null {
  return a.travelFeeCents === null || a.repairPriceCents === null ? null : a.repairPriceCents + a.travelFeeCents
}

// ─── Téléphone ───────────────────────────────────────────────────────────────

/**
 * Chiffres internationaux sans « + » (ex. 33612345678), ou null si invalide.
 * Accepte 06…, +33 6…, 0033 6…, avec espaces, points ou tirets.
 */
export function phoneDigits(raw: string): string | null {
  const s = (raw ?? '').replace(/[^\d+]/g, '')
  let d: string
  if (s.startsWith('+')) d = s.slice(1)
  else if (s.startsWith('00')) d = s.slice(2)
  else if (/^0\d{9}$/.test(s)) d = '33' + s.slice(1)
  else d = s
  return /^\d{8,15}$/.test(d) ? d : null
}

export function telHref(raw: string): string | null {
  const d = phoneDigits(raw)
  return d ? `tel:+${d}` : null
}

export function waHref(raw: string, text?: string): string | null {
  const d = phoneDigits(raw)
  if (!d) return null
  return text ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : `https://wa.me/${d}`
}

// ─── Validation d'une fiche ──────────────────────────────────────────────────

/** Ce que l'administrateur peut saisir ou modifier. */
export type ApptInput = {
  clientName: string
  clientPhone: string
  email?: string
  address: string
  model: string
  repair: RepairId
  quality: string
  description?: string
  symptom?: Symptom | null
  /** Centimes ; null = à déterminer (petite pièce, diagnostic) */
  repairPriceCents: number | null
  zone: ZoneId | null
  zoneVerified?: boolean
  /** Centimes ; null = pas encore défini */
  travelFeeCents: number | null
  startAt: string | null
  durationMin: number
  origin: Origin
  partStatus: PartStatus | null
  internalNotes?: string
  preferredDate?: string | null
  preferredPeriod?: PreferredPeriod | null
  availabilityNote?: string
  communeId?: string | null
}

const isRepair = (v: unknown): v is RepairId =>
  typeof v === 'string' && (ALL_REPAIRS as string[]).includes(v)
export const isSymptom = (v: unknown): v is Symptom =>
  typeof v === 'string' && (SYMPTOMS as readonly string[]).includes(v)
/** Adresse e-mail plausible (facultative). */
export const isEmail = (v: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(v)
const isZone = (v: unknown): v is ZoneId =>
  typeof v === 'string' && ZONES.some((z) => z.id === v)
const isInt = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
const isIso = (v: unknown) =>
  typeof v === 'string' && !Number.isNaN(new Date(v).getTime())

/** Retourne la liste des erreurs, en français, prêtes à afficher. */
export function validateInput(i: Partial<ApptInput>): string[] {
  const e: string[] = []
  const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max

  if (!str(i.clientName, 120)) e.push('Le nom du client est obligatoire.')
  if (typeof i.clientPhone !== 'string' || !phoneDigits(i.clientPhone))
    e.push('Le numéro de téléphone est obligatoire et doit être valide.')
  if (!str(i.address, 300)) e.push("L'adresse d'intervention est obligatoire.")

  if (i.email !== undefined && (typeof i.email !== 'string' || (i.email.trim() !== '' && !isEmail(i.email.trim()))))
    e.push("L'adresse e-mail est invalide.")

  if (!isRepair(i.repair)) e.push('La prestation est invalide.')
  else if (isGridRepair(i.repair)) {
    // Écran / batterie / vitre : tout modèle. Si le catalogue a des prix validés
    // pour ce modèle, la qualité doit en faire partie ; sinon « sur devis ».
    if (!str(i.model, 80)) e.push('Le modèle du téléphone est obligatoire.')
    else if (typeof i.quality !== 'string' || i.quality.length > 80) e.push('Le détail de la pièce est trop long.')
    else if (qualitiesFor(i.model as string, i.repair).length > 0 && !qualitiesFor(i.model as string, i.repair).some((o) => o.label === i.quality))
      e.push("La qualité de pièce n'est pas proposée pour ce modèle.")
  } else {
    // Petite pièce / diagnostic : tout modèle, détail libre.
    if (!str(i.model, 80)) e.push('Le modèle du téléphone est obligatoire.')
    if (typeof i.quality !== 'string' || i.quality.length > 80) e.push('Le détail de la pièce est trop long.')
  }
  if (i.symptom !== undefined && i.symptom !== null && !isSymptom(i.symptom)) e.push('Le symptôme est invalide.')

  if (i.repairPriceCents === null || i.repairPriceCents === undefined) {
    // Obligatoire seulement quand le catalogue fixe un prix ; sinon « sur devis » (à définir).
    if (isRepair(i.repair) && isGridRepair(i.repair) && typeof i.model === 'string' && qualitiesFor(i.model, i.repair).length > 0)
      e.push('Le prix de réparation est obligatoire.')
  } else if (!isInt(i.repairPriceCents, 0, 1_000_000)) e.push('Le prix de réparation est invalide.')
  if (i.zone !== null && i.zone !== undefined && !isZone(i.zone)) e.push('La zone de déplacement est invalide.')
  if (i.travelFeeCents !== null && i.travelFeeCents !== undefined && !isInt(i.travelFeeCents, 0, 100_000))
    e.push('Le déplacement est invalide.')

  if (i.startAt !== null && i.startAt !== undefined && !isIso(i.startAt)) e.push('La date est invalide.')
  if (!isInt(i.durationMin, 10, 600)) e.push('La durée doit être comprise entre 10 et 600 minutes.')

  if (typeof i.origin !== 'string' || !(ORIGINS as readonly string[]).includes(i.origin))
    e.push("L'origine est invalide.")
  if (i.partStatus !== null && i.partStatus !== undefined &&
      !(PART_STATUSES as readonly string[]).includes(i.partStatus))
    e.push("L'état de la pièce est invalide.")

  if (i.description !== undefined && (typeof i.description !== 'string' || i.description.length > 2000))
    e.push('La description est trop longue.')
  if (i.internalNotes !== undefined && (typeof i.internalNotes !== 'string' || i.internalNotes.length > 4000))
    e.push('Les notes internes sont trop longues.')
  if (i.preferredDate !== undefined && i.preferredDate !== null && !isDay(i.preferredDate))
    e.push('Le jour souhaité est invalide.')
  if (i.preferredPeriod !== undefined && i.preferredPeriod !== null && !isPeriod(i.preferredPeriod))
    e.push('Le moment souhaité est invalide.')
  if (i.availabilityNote !== undefined && (typeof i.availabilityNote !== 'string' || i.availabilityNote.length > 300))
    e.push('Les autres disponibilités sont trop longues.')
  if (i.communeId !== undefined && i.communeId !== null && !findCommune(i.communeId))
    e.push('La commune est inconnue.')

  return e
}

const isDay = (v: unknown): v is string =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v + 'T12:00:00Z').getTime()) &&
  new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v
const isPeriod = (v: unknown): v is PreferredPeriod =>
  typeof v === 'string' && (PREFERRED_PERIODS as readonly string[]).includes(v)

// ─── Demande publique (formulaire du site) ───────────────────────────────────

/** Jour courant à Paris, AAAA-MM-JJ, quel que soit le fuseau du serveur. */
export function todayInParis(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(now)
}

export function addDaysToDay(day: string, n: number): string {
  const d = new Date(day + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Jusqu'où un client peut demander une date. */
export const BOOKING_HORIZON_DAYS = CRENEAUX.horizonJours

/** reparation : prix validé · devis : « Sur devis » (demande de tarif) · autre : pré-diagnostic */
export type RequestKind = 'reparation' | 'devis' | 'autre'

/** Seuls ces champs sont acceptés depuis le site. Le prix n'en fait pas partie. */
export type PublicRequestInput = {
  kind: RequestKind
  clientName: string
  clientPhone: string
  email: string
  address: string
  /** Code INSEE de la commune (proposition d'adresse), pour la zone de secours */
  citycode: string | null
  model: string
  repair: RepairId
  quality: string
  symptom: Symptom | null
  description: string
  /** Référence exacte du téléphone si le client la connaît (demande de tarif) */
  reference: string
  /** Créneau demandé (ISO) — une demande, jamais un rendez-vous confirmé */
  startAt: string
}

/**
 * Valide et nettoie une demande venant du site public.
 * Tout champ inconnu est ignoré ; le prix et le déplacement sont recalculés
 * par le serveur, la disponibilité du créneau aussi.
 */
export function parsePublicRequest(
  raw: unknown,
  now = new Date(),
): { ok: true; value: PublicRequestInput } | { ok: false; errors: string[] } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const e: string[] = []
  const txt = (k: string) => (typeof r[k] === 'string' ? (r[k] as string).trim().replace(/\s+/g, ' ') : '')
  const longTxt = (k: string) => (typeof r[k] === 'string' ? (r[k] as string).trim() : '')

  const kind: RequestKind = r.kind === 'autre' ? 'autre' : r.kind === 'devis' ? 'devis' : 'reparation'
  const reference = txt('reference').slice(0, 60)
  const clientName = txt('clientName')
  const clientPhone = txt('clientPhone')
  const email = txt('email')
  const address = txt('address')
  const citycodeRaw = txt('citycode')
  const model = txt('model')
  const description = longTxt('description')
  const startRaw = txt('startAt')
  let repair = txt('repair') as RepairId
  let quality = txt('quality')
  let symptom: Symptom | null = null

  if (kind === 'reparation') {
    // Prix validé : le modèle et la qualité doivent exister dans le catalogue.
    if (!isRepair(repair) || !isGridRepair(repair)) e.push('Choisissez la réparation.')
    if (!findCatalogModel(model)) e.push('Choisissez votre modèle.')
    else if (isRepair(repair) && !qualitiesFor(model, repair).some((o) => o.label === quality))
      e.push('Choisissez la qualité de la pièce.')
  } else if (kind === 'devis') {
    // Demande de tarif : tout modèle (référencé ou saisi), aucun prix accepté.
    if (!isRepair(repair) || !isGridRepair(repair)) e.push('Choisissez la réparation.')
    if (model.length < 2 || model.length > 80) e.push('Indiquez le modèle de votre téléphone.')
    quality = ''
  } else {
    repair = 'diagnostic'
    quality = ''
    const sy = txt('symptom')
    if (!isSymptom(sy)) e.push('Choisissez le problème rencontré.')
    else symptom = sy
    if (model.length < 2 || model.length > 80) e.push('Indiquez le modèle de votre téléphone.')
    if (sy === 'autre' && description.length < 5) e.push('Décrivez le problème en quelques mots.')
  }

  if (clientName.length < 2 || clientName.length > 80) e.push('Indiquez votre nom (2 à 80 caractères).')
  if (!phoneDigits(clientPhone) || clientPhone.length > 30) e.push('Indiquez un numéro de téléphone valide.')
  if (email && (email.length > 200 || !isEmail(email))) e.push("L'adresse e-mail est invalide.")
  if (address.length < 5 || address.length > 200) e.push("Indiquez l'adresse de l'intervention.")
  if (description.length > 1000) e.push('La description dépasse 1 000 caractères.')
  const startMs = new Date(startRaw).getTime()
  if (!startRaw || Number.isNaN(startMs)) e.push('Choisissez un créneau.')
  else if (startMs < now.getTime()) e.push('Ce créneau est déjà passé.')
  else if (startMs > now.getTime() + (BOOKING_HORIZON_DAYS + 1) * 86_400_000)
    e.push(`Choisissez un créneau dans les ${BOOKING_HORIZON_DAYS} prochains jours.`)

  if (e.length) return { ok: false, errors: e }
  return {
    ok: true,
    value: {
      kind, clientName, clientPhone, email, address,
      citycode: /^(\d{5}|2[AB]\d{3})$/.test(citycodeRaw) ? citycodeRaw : null,
      model, repair, quality, symptom, description, reference,
      startAt: new Date(startMs).toISOString(),
    },
  }
}

export function isApptStatus(v: unknown): v is ApptStatus {
  return typeof v === 'string' && (APPT_STATUSES as readonly string[]).includes(v)
}

// ─── Réglages ────────────────────────────────────────────────────────────────

export function validateSettings(s: Partial<AgendaSettings>): string[] {
  const e: string[] = []
  const d = s.durations
  if (!d || !ALL_REPAIRS.every((r) => isInt(d[r], 10, 600)))
    e.push('Chaque durée doit être comprise entre 10 et 600 minutes.')
  if (!isInt(s.marginMin, 0, 240)) e.push('La marge doit être comprise entre 0 et 240 minutes.')
  if (!isInt(s.dayStartHour, 0, 23) || !isInt(s.dayEndHour, 1, 24) ||
      (s.dayStartHour as number) >= (s.dayEndHour as number))
    e.push("La plage horaire affichée est invalide.")
  return e
}
