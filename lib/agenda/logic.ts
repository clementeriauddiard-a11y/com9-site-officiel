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
  MODELS,
  REPAIRS,
  ZONES,
  findModel,
  getOptions,
  type RepairId,
  type ZoneId,
} from '@/data/tarifs'
import {
  APPT_STATUSES,
  BLOCKING_STATUSES,
  ORIGINS,
  PART_STATUSES,
  PREFERRED_PERIODS,
  type AgendaSettings,
  type ApptStatus,
  type Appointment,
  type Origin,
  type PartStatus,
  type PreferredPeriod,
} from './types'
import { findCommune } from '@/lib/communes'

// ─── Transitions de statut ───────────────────────────────────────────────────

export type ActionId =
  | 'confirmer'
  | 'proposer'
  | 'accepter_proposition'
  | 'en_route'
  | 'en_cours'
  | 'terminer'
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
    label: 'Terminé',
    from: ['en_cours'],
    to: 'termine',
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

/** Qualités réellement proposées pour un couple modèle / prestation. */
export function qualitiesFor(model: string, repair: RepairId) {
  const m = findModel(model)
  return m ? getOptions(repair, m) : []
}

/** Prix de la grille, ou null si la combinaison n'existe pas. */
export function gridPrice(model: string, repair: RepairId, quality: string): number | null {
  const opt = qualitiesFor(model, repair).find((o) => o.label === quality)
  return opt ? opt.price : null
}

/** Forfait de la zone. null = sur devis ou zone inconnue. */
export function zoneFee(zone: ZoneId | null): number | null {
  if (!zone) return null
  return ZONES.find((z) => z.id === zone)?.fee ?? null
}

/** Total à payer. null tant que le déplacement n'est pas chiffré (sur devis). */
export function apptTotal(a: Pick<Appointment, 'repairPrice' | 'travelFee'>): number | null {
  return a.travelFee === null ? null : a.repairPrice + a.travelFee
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
  address: string
  model: string
  repair: RepairId
  quality: string
  description?: string
  repairPrice: number
  zone: ZoneId | null
  zoneVerified?: boolean
  travelFee: number | null
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
  typeof v === 'string' && REPAIRS.some((r) => r.id === v)
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

  if (typeof i.model !== 'string' || !MODELS.some((m) => m.model === i.model))
    e.push('Le modèle doit être choisi dans la grille.')
  if (!isRepair(i.repair)) e.push('La prestation est invalide.')
  if (typeof i.model === 'string' && isRepair(i.repair)) {
    const q = qualitiesFor(i.model, i.repair)
    if (!q.some((o) => o.label === i.quality))
      e.push("La qualité de pièce n'est pas proposée pour ce modèle.")
  }

  if (!isInt(i.repairPrice, 0, 10_000)) e.push('Le prix de réparation doit être un nombre entier positif.')
  if (i.zone !== null && i.zone !== undefined && !isZone(i.zone)) e.push('La zone de déplacement est invalide.')
  if (i.travelFee !== null && i.travelFee !== undefined && !isInt(i.travelFee, 0, 1_000))
    e.push('Le déplacement doit être un nombre entier positif.')

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
export const BOOKING_HORIZON_DAYS = 60

/** Seuls ces champs sont acceptés depuis le site. Le prix n'en fait pas partie. */
export type PublicRequestInput = {
  clientName: string
  clientPhone: string
  address: string
  model: string
  repair: RepairId
  quality: string
  zone: ZoneId | null
  description: string
  preferredDate: string
  preferredPeriod: PreferredPeriod | null
  availabilityNote: string
  /** Commune choisie dans la liste COM'9 (null : hors liste ou non précisée) */
  communeId: string | null
  communeNom: string
  /** Le client a indiqué que sa commune n'est pas dans la liste */
  horsListe: boolean
}

/**
 * Valide et nettoie une demande venant du site public.
 * Si une commune de la liste est fournie, SA zone s'impose (la zone envoyée est ignorée).
 * Tout champ inconnu est ignoré ; le prix est toujours recalculé depuis la grille.
 */
export function parsePublicRequest(
  raw: unknown,
  today: string,
): { ok: true; value: PublicRequestInput } | { ok: false; errors: string[] } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const e: string[] = []
  const txt = (k: string) => (typeof r[k] === 'string' ? (r[k] as string).trim().replace(/\s+/g, ' ') : '')
  const longTxt = (k: string) => (typeof r[k] === 'string' ? (r[k] as string).trim() : '')

  const clientName = txt('clientName')
  const clientPhone = txt('clientPhone')
  const address = txt('address')
  const model = txt('model')
  const repair = txt('repair') as RepairId
  const quality = txt('quality')
  const zoneRaw = r.zone === null || r.zone === '' || r.zone === undefined ? null : txt('zone')
  const description = longTxt('description')
  const preferredDate = txt('preferredDate')
  const periodRaw = r.preferredPeriod === null || r.preferredPeriod === '' || r.preferredPeriod === undefined
    ? null : txt('preferredPeriod')
  const availabilityNote = longTxt('availabilityNote')
  const communeRaw = txt('commune')
  const commune = communeRaw && communeRaw !== 'hors-liste' ? findCommune(communeRaw) : null

  if (clientName.length < 2 || clientName.length > 80) e.push('Indiquez votre nom (2 à 80 caractères).')
  if (!phoneDigits(clientPhone) || clientPhone.length > 30) e.push('Indiquez un numéro de téléphone valide.')
  if (address.length < 5 || address.length > 200) e.push("Indiquez l'adresse de l'intervention.")
  if (!MODELS.some((m) => m.model === model)) e.push('Choisissez votre modèle.')
  if (!isRepair(repair)) e.push('Choisissez la réparation.')
  else if (MODELS.some((m) => m.model === model) && !qualitiesFor(model, repair).some((o) => o.label === quality))
    e.push('Choisissez la qualité de la pièce.')
  if (communeRaw && communeRaw !== 'hors-liste' && !commune) e.push('La commune choisie est inconnue.')
  if (!commune && zoneRaw !== null && !isZone(zoneRaw)) e.push('La zone choisie est invalide.')
  if (description.length > 1000) e.push('La description dépasse 1 000 caractères.')
  if (!isDay(preferredDate)) e.push('Choisissez le jour souhaité.')
  else if (preferredDate < today) e.push('Le jour souhaité est déjà passé.')
  else if (preferredDate > addDaysToDay(today, BOOKING_HORIZON_DAYS))
    e.push(`Choisissez un jour dans les ${BOOKING_HORIZON_DAYS} prochains jours.`)
  if (periodRaw !== null && !isPeriod(periodRaw)) e.push('Le moment souhaité est invalide.')
  if (availabilityNote.length > 300) e.push('Les autres disponibilités dépassent 300 caractères.')

  if (e.length) return { ok: false, errors: e }
  return {
    ok: true,
    value: {
      clientName, clientPhone, address, model, repair, quality,
      zone: commune ? commune.zone : communeRaw === 'hors-liste' ? null : (zoneRaw as ZoneId | null),
      communeId: commune ? commune.id : null,
      communeNom: commune ? commune.nom : '',
      horsListe: communeRaw === 'hors-liste',
      description, preferredDate,
      preferredPeriod: periodRaw as PreferredPeriod | null,
      availabilityNote,
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
  if (!d || !REPAIRS.every((r) => isInt(d[r.id], 10, 600)))
    e.push('Chaque durée doit être comprise entre 10 et 600 minutes.')
  if (!isInt(s.marginMin, 0, 240)) e.push('La marge doit être comprise entre 0 et 240 minutes.')
  if (!isInt(s.dayStartHour, 0, 23) || !isInt(s.dayEndHour, 1, 24) ||
      (s.dayStartHour as number) >= (s.dayEndHour as number))
    e.push("La plage horaire affichée est invalide.")
  return e
}
