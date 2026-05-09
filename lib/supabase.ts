// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Client Supabase (server-side uniquement — jamais exposé au navigateur)
//
// Utilise la clé anon (sb_publishable_...) avec :
//   • GRANT CRUD sur la table phones
//   • Politiques Storage pour le bucket phones-images
//
// Variables requises : SUPABASE_URL + SUPABASE_KEY
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  // Supprime le slash final éventuel dans l'URL
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_KEY

  if (!url || !key) return null

  // Singleton — réutilise le même client entre les invocations (warm lambda)
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false },
    })
  }
  return _client
}
