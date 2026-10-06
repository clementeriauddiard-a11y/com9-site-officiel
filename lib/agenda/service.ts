// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : opérations
// ─────────────────────────────────────────────────────────────────────────────
//
//  Assemble les règles (logic.ts) et le stockage (store.ts) :
//  chaque opération vérifie, enregistre, puis trace dans l'historique.
//
// ─────────────────────────────────────────────────────────────────────────────

import { randomBytes, randomUUID } from 'crypto'
import { sourceHash } from '@/lib/security/request'
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
  CLIENT_REQUEST_LABEL,
  ORDER_DELAY_NOTE,
  partNeedsOrder,
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

async function currentConflicts(candidate: { id?: string; startAt: string; durationMin: number }) {
  const [settings, around] = await Promise.all([
    store.getSettings(),
    store.listBlockingAround(candidate.startAt),
  ])
  return findConflicts(candidate, around, settings.marginMin)
}

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

  const now = new Date().toISOString()
  const appt: Appointment = {
    id: randomUUID(),
    // 24 octets aléatoires → 32 caractères : impossible à deviner.
    trackToken: newTrackToken(),
    createdAt: now,
    updatedAt: now,
    ...c,
    proposedStartAt: null,
    proposedReason: '',
    proposalFirm: false,
    clientRequest: null,
    clientMessage: '',
    clientRequestAt: null,
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

// ─── Demande publique (formulaire du site) ───────────────────────────────────

/** Souhait du client, lisible : « mardi 13 octobre, matin ». */
export function fmtWish(day: string | null, period: Appointment['preferredPeriod']): string {
  if (!day) return 'sans souhait de date'
  const d = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(day + 'T12:00:00Z'))
  return period ? `${d}, ${PREFERRED_PERIOD_LABEL[period].toLowerCase()}` : `${d}, moment indifférent`
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
  /** Lien de suivi personnel (contient le jeton) — remis uniquement à l'auteur de la demande */
  trackPath: string
}

/**
 * Enregistre une demande du site. Ce n'est JAMAIS un rendez-vous confirmé :
 * statut « demande reçue », aucun créneau réservé, zone à vérifier par COM'9.
 */
export async function createPublicRequest(raw: unknown, ip: string): Promise<PublicRecap> {
  const parsed = parsePublicRequest(raw, todayInParis())
  if (!parsed.ok) throw new AgendaError('invalid', 'La demande est incomplète.', { errors: parsed.errors })
  const v = parsed.value

  const counts = await store.countAndLogRequest(sourceHash(ip, 'reservation'), REQUEST_LIMITS.shortWindowMin, 'reservation')
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
    trackToken: newTrackToken(),
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
    clientRequest: null,
    clientMessage: '',
    clientRequestAt: null,
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
    trackPath: `/suivi/${appt.trackToken}`,
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

/** Modification par COM'9. Sous verrou : le contrôle des chevauchements reste exact. */
export function updateAppointment(id: string, patch: Partial<ApptInput>): Promise<Appointment> {
  return store.exclusive(() => updateInner(id, patch))
}

async function updateInner(id: string, patch: Partial<ApptInput>): Promise<Appointment> {
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

/** Changement de statut par COM'9, sous verrou (voir store.exclusive). */
export function applyAction(id: string, action: ActionId, payload: ActionPayload = {}): Promise<Appointment> {
  return store.exclusive(() => actionInner(id, action, payload))
}

/** Actions qui répondent à une demande du client : la demande est alors traitée. */
const ANSWERS_CLIENT: readonly ActionId[] = ['confirmer', 'proposer', 'accepter_proposition', 'annuler', 'rouvrir']

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
    const next: Appointment = { ...a, clientRequest: null, clientMessage: '', clientRequestAt: null, updatedAt: new Date().toISOString() }
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

export type ClientAction = 'accepter' | 'refuser' | 'autre_dispo' | 'modification' | 'annulation'

export const CLIENT_ACTION_LABEL: Record<ClientAction, string> = {
  accepter: 'Accepter ce créneau',
  refuser: 'Refuser ce créneau',
  autre_dispo: 'Demander une autre disponibilité',
  modification: 'Demander un autre créneau',
  annulation: "Demander l'annulation",
}

const CLIENT_STATUS_TEXT: Record<Appointment['status'], { title: string; text: string }> = {
  demande_recue:   { title: 'Demande reçue', text: 'COM\'9 vous confirmera le créneau ou vous proposera une autre disponibilité.' },
  creneau_propose: { title: 'Un créneau vous est proposé', text: 'Vous pouvez l\'accepter, le refuser ou demander une autre disponibilité.' },
  confirme:        { title: 'Rendez-vous confirmé', text: 'COM\'9 viendra à l\'adresse indiquée lors de votre demande.' },
  en_route:        { title: 'COM\'9 est en route', text: 'Votre technicien arrive.' },
  en_cours:        { title: 'Intervention en cours', text: 'La réparation est en cours.' },
  termine:         { title: 'Intervention terminée', text: 'Merci pour votre confiance.' },
  annule:          { title: 'Rendez-vous annulé', text: 'Ce rendez-vous a été annulé.' },
}

const CLIENT_REQUEST_FOR_CLIENT: Record<NonNullable<Appointment['clientRequest']>, string> = {
  acceptation:  'Votre accord a été transmis. COM\'9 va confirmer le rendez-vous.',
  refus:        'Vous avez refusé le créneau proposé. COM\'9 vous proposera une autre disponibilité.',
  autre_dispo:  'Votre demande d\'autre disponibilité a été transmise à COM\'9.',
  modification: 'Votre demande de changement a été transmise. Le rendez-vous reste prévu tant que COM\'9 ne l\'a pas modifié.',
  annulation:   'Votre demande d\'annulation a été transmise à COM\'9.',
}

export type ClientView = {
  status: Appointment['status']
  title: string
  text: string
  model: string
  repairLabel: string
  quality: string
  repairPrice: number
  travelFee: number | null
  total: number | null
  onQuote: boolean
  zoneToConfirm: boolean
  slot: string | null
  proposal: { iso: string; label: string; reason: string; firm: boolean } | null
  wish: string | null
  partNote: string | null
  pendingRequest: string | null
  actions: ClientAction[]
}

function clientActionsFor(a: Appointment): ClientAction[] {
  switch (a.status) {
    case 'creneau_propose': return a.proposedStartAt ? ['accepter', 'refuser', 'autre_dispo'] : ['autre_dispo', 'annulation']
    case 'demande_recue':   return ['autre_dispo', 'annulation']
    case 'confirme':        return ['modification', 'annulation']
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

const capFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Ce que voit le client. Liste blanche explicite : rien d'autre ne sort. */
export function toClientView(a: Appointment): ClientView {
  const zone = a.zone ? ZONES.find((z) => z.id === a.zone) ?? null : null
  const st = CLIENT_STATUS_TEXT[a.status]
  return {
    status: a.status,
    title: st.title,
    text: st.text,
    model: a.model,
    repairLabel: repairLabel(a.repair),
    quality: a.quality,
    repairPrice: a.repairPrice,
    travelFee: a.travelFee,
    total: a.travelFee === null ? null : a.repairPrice + a.travelFee,
    onQuote: a.zone === 'devis',
    zoneToConfirm: Boolean(zone) && !a.zoneVerified,
    slot: a.startAt && ['confirme', 'en_route', 'en_cours', 'termine'].includes(a.status) ? capFirst(fmtSlot(a.startAt)) : null,
    proposal: a.status === 'creneau_propose' && a.proposedStartAt
      ? { iso: a.proposedStartAt, label: capFirst(fmtSlot(a.proposedStartAt)), reason: a.proposedReason, firm: a.proposalFirm }
      : null,
    wish: a.preferredDate ? capFirst(fmtWish(a.preferredDate, a.preferredPeriod)) : null,
    partNote: partNeedsOrder(a.partStatus) && !['termine', 'annule'].includes(a.status) ? ORDER_DELAY_NOTE : null,
    pendingRequest: a.clientRequest ? CLIENT_REQUEST_FOR_CLIENT[a.clientRequest] : null,
    actions: clientActionsFor(a),
  }
}

export async function getClientView(token: string): Promise<ClientView | null> {
  const a = await findByToken(token)
  return a ? toClientView(a) : null
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
  if (!['accepter', 'refuser', 'autre_dispo', 'modification', 'annulation'].includes(action)) {
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
    const parseWish = () => {
      const today = todayInParis()
      const parsed = parsePublicRequest({
        clientName: 'Client', clientPhone: '0600000000', address: 'adresse', model: a.model, repair: a.repair,
        quality: a.quality, zone: null, description: '', preferredDate: r.preferredDate,
        preferredPeriod: r.preferredPeriod, availabilityNote: message,
      }, today)
      if (!parsed.ok) throw new AgendaError('invalid', 'Indiquez un jour souhaité valide.', { errors: parsed.errors })
      next.preferredDate = parsed.value.preferredDate
      next.preferredPeriod = parsed.value.preferredPeriod
      next.availabilityNote = parsed.value.availabilityNote
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
        const conflicts = await currentConflicts({ id: a.id, startAt: a.proposedStartAt, durationMin: a.durationMin })
        if (conflicts.length) {
          // Le créneau a été pris depuis la proposition : rien n'est réservé,
          // la demande repasse « à traiter » pour une nouvelle proposition.
          next.status = 'demande_recue'
          clearProposal()
          withRequest('autre_dispo', 'Créneau proposé déjà pris au moment de l\'acceptation (automatique).')
          await store.updateAppt(next)
          await store.addEvent(a.id, 'statut', `Lien client : acceptation du ${slot} impossible, créneau déjà pris — à reproposer.`)
          // On valide ce retour « à traiter » puis on prévient le client (hors transaction).
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
      case 'refuser': {
        next.status = 'demande_recue'
        clearProposal()
        withRequest('refus', message)
        summary = `Lien client : refuse le créneau du ${fmtSlot(a.proposedStartAt)}.` + (message ? ` Message : ${message}` : '')
        break
      }
      case 'autre_dispo': {
        parseWish()
        next.status = 'demande_recue'
        clearProposal()
        withRequest('autre_dispo', message)
        summary = `Lien client : demande une autre disponibilité — souhait : ${fmtWish(next.preferredDate, next.preferredPeriod)}.`
        break
      }
      case 'modification': {
        parseWish()
        withRequest('modification', message)
        summary = `Lien client : demande à changer le rendez-vous — souhait : ${fmtWish(next.preferredDate, next.preferredPeriod)}. Le rendez-vous reste prévu.`
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
    throw new AgendaError('conflict', 'Ce créneau vient d\'être pris. COM\'9 va vous proposer une autre disponibilité.')
  }
  return out.view
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
