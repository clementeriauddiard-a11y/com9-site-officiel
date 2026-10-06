// COM'9 — Montants : stockés en centimes, affichés « 8,90 € ».

const NBSP = ' '

/** 890 → « 8,90 € » (espace insécable avant €). */
export function euros(cents: number): string {
  const neg = cents < 0
  const abs = Math.abs(Math.round(cents))
  const e = Math.floor(abs / 100)
  const c = String(abs % 100).padStart(2, '0')
  const ent = String(e).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${neg ? '-' : ''}${ent},${c}${NBSP}€`
}

/** Euros entiers de la grille → centimes. */
export const toCents = (euros: number): number => Math.round(euros * 100)

/**
 * Saisie libre « 14,90 », « 14.9 », « 15 » → centimes.
 * null si vide, NaN si invalide.
 */
export function parseEuros(input: string): number | null {
  const s = input.trim().replace(/\s|€/g, '').replace(',', '.')
  if (s === '') return null
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return Number.NaN
  return Math.round(Number(s) * 100)
}

/** Centimes → valeur de champ « 14,90 ». */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}
