// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Page introuvable (404), même DA que le reste du site
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Footer from '@/components/Footer'
import { IconArrowRight } from '@/components/ui/icons'

export default function NotFound() {
  return (
    <>
      <PageHeader label="Erreur 404" title={<>Page <span className="c9-hl">introuvable.</span></>}
        sub="Cette page n’existe pas ou a été déplacée." />
      <main className="c9-light">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-12 sm:flex-row md:px-8">
          <Link href="/reservation" className="c9-btn c9-btn-primary gap-2">
            Réserver une intervention <IconArrowRight className="h-5 w-5" strokeWidth={1.9} />
          </Link>
          <Link href="/" className="c9-btn c9-btn-secondary">Retour à l&apos;accueil</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
