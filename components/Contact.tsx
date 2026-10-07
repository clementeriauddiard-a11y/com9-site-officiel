// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Contact (accueil)
// Téléphone : « Appeler COM'9 ». Ordinateur : numéro, « Copier », WhatsApp Web.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import ContactActions from '@/components/ui/ContactActions'
import { HORAIRES_TEXTE } from '@/config/com9'
import { IconArrowRight } from '@/components/ui/icons'

export default function Contact() {
  return (
    <section id="contact" className="c9-light" style={{ paddingBlock: 'clamp(3rem, 6vw, 4.5rem)' }}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="section-label">Contact</span>
          <h2 className="c9-title lg:whitespace-nowrap" style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.25rem)' }}>Une question avant de réserver ?</h2>
          <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
            Appelez ou écrivez à COM&apos;9. Pour une intervention, le plus simple reste la réservation en ligne :
            le prix total s&apos;affiche avant d&apos;envoyer votre demande.
          </p>
          <p className="text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>
            Interventions : {HORAIRES_TEXTE.detail.toLowerCase()}, {HORAIRES_TEXTE.accroche.toLowerCase()}.
          </p>
        </div>
        <div className="c9-surface flex flex-col gap-5 rounded-[20px] p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
          <ContactActions message="Bonjour COM'9, j'ai une question." />
          <Link href="/reservation" className="c9-btn c9-btn-primary w-full gap-2 lg:w-auto lg:!px-7" style={{ minHeight: 60 }}>
            Réserver une intervention <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </section>
  )
}
