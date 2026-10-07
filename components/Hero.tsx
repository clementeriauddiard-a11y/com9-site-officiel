// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Hero (maquette premium)
// « Votre smartphone réparé sans vous déplacer. » · atelier mobile · jusqu'à 23h
// · bandeau de confiance en bas.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { GARANTIE, HORAIRES_TEXTE } from '@/config/com9'
import { getImageProps } from 'next/image'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'
import { IconArrowRight, IconCalendar, IconCar, IconCard, IconCheckCircle, IconGear, IconTag } from '@/components/ui/icons'

const TRUST = [
  { icon: IconGear, title: 'Pièces de qualité' },
  { icon: IconCheckCircle, title: GARANTIE.titre, sub: GARANTIE.portee },
  { icon: IconCard, title: 'Paiement après intervention', sub: 'CB, espèces, virement' },
  { icon: IconTag, title: 'Prix affiché = prix payé' },
]

/** Photo du hero : version verticale dédiée sur téléphone, horizontale ailleurs (une seule est chargée). */
function HeroPicture() {
  const common = { alt: 'Deux smartphones posés sur un rocher, éclairés en orange', quality: PHOTO_QUALITY, sizes: '100vw' }
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: PHOTOS.heroDesktop })
  const { props: { srcSet: mobile, ...img } } = getImageProps({ ...common, src: PHOTOS.heroMobile, loading: 'eager', fetchPriority: 'high' })
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktop} />
      <source srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
      <img {...img} className="absolute inset-0 h-full w-full select-none object-cover object-[50%_32%] sm:object-[72%_45%]" draggable={false} />
    </picture>
  )
}

export default function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}>
      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex max-w-[44rem] flex-col gap-5 pb-8 pt-7 md:pt-16 lg:gap-6 lg:min-h-[34rem] lg:justify-center lg:pb-10 lg:pt-16">
          <span className="section-label c9-rise">Réparation smartphone à domicile</span>

          <h1 className="c9-display c9-rise" style={{ animationDelay: '60ms', fontSize: 'clamp(2.6rem, 5.4vw, 3.9rem)', lineHeight: 1.02 }}>
            Votre smartphone<br className="hidden sm:block" /> réparé<br className="hidden sm:block" /> <span className="c9-hl">sans vous déplacer.</span>
          </h1>

          <div className="c9-rise flex flex-col gap-1.5" style={{ animationDelay: '120ms' }}>
            <p className="max-w-[34rem] text-[1.25rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.5rem]">
              Faites réparer votre téléphone devant chez vous, <span className="c9-hl">{HORAIRES_TEXTE.accroche.toLowerCase()}.</span>
            </p>
            <p className="text-[1rem]" style={{ color: 'var(--c9-text-2)' }}>{HORAIRES_TEXTE.detail.replace(' • ', ' · ')}</p>
          </div>

          {/* Atelier mobile : le technicien n'entre pas au domicile */}
          <span data-hero-badge className="c9-rise inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[0.875rem] font-medium"
            style={{ animationDelay: '150ms', background: 'var(--c9-accent-soft)', border: '1px solid var(--c9-accent-line)', color: 'var(--c9-text)', backdropFilter: 'blur(6px)' }}>
            <span style={{ color: 'var(--c9-accent-text)' }}><IconCar className="h-[18px] w-[18px]" strokeWidth={1.7} /></span>
            {`Atelier mobile · Aucune entrée chez vous`}
          </span>

          <div className="c9-rise mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch" style={{ animationDelay: '180ms' }}>
            <Link href="/reservation" className="c9-btn c9-btn-primary justify-start gap-3.5 !px-5 sm:min-w-[15rem]" style={{ minHeight: 64 }}>
              <IconCalendar className="h-6 w-6" />
              <span className="flex flex-col items-start text-left">
                <span className="text-[1rem] font-semibold">Voir mon tarif</span>
                <span className="whitespace-nowrap text-[0.75rem] font-medium opacity-75">Prix immédiat selon votre modèle</span>
              </span>
            </Link>
            <Link href="/reservation?etape=creneau" className="c9-btn c9-btn-secondary justify-between gap-6 whitespace-nowrap !px-5 sm:justify-center" style={{ minHeight: 64 }}>
              Réserver une intervention <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
            </Link>
          </div>
          <Link href="/reservation?parcours=autre" data-hero-other className="c9-rise -mt-1 self-start rounded-lg py-1 text-[0.9375rem] font-medium"
            style={{ animationDelay: '220ms', color: 'var(--c9-text-2)' }}>
            <span className="c9-link">J&apos;ai un autre problème</span> →
          </Link>
        </div>
      </div>

      {/* Photo produit (une seule image chargée selon l'écran)
          · ordinateur : version large, en fond de tout le haut de page ; la zone sombre accueille le texte
          · téléphone : version verticale entière, son ciel sombre passe sous les boutons */}
      <div className="relative z-0 -mt-[64vw] aspect-[941/1440] sm:-mt-[14vw] sm:aspect-[1672/941] lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
        <HeroPicture />
        {/* voiles très légers : lisibilité du texte et fondu vers le reste de la page */}
        <div aria-hidden="true" className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, rgba(10,12,14,0.55) 0%, rgba(10,12,14,0.15) 38%, rgba(10,12,14,0) 55%), linear-gradient(0deg, rgba(10,12,14,0.6) 0%, rgba(10,12,14,0) 18%)' }} />
        <div aria-hidden="true" className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(180deg, var(--c9-bg) 0%, rgba(10,12,14,0) 22%, rgba(10,12,14,0) 62%, rgba(10,12,14,0.85) 86%, var(--c9-bg) 100%)' }} />
      </div>

      {/* Bandeau de confiance */}
      <div className="relative z-10 mx-auto -mt-[30vw] max-w-6xl px-5 pb-8 sm:-mt-[6vw] md:px-8 lg:mt-0 lg:pb-12 lg:pt-2">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 lg:flex lg:flex-wrap lg:gap-x-12">
          {TRUST.map(({ icon: Icon, title, sub }) => (
            <li key={title} className="flex items-start gap-2.5">
              <span style={{ color: 'var(--c9-accent-text)' }}><Icon className="mt-[1px] h-[22px] w-[22px]" /></span>
              <span className="flex flex-col">
                <span className="text-[0.875rem] font-medium leading-snug">{title}</span>
                {sub && <span className="text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>{sub}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
