// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Contact (accueil)
// Téléphone : « Appeler COM'9 ». Ordinateur : numéro, « Copier », WhatsApp Web.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import ContactActions from '@/components/ui/ContactActions'
import { HORAIRES_TEXTE } from '@/config/com9'

export default function Contact() {
  return (
    <section id="contact" className="c9-light" style={{ paddingBlock: 'var(--section-py)' }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex max-w-xl flex-col gap-4">
          <span className="section-label">Contact</span>
          <h2 className="c9-title">Une question avant de réserver ?</h2>
          <p className="c9-subtitle">
            Appelez ou écrivez à COM&apos;9. Pour une intervention, le plus simple reste la réservation en ligne :
            le prix total s&apos;affiche avant d&apos;envoyer votre demande.
          </p>
          <p className="text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }}>
            Interventions : {HORAIRES_TEXTE.detail.toLowerCase()}, {HORAIRES_TEXTE.accroche.toLowerCase()}.
          </p>
        </div>
        <div className="c9-surface flex flex-col gap-5 rounded-[24px] p-6 sm:p-8">
          <ContactActions message="Bonjour COM'9, j'ai une question." />
          <div className="c9-divider" />
          <Link href="/reservation" className="c9-btn c9-btn-primary w-full">Réserver une intervention</Link>
        </div>
      </div>
    </section>
  )
}
