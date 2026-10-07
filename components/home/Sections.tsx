// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Sections de l'accueil (maquette premium)
// Toutes les valeurs (prix, frais, horaires, délai) viennent des sources
// centralisées : data/tarifs.ts et config/com9.ts. Les visuels sont des photos
// (next/image, sources HD dans assets/photos/), jamais redessinés en CSS.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import type { ReactNode } from 'react'
import { DELAI_COMMANDE, DIAGNOSTIC, GARANTIE, DISTANCE_MAX_KM, HORAIRES_TEXTE, PAIEMENT_LABEL, PAIEMENT_MODES, ZONES } from '@/config/com9'
import { PRICE_NOTE, REPAIRS, type GridRepairId } from '@/data/tarifs'
import { priceFrom } from '@/data/catalogue'
import { SYMPTOMS, SYMPTOM_LABEL } from '@/lib/agenda/types'
import { euros } from '@/lib/money'
import Image, { type StaticImageData } from 'next/image'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'
import {
  IconArrowRight, IconBolt, IconBox, IconCalendar, IconCar, IconCard, IconCheck, IconCheckCircle, IconHome,
  IconPhone, IconPin, IconSearch, IconShield, IconX,
} from '@/components/ui/icons'

const wrap = 'mx-auto max-w-6xl px-5 md:px-8'
const py = { paddingBlock: 'clamp(3.5rem, 7vw, 5.5rem)' }

function Head({ label, title, sub }: { label: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <span className="section-label">{label}</span>
      <h2 className="c9-title" style={{ fontSize: 'clamp(2rem, 4.6vw, 3rem)' }}>{title}</h2>
      {sub && <div className="text-[1rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{sub}</div>}
    </div>
  )
}

// ─── Comment ça marche ───────────────────────────────────────────────────────

export function HowItWorks() {
  const steps = [
    { icon: IconPhone, t: 'Choisissez votre réparation', d: 'Écran, batterie, vitre arrière… Le prix s’affiche tout de suite.' },
    { icon: IconPin, t: 'Indiquez votre adresse', d: `Le déplacement est calculé selon la distance depuis Nogent-le-Rotrou, jusqu’à ${DISTANCE_MAX_KM} km. Choisissez ensuite votre créneau.` },
    { icon: IconCar, t: 'Remettez-nous votre smartphone', d: 'À l’heure prévue, confiez votre téléphone au technicien COM’9, devant chez vous. Il le répare dans son atelier mobile.' },
    { icon: IconCheckCircle, t: 'Récupérez-le réparé', d: 'Le technicien vous prévient dès que c’est terminé. Vous récupérez votre téléphone, puis vous payez.' },
  ]
  return (
    <section id="fonctionnement" className="c9-light" style={py}>
      <div className={wrap}>
        <div className="flex items-end justify-between gap-6">
          <Head label="Comment ça marche" title={<>Quatre étapes,<br className="hidden sm:block" /> aucun déplacement de votre part.</>} />
          <p aria-hidden="true" className="c9-script hidden shrink-0 -rotate-[8deg] pb-2 text-right text-[1.6rem] leading-[1.05] md:block"
            style={{ color: 'var(--c9-text)' }}>
            Simple, rapide<br />&nbsp;&nbsp;et sans stress.
            <svg viewBox="0 0 120 14" className="ml-auto mt-1 block h-3 w-28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 11 C 35 4, 75 2, 117 3" />
            </svg>
          </p>
        </div>

        <ol className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-3">
          {steps.map((s, i) => (
            <li key={s.t} className="contents">
              <div className="c9-surface flex gap-4 rounded-[18px] p-5 lg:p-6">
                <span style={{ color: 'var(--c9-accent-text)' }}><s.icon className="h-8 w-8" strokeWidth={1.5} /></span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[0.8125rem] font-semibold tabular-nums" style={{ color: 'var(--c9-accent-text)' }}>0{i + 1}</span>
                  <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em]">{s.t}</p>
                  <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{s.d}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="hidden items-center justify-center lg:flex" style={{ color: 'var(--c9-text)' }}>
                  <IconArrowRight className="h-5 w-5" strokeWidth={1.8} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <PrivateHome />
      </div>
    </section>
  )
}

/** Carte « Votre domicile reste votre espace » : l'intervention se fait dehors, dans l'atelier mobile. */
function PrivateHome() {
  const points = ['Aucun déplacement en boutique', 'Aucun technicien à faire entrer chez vous', 'Votre téléphone reste à proximité']
  return (
    <div data-private-home className="c9-surface mt-4 grid gap-5 rounded-[18px] p-6 md:p-7 lg:grid-cols-[1.1fr_auto_1.6fr] lg:items-center lg:gap-8">
      <div className="flex gap-4">
        <span style={{ color: 'var(--c9-accent-text)' }}><IconHome className="h-9 w-9" strokeWidth={1.5} /></span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[1.0625rem] font-semibold">Votre domicile reste votre espace.</p>
          <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
            Le technicien se gare devant ou à proximité de chez vous. La réparation se fait dans son atelier mobile : aucun accès à votre domicile n’est nécessaire.
          </p>
        </div>
      </div>
      <span aria-hidden="true" className="hidden h-full w-px lg:block" style={{ background: 'var(--c9-hairline)' }} />
      <ul className="grid gap-3 sm:grid-cols-3">
        {points.map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-[0.9375rem] font-medium leading-snug">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--c9-accent-soft)', color: 'var(--c9-accent-text)' }}>
              <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Tarifs ──────────────────────────────────────────────────────────────────

/** pos : point de cadrage dans la carte (impact de l'écran, batterie, bloc caméras) */
const TARIF_PHOTO: Record<GridRepairId, { src: StaticImageData; alt: string; pos: string }> = {
  ecran: { src: PHOTOS.tarifEcran, alt: 'Écran de smartphone fissuré', pos: '62% 40%' },
  batterie: { src: PHOTOS.tarifBatterie, alt: 'Batterie de smartphone', pos: '50% 45%' },
  vitre: { src: PHOTOS.tarifVitre, alt: 'Vitre arrière de smartphone', pos: '30% 22%' },
}

export function Tarifs() {
  const travel = ZONES.filter((z) => z.feeCents !== null)
  return (
    <section id="tarifs" style={{ ...py, background: 'var(--c9-bg)' }}>
      <div className={wrap}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Head label="Tarifs" title="Le prix total, avant de réserver."
            sub={<>{PRICE_NOTE}<br className="hidden sm:block" /> Vous voyez le prix final avant d&apos;envoyer votre demande.</>} />
          <Link href="/reservation" className="shrink-0 pb-1 text-[0.9375rem] font-medium">
            <span className="c9-link">Voir tous les modèles</span> →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {REPAIRS.map((r) => (
            <Link key={r.id} href={`/reservation?reparation=${r.id}`}
              aria-label={`${r.label} : à partir de ${euros(priceFrom(r.id))} selon modèle. Voir le prix de mon modèle`}
              className="c9-surface group flex min-h-[8.5rem] cursor-pointer items-stretch overflow-hidden rounded-[18px] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[color:var(--c9-accent-line)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--c9-accent)]">
              <div className="relative w-[38%] shrink-0 overflow-hidden">
                <Image src={TARIF_PHOTO[r.id].src} alt="" fill quality={PHOTO_QUALITY}
                  sizes="(min-width: 1152px) 166px, (min-width: 768px) 13vw, 38vw" className="object-cover"
                  style={{ objectPosition: TARIF_PHOTO[r.id].pos }} />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-[1.125rem] font-semibold tracking-[-0.02em]">{r.label}</p>
                  <p className="text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>À partir de</p>
                  <p className="text-[1.75rem] font-semibold tabular-nums tracking-[-0.03em]">{euros(priceFrom(r.id))}</p>
                  <p className="text-[0.75rem]" style={{ color: 'var(--c9-text-3)' }}>selon modèle</p>
                </div>
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300 group-hover:translate-x-0.5 group-hover:bg-[color:var(--c9-accent)] group-hover:text-[color:var(--c9-accent-ink)]"
                  style={{ background: 'var(--c9-elev-2)', color: 'var(--c9-accent-text)' }}>
                  <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Frais de déplacement */}
        <div className="c9-surface mt-4 grid gap-6 rounded-[18px] p-6 md:p-7 lg:grid-cols-[1.15fr_auto_1fr_1fr] lg:items-center lg:gap-8">
          <div className="flex gap-4">
            <span style={{ color: 'var(--c9-accent-text)' }}><IconCar className="h-9 w-9" strokeWidth={1.5} /></span>
            <div className="flex flex-col gap-1.5">
              <p className="text-[1.0625rem] font-semibold">Frais de déplacement</p>
              <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                Selon la distance depuis Nogent-le-Rotrou. Un tarif clair et fixe, même en soirée, même le week-end.
              </p>
            </div>
          </div>
          <span aria-hidden="true" className="hidden h-full w-px lg:block" style={{ background: 'var(--c9-hairline)' }} />
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[0.875rem]">
            {travel.map((z) => (
              <div key={z.id} className="contents">
                <dt style={{ color: 'var(--c9-text-2)' }}>{z.label}</dt>
                <dd className="font-semibold tabular-nums">{euros(z.feeCents as number)}</dd>
              </div>
            ))}
            <dt style={{ color: 'var(--c9-text-2)' }}>{`Au-delà de ${DISTANCE_MAX_KM} km`}</dt>
            <dd style={{ color: 'var(--c9-text-2)' }}>COM&apos;9 n&apos;intervient pas.</dd>
          </dl>
          <div className="flex items-center gap-4 rounded-[14px] p-4" style={{ border: '1px solid var(--c9-accent-line)', background: 'var(--c9-accent-soft)' }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--c9-accent)', color: 'var(--c9-accent-ink)' }}>
              <IconCheck className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <p className="text-[0.875rem] leading-relaxed" style={{ color: 'var(--c9-accent-text)' }}>
              Le prix de la réparation et les frais de déplacement sont affichés séparément avant toute demande de rendez-vous.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Autre problème ──────────────────────────────────────────────────────────

export function OtherProblem() {
  return (
    <section id="autre-probleme" className="c9-light" style={py}>

      <div className={`${wrap} relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center`}>
        <div className="flex flex-col gap-6">
          <Head label="Autre problème" title={<>Votre panne n&apos;est <span className="c9-hl">pas dans la liste ?</span></>}
            sub={<>Décrivez votre problème : le <b className="font-semibold" style={{ color: 'var(--c9-text)' }}>pré-diagnostic en ligne est gratuit</b>.<br className="hidden sm:block" /> Si la réparation a un prix connu, il s&apos;affiche. Sinon, COM&apos;9 fait le diagnostic dans son atelier mobile.</>} />
          <span className="inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[0.875rem] font-semibold"
            style={{ background: 'var(--c9-accent-soft)', color: 'var(--c9-accent-text)', border: '1px solid var(--c9-accent-line)' }}>
            <IconCheck className="h-4 w-4" strokeWidth={2.4} /> Pré-diagnostic en ligne gratuit
          </span>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <Link key={s} href={`/reservation?parcours=autre&symptome=${s}`}
                className="inline-flex items-center rounded-full px-4 text-[0.875rem] font-medium transition-colors duration-200 hover:border-[color:var(--c9-accent-line)]"
                style={{ minHeight: 40, background: 'var(--c9-surface)', border: '1px solid var(--c9-hairline-soft)', boxShadow: '0 1px 2px rgba(74,52,28,0.06)' }}>
                {SYMPTOM_LABEL[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[20px] p-6 sm:p-7"
          style={{ background: 'var(--c9-surface)', border: '1px solid var(--c9-accent-line)', boxShadow: '0 18px 44px -30px rgba(74,52,28,0.35)' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--c9-accent-text)' }}><IconSearch className="h-7 w-7" strokeWidth={1.7} /></span>
            <p className="text-[1.0625rem] font-semibold">Diagnostic à domicile : la règle est simple.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--c9-ok-soft)', color: 'var(--c9-ok)' }}>
              <IconCheck className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              <b style={{ color: 'var(--c9-text)' }}>Vous acceptez la réparation :</b><br />vous payez uniquement la réparation et le déplacement.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--c9-accent-soft)', color: 'var(--c9-accent-text)' }}>
              <IconX className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              <b style={{ color: 'var(--c9-text)' }}>Vous refusez après le diagnostic :</b><br />vous payez le déplacement + {euros(DIAGNOSTIC.refusCents)} de diagnostic.
            </p>
          </div>
          <div className="mt-1 flex flex-col gap-2">
            <Link href="/reservation?parcours=autre" className="c9-btn c9-btn-primary w-full gap-2">
              Décrire mon problème <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
            </Link>
            <p className="text-center text-[0.8125rem] font-medium" style={{ color: 'var(--c9-accent-text)' }}>Gratuit : le prix s’affiche s’il est connu.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Horaires & confiance ────────────────────────────────────────────────────

export function Trust() {
  const items = [
    { icon: IconShield, t: GARANTIE.titre, d: GARANTIE.detail },
    { icon: IconCard, t: 'Paiement après intervention', d: PAIEMENT_MODES.map((m) => PAIEMENT_LABEL[m]).join(', ') + '. Aucun paiement en ligne.' },
    { icon: IconBox, t: 'Aucun acompte', d: 'Même quand une pièce doit être commandée.' },
    { icon: IconBolt, t: 'Pièce disponible, intervention rapide', d: `Pièce en stock : intervention selon l’agenda. Sur commande : délai estimé de ${DELAI_COMMANDE.texte}.` },
  ]
  return (
    <section id="confiance" style={{ ...py, background: 'var(--c9-bg)' }}>
      <div className={wrap}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="section-label">Horaires</span>
              <h2 className="c9-title" style={{ fontSize: 'clamp(2rem, 3.3vw, 2.75rem)' }}>Disponible jusqu&apos;à <span className="c9-hl">23h, 7j/7.</span></h2>
              <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                COM&apos;9 intervient jusqu&apos;à 23h dans son atelier mobile, directement à proximité de votre domicile.
              </p>
            </div>
            <div className="flex flex-col">
              {HORAIRES_TEXTE.lignes.map((l) => (
                <div key={l.jours} className="flex items-center justify-between gap-4 py-3.5" style={{ borderBottom: '1px solid var(--c9-hairline-soft)' }}>
                  <span className="flex items-center gap-3 whitespace-nowrap text-[1rem]" style={{ color: 'var(--c9-text-2)' }}>
                    <span style={{ color: 'var(--c9-accent-text)' }}><IconCalendar className="h-5 w-5" /></span>{l.jours}
                  </span>
                  <span className="whitespace-nowrap text-[1.125rem] font-semibold tabular-nums">{l.heures}</span>
                </div>
              ))}
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((i) => (
              <li key={i.t} className="c9-surface flex gap-3.5 rounded-[16px] p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--c9-accent-soft)', color: 'var(--c9-accent-text)' }}>
                  <i.icon className="h-5 w-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-[0.9375rem] font-semibold leading-snug">{i.t}</p>
                  <p className="text-[0.8125rem] leading-relaxed" style={{ color: 'var(--c9-text-3)' }}>{i.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  )
}
