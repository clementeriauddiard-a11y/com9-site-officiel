'use client'

import { PhonesProvider } from '@/context/PhonesContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PhonesProvider>{children}</PhonesProvider>
}
