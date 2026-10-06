// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : opérations
// ─────────────────────────────────────────────────────────────────────────────
//
//  Assemble les règles (logic.ts) et le stockage (store.ts) :
//  chaque opération vérifie, enregistre, puis trace dans l'historique.
//
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, randomBytes, randomUUID } from 'crypto'
import { REPAIRS, ZONES } from '@/data/tarifs'
import {
  ACTIONS,
  findConflicts,
  gridPrice,
  parsePublicRequest,
  todayInParis,
  validateInput,
  zoneFee,
  validateSettings,
  type ActionId,
  type ApptInput,
} from './logic'
import * as store from './store'
import {
  APPT_STATUS_LABEL,
  BLOCKING_STATUSES,
  ORIGIN_LABEL,
  PART_STATUS_LABEL,
  PREFERRED_PERIOD_LABEL,
  type AgendaSettings,
  type ApptEvent,
  type Appointment,
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
  }).format(new Date(isoStr))
}

const euros = (n: number | null) => (n === null ? 'sur devis' : `${n} €`)

// ─── Conflits ────────────────────────────────────────────────────────────────

async function assertNoConflict(candidate: { id?: string; startAt: string; durationMin: number }) {
  const [settings, around] = await Promise.all([
    store.getSettings(),
    store.listBlockingAround(candidate.startAt),
  ])
  const conflicts = findConflicts(candidate, around, settings.marginMin)
  if (conflicts.length) {
    throw new AgendaError(
      'conflict',
      `Ce créneau chevauche ${conflicts.length > 1 ? 'des rendez-vous confirmés' : 'un rendez-vous confirmé'} (marge de ${settings.marginMin} min comprise).`,
      {
        conflicts: conflicts.map((c) => ({
          id: c.id,
          clientName: c.clientName,
          startAt: c.startAt as string,
          durationMin: c.durationMin,
        })),
      },
    )
  }
}

// ─── Création ────────────────────────────────────────────────────────────────

function clean(input: ApptInput) {
  return {
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone.trim(),
    address: input.address.trim(),
    model: input.model,
    repair: input.repair,
    quality: input.quality,
    description: (input.description ?? '').trim(),
    repairPrice: input.repairPrice,
    zone: input.zone ?? null,
    zoneVerified: Boolean(input.zoneVerified),
    travelFee: input.travelFee ?? null,
    startAt: input.startAt ? new Date(input.startAt).toISOString() : null,
    durationMin: input.durationMin,
    origin: input.origin,
    partStatus: input.partStatus ?? null,
    internalNotes: (input.internalNotes ?? '').trim(),
    preferredDate: input.preferredDate ?? null,
    preferredPeriod: input.preferredPeriod ?? null,
    availabilityNote: (input.availabilityNote ?? '').trim(),
  }
}

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
  if (initialStatus === 'confirme') {
    await assertNoConflict({ startAt: c.startAt as string, durationMin: c.durationMin })
  }

  const now = new Date().toISOString()
  const appt: Appointment = {
    id: randomUUID(),
    // 24 octets aléatoires → 32 caractères : impossible à deviner.
    trackToken: randomBytes(24).toString('base64url'),
    createdAt: now,
    updatedAt: now,
    ...c,
    proposedStartAt: null,
    proposedReason: '',
    proposalFirm: false,
    status: initialStatus,
  }

  await store.insertAppt(appt)
  await store.addEvent(
    appt.id,
    'creation',
    `Fiche créée (${ORIGIN_LABEL[appt.origin]}) — ${APPT_STATUS_LABEL[appt.status]}, ${fmtSlot(appt.startAt)}.`,
  )
  return appt
}

// ─── Demande publique (formulaire du site) ───────────────────────────────────

/** Souhait du client, lisible : « mardi 13 octobre, matin ». */
export function fmtWish(day: string | null, period: Appointment['preferredPeriod']): string {
  if (!day) return 'sans souhait de date'
  const d = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(day + 'T12:00:00Z'))
  return period ? `${d}, ${PREFERRED_PERIOD_LABEL[period].toLowerCase()}` : `${d}, moment indifférent`
}

/** Empreinte non réversible de la source (adresse IP) pour limiter les abus. */
export function sourceHash(ip: string): string {
  const key = process.env.ADMIN_PASSWORD || 'com9-reservation'
  return createHmac('sha256', key).update('rdv-source:' + ip).digest('hex').slice(0, 32)
}

/** Limites d'envoi, volontairement larges pour un vrai client. */
export const REQUEST_LIMITS = { shortWindowMin: 10, perSourceShort: 3, perSourceDay: 8, allDay: 150 }

export type PublicRecap = {
  model: string
  repairLabel: string
  quality: string
  repairPrice: number
  zoneLabel: string | null
  travelFee: number | null
  total: number | null
  onQuote: boolean
  wish: string
}

/**
 * Enregistre une demande du site. Ce n'est JAMAIS un rendez-vous confirmé :
 * statut « demande reçue », aucun créneau réservé, zone à vérifier par COM'9.
 */
export async function createPublicRequest(raw: unknown, ip: string): Promise<PublicRecap> {
  const parsed = parsePublicRequest(raw, todayInParis())
  if (!parsed.ok) throw new AgendaError('invalid', 'La demande est incomplète.', { errors: parsed.errors })
  const v = parsed.value

  const counts = await store.countAndLogRequest(sourceHash(ip), REQUEST_LIMITS.shortWindowMin)
  if (
    counts.sameSourceShort >= REQUEST_LIMITS.perSourceShort ||
    counts.sameSourceDay >= REQUEST_LIMITS.perSourceDay ||
    counts.allDay >= REQUEST_LIMITS.allDay
  ) {
    throw new AgendaError('rate_limited', 'Trop de demandes envoyées. Réessayez plus tard ou contactez COM\'9 sur WhatsApp.')
  }

  const price = gridPrice(v.model, v.repair, v.quality) as number // validé par parsePublicRequest
  const settings = await store.getSettings()
  const travelFee = zoneFee(v.zone) // null si sur devis ou zone inconnue

  const now = new Date().toISOString()
  const appt: Appointment = {
    id: randomUUID(),
    trackToken: randomBytes(24).toString('base64url'),
    createdAt: now,
    updatedAt: now,
    clientName: v.clientName,
    clientPhone: v.clientPhone,
    address: v.address,
    model: v.model,
    repair: v.repair,
    quality: v.quality,
    description: v.description,
    repairPrice: price,
    zone: v.zone,
    zoneVerified: false, // choisie par le client : provisoire
    travelFee,
    startAt: null, // aucun créneau tant que COM'9 n'a pas confirmé
    durationMin: settings.durations[v.repair],
    proposedStartAt: null,
    proposedReason: '',
    proposalFirm: false,
    preferredDate: v.preferredDate,
    preferredPeriod: v.preferredPeriod,
    availabilityNote: v.availabilityNote,
    origin: 'site',
    status: 'demande_recue',
    partStatus: null,
    internalNotes: '',
  }
  await store.insertAppt(appt)
  await store.addEvent(appt.id, 'creation',
    `Demande reçue depuis le site — souhait : ${fmtWish(v.preferredDate, v.preferredPeriod)}. Zone indiquée par le client, à vérifier.`)

  const zone = v.zone ? ZONES.find((z) => z.id === v.zone) ?? null : null
  return {
    model: v.model,
    repairLabel: repairLabel(v.repair),
    quality: v.quality,
    repairPrice: price,
    zoneLabel: zone ? zone.full : null,
    travelFee,
    total: travelFee === null ? null : price + travelFee,
    onQuote: v.zone === 'devis',
    wish: fmtWish(v.preferredDate, v.preferredPeriod),
  }
}

// ─── Modification ────────────────────────────────────────────────────────────

const repairLabel = (id: string) => REPAIRS.find((r) => r.id === id)?.label ?? id
const zoneLabel = (id: string | null) => (id ? ZONES.find((z) => z.id === id)?.full ?? id : 'non définie')

function describeChanges(before: Appointment, after: Appointment): string[] {
  const out: string[] = []
  const diff = (label: string, a: unknown, b: unknown, fmt: (v: never) => string = String) => {
    if (a !== b) out.push(`${label} : ${fmt(a as never)} → ${fmt(b as never)}`)
  }
  diff('Client', before.clientName, after.clientName)
  if (before.clientPhone !== after.clientPhone) out.push('Téléphone modifié')
  if (before.address !== after.address) out.push('Adresse modifiée')
  diff('Modèle', before.model, after.model)
  diff('Prestation', before.repair, after.repair, repairLabel)
  diff('Qualité', before.quality, after.quality)
  diff('Prix de réparation', before.repairPrice, after.repairPrice, (v: number) => `${v} €`)
  diff('Zone', before.zone, after.zone, zoneLabel)
  if (before.zoneVerified !== after.zoneVerified)
    out.push(after.zoneVerified ? 'Zone vérifiée par COM\'9' : 'Zone repassée à vérifier')
  diff('Déplacement', before.travelFee, after.travelFee, euros)
  diff('Créneau', before.startAt, after.startAt, fmtSlot)
  diff('Durée', before.durationMin, after.durationMin, (v: number) => `${v} min`)
  diff('Origine', before.origin, after.origin, (v: Appointment['origin']) => ORIGIN_LABEL[v])
  diff('Pièce', before.partStatus, after.partStatus,
    (v: Appointment['partStatus']) => (v ? PART_STATUS_LABEL[v] : 'non vérifiée'))
  if (before.description !== after.description) out.push('Description modifiée')
  if (before.internalNotes !== after.internalNotes) out.push('Notes internes modifiées')
  return out
}

export async function updateAppointment(id: string, patch: Partial<ApptInput>): Promise<Appointment> {
  const current = await store.getAppt(id)
  if (!current) throw new AgendaError('not_found', 'Rendez-vous introuvable.')

  const merged: ApptInput = {
    clientName: current.clientName,
    clientPhone: current.clientPhone,
    address: current.address,
    model: current.model,
    repair: current.repair,
    quality: current.quality,
    description: current.description,
    repairPrice: current.repairPrice,
    zone: current.zone,
    zoneVerified: current.zoneVerified,
    travelFee: current.travelFee,
    startAt: current.startAt,
    durationMin: current.durationMin,
    origin: current.origin,
    partStatus: current.partStatus,
    internalNotes: current.internalNotes,
    preferredDate: current.preferredDate,
    preferredPeriod: current.preferredPeriod,
    availabilityNote: current.availabilityNote,
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

  const slotChanged = after.startAt !== current.startAt || after.durationMin !== current.durationMin
  if (blocking && slotChanged) {
    await assertNoConflict({ id, startAt: after.startAt as string, durationMin: after.durationMin })
  }

  const changes = describeChanges(current, after)
  if (!changes.length) return current

  await store.updateAppt(after)
  const onlyPart = changes.length === 1 && changes[0].startsWith('Pièce')
  await store.addEvent(id, onlyPart ? 'piece' : 'modification', changes.join(' · '))
  return after
}

// ─── Actions de statut ───────────────────────────────────────────────────────

export type ActionPayload = {
  proposedStartAt?: string
  reason?: string
  firm?: boolean
}

export async function applyAction(id: string, action: ActionId, payload: ActionPayload = {}): Promise<Appointment> {
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

  const next: Appointment = { ...a, status: def.to, updatedAt: new Date().toISOString() }
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

    default:
      break
  }

  await store.updateAppt(next)
  await store.addEvent(id, kind, summary)
  return next
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
    durations: { ecran: s.durations.ecran, batterie: s.durations.batterie, vitre: s.durations.vitre },
    marginMin: s.marginMin,
    dayStartHour: s.dayStartHour,
    dayEndHour: s.dayEndHour,
  }
  await store.saveSettings(clean)
  return clean
}
