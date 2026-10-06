// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Messages WhatsApp : reste-t-il quelque chose à envoyer ? (fonction pure)
// Partagée par le serveur (listes de rappels) et la fiche (affichage).
// ─────────────────────────────────────────────────────────────────────────────

import type { Appointment, MessageKind } from './types'

/**
 * Confirmation, rappel, « en route » : à renvoyer si le créneau a changé depuis
 * l'envoi noté. Proposition : si une autre proposition a été faite. Les autres
 * messages ne s'envoient qu'une fois.
 */
export function messagePending(
  a: Pick<Appointment, 'messagesLog' | 'startAt' | 'proposedStartAt'>,
  k: MessageKind,
): boolean {
  const log = a.messagesLog?.[k]
  if (!log) return true
  if (k === 'confirmation' || k === 'rappel' || k === 'en_route') return log.slot !== a.startAt
  if (k === 'proposition') return log.slot !== a.proposedStartAt
  return false
}
