// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Logo officiel (mascotte bleue + « Com'9 »)
// Fichiers allégés générés depuis public/logo.png (l'original reste intact).
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @next/next/no-img-element */

export default function Logo({ size = 44, className = '', priority = false, decorative = false }: {
  /** taille affichée en px (le logo est carré) */
  size?: number
  className?: string
  /** à charger tout de suite (en haut de page) */
  priority?: boolean
  /** true si un texte « COM'9 » est déjà lu à côté */
  decorative?: boolean
}) {
  const src = size <= 48 ? '/logo-com9-96.webp' : size <= 96 ? '/logo-com9-192.webp' : '/logo-com9-512.webp'
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={decorative ? '' : 'COM’9 — la mascotte qui répare votre smartphone'}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
