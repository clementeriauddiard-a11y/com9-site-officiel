// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Fiche entreprise lisible par Google (schema.org, JSON-LD)
// Uniquement des informations déjà publiques sur le site : nom, téléphone,
// ville, horaires (config/com9.ts), zone d'intervention. Aucune adresse précise.
// ─────────────────────────────────────────────────────────────────────────────

import { ATELIER, DISTANCE_MAX_KM, HORAIRES, PAIEMENT_LABEL, PAIEMENT_MODES, SITE_URL } from '@/config/com9'
import { PHONE } from '@/lib/links'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Regroupe les jours qui ont la même plage horaire. */
function openingHours() {
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>()
  HORAIRES.forEach((p, i) => {
    if (!p) return
    const key = `${p.debut}-${p.fin}`
    const g = groups.get(key) ?? { opens: p.debut, closes: p.fin, days: [] }
    g.days.push(`https://schema.org/${DAYS[i]}`)
    groups.set(key, g)
  })
  return [...groups.values()].map((g) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: g.days, opens: g.opens, closes: g.closes,
  }))
}

export default function StructuredData() {
  const business = {
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#entreprise`,
    name: "COM'9",
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    telephone: PHONE.e164,
    description:
      "Réparation smartphone à domicile depuis Nogent-le-Rotrou. COM'9 vient jusqu'à vous et répare votre téléphone dans son atelier mobile, jusqu'à 23h.",
    address: { '@type': 'PostalAddress', addressLocality: ATELIER.libelle, postalCode: '28400', addressCountry: 'FR' },
    areaServed: `${ATELIER.libelle} et alentours (jusqu'à ${DISTANCE_MAX_KM} km)`,
    openingHoursSpecification: openingHours(),
    paymentAccepted: PAIEMENT_MODES.map((m) => PAIEMENT_LABEL[m]).join(', '),
  }
  const service = {
    '@type': 'Service',
    serviceType: 'Réparation smartphone à domicile',
    name: 'Réparation de smartphone en atelier mobile',
    description: "Le technicien se gare devant ou à proximité de votre domicile et répare votre smartphone dans son atelier mobile : écran, batterie, vitre arrière.",
    provider: { '@id': `${SITE_URL}/#entreprise` },
    areaServed: business.areaServed,
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': [business, service] }).replace(/</g, '\\u003c')
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
