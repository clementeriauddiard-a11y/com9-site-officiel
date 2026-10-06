// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : messages WhatsApp préremplis (envoi MANUEL par COM'9)
//
//  Rien n'est envoyé automatiquement : ces textes remplissent WhatsApp, et
//  COM'9 relit puis appuie lui-même sur « Envoyer ».
// ─────────────────────────────────────────────────────────────────────────────

import { REPAIRS } from '@/data/tarifs'
import type { Appointment } from '@/lib/agenda/types'
import { fmtSlotFull } from './time'

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const repairLabel = (id: string) => (REPAIRS.find((r) => r.id === id)?.label ?? id).toLowerCase()

export function trackUrl(origin: string, token: string): string {
  return `${origin}/suivi/${token}`
}

/** Message adapté à l'état du rendez-vous, avec le lien de suivi personnel. */
export function trackLinkMessage(a: Pick<Appointment, 'clientName' | 'model' | 'repair' | 'status' | 'startAt' | 'proposedStartAt' | 'proposedReason'>, url: string): string {
  const who = `Bonjour ${a.clientName},`
  const what = `votre ${a.model} (${repairLabel(a.repair)})`
  if (a.status === 'creneau_propose' && a.proposedStartAt) {
    return `${who} COM'9 vous propose un rendez-vous le ${lowerFirst(fmtSlotFull(a.proposedStartAt))} pour ${what}.` +
      (a.proposedReason ? ` Motif : ${a.proposedReason}.` : '') +
      ` Vous pouvez accepter, refuser ou demander une autre disponibilité ici : ${url}`
  }
  if (a.status === 'confirme' && a.startAt) {
    return `${who} votre rendez-vous COM'9 est confirmé le ${lowerFirst(fmtSlotFull(a.startAt))} pour ${what}. ` +
      `Suivi et demandes de changement : ${url}`
  }
  return `${who} voici le suivi de votre demande COM'9 pour ${what} : ${url}`
}
