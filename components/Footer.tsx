// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Pied de page
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { HORAIRES_TEXTE } from '@/config/com9'
import { LINKS, PHONE } from '@/lib/links'
import { WaIcon } from '@/components/ui/Wa'
import { Wordmark } from '@/components/Navbar'

const NAV = [
  { href: '/reservation', label: 'Réserver une intervention' },
  { href: '/#tarifs', label: 'Tarifs' },
  { href: '/reservation?parcours=autre', label: 'Autre problème' },
  { href: '/#contact', label: 'Contact' },
]

const SOCIAL = [
  { name: 'WhatsApp', href: LINKS.whatsapp, icon: <WaIcon className="h-4 w-4" /> },
  {
    name: 'TikTok', href: LINKS.tiktok,
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.28 8.28 0 004.84 1.54V6.84a4.85 4.85 0 01-1.07-.15z" /></svg>,
  },
  {
    name: 'Snapchat', href: LINKS.snapchat,
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.106-1.123.45-1.679.81-.712.45-1.499.93-2.752.93-1.252 0-2.04-.48-2.751-.93-.556-.36-1.08-.704-1.679-.81a6.9 6.9 0 00-.913-.074c-.508 0-.913.06-1.273.135-.226.043-.403.074-.538.074h-.03c-.285 0-.48-.134-.555-.405-.06-.193-.105-.374-.134-.553-.045-.195-.105-.48-.165-.57-1.872-.283-2.905-.702-3.145-1.271a.544.544 0 01-.045-.225c-.015-.24.165-.465.42-.509 3.264-.539 4.73-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.195-.45-.884-.675-1.333-.81-.135-.044-.255-.09-.345-.12C2.044 9.756 1.64 9.366 1.655 8.917c0-.36.284-.69.733-.838.15-.061.328-.09.51-.09.12 0 .298.016.464.104.373.181.732.285 1.032.301.198 0 .326-.045.401-.09l-.03-.51-.002-.06c-.105-1.628-.23-3.654.298-4.847C5.86 1.069 9.216.793 10.207.793h.001z" /></svg>,
  },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--c9-bg-deep)', borderTop: '1px solid var(--c9-hairline-soft)' }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8"
        style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col gap-3">
          <Wordmark className="text-[1.5rem]" />
          <p className="text-[1.0625rem] font-medium">Réparation smartphone à domicile depuis <span className="whitespace-nowrap">Nogent-le-Rotrou</span>.</p>
          <p className="text-[0.9375rem]" style={{ color: 'var(--c9-text-3)' }}>
            COM&apos;9 vient jusqu&apos;à vous et répare votre téléphone dans son atelier mobile, jusqu&apos;à 23h.
            <br />{HORAIRES_TEXTE.detail.replace(' • ', ' · ')}.
          </p>
          <a href={LINKS.phone} className="self-start text-[1.0625rem] font-semibold tabular-nums">{PHONE.display}</a>
        </div>

        <nav aria-label="Liens du pied de page" className="flex flex-col gap-1">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="c9-back -ml-2 self-start rounded-lg px-2 py-2 text-[0.9375rem]"
              style={{ color: 'var(--c9-text-2)' }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {SOCIAL.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name}
                className="c9-back flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ border: '1px solid var(--c9-hairline)', color: 'var(--c9-text-2)' }}>
                {s.icon}
              </a>
            ))}
          </div>
          <Link href="/login" className="self-start text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>Espace COM&apos;9</Link>
          <p className="text-[0.8125rem]" style={{ color: 'var(--c9-text-3)' }}>© {new Date().getFullYear()} COM&apos;9 · Nogent-le-Rotrou</p>
        </div>
      </div>
    </footer>
  )
}
