// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Sections de l'accueil (maquette premium)
// Toutes les valeurs (prix, frais, horaires, délai) viennent des sources
// centralisées : data/tarifs.ts et config/com9.ts. Les visuels sont des photos
// (next/image, sources HD dans assets/photos/), jamais redessinés en CSS.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import type { ReactNode } from 'react'
import { DELAI_COMMANDE_JOURS, DIAGNOSTIC, DISTANCE_MAX_KM, HORAIRES_TEXTE, PAIEMENT_LABEL, PAIEMENT_MODES, ZONES } from '@/config/com9'
import { PRICE_NOTE, REPAIRS, priceFrom, type GridRepairId } from '@/data/tarifs'
import { SYMPTOMS, SYMPTOM_LABEL } from '@/lib/agenda/types'
import { euros } from '@/lib/money'
import Image, { type StaticImageData } from 'next/image'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'
import {
  IconArrowRight, IconBolt, IconBox, IconCalendar, IconCar, IconCard, IconCheck, IconHome,
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
    { icon: IconPin, t: 'Indiquez votre adresse', d: `Le déplacement est calculé selon la distance depuis Nogent-le-Rotrou, jusqu’à ${DISTANCE_MAX_KM} km.` },
    { icon: IconCalendar, t: 'Choisissez un créneau', d: `${HORAIRES_TEXTE.detail.replace(' • ', ' · ')}, ${HORAIRES_TEXTE.accroche.toLowerCase()}.` },
    { icon: IconHome, t: 'COM’9 vient chez vous', d: 'Nous confirmons votre créneau, puis réparons votre smartphone sur place. Vous payez après.' },
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
      </div>
    </section>
  )
}

// ─── Tarifs ──────────────────────────────────────────────────────────────────

const TARIF_PHOTO: Record<GridRepairId, { src: StaticImageData; alt: string }> = {
  ecran: { src: PHOTOS.tarifEcran, alt: 'Écran de smartphone fissuré' },
  batterie: { src: PHOTOS.tarifBatterie, alt: 'Batterie de smartphone' },
  vitre: { src: PHOTOS.tarifVitre, alt: 'Vitre arrière de smartphone' },
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
              className="c9-surface group flex min-h-[8.5rem] items-stretch overflow-hidden rounded-[18px] transition-colors duration-300 hover:border-[color:var(--c9-hairline-lit)]">
              <div className="relative w-[38%] shrink-0 overflow-hidden">
                <Image src={TARIF_PHOTO[r.id].src} alt={TARIF_PHOTO[r.id].alt} fill quality={PHOTO_QUALITY}
                  sizes="(min-width: 1152px) 166px, (min-width: 768px) 13vw, 38vw" className="object-cover object-center" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-[1.125rem] font-semibold tracking-[-0.02em]">{r.label}</p>
                  <p className="text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>À partir de</p>
                  <p className="text-[1.75rem] font-semibold tabular-nums tracking-[-0.03em]">{euros(priceFrom(r.id))}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
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
    <section id="autre-probleme" className="c9-light relative overflow-hidden" style={py}>
      {/* Photo : bord droit, derrière l'encadré (ordinateur) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[17%] xl:block">
        <Image src={PHOTOS.autreIphone} alt="" fill quality={PHOTO_QUALITY} sizes="17vw" className="object-cover object-left" />
      </div>

      <div className={`${wrap} relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center`}>
        <div className="flex flex-col gap-6">
          <Head label="Autre problème" title={<>Votre panne n&apos;est <span className="c9-hl">pas dans la liste ?</span></>}
            sub={<>Décrivez votre problème : le pré-diagnostic en ligne est gratuit.<br className="hidden sm:block" /> Si la réparation a un prix connu, il s&apos;affiche. Sinon, COM&apos;9 fait le diagnostic chez vous.</>} />
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <Link key={s} href={`/reservation?parcours=autre&symptome=${s}`}
                className="inline-flex items-center rounded-full px-4 text-[0.875rem] font-medium transition-colors duration-200 hover:border-[color:var(--c9-accent-line)]"
                style={{ minHeight: 40, background: 'var(--c9-surface)', border: '1px solid var(--c9-hairline-soft)', boxShadow: '0 1px 2px rgba(21,21,23,0.04)' }}>
                {SYMPTOM_LABEL[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[20px] p-6 sm:p-7 xl:mr-[10%]"
          style={{ background: '#f6ede4', border: '1px solid rgba(200,120,70,0.14)', boxShadow: '0 18px 44px -30px rgba(21,21,23,0.3)' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--c9-accent-text)' }}><IconSearch className="h-7 w-7" strokeWidth={1.7} /></span>
            <p className="text-[1.0625rem] font-semibold">Diagnostic à domicile : la règle est simple.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: '#d6efd9', color: '#2f7a44' }}>
              <IconCheck className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              <b style={{ color: 'var(--c9-text)' }}>Vous acceptez la réparation :</b><br />vous payez uniquement la réparation et le déplacement.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: '#f8d9c4', color: '#a8552a' }}>
              <IconX className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              <b style={{ color: 'var(--c9-text)' }}>Vous refusez après le diagnostic :</b><br />vous payez le déplacement + {euros(DIAGNOSTIC.refusCents)} de diagnostic.
            </p>
          </div>
          <Link href="/reservation?parcours=autre" className="c9-btn c9-btn-primary mt-1 w-full gap-2">
            Décrire mon problème <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Horaires & confiance ────────────────────────────────────────────────────

export function Trust() {
  const items = [
    { icon: IconShield, t: 'Garantie 3 mois pièces et main-d’œuvre', d: 'Sur les réparations réalisées par COM’9.' },
    { icon: IconCard, t: 'Paiement après intervention', d: PAIEMENT_MODES.map((m) => PAIEMENT_LABEL[m]).join(', ') + '. Aucun paiement en ligne.' },
    { icon: IconBox, t: 'Aucun acompte', d: 'Même quand une pièce doit être commandée.' },
    { icon: IconBolt, t: 'Pièce disponible, intervention rapide', d: `Pièce en stock : intervention selon l’agenda. Sur commande : délai estimé de ${DELAI_COMMANDE_JOURS} jours.` },
  ]
  return (
    <section id="confiance" className="relative overflow-hidden lg:flex" style={{ background: 'var(--c9-bg)' }}>
      <div className="relative min-w-0 flex-1 px-5 md:px-8 lg:pr-10"
        style={{ ...py, paddingLeft: undefined }}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-10 lg:pl-[max(0rem,calc((100vw-72rem)/2))]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="section-label">Horaires</span>
              <h2 className="c9-title" style={{ fontSize: 'clamp(2rem, 3.3vw, 2.75rem)' }}>Disponible jusqu&apos;à <span className="c9-hl">23h, 7j/7.</span></h2>
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

      {/* Photo : technicien COM'9 de nuit — colonne droite (ordinateur), bandeau sous le texte (téléphone) */}
      <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:order-last lg:aspect-auto lg:w-[27%] lg:shrink-0">
        <Image src={PHOTOS.technicienNuit} alt="Un technicien COM’9 arrive le soir chez un client" fill quality={PHOTO_QUALITY}
          sizes="(min-width: 1024px) 27vw, 100vw" className="object-cover object-[62%_40%]" />
        <div aria-hidden="true" className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, var(--c9-bg) 0%, rgba(10,12,14,0) 28%)' }} />
        <div aria-hidden="true" className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(180deg, var(--c9-bg) 0%, rgba(10,12,14,0) 25%)' }} />
      </div>
    </section>
  )
}
