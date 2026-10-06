// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Recherche de commune et zone associée (fonctions pures)
// ─────────────────────────────────────────────────────────────────────────────

import { COMMUNES, type CommuneZone } from '@/data/communes-zones'

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-'’]/g, ' ').replace(/\s+/g, ' ').trim()

const INDEX = COMMUNES.map((c) => ({
  c,
  names: [c.nom, ...(c.alias ?? [])].map(norm),
}))

export function findCommune(id: string | null | undefined): CommuneZone | null {
  if (!id) return null
  return COMMUNES.find((c) => c.id === id) ?? null
}

/** Libellé affiché : « Brunelles (Arcisses) · 28400 », « Arcisses (Margon) · 28400 » */
export function communeLabel(c: CommuneZone): string {
  const extra = c.parent ?? (c.alias?.length ? c.alias.join(', ') : '')
  return `${c.nom}${extra ? ` (${extra})` : ''} · ${c.cp.join(', ')}`
}

/** Jusqu'à `max` communes : nom commençant par la saisie d'abord, puis contenant, puis code postal. */
export function searchCommunes(input: string, max = 8): CommuneZone[] {
  const q = norm(input)
  if (q.length < 2) return []
  const digits = /^\d{2,5}$/.test(q)
  const scored: { c: CommuneZone; s: number }[] = []
  for (const { c, names } of INDEX) {
    let s = -1
    if (digits) {
      if (c.cp.some((cp) => cp.startsWith(q))) s = 3
    } else if (names.some((n) => n === q)) s = 0
    else if (names.some((n) => n.startsWith(q))) s = 1
    else if (names.some((n) => n.split(' ').some((w) => w.startsWith(q)))) s = 2
    else if (names.some((n) => n.includes(q))) s = 4
    if (s >= 0) scored.push({ c, s })
  }
  return scored
    .sort((a, b) => a.s - b.s || a.c.nom.localeCompare(b.c.nom, 'fr'))
    .slice(0, max)
    .map((x) => x.c)
}
