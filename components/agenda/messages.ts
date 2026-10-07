// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : messages WhatsApp préremplis (envoi MANUEL par COM'9)
//
//  Rien n'est envoyé automatiquement : ces textes remplissent WhatsApp sur le
//  numéro du client, COM'9 relit puis appuie lui-même sur « Envoyer ».
//  Les textes n'utilisent que les données du rendez-vous : aucun numéro,
//  délai, garantie ou frais qui n'existe pas dans la fiche.
// ─────────────────────────────────────────────────────────────────────────────

import { REPAIR_LABEL, findZone, isGridRepair } from '@/data/tarifs'
import { DIAGNOSTIC } from '@/config/com9'
import { euros } from '@/lib/money'
import { ORDER_DELAY_NOTE, partNeedsOrder, type Appointment, type MessageKind } from '@/lib/agenda/types'
import { addDays, fmtSlotFull, fmtTime, isoToParis, todayParis } from './time'

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const repairLabel = (id: Appointment['repair']) => (REPAIR_LABEL[id] ?? id).toLowerCase()

export function trackUrl(origin: string, token: string): string {
  return `${origin}/suivi/${token}`
}

type Msg = Pick<
  Appointment,
  | 'clientName' | 'model' | 'repair' | 'quality' | 'status' | 'startAt' | 'proposedStartAt' | 'proposedReason'
  | 'repairPriceCents' | 'travelFeeCents' | 'zone' | 'zoneVerified' | 'partStatus'
>

/** « le mardi 13 octobre à 10 h 00 » */
const slotPhrase = (iso: string) => 'le ' + lowerFirst(fmtSlotFull(iso))

/** « aujourd'hui à 10 h 00 », « demain (mardi 13 octobre) à 10 h 00 » ou « le mardi … » */
export function whenPhrase(iso: string, today = todayParis()): string {
  const day = isoToParis(iso).date
  if (day === today) return `aujourd'hui à ${fmtTime(iso)}`
  if (day === addDays(today, 1)) {
    const full = lowerFirst(fmtSlotFull(iso)) // « mardi 13 octobre à 10 h 00 »
    return `demain (${full.replace(/ à .*$/, '')}) à ${fmtTime(iso)}`
  }
  return slotPhrase(iso)
}

function amountPhrase(a: Msg): string {
  const zone = findZone(a.zone)
  const caveat = zone && !a.zoneVerified ? ' (zone à confirmer)' : ''
  if (a.repairPriceCents === null && isGridRepair(a.repair)) {
    // Demande de tarif (sur devis) : COM'9 complète le prix dans la fiche avant d'envoyer.
    const travel = a.travelFeeCents === null ? 'déplacement à confirmer' : `déplacement ${euros(a.travelFeeCents)}${caveat}`
    return `Réparation sur devis : COM'9 vous communique le prix avant l'intervention ; ${travel}.`
  }
  if (a.repairPriceCents === null) {
    // Diagnostic / petite pièce : prix connu après le diagnostic.
    const travel = a.travelFeeCents === null ? 'déplacement à confirmer' : `déplacement ${euros(a.travelFeeCents)}${caveat}`
    return `Prix de la réparation indiqué après le diagnostic sur place ; ${travel}. ` +
      `Si vous refusez la réparation : déplacement + ${euros(DIAGNOSTIC.refusCents)} de diagnostic.`
  }
  if (a.travelFeeCents === null) {
    return `Réparation ${euros(a.repairPriceCents)}, déplacement à confirmer.`
  }
  return `Réparation ${euros(a.repairPriceCents)} + déplacement ${euros(a.travelFeeCents)}${caveat} = ${euros(a.repairPriceCents + a.travelFeeCents)}.`
}

/** Texte prêt à envoyer. `url` = lien de suivi personnel du client. */
export function buildMessage(kind: MessageKind, a: Msg, url: string, today = todayParis()): string {
  const hello = `Bonjour ${a.clientName},`
  const what = `votre ${a.model} (${repairLabel(a.repair)})`
  const qual = a.quality ? `, ${a.quality}` : ''
  const part = partNeedsOrder(a.partStatus) ? ` ${ORDER_DELAY_NOTE}` : ''

  switch (kind) {
    case 'reception':
      return `${hello} COM'9 a bien reçu votre demande pour ${what}. Nous revenons vers vous pour vous confirmer le créneau ` +
        `ou vous proposer une autre disponibilité. Suivi de votre demande : ${url}`

    case 'proposition':
      return a.proposedStartAt
        ? `${hello} COM'9 vous propose un rendez-vous ${slotPhrase(a.proposedStartAt)} pour ${what}.` +
          (a.proposedReason ? ` Motif : ${a.proposedReason}.` : '') +
          ` Acceptez-le ou choisissez un autre créneau ici : ${url}`
        : `${hello} voici le suivi de votre demande COM'9 pour ${what} : ${url}`

    case 'confirmation':
      return a.startAt
        ? `${hello} votre rendez-vous COM'9 est confirmé ${slotPhrase(a.startAt)}, à l'adresse indiquée, pour ${what}${qual}. ` +
          `${amountPhrase(a)}${part} Aucun paiement à l'avance. Suivi et demandes de changement : ${url}`
        : `${hello} voici le suivi de votre rendez-vous COM'9 pour ${what} : ${url}`

    case 'rappel':
      return a.startAt
        ? `${hello} petit rappel : COM'9 intervient ${whenPhrase(a.startAt, today)} pour ${what}. ` +
          `Pour un changement, utilisez votre lien de suivi : ${url}`
        : `${hello} voici le suivi de votre rendez-vous COM'9 : ${url}`

    case 'en_route':
      return a.startAt
        ? `${hello} COM'9 est en route pour votre rendez-vous de ${fmtTime(a.startAt)}.`
        : `${hello} COM'9 est en route pour votre rendez-vous.`

    case 'suivi':
      return `${hello} merci pour votre confiance. Votre ${a.model} fonctionne-t-il bien depuis l'intervention ` +
        `(${repairLabel(a.repair)}) ? Si vous remarquez quoi que ce soit, répondez simplement à ce message.`

    case 'annulation':
      return `${hello} votre rendez-vous COM'9 ${a.startAt ? slotPhrase(a.startAt) + ' ' : ''}pour ${what} est bien annulé. ` +
        `N'hésitez pas à nous recontacter pour une nouvelle demande.`
  }
}
