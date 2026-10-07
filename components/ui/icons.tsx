// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Icônes au trait (même épaisseur partout, couleur = currentColor)
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'

function Svg({ children, className = 'h-6 w-6', strokeWidth = 1.7 }: { children: ReactNode; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

type P = { className?: string; strokeWidth?: number }

export const IconCalendar = (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>
export const IconArrowRight = (p: P) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const IconPhone = (p: P) => <Svg {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>
export const IconPin = (p: P) => <Svg {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10" r="2.3" /></Svg>
export const IconHome = (p: P) => <Svg {...p}><path d="M3.5 11L12 4l8.5 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5.5h4V20" /></Svg>
export const IconGear = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8l1.6 2.3 2.7-.6.6 2.7 2.3 1.6-1.2 2.5 1.2 2.5-2.3 1.6-.6 2.7-2.7-.6L12 21.2l-1.6-2.3-2.7.6-.6-2.7-2.3-1.6L6 12.7 4.8 10.2l2.3-1.6.6-2.7 2.7.6z" />
  </Svg>
)
export const IconCheckCircle = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.6 2.6L16 9.5" /></Svg>
export const IconCard = (p: P) => <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19M6.5 15h3" /></Svg>
export const IconTag = (p: P) => <Svg {...p}><path d="M3.5 12.5V4.5h8l9 9-8 8z" /><circle cx="8" cy="9" r="1.4" /></Svg>
export const IconCar = (p: P) => (
  <Svg {...p}>
    <path d="M4 16.5V12l2-5.2A2 2 0 017.9 5.5h8.2A2 2 0 0118 6.8L20 12v4.5" /><path d="M3 12h18v4.5H3z" />
    <path d="M6 16.5V19M18 16.5V19M6.5 14.2h1.5M16 14.2h1.5" />
  </Svg>
)
export const IconCheck = (p: P) => <Svg {...p}><path d="M5 12.5l4.2 4.2L19 7" /></Svg>
export const IconX = (p: P) => <Svg {...p}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></Svg>
export const IconSearch = (p: P) => <Svg {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></Svg>
export const IconShield = (p: P) => <Svg {...p}><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></Svg>
export const IconBox = (p: P) => <Svg {...p}><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" /></Svg>
export const IconBolt = (p: P) => <Svg {...p}><path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" /></Svg>
export const IconWrench = (p: P) => <Svg {...p}><path d="M14.5 5.5a4 4 0 005 5L13 17l-3.5 3.5a2.1 2.1 0 01-3-3L10 14l6.5-6.5" /></Svg>
