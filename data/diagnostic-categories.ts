export type ScoringOption = { value: number; label: string; desc?: string }
export type MalusOption   = { value: number; label: string }

export type DiagCategory = {
  id:      string
  icon:    string
  label:   string
  max:     number
  options: ScoringOption[]
  malus:   MalusOption[]
}

export const DIAG_CATEGORIES: DiagCategory[] = [
  {
    id: 'batterie', icon: '🔋', label: 'Batterie', max: 20,
    options: [
      { value: 20, label: '95 – 100 %', desc: 'Excellent' },
      { value: 18, label: '90 – 94 %',  desc: 'Très bon' },
      { value: 16, label: '85 – 89 %',  desc: 'Bon' },
      { value: 14, label: '80 – 84 %',  desc: 'Usure modérée' },
      { value: 12, label: '75 – 79 %',  desc: 'Usure notable' },
      { value: 10, label: '70 – 74 %',  desc: 'Faible' },
      { value:  8, label: '< 70 %',     desc: 'Très usée' },
      { value:  0, label: 'Panne / inconnue / chauffe anormale' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -2, label: 'Autonomie correcte mais chauffe légère' },
      { value: -3, label: 'Batterie remplacée non reconnue mais stable' },
      { value: -5, label: 'Extinction sous faible charge' },
    ],
  },
  {
    id: 'ecran', icon: '📱', label: 'Écran / Tactile', max: 20,
    options: [
      { value: 20, label: 'Parfait',                            desc: 'Tactile parfait, luminosité normale' },
      { value: 18, label: 'Micro-rayures légères',              desc: 'Sans impact' },
      { value: 16, label: 'Rayures visibles',                   desc: 'Bon usage' },
      { value: 14, label: 'Petite marque',                      desc: 'Léger défaut d\'affichage' },
      { value: 12, label: 'Fissure légère',                     desc: 'Tactile complet' },
      { value: 10, label: 'Tactile légèrement irrégulier',      desc: 'Luminosité anormale' },
      { value:  8, label: 'Fissure + défaut tactile localisé' },
      { value:  6, label: 'Écran partiellement HS' },
      { value:  0, label: 'Écran très défectueux',              desc: 'Noir / lignes / tactile HS' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -2, label: 'True Tone absent après changement écran' },
      { value: -2, label: 'Léger décollement écran' },
      { value: -4, label: 'Décollement important / collage à revoir' },
    ],
  },
  {
    id: 'cameras', icon: '📷', label: 'Caméras', max: 10,
    options: [
      { value: 10, label: 'Toutes parfaites',                   desc: 'Focus OK, vidéo OK' },
      { value:  9, label: 'Légère rayure sans impact réel' },
      { value:  8, label: 'Légère baisse qualité',              desc: 'Autofocus lent' },
      { value:  7, label: 'Fonction imparfaite sur caméra secondaire' },
      { value:  6, label: 'Caméra selfie ou secondaire défectueuse' },
      { value:  4, label: 'Caméra principale défaut notable' },
      { value:  0, label: 'Caméra principale HS',               desc: 'Application instable' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -1, label: 'Verre caméra rayé mais capteur bon' },
      { value: -2, label: 'Légère poussière / rendu variable' },
      { value: -3, label: 'Focus qui tremble fortement' },
    ],
  },
  {
    id: 'audio', icon: '🔊', label: 'Audio', max: 10,
    options: [
      { value: 10, label: 'Haut-parleur, écouteur, micros parfaits' },
      { value:  8, label: 'Volume légèrement plus faible',      desc: 'Mais correct' },
      { value:  7, label: 'Léger grésillement',                 desc: 'Micro un peu faible' },
      { value:  6, label: 'Un élément imparfait en appel ou vidéo' },
      { value:  4, label: 'Haut-parleur ou micro clairement faible' },
      { value:  2, label: 'Appels compliqués / son très mauvais' },
      { value:  0, label: 'Audio quasi inutilisable' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -1, label: 'Grésillement léger à volume max' },
      { value: -2, label: 'Écouteur faible mais utilisable' },
      { value: -3, label: 'Micro très faible' },
    ],
  },
  {
    id: 'reseau', icon: '📶', label: 'Réseau / Connectivité', max: 15,
    options: [
      { value: 15, label: 'Réseau, Wi-Fi, Bluetooth, GPS parfaits' },
      { value: 13, label: 'Très léger défaut mineur non bloquant' },
      { value: 11, label: 'Défaut notable',                     desc: 'Bluetooth, GPS ou Wi-Fi' },
      { value:  9, label: 'Faiblesse réseau mobile',            desc: 'Instabilité réelle' },
      { value:  7, label: 'Gros défaut sur un élément important' },
      { value:  5, label: 'Mauvaise accroche réseau / Wi-Fi instable' },
      { value:  3, label: 'Plusieurs fonctions réseau défectueuses' },
      { value:  0, label: 'Aucune connectivité fiable' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -1, label: 'Compatibilité bandes à surveiller' },
      { value: -2, label: 'Bluetooth capricieux' },
      { value: -4, label: 'SIM non reconnue / forte anomalie' },
    ],
  },
  {
    id: 'capteurs', icon: '🔐', label: 'Capteurs / Sécurité', max: 10,
    options: [
      { value: 10, label: 'Face ID / empreinte + capteurs OK' },
      { value:  9, label: 'Petit défaut sur capteur secondaire' },
      { value:  8, label: 'Rotation / proximité / luminosité imparfaite' },
      { value:  6, label: 'Un capteur important HS' },
      { value:  5, label: 'Biométrie HS mais reste correct' },
      { value:  3, label: 'Plusieurs capteurs HS' },
      { value:  0, label: 'Biométrie + capteurs critiques HS' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -2, label: 'Auto-rotation capricieuse' },
      { value: -3, label: 'Face ID / Touch ID HS' },
      { value: -3, label: 'Proximité HS en appel' },
    ],
  },
  {
    id: 'performance', icon: '⚡', label: 'Performance / Stockage', max: 10,
    options: [
      { value: 10, label: 'Fluide, stable, stockage sain' },
      { value:  8, label: 'Très légère lenteur occasionnelle' },
      { value:  7, label: 'Quelques ralentissements',           desc: 'Stockage chargé' },
      { value:  5, label: 'Lenteur notable ou bugs ponctuels' },
      { value:  3, label: 'Très lent / chauffe / apps ferment' },
      { value:  0, label: 'Instable ou presque inutilisable' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -2, label: 'Stockage saturé mais appareil sain' },
      { value: -2, label: 'Chauffe anormale légère' },
      { value: -4, label: 'Redémarrages aléatoires / instabilité' },
    ],
  },
  {
    id: 'physique', icon: '🔧', label: 'État physique', max: 5,
    options: [
      { value: 5, label: 'Excellent état, très propre' },
      { value: 4, label: 'Usure légère normale' },
      { value: 3, label: 'Rayures visibles ou petits impacts' },
      { value: 2, label: 'Chocs marqués ou coins abîmés' },
      { value: 1, label: 'Très abîmé esthétiquement' },
      { value: 0, label: 'Châssis très endommagé / tordu' },
    ],
    malus: [
      { value:  0, label: 'Aucun' },
      { value: -1, label: 'Traces de démontage fortes' },
      { value: -1, label: 'Vis manquantes' },
      { value: -2, label: 'Châssis tordu / ouverture importante' },
    ],
  },
]

export function getRating(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent état',  color: '#00D1FF' }
  if (score >= 75) return { label: 'Bon état',        color: '#00D1FF' }
  if (score >= 60) return { label: 'État correct',    color: '#a0b4d0' }
  if (score >= 40) return { label: 'État fragile',    color: '#facc15' }
  return               { label: 'État dégradé',       color: '#f87171' }
}
