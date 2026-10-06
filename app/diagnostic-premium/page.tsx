// ─────────────────────────────────────────────────────────────────────────────
// COM'9 DIAGNOSTIC PREMIUM — Page privée
// L'accès est vérifié ici, côté serveur (cookie posé après DIAGNOSTIC_PASSWORD).
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import DiagnosticPremium from '@/components/DiagnosticPremium'
import { DIAG_COOKIE, hasDiagnosticAccess } from '@/lib/diagnostic-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Diagnostic Premium',
  robots: { index: false, follow: false },
}

export default async function DiagnosticPremiumPage() {
  const jar = await cookies()
  return <DiagnosticPremium initiallyUnlocked={hasDiagnosticAccess(jar.get(DIAG_COOKIE)?.value)} />
}
