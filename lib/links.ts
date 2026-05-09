// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Liens de contact & réseaux sociaux centralisés
// ─────────────────────────────────────────────────────────────────────────────
//
//  ✅ Modifier ici pour mettre à jour les liens partout sur le site.
//  Ne pas changer les noms des constantes — ils sont utilisés dans tous les composants.
//
// ─────────────────────────────────────────────────────────────────────────────

export const LINKS = {
  /** Lien WhatsApp principal (QR Com'9) */
  whatsapp: 'https://wa.me/qr/7Z3I2DB3CWKVM1',

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
