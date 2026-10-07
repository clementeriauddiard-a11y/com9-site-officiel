// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : opérations
// ─────────────────────────────────────────────────────────────────────────────
//
//  Assemble les règles (logic.ts, slots.ts) et le stockage (store.ts) :
//  chaque opération vérifie, enregistre, puis trace dans l'historique.
//  Montants en centimes.
//
// ─────────────────────────────────────────────────────────────────────────────

import { randomBytes, randomUUID } from 'crypto'
import { sourceHash } from '@/lib/security/request'
import { messagePending } from './messages-state'
import { findCommune } from '@/lib/communes'
export { messagePending } from './messages-state'
import { CRENEAUX, DIAGNOSTIC, DISTANCE_MAX_KM, PAIEMENT_LABEL, PAIEMENT_MODES, type PaiementMode } from '@/config/com9'
import { REPAIR_LABEL, ZONES, findZone, isGridRepair, type RepairId, type ZoneId } from '@/data/tarifs'
import { DistanceError, distanceConfigured, routeDistance } from '@/lib/distance'
import { euros } from '@/lib/money'
import {
  ACTIONS,
  apptTotal,
  findConflicts,
  gridPriceCents,
  parsePublicRequest,
  todayInParis,
  validateInput,
  zoneFee,
  validateSettings,
  type ActionId,
  type ApptInput,
} from './logic'
import { addDays, busyFrom, freeSlots, isoToParisParts, isSlotAvailable, overlapsBlock } from './slots'
import * as store from './store'
import {
  APPT_STATUS_LABEL,
  BLOCK_REASONS,
  BLOCK_REASON_LABEL,
  BLOCKING_STATUSES,
  ORIGIN_LABEL,
  PART_STATUS_LABEL,
  CLIENT_REQUEST_LABEL,
  MESSAGE_KINDS,
  MESSAGE_LABEL,
  MESSAGES_FOR_STATUS,
  ORDER_DELAY_NOTE,
  QUOTE_SLOT_NOTE,
  SYMPTOM_LABEL,
  partNeedsOrder,
  type AgendaSettings,
  type ApptEvent,
  type Appointment,
  type Block,
  type BlockReason,
} from './types'

// ─── Erreurs typées ──────────────────────────────────────────────────────────

export type ConflictInfo = { id: string; clientName: string; startAt: string; durationMin: number }

export class AgendaError extends Error {
  constructor(
    public code: 'invalid' | 'not_found' | 'conflict' | 'transition' | 'rate_limited',
    message: string,
    public details?: { errors?: string[]; conflicts?: ConflictInfo[] },
  ) {
    super(message)
    this.name = 'AgendaError'
  }
}

// ─── Formatage (fuseau de l'atelier, quel que soit le serveur) ───────────────

const TZ = 'Europe/Paris'

export function fmtSlot(isoStr: string | null): string {
  if (!isoStr) return 'sans créneau'
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoStr)).replace(/(\d{2}):(\d{2})$/, '$1h$2') // « … à 19h00 », comme sur le site
}

const money = (c: number | null) => (c === null ? 'à définir' : euros(c))
const fmtKm = (km: number) => `${String(km).replace('.', ',')} km`
const capFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const repairLabel = (id: RepairId) => REPAIR_LABEL[id] ?? id
const zoneLabel = (id: ZoneId | null) => (id ? findZone(id)?.full ?? id : 'non définie')

// ─── Conflits (rendez-vous confirmés + plages bloquées) ──────────────────────

async function conflictsFor(candidate: { id?: string; startAt: string; durationMin: number }): Promise<ConflictInfo[]> {
  const c = new Date(candidate.startAt).getTime()
  // Requêtes l'une après l'autre : sous verrou, elles partagent une seule connexion.
  const settings = await store.getSettings()
  const around = await store.listBlockingAround(candidate.startAt)
  const blocks = await store.listBlocks(new Date(c - 86_400_000).toISOString(), new Date(c + 86_400_000).toISOString())
  const appts = findConflicts(candidate, around, settings.marginMin).map((a) => ({
    id: a.id, clientName: a.clientName, startAt: a.startAt as string, durationMin: a.durationMin,
  }))
  const blk = blocks
    .filter((b) => overlapsBlock(candidate.startAt, candidate.durationMin, b))
    .map((b) => ({
      id: `plage:${b.id}`,
      clientName: `Plage bloquée — ${BLOCK_REASON_LABEL[b.reason]}`,
      startAt: b.startAt,
      durationMin: Math.round((new Date(b.endAt).getTime() - new Date(b.startAt).getTime()) / 60_000),
    }))
  return [...appts, ...blk]
}

async function assertNoConflict(candidate: { id?: string; startAt: string; durationMin: number }) {
  const conflicts = await conflictsFor(candidate)
  if (conflicts.length) {
    const settings = await store.getSettings()
    throw new AgendaError(
      'conflict',
      conflicts.length > 1
        ? `Ce créneau chevauche ${conflicts.length} éléments du planning (marge de ${settings.marginMin} min comprise).`
        : `Ce créneau chevauche ${conflicts[0].id.startsWith('plage:') ? 'une plage bloquée' : 'un rendez-vous confirmé'} (marge de ${settings.marginMin} min comprise).`,
      { conflicts },
    )
  }
}

// ─── Distance par la route (Google Maps, si configuré) ──────────────────────

type Measured = { km: number; zone: ZoneId; precise: boolean }

/**
 * Distance atelier → adresse, sans jamais bloquer l'enregistrement :
 * service non configuré, adresse introuvable ou Google indisponible → null.
 */
async function measureSafe(address: string): Promise<Measured | null> {
  if (!distanceConfigured()) return null
  try {
    const r = await routeDistance(address)
    return { km: r.km, zone: r.zone, precise: r.precise }
  } catch (err) {
    if (!(err instanceof DistanceError)) console.error("[COM'9 Distance]", err)
    return null
  }
}

/** Adresse envoyée au calcul : complétée par la commune de la liste si elle est connue. */
function distanceQuery(address: string, communeId: string | null | undefined): string {
  const c = communeId ? findCommune(communeId) : null
  if (!c) return address
  // Adresse déjà complète (code postal présent) : inutile d'ajouter la commune.
  if (/\b\d{5}\b/.test(address)) return address
  return `${address}, ${c.cp[0] ?? ''} ${c.nom}`.replace(/\s+/g, ' ')
}

// ─── Création par COM'9 ──────────────────────────────────────────────────────

function clean(input: ApptInput) {
  return {
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone.trim(),
    email: (input.email ?? '').trim(),
    address: input.address.trim(),
    model: input.model.trim(),
    repair: input.repair,
    quality: input.quality.trim(),
    description: (input.description ?? '').trim(),
    symptom: input.symptom ?? null,
    repairPriceCents: input.repairPriceCents ?? null,
    zone: input.zone ?? null,
    zoneVerified: Boolean(input.zoneVerified),
    travelFeeCents: input.travelFeeCents ?? null,
    startAt: input.startAt ? new Date(input.startAt).toISOString() : null,
    durationMin: input.durationMin,
    origin: input.origin,
    partStatus: input.partStatus ?? null,
    internalNotes: (input.internalNotes ?? '').trim(),
    preferredDate: input.preferredDate ?? null,
    preferredPeriod: input.preferredPeriod ?? null,
    availabilityNote: (input.availabilityNote ?? '').trim(),
    communeId: input.communeId ?? null,
    communeNom: input.communeId ? findCommune(input.communeId)?.nom ?? '' : '',
  }
}

/** Champs d'une fiche neuve qui ne viennent pas de la saisie. */
function freshMeta() {
  const now = new Date().toISOString()
  return {
    id: randomUUID(),
    // 24 octets aléatoires → 32 caractères : impossible à deviner.
    trackToken: newTrackToken(),
    createdAt: now,
    updatedAt: now,
    proposedStartAt: null,
    proposedReason: '',
    proposalFirm: false,
    clientRequest: null,
    clientMessage: '',
    clientRequestAt: null,
    clientSlot: null,
    messagesLog: {},
    finalAmountCents: null,
    paymentMode: null,
    paid: false,
    paidAt: null,
  }
}

/**
 * Fiche créée par COM'9 (appel, WhatsApp, ajout manuel). Les horaires publics
 * ne s'appliquent pas : COM'9 peut fixer un rendez-vous à toute heure.
 */
export async function createAppointment(
  input: ApptInput,
  initialStatus: 'demande_recue' | 'confirme',
): Promise<Appointment> {
  const errors = validateInput(input)
  if (initialStatus === 'confirme' && !input.startAt) {
    errors.push('Un rendez-vous confirmé doit avoir une date et une heure.')
  }
  if (errors.length) throw new AgendaError('invalid', 'La fiche est incomplète.', { errors })

  const c = clean(input)
  // Mesurée à titre d'information : la zone reste celle choisie par COM'9.
  const measured = await measureSafe(distanceQuery(c.address, c.communeId))

  const appt: Appointment = {
    ...freshMeta(),
    ...c,
    distanceKm: measured ? measured.km : null,
    distanceSource: measured ? 'google' : null,
    status: initialStatus,
  }

  const save = async () => {
    if (initialStatus === 'confirme') {
      await assertNoConflict({ startAt: c.startAt as string, durationMin: c.durationMin })
    }
    await store.insertAppt(appt)
    await store.addEvent(
      appt.id,
      'creation',
      `Fiche créée (${ORIGIN_LABEL[appt.origin]}) — ${APPT_STATUS_LABEL[appt.status]}, ${fmtSlot(appt.startAt)}.`,
    )
  }
  // Un rendez-vous confirmé réserve du temps : contrôle et écriture sous verrou.
  if (initialStatus === 'confirme') await store.exclusive(save)
  else await save()
  return appt
}

// ─── Créneaux libres (site public, lien de suivi) ────────────────────────────

export type DayAvailability = { day: string; slots: string[] }

/**
 * Créneaux libres jour par jour, depuis aujourd'hui jusqu'à l'horizon.
 * `excludeId` : le rendez-vous du client lui-même ne bloque pas ses choix.
 */
export async function getAvailability(
  repair: RepairId,
  opts: { excludeId?: string; now?: Date } = {},
): Promise<DayAvailability[]> {
  const now = opts.now ?? new Date()
  const today = todayInParis(now)
  const lastDay = addDays(today, CRENEAUX.horizonJours)
  const from = new Date(now.getTime() - 86_400_000).toISOString()
  const to = new Date(now.getTime() + (CRENEAUX.horizonJours + 2) * 86_400_000).toISOString()
  const [settings, appts, blocks] = await Promise.all([
    store.getSettings(),
    store.listActiveRange(from, to),
    store.listBlocks(from, to),
  ])
  const busy = busyFrom(appts, blocks, opts.excludeId)
  const durationMin = settings.durations[repair]
  const out: DayAvailability[] = []
  for (let day = today; day <= lastDay; day = addDays(day, 1)) {
    const slots = freeSlots({ day, durationMin, busy, marginMin: settings.marginMin, now })
    if (slots.length) out.push({ day, slots })
  }
  return out
}

async function assertSlotFree(startAt: string, repair: RepairId, excludeId?: string) {
  const c = new Date(startAt).getTime()
  const from = new Date(c - 86_400_000).toISOString()
  const to = new Date(c + 86_400_000).toISOString()
  const settings = await store.getSettings()
  const appts = await store.listActiveRange(from, to)
  const blocks = await store.listBlocks(from, to)
  const ok = isSlotAvailable(startAt, {
    durationMin: settings.durations[repair],
    busy: busyFrom(appts, blocks, excludeId),
    marginMin: settings.marginMin,
  })
  if (!ok) {
    throw new AgendaError('conflict', 'Ce créneau n\'est plus disponible. Choisissez-en un autre.')
  }
  return settings
}

// ─── Demande publique (parcours du site) ─────────────────────────────────────

/** Ancien format de souhait (fiches créées avant la refonte). */
export function fmtWish(day: string | null, period: Appointment['preferredPeriod']): string {
  if (!day) return 'sans souhait de date'
  const d = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(day + 'T12:00:00Z'))
  const periods = { matin: 'matin', apres_midi: 'après-midi', fin_journee: 'fin de journée' } as const
  return period ? `${d}, ${periods[period]}` : d
}

/** Limites d'envoi, volontairement larges pour un vrai client. */
export const REQUEST_LIMITS = { shortWindowMin: 10, perSourceShort: 3, perSourceDay: 8, allDay: 150 }

export type PublicRecap = {
  model: string
  repairLabel: string
  quality: string
  symptomLabel: string | null
  /** null : diagnostic à domicile, prix après diagnostic */
  repairPriceCents: number | null
  zoneLabel: string | null
  travelFeeCents: number | null
  totalCents: number | null
  /** Créneau demandé, lisible */
  slot: string
  /** Lien de suivi personnel (contient le jeton) — remis uniquement à l'auteur de la demande */
  trackPath: string
  /** Distance par la route calculée par Google Maps (null si non calculée) */
  distanceKm: number | null
  /** true : adresse reconnue précisément, zone définitive */
  zoneVerified: boolean
  /** true : demande de tarif (« Sur devis ») — aucun prix de réparation affiché */
  quote: boolean
}

/**
 * Enregistre une demande du site. Ce n'est JAMAIS un rendez-vous confirmé :
 * statut « demande reçue » ; le créneau choisi est réservé à titre provisoire
 * (il n'est plus proposé aux autres clients) jusqu'à la réponse de COM'9.
 */
export async function createPublicRequest(raw: unknown, ip: string): Promise<PublicRecap> {
  const parsed = parsePublicRequest(raw)
  if (!parsed.ok) throw new AgendaError('invalid', 'La demande est incomplète.', { errors: parsed.errors })
  const v = parsed.value

  const counts = await store.countAndLogRequest(sourceHash(ip, 'reservation'), REQUEST_LIMITS.shortWindowMin, 'reservation')
  if (
    counts.sameSourceShort >= REQUEST_LIMITS.perSourceShort ||
    counts.sameSourceDay >= REQUEST_LIMITS.perSourceDay ||
    counts.allDay >= REQUEST_LIMITS.allDay
  ) {
    throw new AgendaError('rate_limited', 'Trop de demandes envoyées. Réessayez plus tard ou appelez COM\'9.')
  }

  // Prix : toujours recalculé depuis le catalogue (null pour un diagnostic ou une demande de tarif).
  const repairPriceCents = v.kind === 'reparation' ? gridPriceCents(v.model, v.repair, v.quality) : null
  const description = [v.reference ? `Référence : ${v.reference}` : '', v.description].filter(Boolean).join('\n')

  // Zone : distance par la route (Google) si possible, sinon commune de la
  // liste (zone indicative). La distance du navigateur est toujours ignorée.
  const commune = v.citycode ? findCommune(v.citycode) : null
  const measured = await measureSafe(v.address)
  if (measured && measured.zone === 'hors') {
    throw new AgendaError('invalid',
      `COM'9 intervient jusqu'à ${DISTANCE_MAX_KM} km de Nogent-le-Rotrou. Votre adresse est à ${fmtKm(measured.km)} par la route.`)
  }
  const zone: ZoneId | null = measured ? measured.zone : commune ? commune.zone : null
  const zoneVerified = measured ? measured.precise : false
  const distanceSource: Appointment['distanceSource'] = measured ? 'google' : commune ? 'liste' : null
  const travelFeeCents = zoneFee(zone)

  const appt = await store.exclusive(async () => {
    const settings = await assertSlotFree(v.startAt, v.repair)
    const a: Appointment = {
      ...freshMeta(),
      clientName: v.clientName,
      clientPhone: v.clientPhone,
      email: v.email,
      address: v.address,
      model: v.model,
      repair: v.repair,
      quality: v.quality,
      description,
      symptom: v.symptom,
      repairPriceCents,
      zone,
      zoneVerified,
      travelFeeCents,
      startAt: v.startAt, // créneau DEMANDÉ : à confirmer par COM'9
      durationMin: settings.durations[v.repair],
      preferredDate: isoToParisParts(v.startAt).day,
      preferredPeriod: null,
      availabilityNote: '',
      communeId: commune ? commune.id : null,
      communeNom: commune ? commune.nom : '',
      distanceKm: measured ? measured.km : null,
      distanceSource,
      origin: 'site',
      status: 'demande_recue',
      partStatus: null,
      internalNotes: '',
    }
    await store.insertAppt(a)
    await store.addEvent(a.id, 'creation',
      `Demande reçue depuis le site — créneau demandé : ${fmtSlot(v.startAt)}. ` +
      (v.kind === 'devis' ? 'Demande de tarif (sur devis) : prix à communiquer au client. ' : '') +
      (v.symptom ? `Problème : ${SYMPTOM_LABEL[v.symptom]}. ` : '') +
      (measured
        ? `Distance calculée par Google Maps : ${fmtKm(measured.km)} par la route` +
          (measured.precise ? '.' : ' (adresse reconnue approximativement : zone à vérifier).')
        : commune ? `Zone indicative d'après la commune (${commune.nom}), à vérifier.`
        : 'Distance non calculée : zone à vérifier.'))
    return a
  })

  const zoneDef = findZone(zone)
  return {
    model: appt.model,
    repairLabel: repairLabel(appt.repair),
    quality: appt.quality,
    symptomLabel: appt.symptom ? SYMPTOM_LABEL[appt.symptom] : null,
    repairPriceCents,
    zoneLabel: zoneDef ? zoneDef.full : null,
    travelFeeCents,
    totalCents: apptTotal(appt),
    slot: capFirst(fmtSlot(appt.startAt)),
    trackPath: `/suivi/${appt.trackToken}`,
    distanceKm: appt.distanceKm,
    zoneVerified,
    quote: v.kind === 'devis',
  }
}

// ─── Modification ────────────────────────────────────────────────────────────

function describeChanges(before: Appointment, after: Appointment): string[] {
  const out: string[] = []
  const diff = (label: string, a: unknown, b: unknown, fmt: (v: never) => string = String) => {
    if (a !== b) out.push(`${label} : ${fmt(a as never)} → ${fmt(b as never)}`)
  }
  diff('Client', before.clientName, after.clientName)
  if (before.clientPhone !== after.clientPhone) out.push('Téléphone modifié')
  if ((before.email ?? '') !== (after.email ?? '')) out.push('E-mail modifié')
  if (before.address !== after.address) {
    out.push('Adresse modifiée' + (after.distanceKm !== null && after.distanceSource === 'google'
      ? ` (${fmtKm(after.distanceKm)} par la route)` : ''))
  }
  diff('Modèle', before.model, after.model)
  diff('Prestation', before.repair, after.repair, repairLabel)
  diff('Qualité', before.quality, after.quality)
  diff('Prix de réparation', before.repairPriceCents, after.repairPriceCents, money)
  diff('Zone', before.zone, after.zone, zoneLabel)
  if ((before.communeId ?? null) !== (after.communeId ?? null))
    out.push(`Commune : ${before.communeNom || 'non précisée'} → ${after.communeNom || 'non précisée'}`)
  if (before.zoneVerified !== after.zoneVerified)
    out.push(after.zoneVerified ? 'Zone vérifiée par COM\'9' : 'Zone repassée à vérifier')
  diff('Déplacement', before.travelFeeCents, after.travelFeeCents, money)
  diff('Créneau', before.startAt, after.startAt, fmtSlot)
  diff('Durée', before.durationMin, after.durationMin, (v: number) => `${v} min`)
  diff('Origine', before.origin, after.origin, (v: Appointment['origin']) => ORIGIN_LABEL[v])
  diff('Pièce', before.partStatus, after.partStatus,
    (v: Appointment['partStatus']) => (v ? PART_STATUS_LABEL[v] : 'non vérifiée'))
  if (before.description !== after.description) out.push('Description modifiée')
  if (before.internalNotes !== after.internalNotes) out.push('Notes internes modifiées')
  return out
}

/** Modification par COM'9. Sous verrou : le contrôle des chevauchements reste exact. */
export async function updateAppointment(id: string, patch: Partial<ApptInput>): Promise<Appointment> {
  // Nouvelle adresse : distance remesurée AVANT le verrou (appel réseau).
  const newAddress = typeof patch.address === 'string' ? patch.address.trim() : null
  let measured: Measured | null = null
  if (newAddress) {
    const current = await store.getAppt(id)
    if (current && current.address !== newAddress) {
      measured = await measureSafe(distanceQuery(newAddress, patch.communeId !== undefined ? patch.communeId : current.communeId))
    }
  }
  return store.exclusive(() => updateInner(id, patch, measured))
}

async function updateInner(id: string, patch: Partial<ApptInput>, measured: Measured | null): Promise<Appointment> {
  const current = await store.getAppt(id)
  if (!current) throw new AgendaError('not_found', 'Rendez-vous introuvable.')

  const merged: ApptInput = {
    clientName: current.clientName,
    clientPhone: current.clientPhone,
    email: current.email,
    address: current.address,
    model: current.model,
    repair: current.repair,
    quality: current.quality,
    description: current.description,
    symptom: current.symptom,
    repairPriceCents: current.repairPriceCents,
    zone: current.zone,
    zoneVerified: current.zoneVerified,
    travelFeeCents: current.travelFeeCents,
    startAt: current.startAt,
    durationMin: current.durationMin,
    origin: current.origin,
    partStatus: current.partStatus,
    internalNotes: current.internalNotes,
    preferredDate: current.preferredDate,
    preferredPeriod: current.preferredPeriod,
    availabilityNote: current.availabilityNote,
    communeId: current.communeId,
    ...patch,
  }

  const errors = validateInput(merged)
  const blocking = BLOCKING_STATUSES.includes(current.status)
  if (blocking && !merged.startAt) {
    errors.push('Un rendez-vous confirmé doit garder une date et une heure.')
  }
  if (errors.length) throw new AgendaError('invalid', 'La modification est invalide.', { errors })

  const c = clean(merged)
  const after: Appointment = { ...current, ...c, updatedAt: new Date().toISOString() }
  if (after.address !== current.address) {
    after.distanceKm = measured ? measured.km : null
    after.distanceSource = measured ? 'google' : null
  }

  const slotChanged = after.startAt !== current.startAt || after.durationMin !== current.durationMin
  if (blocking && slotChanged) {
    await assertNoConflict({ id, startAt: after.startAt as string, durationMin: after.durationMin })
  }
  // Le créneau choisi par le client a été appliqué à la main : demande traitée.
  if (slotChanged && current.clientSlot && after.startAt === current.clientSlot) {
    after.clientSlot = null
    after.clientRequest = null
    after.clientMessage = ''
    after.clientRequestAt = null
  }

  const changes = describeChanges(current, after)
  if (!changes.length) return current

  await store.updateAppt(after)
  const onlyPart = changes.length === 1 && changes[0].startsWith('Pièce')
  await store.addEvent(id, onlyPart ? 'piece' : 'modification', changes.join(' · '))
  return after
}

// ─── Fin d'intervention et paiement ──────────────────────────────────────────

export type PaymentPayload = {
  finalAmountCents?: unknown
  paymentMode?: unknown
  paid?: unknown
}

function parsePayment(p: PaymentPayload, required: boolean) {
  const errors: string[] = []
  const amount = p.finalAmountCents
  if (amount === undefined || amount === null) {
    if (required) errors.push('Indiquez le montant final.')
  } else if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 || amount > 1_000_000) {
    errors.push('Le montant final est invalide.')
  }
  const mode = p.paymentMode
  if (mode !== undefined && mode !== null && !(PAIEMENT_MODES as readonly unknown[]).includes(mode)) {
    errors.push('Le mode de paiement est invalide.')
  }
  const paid = p.paid === true
  if (paid && (mode === undefined || mode === null)) errors.push('Indiquez le mode de paiement.')
  if (errors.length) throw new AgendaError('invalid', 'Paiement incomplet.', { errors })
  return {
    finalAmountCents: (amount as number | null | undefined) ?? null,
    paymentMode: (mode as PaiementMode | null | undefined) ?? null,
    paid,
  }
}

function paymentSummary(a: Pick<Appointment, 'finalAmountCents' | 'paymentMode' | 'paid'>): string {
  return `Montant final ${money(a.finalAmountCents)}` +
    (a.paymentMode ? ` · ${PAIEMENT_LABEL[a.paymentMode]}` : '') +
    (a.paid ? ' · payé' : ' · non payé')
}

/** Corrige le paiement d'une intervention terminée (ex. virement reçu plus tard). */
export function recordPayment(id: string, payload: PaymentPayload): Promise<Appointment> {
  return store.exclusive(async () => {
    const a = await store.getAppt(id)
    if (!a) throw new AgendaError('not_found', 'Rendez-vous introuvable.')
    if (a.status !== 'termine') throw new AgendaError('transition', 'Terminez d\'abord l\'intervention.')
    const p = parsePayment(payload, true)
    const now = new Date().toISOString()
    const next: Appointment = { ...a, ...p, paidAt: p.paid ? (a.paid ? a.paidAt : now) : null, updatedAt: now }
    await store.updateAppt(next)
    await store.addEvent(id, 'paiement', `Paiement mis à jour — ${paymentSummary(next)}`)
    return next
  })
}

// ─── Actions de statut ───────────────────────────────────────────────────────

export type ActionPayload = {
  proposedStartAt?: string
  reason?: string
  firm?: boolean
} & PaymentPayload

/** Changement de statut par COM'9, sous verrou (voir store.exclusive). */
export function applyAction(id: string, action: ActionId, payload: ActionPayload = {}): Promise<Appointment> {
  return store.exclusive(() => actionInner(id, action, payload))
}

/** Actions qui répondent à une demande du client : la demande est alors traitée. */
const ANSWERS_CLIENT: readonly ActionId[] = ['confirmer', 'proposer', 'accepter_proposition', 'valider_choix_client', 'annuler', 'rouvrir']

async function actionInner(id: string, action: ActionId, payload: ActionPayload): Promise<Appointment> {
  const def = ACTIONS[action]
  if (!def) throw new AgendaError('invalid', 'Action inconnue.')

  const a = await store.getAppt(id)
  if (!a) throw new AgendaError('not_found', 'Rendez-vous introuvable.')

  if (!def.from.includes(a.status)) {
    throw new AgendaError(
      'transition',
      `Impossible de passer de « ${APPT_STATUS_LABEL[a.status]} » à « ${APPT_STATUS_LABEL[def.to]} ».`,
    )
  }

  const now = new Date().toISOString()
  const next: Appointment = { ...a, status: def.to, updatedAt: now }
  let summary = `${APPT_STATUS_LABEL[a.status]} → ${APPT_STATUS_LABEL[def.to]}`
  let kind: ApptEvent['kind'] = 'statut'

  switch (action) {
    case 'confirmer': {
      if (!a.startAt) throw new AgendaError('invalid', 'Fixez une date et une heure avant de confirmer.')
      await assertNoConflict({ id, startAt: a.startAt, durationMin: a.durationMin })
      summary += ` — ${fmtSlot(a.startAt)}`
      break
    }

    case 'proposer': {
      const p = payload.proposedStartAt
      if (!p || Number.isNaN(new Date(p).getTime())) {
        throw new AgendaError('invalid', 'Indiquez la nouvelle date et la nouvelle heure proposées.')
      }
      const reason = (payload.reason ?? '').trim().slice(0, 500)
      next.proposedStartAt = new Date(p).toISOString()
      next.proposedReason = reason
      next.proposalFirm = Boolean(payload.firm)
      next.clientSlot = null
      kind = 'proposition'
      summary =
        `Nouveau créneau proposé : ${fmtSlot(next.proposedStartAt)}` +
        (next.proposalFirm ? ' (proposition ferme)' : '') +
        (reason ? ` — motif : ${reason}` : '')
      break
    }

    case 'accepter_proposition': {
      if (!a.proposedStartAt) throw new AgendaError('invalid', "Aucun créneau n'a été proposé.")
      await assertNoConflict({ id, startAt: a.proposedStartAt, durationMin: a.durationMin })
      next.startAt = a.proposedStartAt
      next.proposedStartAt = null
      next.proposedReason = ''
      next.proposalFirm = false
      summary = `Proposition acceptée — confirmé pour ${fmtSlot(next.startAt)}`
      break
    }

    case 'valider_choix_client': {
      if (!a.clientSlot) throw new AgendaError('invalid', "Le client n'a pas choisi d'autre créneau.")
      await assertNoConflict({ id, startAt: a.clientSlot, durationMin: a.durationMin })
      next.startAt = a.clientSlot
      next.clientSlot = null
      summary = `Créneau choisi par le client validé — confirmé pour ${fmtSlot(next.startAt)}`
      break
    }

    case 'terminer': {
      const p = parsePayment(payload, true)
      next.finalAmountCents = p.finalAmountCents
      next.paymentMode = p.paymentMode
      next.paid = p.paid
      next.paidAt = p.paid ? now : null
      kind = 'paiement'
      summary = `Intervention terminée — ${paymentSummary(next)}`
      break
    }

    case 'annuler':
      next.clientSlot = null
      break

    default:
      break
  }

  if (ANSWERS_CLIENT.includes(action) && a.clientRequest) {
    next.clientRequest = null
    next.clientMessage = ''
    next.clientRequestAt = null
  }

  await store.updateAppt(next)
  await store.addEvent(id, kind, summary)
  return next
}

/** COM'9 indique avoir traité la demande du client (sans changer le rendez-vous). */
export function markClientRequestHandled(id: string): Promise<Appointment> {
  return store.exclusive(async () => {
    const a = await store.getAppt(id)
    if (!a) throw new AgendaError('not_found', 'Rendez-vous introuvable.')
    if (!a.clientRequest) return a
    const next: Appointment = {
      ...a, clientRequest: null, clientMessage: '', clientRequestAt: null, clientSlot: null,
      updatedAt: new Date().toISOString(),
    }
    await store.updateAppt(next)
    await store.addEvent(id, 'modification', `Demande du client traitée : ${CLIENT_REQUEST_LABEL[a.clientRequest]}`)
    return next
  })
}

/** Nouveau lien de suivi : l'ancien cesse immédiatement de fonctionner. */
export async function regenerateTrackLink(id: string): Promise<Appointment> {
  const a = await store.getAppt(id)
  if (!a) throw new AgendaError('not_found', 'Rendez-vous introuvable.')
  const token = newTrackToken()
  await store.setTrackToken(id, token)
  await store.addEvent(id, 'modification', 'Nouveau lien de suivi généré — l’ancien lien ne fonctionne plus.')
  return { ...a, trackToken: token }
}

// ─── Plages bloquées ─────────────────────────────────────────────────────────

export async function createBlock(raw: unknown): Promise<Block> {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const errors: string[] = []
  const s = typeof r.startAt === 'string' ? new Date(r.startAt) : null
  const e = typeof r.endAt === 'string' ? new Date(r.endAt) : null
  if (!s || Number.isNaN(s.getTime())) errors.push('Le début est invalide.')
  if (!e || Number.isNaN(e.getTime())) errors.push('La fin est invalide.')
  if (s && e && e.getTime() <= s.getTime()) errors.push('La fin doit être après le début.')
  if (s && e && e.getTime() - s.getTime() > 31 * 86_400_000) errors.push('Une plage ne peut pas dépasser 31 jours.')
  if (!(BLOCK_REASONS as readonly unknown[]).includes(r.reason)) errors.push('Choisissez un motif.')
  const note = typeof r.note === 'string' ? r.note.trim().slice(0, 300) : ''
  if (errors.length) throw new AgendaError('invalid', 'Plage invalide.', { errors })
  const b: Block = {
    id: randomUUID(),
    startAt: (s as Date).toISOString(),
    endAt: (e as Date).toISOString(),
    reason: r.reason as BlockReason,
    note,
  }
  await store.insertBlock(b)
  return b
}

export async function removeBlock(id: string): Promise<void> {
  if (typeof id !== 'string' || id.length > 64) throw new AgendaError('not_found', 'Plage introuvable.')
  const ok = await store.deleteBlock(id)
  if (!ok) throw new AgendaError('not_found', 'Plage introuvable.')
}

export const listBlocks = store.listBlocks

// ─── Lien de suivi client (public) ───────────────────────────────────────────
//
//  Le jeton (32 caractères aléatoires, 192 bits) est la seule clé d'accès :
//  il ne donne accès qu'à SON rendez-vous, et la vue publique ne contient ni
//  coordonnées, ni adresse, ni description, ni notes internes.

export function newTrackToken(): string {
  return randomBytes(24).toString('base64url')
}

const TOKEN_RE = /^[A-Za-z0-9_-]{32}$/
/** Un suivi terminé ou annulé reste consultable 30 jours, puis le lien expire. */
const LINK_TTL_AFTER_END_MS = 30 * 86_400_000

export type ClientAction = 'accepter' | 'autre_creneau' | 'annulation'

export const CLIENT_ACTION_LABEL: Record<ClientAction, string> = {
  accepter: 'Accepter',
  autre_creneau: 'Choisir un autre créneau',
  annulation: "Demander l'annulation",
}

const CLIENT_STATUS_TEXT: Record<Appointment['status'], { title: string; text: string }> = {
  demande_recue:   { title: 'Demande reçue', text: 'COM\'9 va confirmer votre créneau ou vous proposer une autre disponibilité.' },
  creneau_propose: { title: 'COM\'9 vous propose un nouveau rendez-vous', text: 'Acceptez-le ou choisissez un autre créneau.' },
  confirme:        { title: 'Rendez-vous confirmé', text: 'COM\'9 viendra à l\'adresse indiquée lors de votre demande.' },
  en_route:        { title: 'COM\'9 est en route', text: 'Votre technicien arrive.' },
  en_cours:        { title: 'Intervention en cours', text: 'La réparation est en cours.' },
  termine:         { title: 'Intervention terminée', text: 'Merci pour votre confiance.' },
  annule:          { title: 'Rendez-vous annulé', text: 'Ce rendez-vous a été annulé.' },
}

const CLIENT_REQUEST_FOR_CLIENT: Record<NonNullable<Appointment['clientRequest']>, string> = {
  acceptation:  'Votre accord a été transmis. COM\'9 va confirmer le rendez-vous.',
  refus:        'Vous avez refusé le créneau proposé. COM\'9 vous proposera une autre disponibilité.',
  autre_dispo:  'Votre nouveau créneau a été transmis à COM\'9, qui va le confirmer.',
  modification: 'Votre demande de changement a été transmise. Le rendez-vous reste prévu tant que COM\'9 ne l\'a pas modifié.',
  annulation:   'Votre demande d\'annulation a été transmise à COM\'9.',
}

/** Règle affichée pour un diagnostic à domicile. */
export const DIAGNOSTIC_RULE =
  `Si vous acceptez la réparation, vous ne payez que la réparation et le déplacement. ` +
  `Si vous la refusez après le diagnostic, vous payez le déplacement + ${euros(DIAGNOSTIC.refusCents)} de diagnostic.`

export type ClientView = {
  status: Appointment['status']
  title: string
  text: string
  repair: RepairId
  model: string
  repairLabel: string
  quality: string
  symptomLabel: string | null
  repairPriceCents: number | null
  travelFeeCents: number | null
  totalCents: number | null
  outOfArea: boolean
  zoneToConfirm: boolean
  diagnosticRule: string | null
  /** Écran / batterie / vitre sans prix fixé : « Sur devis » */
  quote: boolean
  /** Rendez-vous confirmé (lisible) */
  slot: string | null
  /** Créneau demandé, pas encore confirmé (lisible) */
  requestedSlot: string | null
  /** Créneau choisi par le client pour remplacer un rendez-vous confirmé */
  clientSlot: string | null
  proposal: { iso: string; label: string; reason: string; firm: boolean } | null
  partNote: string | null
  pendingRequest: string | null
  actions: ClientAction[]
}

function clientActionsFor(a: Appointment): ClientAction[] {
  switch (a.status) {
    case 'creneau_propose': return a.proposedStartAt ? ['accepter', 'autre_creneau', 'annulation'] : ['autre_creneau', 'annulation']
    case 'demande_recue':   return ['autre_creneau', 'annulation']
    case 'confirme':        return ['autre_creneau', 'annulation']
    default:                return []
  }
}

async function findByToken(token: string): Promise<Appointment | null> {
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) return null
  const a = await store.getApptByToken(token)
  if (!a) return null
  if ((a.status === 'termine' || a.status === 'annule') &&
      Date.now() - new Date(a.updatedAt).getTime() > LINK_TTL_AFTER_END_MS) return null
  return a
}

/** Ce que voit le client. Liste blanche explicite : rien d'autre ne sort. */
export function toClientView(a: Appointment): ClientView {
  const zone = findZone(a.zone)
  const quote = isGridRepair(a.repair) && a.repairPriceCents === null
  const st = quote && a.status === 'demande_recue'
    ? { title: 'Demande de tarif reçue', text: QUOTE_SLOT_NOTE }
    : CLIENT_STATUS_TEXT[a.status]
  const confirmed = ['confirme', 'en_route', 'en_cours', 'termine'].includes(a.status)
  return {
    status: a.status,
    title: st.title,
    text: st.text,
    repair: a.repair,
    model: a.model,
    repairLabel: repairLabel(a.repair),
    quality: a.quality,
    symptomLabel: a.symptom ? SYMPTOM_LABEL[a.symptom] : null,
    repairPriceCents: a.repairPriceCents,
    travelFeeCents: a.travelFeeCents,
    totalCents: apptTotal(a),
    outOfArea: a.zone === 'hors',
    zoneToConfirm: Boolean(zone) && !a.zoneVerified,
    diagnosticRule: a.repair === 'diagnostic' ? DIAGNOSTIC_RULE : null,
    quote,
    slot: a.startAt && confirmed ? capFirst(fmtSlot(a.startAt)) : null,
    requestedSlot: a.startAt && a.status === 'demande_recue' ? capFirst(fmtSlot(a.startAt)) : null,
    clientSlot: a.clientSlot && a.status === 'confirme' ? capFirst(fmtSlot(a.clientSlot)) : null,
    proposal: a.status === 'creneau_propose' && a.proposedStartAt
      ? { iso: a.proposedStartAt, label: capFirst(fmtSlot(a.proposedStartAt)), reason: a.proposedReason, firm: a.proposalFirm }
      : null,
    partNote: partNeedsOrder(a.partStatus) && !['termine', 'annule'].includes(a.status) ? ORDER_DELAY_NOTE : null,
    pendingRequest: a.clientRequest ? CLIENT_REQUEST_FOR_CLIENT[a.clientRequest] : null,
    actions: clientActionsFor(a),
  }
}

export async function getClientView(token: string): Promise<ClientView | null> {
  const a = await findByToken(token)
  return a ? toClientView(a) : null
}

/** Créneaux libres proposés au client depuis son lien. */
export async function getClientAvailability(token: string): Promise<DayAvailability[] | null> {
  const a = await findByToken(token)
  if (!a || !clientActionsFor(a).includes('autre_creneau')) return null
  return getAvailability(a.repair, { excludeId: a.id })
}

export const CLIENT_ACTION_LIMITS = { shortWindowMin: 10, perSourceShort: 10 }

/**
 * Réponse du client depuis son lien. Toute l'opération se fait sous verrou :
 * une acceptation ne peut jamais créer de chevauchement, même si deux clients
 * acceptent au même instant.
 */
export async function clientRespond(token: string, raw: unknown, ip: string): Promise<ClientView> {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const action = r.action as ClientAction
  if (!['accepter', 'autre_creneau', 'annulation'].includes(action)) {
    throw new AgendaError('invalid', 'Action inconnue.')
  }
  const message = typeof r.message === 'string' ? r.message.trim().slice(0, 300) : ''

  const counts = await store.countAndLogRequest(sourceHash(ip, 'suivi'), CLIENT_ACTION_LIMITS.shortWindowMin, 'suivi')
  if (counts.sameSourceShort >= CLIENT_ACTION_LIMITS.perSourceShort) {
    throw new AgendaError('rate_limited', 'Trop de demandes envoyées. Réessayez dans quelques minutes.')
  }

  const out = await store.exclusive(async (): Promise<{ view: ClientView; taken: boolean }> => {
    const a = await findByToken(token)
    if (!a) throw new AgendaError('not_found', 'Ce lien de suivi n\'est pas valide ou a expiré.')
    if (!clientActionsFor(a).includes(action)) {
      throw new AgendaError('transition', 'Cette action n\'est plus possible pour ce rendez-vous. Rechargez la page.')
    }

    const now = new Date().toISOString()
    const next: Appointment = { ...a, updatedAt: now }
    const withRequest = (req: NonNullable<Appointment['clientRequest']>, msg: string) => {
      next.clientRequest = req
      next.clientMessage = msg
      next.clientRequestAt = now
    }
    const clearProposal = () => {
      next.proposedStartAt = null
      next.proposedReason = ''
      next.proposalFirm = false
    }
    let summary = ''

    switch (action) {
      case 'accepter': {
        // Le client doit accepter exactement la proposition qu'il a vue.
        if (!a.proposedStartAt || r.expectedProposal !== a.proposedStartAt) {
          throw new AgendaError('transition', 'La proposition a changé entre-temps. Rechargez la page.')
        }
        const slot = fmtSlot(a.proposedStartAt)
        if (!a.proposalFirm) {
          withRequest('acceptation', message)
          summary = `Lien client : accepte le créneau indicatif du ${slot} — à confirmer par COM'9.`
          break
        }
        const conflicts = await conflictsFor({ id: a.id, startAt: a.proposedStartAt, durationMin: a.durationMin })
        if (conflicts.length) {
          // Le créneau a été pris depuis la proposition : rien n'est réservé,
          // la demande repasse « à traiter » pour une nouvelle proposition.
          next.status = 'demande_recue'
          clearProposal()
          withRequest('autre_dispo', 'Créneau proposé déjà pris au moment de l\'acceptation (automatique).')
          await store.updateAppt(next)
          await store.addEvent(a.id, 'statut', `Lien client : acceptation du ${slot} impossible, créneau déjà pris — à reproposer.`)
          return { view: toClientView(next), taken: true }
        }
        next.status = 'confirme'
        next.startAt = a.proposedStartAt
        clearProposal()
        next.clientRequest = null
        next.clientMessage = ''
        next.clientRequestAt = null
        summary = `Lien client : proposition acceptée — confirmé pour ${slot}.` + (message ? ` Message : ${message}` : '')
        break
      }
      case 'autre_creneau': {
        const startRaw = typeof r.startAt === 'string' ? r.startAt : ''
        const ms = new Date(startRaw).getTime()
        if (!startRaw || Number.isNaN(ms)) throw new AgendaError('invalid', 'Choisissez un créneau.')
        const startAt = new Date(ms).toISOString()
        await assertSlotFree(startAt, a.repair, a.id)
        if (a.status === 'confirme') {
          // Un rendez-vous confirmé ne bouge pas tout seul : COM'9 valide.
          next.clientSlot = startAt
          withRequest('modification', message)
          summary = `Lien client : souhaite déplacer le rendez-vous au ${fmtSlot(startAt)} — à valider. Le rendez-vous reste prévu.`
        } else {
          next.status = 'demande_recue'
          next.startAt = startAt
          next.preferredDate = isoToParisParts(startAt).day
          next.preferredPeriod = null
          clearProposal()
          withRequest('autre_dispo', message)
          summary = `Lien client : choisit un autre créneau — ${fmtSlot(startAt)}.` + (message ? ` Message : ${message}` : '')
        }
        break
      }
      case 'annulation': {
        withRequest('annulation', message)
        summary = 'Lien client : demande l\'annulation.' + (message ? ` Message : ${message}` : '')
        break
      }
    }

    await store.updateAppt(next)
    await store.addEvent(a.id, 'statut', summary)
    return { view: toClientView(next), taken: false }
  })
  if (out.taken) {
    throw new AgendaError('conflict', 'Ce créneau vient d\'être pris. Choisissez un autre créneau.')
  }
  return out.view
}

// ─── Messages WhatsApp (envoi manuel) ────────────────────────────────────────

/**
 * COM'9 indique avoir envoyé un message depuis son WhatsApp. Le site n'envoie
 * rien lui-même : il garde seulement la trace, pour savoir ce qui reste à faire.
 */
export async function noteMessageSent(id: string, kind: unknown): Promise<Appointment> {
  if (typeof kind !== 'string' || !(MESSAGE_KINDS as readonly string[]).includes(kind)) {
    throw new AgendaError('invalid', 'Type de message inconnu.')
  }
  const k = kind as (typeof MESSAGE_KINDS)[number]
  return store.exclusive(async () => {
    const a = await store.getAppt(id)
    if (!a) throw new AgendaError('not_found', 'Rendez-vous introuvable.')
    if (!MESSAGES_FOR_STATUS[a.status].includes(k)) {
      throw new AgendaError('transition', `Le message « ${MESSAGE_LABEL[k]} » ne correspond pas à l'état du rendez-vous.`)
    }
    const now = new Date().toISOString()
    const slot = k === 'proposition' ? a.proposedStartAt : a.startAt
    const next: Appointment = { ...a, messagesLog: { ...a.messagesLog, [k]: { at: now, slot } }, updatedAt: now }
    await store.updateAppt(next)
    await store.addEvent(id, 'message', `WhatsApp « ${MESSAGE_LABEL[k]} » noté comme envoyé (envoi manuel).`)
    return next
  })
}

/**
 * Ce qu'il reste à envoyer :
 *  • rappels — rendez-vous confirmés d'ici la fin de demain (heure de Paris) ;
 *  • suivis — interventions terminées depuis moins de 7 jours.
 */
export async function getFollowups(now = new Date()) {
  const today = todayInParis(now)
  const endTomorrow = new Date(new Date(`${today}T12:00:00Z`).getTime() + 2 * 86_400_000)
  const parisMidnight = (day: string) => {
    const guess = new Date(`${day}T00:00:00+01:00`)
    const h = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(guess)
    return h === '00' ? guess : new Date(`${day}T00:00:00+02:00`)
  }
  const dayAfterTomorrow = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(endTomorrow)
  const upcoming = await store.listRange(now.toISOString(), parisMidnight(dayAfterTomorrow).toISOString())
  const recent = await store.listRange(new Date(now.getTime() - 7 * 86_400_000).toISOString(), now.toISOString())
  return {
    reminders: upcoming.filter((a) => a.status === 'confirme' && a.startAt && messagePending(a, 'rappel')),
    aftercare: recent.filter((a) => a.status === 'termine' && messagePending(a, 'suivi')),
  }
}

// ─── Lecture ─────────────────────────────────────────────────────────────────

export async function getDetail(id: string) {
  const appt = await store.getAppt(id)
  if (!appt) throw new AgendaError('not_found', 'Rendez-vous introuvable.')
  const events = await store.listEvents(id)
  return { appt, events }
}

export const listRange = store.listRange
export const listPending = store.listPending

// ─── Réglages ────────────────────────────────────────────────────────────────

export const getSettings = store.getSettings

export async function saveSettings(s: AgendaSettings): Promise<AgendaSettings> {
  const errors = validateSettings(s)
  if (errors.length) throw new AgendaError('invalid', 'Réglages invalides.', { errors })
  const clean: AgendaSettings = {
    durations: {
      ecran: s.durations.ecran,
      batterie: s.durations.batterie,
      vitre: s.durations.vitre,
      module: s.durations.module,
      diagnostic: s.durations.diagnostic,
    },
    marginMin: s.marginMin,
    dayStartHour: s.dayStartHour,
    dayEndHour: s.dayEndHour,
  }
  await store.saveSettings(clean)
  return clean
}

export { ZONES }
