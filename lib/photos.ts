// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Photos du site (sources HD intactes dans assets/photos/)
//
// Importées de façon statique : next/image connaît leurs dimensions exactes
// (aucun étirement) et produit automatiquement des versions AVIF/WebP à la
// bonne taille pour chaque écran. Pour remplacer une photo : remplacer le
// fichier dans assets/photos/ en gardant le même nom.
// ─────────────────────────────────────────────────────────────────────────────

import heroDesktop from '@/assets/photos/hero-iphone.png'
import heroMobile from '@/assets/photos/hero-iphone-mobile.png'
import tarifEcran from '@/assets/photos/tarif-ecran.png'
import tarifBatterie from '@/assets/photos/tarif-batterie.png'
import tarifVitre from '@/assets/photos/tarif-vitre.png'
import autreIphone from '@/assets/photos/autre-iphone.png'
import technicienNuit from '@/assets/photos/technicien-nuit.png'

export const PHOTOS = {
  heroDesktop,
  heroMobile,
  tarifEcran,
  tarifBatterie,
  tarifVitre,
  autreIphone,
  technicienNuit,
}

/** Qualité d'encodage des photos (voir images.qualities dans next.config.js). */
export const PHOTO_QUALITY = 85
