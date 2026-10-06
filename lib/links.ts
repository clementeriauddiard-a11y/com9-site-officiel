// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Liens de contact & réseaux sociaux centralisés
// ─────────────────────────────────────────────────────────────────────────────
//
//  ✅ Modifier ici pour mettre à jour les liens partout sur le site.
//  Ne pas changer les noms des constantes — ils sont utilisés dans tous les composants.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Numéro Com'9 — appels et WhatsApp (même numéro). */
export const PHONE = {
  /** Affichage */
  display: '06 47 41 20 08',
  /** Format international pour les liens d'appel */
  e164: '+33647412008',
  /** Format WhatsApp (sans « + ») */
  wa: '33647412008',
} as const

export const LINKS = {
  /** Lien WhatsApp principal : conversation directe avec le numéro Com'9.
   *  Contrairement à l'ancien lien QR, il accepte un message pré-rempli. */
  whatsapp: `https://wa.me/${PHONE.wa}`,

  /** Appel téléphonique */
  phone: `tel:${PHONE.e164}`,

  /** Page TikTok */
  tiktok: 'https://www.tiktok.com/@utu.electronics?_r=1&_t=ZN-96CBv2eSbgs',

  /** Snap Com'9 */
  snapchat: 'https://snapchat.com/t/xG4o4KY9',
} as const

/**
 * Génère un lien WhatsApp avec message pré-rempli.
 * Sans message → ouvre directement la conversation.
 */
export function waLink(message?: string): string {
  if (!message) return LINKS.whatsapp
  return `${LINKS.whatsapp}?text=${encodeURIComponent(message)}`
}
