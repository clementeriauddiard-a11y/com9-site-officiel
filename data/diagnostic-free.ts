// ─── Diagnostic Gratuit Com'9 ─────────────────────────────────────────────────
// 4 catégories : Batterie · Écran · Caméras · Vitre arrière

export type FreeSeverity = 0 | 1 | 2 | 3
// 0 = parfait / 1 = légère dégradation / 2 = réparation conseillée / 3 = urgent

export type FreeOption = {
  label:    string
  desc:     string
  severity: FreeSeverity
}

export type FreeCategory = {
  id:       string
  label:    string
  subtitle: string
  options:  FreeOption[]
}

export const FREE_CATEGORIES: FreeCategory[] = [
  {
    id: 'batterie',
    label: 'Batterie',
    subtitle: 'Analyse de l\'autonomie et de l\'état de charge',
    options: [
      { label: 'Autonomie normale',       desc: 'Aucun problème constaté, tient la journée',     severity: 0 },
      { label: 'Autonomie réduite',        desc: 'Se décharge plus vite qu\'à l\'origine',         severity: 1 },
      { label: 'Chauffe / décharge rapide',desc: 'Chauffe anormalement ou tient moins de 4h',     severity: 2 },
      { label: 'Pannes / arrêts brutaux',  desc: 'S\'éteint sans raison ou ne charge plus',        severity: 3 },
    ],
  },
  {
    id: 'ecran',
    label: 'Écran',
    subtitle: 'Contrôle visuel et fonctionnel de la dalle',
    options: [
      { label: 'Parfait',                  desc: 'Aucune rayure, tactile impeccable',               severity: 0 },
      { label: 'Micro-rayures légères',     desc: 'Traces fines sans impact sur l\'usage',            severity: 1 },
      { label: 'Rayures / fissure légère',  desc: 'Défaut visible, tactile encore fonctionnel',      severity: 2 },
      { label: 'Écran fissuré / défaillant',desc: 'Fissure profonde ou zones tactiles HS',           severity: 3 },
    ],
  },
  {
    id: 'cameras',
    label: 'Caméras',
    subtitle: 'Test de la qualité optique et du focus',
    options: [
      { label: 'Photos nettes, focus parfait', desc: 'Toutes les caméras fonctionnent bien',          severity: 0 },
      { label: 'Légère baisse de qualité',      desc: 'Buée légère, focus parfois lent',              severity: 1 },
      { label: 'Photos floues / focus défaillant',desc: 'Problème optique confirmé',                  severity: 2 },
      { label: 'Caméra non fonctionnelle',      desc: 'Caméra principale ou selfie HS',               severity: 3 },
    ],
  },
  {
    id: 'vitre',
    label: 'Vitre arrière',
    subtitle: 'État de la protection structurelle',
    options: [
      { label: 'Intacte, aucun défaut',     desc: 'Vitre arrière en parfait état',                   severity: 0 },
      { label: 'Micro-rayures discrètes',   desc: 'Traces fines sans conséquence structurelle',       severity: 1 },
      { label: 'Fissures visibles',         desc: 'Fissures légères sur la surface',                  severity: 2 },
      { label: 'Brisée / éclats',           desc: 'Vitre détruite, risque pour les composants',       severity: 3 },
    ],
  },
]

// ─── Résultat par sévérité ────────────────────────────────────────────────────

export type FreeResult = {
  label:  string
  color:  string
  glow:   string
  action: string
  cta:    string
}

export function getFreeResult(severity: FreeSeverity): FreeResult {
  switch (severity) {
    case 0: return {
      label:  'État optimal',
      color:  '#00d1ff',
      glow:   'rgba(0,209,255,0.3)',
      action: 'Aucune intervention requise',
      cta:    'Diagnostic Premium pour validation complète',
    }
    case 1: return {
      label:  'Légère dégradation',
      color:  '#4ade80',
      glow:   'rgba(74,222,128,0.25)',
      action: 'Surveillance recommandée',
      cta:    'Réparation préventive conseillée',
    }
    case 2: return {
      label:  'Intervention conseillée',
      color:  '#facc15',
      glow:   'rgba(250,204,21,0.25)',
      action: 'Réparation recommandée',
      cta:    'Contacter Com\'9 rapidement',
    }
    case 3: return {
      label:  'Intervention urgente',
      color:  '#f87171',
      glow:   'rgba(248,113,113,0.25)',
      action: 'Prise en charge immédiate requise',
      cta:    'Contacter Com\'9 maintenant',
    }
  }
}

export function getOverallSeverity(answers: Record<string, FreeSeverity>): FreeSeverity {
  const values = Object.values(answers)
  if (!values.length) return 0
  const max = Math.max(...values) as FreeSeverity
  return max
}
