// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Sections de l'accueil
// Toutes les valeurs (prix, frais, horaires, délai) viennent des sources
// centralisées : data/tarifs.ts et config/com9.ts.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import type { ReactNode } from 'react'
import { DELAI_COMMANDE_JOURS, DIAGNOSTIC, DISTANCE_MAX_KM, HORAIRES_TEXTE, PAIEMENT_LABEL, PAIEMENT_MODES, ZONES } from '@/config/com9'
import { PRICE_NOTE, REPAIRS, TRAVEL_RULE, priceFrom } from '@/data/tarifs'
import { SYMPTOMS, SYMPTOM_LABEL } from '@/lib/agenda/types'
import { euros } from '@/lib/money'

function Head({ label, title, sub, center = false }: { label: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${center ? 'mx-auto items-center text-center' : ''}`}>
      <span className="section-label">{label}</span>
      <h2 className="c9-title">{title}</h2>
      {sub && <p className="c9-subtitle">{sub}</p>}
    </div>
  )
}

const wrap = 'mx-auto max-w-6xl px-5 md:px-8'
const py = { paddingBlock: 'var(--section-py)' }

// ─── Comment ça marche ───────────────────────────────────────────────────────

export function HowItWorks() {
  const steps = [
    { t: 'Choisissez votre réparation', d: 'Écran, batterie, vitre arrière… Le prix s’affiche tout de suite.' },
    { t: 'Indiquez votre adresse', d: `Le déplacement est calculé selon la distance depuis Nogent-le-Rotrou, jusqu’à ${DISTANCE_MAX_KM} km.` },
    { t: 'Choisissez un créneau', d: `${HORAIRES_TEXTE.detail}, ${HORAIRES_TEXTE.accroche.toLowerCase()}.` },
    { t: 'COM’9 vient chez vous', d: 'COM’9 confirme votre créneau, puis répare votre smartphone sur place. Vous payez après.' },
  ]
  return (
    <section id="fonctionnement" className="c9-light" style={py}>
      <div className={wrap}>
        <Head label="Comment ça marche" title="Quatre étapes, aucun déplacement de votre part." />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="c9-surface flex flex-col gap-3 rounded-[22px] p-6">
              <span className="font-mono text-[0.75rem] tabular-nums" style={{ color: 'var(--c9-accent-text)' }}>0{i + 1}</span>
              <p className="text-[1.1875rem] font-semibold leading-snug tracking-[-0.02em]">{s.t}</p>
              <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/reservation" className="c9-btn c9-btn-primary w-full sm:w-auto">Commencer</Link>
        </div>
      </div>
    </section>
  )
}

// ─── Tarifs ──────────────────────────────────────────────────────────────────

export function Tarifs() {
  const travel = ZONES.filter((z) => z.feeCents !== null)
  return (
    <section id="tarifs" className="c9-dark" style={py}>
      <div className={wrap}>
        <Head label="Tarifs" title="Le prix total, avant de réserver."
          sub={`${PRICE_NOTE} Vous voyez la réparation, le déplacement et le total avant d'envoyer votre demande.`} />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {REPAIRS.map((r) => (
            <Link key={r.id} href={`/reservation?reparation=${r.id}`}
              className="c9-surface group flex flex-col gap-6 rounded-[22px] p-6 transition-colors duration-300 hover:border-[color:var(--c9-hairline-lit)]">
              <p className="text-[1.25rem] font-semibold tracking-[-0.02em]">{r.label}</p>
              <p>
                <span className="text-[0.875rem]" style={{ color: 'var(--c9-text-3)' }}>à partir de </span>
                <span className="text-[2rem] font-semibold tabular-nums tracking-[-0.03em]">{euros(priceFrom(r.id))}</span>
              </p>
              <span className="text-[0.9375rem] font-medium" style={{ color: 'var(--c9-accent-text)' }}>
                Voir le prix de mon modèle <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 rounded-[22px] p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:items-center" style={{ border: '1px solid var(--c9-hairline)' }}>
          <div className="flex flex-col gap-2">
            <p className="text-[1.25rem] font-semibold tracking-[-0.02em]">Frais de déplacement</p>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
              Selon la distance par la route depuis Nogent-le-Rotrou. {TRAVEL_RULE}
            </p>
          </div>
          <div className="flex flex-col">
            {travel.map((z) => (
              <div key={z.id} className="flex items-baseline justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--c9-hairline-soft)' }}>
                <span style={{ color: 'var(--c9-text-2)' }}>{z.label}</span>
                <span className="text-[1.125rem] font-semibold tabular-nums">{euros(z.feeCents as number)}</span>
              </div>
            ))}
            <p className="pt-3 text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }}>
              {`Au-delà de ${DISTANCE_MAX_KM} km, COM’9 n’intervient pas.`}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/reservation" className="c9-btn c9-btn-primary w-full sm:w-auto">Voir mon tarif exact</Link>
        </div>
      </div>
    </section>
  )
}

// ─── Autre problème ──────────────────────────────────────────────────────────

export function OtherProblem() {
  return (
    <section id="autre-probleme" className="c9-light" style={py}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start`}>
        <div className="flex flex-col gap-8">
          <Head label="Autre problème" title="Votre panne n’est pas dans la liste ?"
            sub="Décrivez ce qui se passe : le pré-diagnostic en ligne est gratuit. Si la réparation a un prix connu, il s'affiche. Sinon, COM'9 fait le diagnostic chez vous." />
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <Link key={s} href={`/reservation?parcours=autre&symptome=${s}`}
                className="c9-choice inline-flex items-center px-4 text-[0.9375rem] font-medium" style={{ minHeight: 48 }}>
                {SYMPTOM_LABEL[s]}
              </Link>
            ))}
          </div>
        </div>
        <div className="c9-surface-accent flex flex-col gap-5 rounded-[24px] p-6 sm:p-8">
          <p className="text-[1.25rem] font-semibold tracking-[-0.02em]">Diagnostic à domicile : la règle est simple.</p>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--c9-ok)' }} />
              <p className="leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                <b style={{ color: 'var(--c9-text)' }}>Vous acceptez la réparation :</b> vous payez uniquement la réparation et le déplacement.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--c9-text-3)' }} />
              <p className="leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
                <b style={{ color: 'var(--c9-text)' }}>Vous refusez après le diagnostic :</b> vous payez le déplacement + {euros(DIAGNOSTIC.refusCents)} de diagnostic.
              </p>
            </div>
          </div>
          <Link href="/reservation?parcours=autre" className="c9-btn c9-btn-primary w-full">Décrire mon problème</Link>
        </div>
      </div>
    </section>
  )
}

// ─── Confiance & horaires ────────────────────────────────────────────────────

export function Trust() {
  const items = [
    { t: 'Garantie pièces et main-d’œuvre', d: 'Sur les réparations réalisées par COM’9.' },
    { t: 'Paiement après l’intervention', d: PAIEMENT_MODES.map((m) => PAIEMENT_LABEL[m]).join(' · ') + '. Aucun paiement en ligne.' },
    { t: 'Aucun acompte', d: 'Même quand une pièce doit être commandée.' },
    { t: 'Pièce disponible, intervention rapide', d: `Pièce à commander : délai estimé de ${DELAI_COMMANDE_JOURS} jours, COM’9 vous propose un créneau adapté.` },
  ]
  return (
    <section id="confiance" className="c9-dark" style={py}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-[1fr_1.3fr]`}>
        <div className="flex flex-col gap-8">
          <Head label="Horaires" title={<>Le soir et le week-end, <span className="c9-copper">{HORAIRES_TEXTE.accroche.toLowerCase()}</span>.</>} />
          <div className="flex flex-col">
            {HORAIRES_TEXTE.lignes.map((l) => (
              <div key={l.jours} className="flex items-baseline justify-between gap-4 py-4" style={{ borderBottom: '1px solid var(--c9-hairline-soft)' }}>
                <span className="text-[1.0625rem]" style={{ color: 'var(--c9-text-2)' }}>{l.jours}</span>
                <span className="text-[1.25rem] font-semibold tabular-nums">{l.heures}</span>
              </div>
            ))}
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.t} className="c9-surface flex flex-col gap-2 rounded-[22px] p-6">
              <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em]">{i.t}</p>
              <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>{i.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
