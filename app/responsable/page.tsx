// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Espace responsable
// L'agenda est désormais le centre opérationnel : l'espace y mène directement.
// (Accès protégé par proxy.ts.)
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'

export default function ResponsablePage() {
  redirect('/responsable/agenda')
}
