// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Défilement doux et fiable
// ─────────────────────────────────────────────────────────────────────────────
//
//  Pourquoi ne pas se contenter de `scrollIntoView({ behavior: 'smooth' })` :
//    • iOS Safari < 15.4 ignore `behavior` → saut brutal.
//    • `scroll-margin-top` n'est pas honoré partout de la même façon.
//  On calcule donc la position nous-mêmes, et on anime à la main lorsque le
//  navigateur ne sait pas le faire.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Hauteur du header fixe + respiration au-dessus du bloc visé. */
export const HEADER_OFFSET = 88

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function supportsNativeSmooth(): boolean {
  return (
    typeof document !== 'undefined' &&
    'scrollBehavior' in document.documentElement.style
  )
}

/** Repli maison — courbe identique au reste du site (--c9-ease). */
function animateScroll(to: number, duration = 460) {
  const start = window.pageYOffset
  const delta = to - start
  if (delta === 0) return

  let startTime: number | null = null

  const step = (now: number) => {
    if (startTime === null) startTime = now
    const t = Math.min((now - startTime) / duration, 1)
    // easeOutCubic — départ franc, arrivée posée
    const eased = 1 - Math.pow(1 - t, 3)
    window.scrollTo(0, start + delta * eased)
    if (t < 1) window.requestAnimationFrame(step)
  }

  window.requestAnimationFrame(step)
}

/**
 * Amène `el` sous le header, en douceur.
 *
 * @param el      élément cible
 * @param offset  marge au-dessus de l'élément (header fixe compris)
 * @param onlyIfHidden  ne défile que si l'élément n'est pas déjà confortablement
 *                      visible — évite de bouger la page pour rien sur desktop.
 */
export function scrollToElement(
  el: HTMLElement | null,
  offset: number = HEADER_OFFSET,
  onlyIfHidden = false,
) {
  if (!el || typeof window === 'undefined') return

  const rect = el.getBoundingClientRect()

  if (onlyIfHidden) {
    const fullyVisible = rect.top >= offset && rect.bottom <= window.innerHeight
    if (fullyVisible) return
  }

  const target = Math.max(0, rect.top + window.pageYOffset - offset)

  if (prefersReducedMotion()) {
    window.scrollTo(0, target)
    return
  }

  if (supportsNativeSmooth()) {
    window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }

  animateScroll(target)
}
