// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Zone de déplacement par commune (généré, ne pas modifier à la main)
//
//  Point de départ : atelier COM'9, place Saint-Pol, Nogent-le-Rotrou.
//  Zones proposées à partir de la distance à vol d'oiseau jusqu'au centre de
//  chaque commune (données officielles des communes), puis relues par COM'9.
//  PROPOSITION NON VALIDÉE — zones calculées à vol d'oiseau, en attente de relecture par Clément.
//  Une commune absente de la liste : zone « à confirmer » par COM'9.
// ─────────────────────────────────────────────────────────────────────────────

import type { ZoneId } from './tarifs'

export type CommuneZone = {
  /** Code commune INSEE (préfixé « d » pour une commune déléguée) */
  id: string
  nom: string
  cp: string[]
  dep: string
  zone: ZoneId
  /** Anciens noms rattachés (communes déléguées chef-lieu) */
  alias?: string[]
  /** Commune nouvelle de rattachement (commune déléguée) */
  parent?: string
}

export const COMMUNES_VALIDATED = false

export const COMMUNES: CommuneZone[] = [
{
"id": "61005",
"nom": "Appenai-sous-Bellême",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28236",
"nom": "Arcisses",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15",
"alias": [
"Margon"
]
},
{
"id": "28010",
"nom": "Argenvilliers",
"cp": [
"28480"
],
"dep": "28",
"zone": "z15"
},
{
"id": "d41005",
"nom": "Arville",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30",
"parent": "Couëtron-au-Perche"
},
{
"id": "28018",
"nom": "Authon-du-Perche",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72020",
"nom": "Avezé",
"cp": [
"72400"
],
"dep": "72",
"zone": "z15"
},
{
"id": "28031",
"nom": "Beaumont-les-Autels",
"cp": [
"28480"
],
"dep": "28",
"zone": "z15"
},
{
"id": "61196",
"nom": "Belforêt-en-Perche",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"alias": [
"Le Gué-de-la-Chaîne"
]
},
{
"id": "28033",
"nom": "Belhomert-Guéhouville",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61037",
"nom": "Bellavilliers",
"cp": [
"61360"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61041",
"nom": "Bellou-le-Trichard",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61038",
"nom": "Bellême",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61043",
"nom": "Berd'huis",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15"
},
{
"id": "61046",
"nom": "Bizou",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72041",
"nom": "Bouër",
"cp": [
"72390"
],
"dep": "72",
"zone": "z30"
},
{
"id": "72038",
"nom": "Boëssé-le-Sec",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61061",
"nom": "Bretoncelles",
"cp": [
"61110"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28061",
"nom": "Brou",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d28063",
"nom": "Brunelles",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15",
"parent": "Arcisses"
},
{
"id": "28038",
"nom": "Béthonvilliers",
"cp": [
"28330"
],
"dep": "28",
"zone": "z15"
},
{
"id": "61079",
"nom": "Ceton",
"cp": [
"61260"
],
"dep": "61",
"zone": "z15"
},
{
"id": "72057",
"nom": "Champrond",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28071",
"nom": "Champrond-en-Gâtine",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28072",
"nom": "Champrond-en-Perchet",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15"
},
{
"id": "28078",
"nom": "Chapelle-Guillaume",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28079",
"nom": "Chapelle-Royale",
"cp": [
"28290"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28080",
"nom": "Charbonnières",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28086",
"nom": "Chassant",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61105",
"nom": "Chemilli",
"cp": [
"61360"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d72081",
"nom": "Cherreau",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30",
"parent": "Cherré-Au"
},
{
"id": "72080",
"nom": "Cherré-Au",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30",
"alias": [
"Cherré"
]
},
{
"id": "d61112",
"nom": "Colonard-Corubert",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Perche en Nocé"
},
{
"id": "61113",
"nom": "Comblot",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28105",
"nom": "Combres",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61115",
"nom": "Condeau",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15",
"parent": "Sablons sur Huisne"
},
{
"id": "61118",
"nom": "Corbon",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72093",
"nom": "Cormes",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28111",
"nom": "Coudray-au-Perche",
"cp": [
"28330"
],
"dep": "28",
"zone": "z15"
},
{
"id": "d28112",
"nom": "Coudreceau",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15",
"parent": "Arcisses"
},
{
"id": "d61125",
"nom": "Coulonges-les-Sablons",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15",
"parent": "Sablons sur Huisne"
},
{
"id": "61050",
"nom": "Cour-Maugis sur Huisne",
"cp": [
"61110",
"61340"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72105",
"nom": "Courgenard",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61129",
"nom": "Courgeon",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "41248",
"nom": "Couëtron-au-Perche",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30",
"alias": [
"Souday"
]
},
{
"id": "61142",
"nom": "Dame-Marie",
"cp": [
"61130"
],
"dep": "61",
"zone": "z15"
},
{
"id": "28123",
"nom": "Dampierre-sous-Brou",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61144",
"nom": "Dancé",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Perche en Nocé"
},
{
"id": "72114",
"nom": "Dehault",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "d61154",
"nom": "Eperrais",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"parent": "Belforêt-en-Perche"
},
{
"id": "61160",
"nom": "Feings",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28156",
"nom": "Fontaine-Simon",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28161",
"nom": "Frazé",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28166",
"nom": "Friaize",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d28165",
"nom": "Frétigny",
"cp": [
"28480"
],
"dep": "28",
"zone": "z15",
"parent": "Saintigny"
},
{
"id": "72144",
"nom": "Gréez-sur-Roc",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "d61185",
"nom": "Gémages",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Val-au-Perche"
},
{
"id": "28192",
"nom": "Happonvilliers",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61207",
"nom": "Igé",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d61204",
"nom": "L'Hermitière",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Val-au-Perche"
},
{
"id": "28027",
"nom": "La Bazoche-Gouet",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72040",
"nom": "La Bosse",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61097",
"nom": "La Chapelle-Montligeon",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61099",
"nom": "La Chapelle-Souëf",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72062",
"nom": "La Chapelle-du-Bois",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28119",
"nom": "La Croix-du-Perche",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72132",
"nom": "La Ferté-Bernard",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28175",
"nom": "La Gaudaine",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15"
},
{
"id": "d61220",
"nom": "La Lande-sur-Eure",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "28214",
"nom": "La Loupe",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61241",
"nom": "La Madeleine-Bouvet",
"cp": [
"61110"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d61325",
"nom": "La Perrière",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"parent": "Belforêt-en-Perche"
},
{
"id": "d61356",
"nom": "La Rouge",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Val-au-Perche"
},
{
"id": "72156",
"nom": "Lamnay",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28148",
"nom": "Le Favril",
"cp": [
"28190"
],
"dep": "28",
"zone": "z30"
},
{
"id": "41096",
"nom": "Le Gault-du-Perche",
"cp": [
"41270"
],
"dep": "41",
"zone": "z30"
},
{
"id": "61242",
"nom": "Le Mage",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61323",
"nom": "Le Pas-Saint-l'Homer",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61329",
"nom": "Le Pin-la-Garenne",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "41177",
"nom": "Le Plessis-Dorin",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30"
},
{
"id": "28385",
"nom": "Le Thieulin",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28016",
"nom": "Les Autels-Villevillon",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28109",
"nom": "Les Corvées-les-Yys",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61274",
"nom": "Les Menus",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28144",
"nom": "Les Étilleux",
"cp": [
"28330"
],
"dep": "28",
"zone": "z15"
},
{
"id": "61229",
"nom": "Loisail",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61230",
"nom": "Longny les Villages",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"alias": [
"Longny-au-Perche"
]
},
{
"id": "28219",
"nom": "Luigny",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61247",
"nom": "Malétable",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "28232",
"nom": "Manou",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61250",
"nom": "Marchainville",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "28237",
"nom": "Marolles-les-Buis",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15"
},
{
"id": "61255",
"nom": "Mauves-sur-Huisne",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28240",
"nom": "Meaucé",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72193",
"nom": "Melleray",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28252",
"nom": "Miermaigne",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61280",
"nom": "Monceaux-au-Perche",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "28261",
"nom": "Montigny-le-Chartif",
"cp": [
"28120"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28264",
"nom": "Montireau",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28265",
"nom": "Montlandon",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72208",
"nom": "Montmirail",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61293",
"nom": "Mortagne-au-Perche",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28272",
"nom": "Mottereau",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28273",
"nom": "Moulhard",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61296",
"nom": "Moulicent",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "61300",
"nom": "Moutiers-au-Perche",
"cp": [
"61110"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d61246",
"nom": "Mâle",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Val-au-Perche"
},
{
"id": "28242",
"nom": "Méréglise",
"cp": [
"28120"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61305",
"nom": "Neuilly-sur-Eure",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "72220",
"nom": "Nogent-le-Bernard",
"cp": [
"72110"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28280",
"nom": "Nogent-le-Rotrou",
"cp": [
"28400"
],
"dep": "28",
"zone": "z5"
},
{
"id": "28282",
"nom": "Nonvilliers-Grandhoux",
"cp": [
"28120"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d41165",
"nom": "Oigny",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30",
"parent": "Couëtron-au-Perche"
},
{
"id": "d61318",
"nom": "Origny-le-Butin",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"parent": "Belforêt-en-Perche"
},
{
"id": "61319",
"nom": "Origny-le-Roux",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61322",
"nom": "Parfondeval",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61309",
"nom": "Perche en Nocé",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"alias": [
"Nocé"
]
},
{
"id": "61336",
"nom": "Pouvrai",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d61337",
"nom": "Préaux-du-Perche",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Perche en Nocé"
},
{
"id": "72245",
"nom": "Préval",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "72259",
"nom": "Rouperroux-le-Coquet",
"cp": [
"72110"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61345",
"nom": "Rémalard en Perche",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15"
},
{
"id": "61348",
"nom": "Réveillon",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61116",
"nom": "Sablons sur Huisne",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15",
"alias": [
"Condé-sur-Huisne"
]
},
{
"id": "d41197",
"nom": "Saint-Agil",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30",
"parent": "Couëtron-au-Perche"
},
{
"id": "d61359",
"nom": "Saint-Agnan-sur-Erre",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Val-au-Perche"
},
{
"id": "72267",
"nom": "Saint-Aubin-des-Coudrais",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "d61368",
"nom": "Saint-Aubin-des-Grois",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Perche en Nocé"
},
{
"id": "d41202",
"nom": "Saint-Avit",
"cp": [
"41170"
],
"dep": "41",
"zone": "z30",
"parent": "Couëtron-au-Perche"
},
{
"id": "28327",
"nom": "Saint-Bomer",
"cp": [
"28330"
],
"dep": "28",
"zone": "z15"
},
{
"id": "72276",
"nom": "Saint-Cosme-en-Vairais",
"cp": [
"72110"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61379",
"nom": "Saint-Cyr-la-Rosière",
"cp": [
"61130"
],
"dep": "61",
"zone": "z15"
},
{
"id": "72277",
"nom": "Saint-Denis-des-Coudrais",
"cp": [
"72110"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28333",
"nom": "Saint-Denis-des-Puits",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61381",
"nom": "Saint-Denis-sur-Huisne",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61388",
"nom": "Saint-Fulgent-des-Ormes",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72281",
"nom": "Saint-Georges-du-Rosay",
"cp": [
"72110"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61394",
"nom": "Saint-Germain-de-la-Coudre",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61395",
"nom": "Saint-Germain-des-Grois",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15"
},
{
"id": "61405",
"nom": "Saint-Hilaire-sur-Erre",
"cp": [
"61340"
],
"dep": "61",
"zone": "z5"
},
{
"id": "28342",
"nom": "Saint-Jean-Pierre-Fixte",
"cp": [
"28400"
],
"dep": "28",
"zone": "z5"
},
{
"id": "d61409",
"nom": "Saint-Jean-de-la-Forêt",
"cp": [
"61340"
],
"dep": "61",
"zone": "z15",
"parent": "Perche en Nocé"
},
{
"id": "72292",
"nom": "Saint-Jean-des-Échelles",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61411",
"nom": "Saint-Jouin-de-Blavou",
"cp": [
"61360"
],
"dep": "61",
"zone": "z30"
},
{
"id": "61414",
"nom": "Saint-Langis-lès-Mortagne",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72296",
"nom": "Saint-Maixent",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61418",
"nom": "Saint-Mard-de-Réno",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
},
{
"id": "72302",
"nom": "Saint-Martin-des-Monts",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61426",
"nom": "Saint-Martin-du-Vieux-Bellême",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28354",
"nom": "Saint-Maurice-Saint-Germain",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61437",
"nom": "Saint-Ouen-de-la-Cour",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"parent": "Belforêt-en-Perche"
},
{
"id": "72313",
"nom": "Saint-Pierre-des-Ormes",
"cp": [
"72600"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61448",
"nom": "Saint-Pierre-la-Bruyère",
"cp": [
"61340"
],
"dep": "61",
"zone": "z5"
},
{
"id": "72322",
"nom": "Saint-Ulphace",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28362",
"nom": "Saint-Victor-de-Buthon",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "d61458",
"nom": "Saint-Victor-de-Réno",
"cp": [
"61290"
],
"dep": "61",
"zone": "z30",
"parent": "Longny les Villages"
},
{
"id": "28335",
"nom": "Saint-Éliph",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28336",
"nom": "Saint-Éman",
"cp": [
"28120"
],
"dep": "28",
"zone": "z30"
},
{
"id": "28331",
"nom": "Saintigny",
"cp": [
"28480"
],
"dep": "28",
"zone": "z15",
"alias": [
"Saint-Denis-d'Authou"
]
},
{
"id": "72331",
"nom": "Sceaux-sur-Huisne",
"cp": [
"72160"
],
"dep": "72",
"zone": "z30"
},
{
"id": "d28376",
"nom": "Soizé",
"cp": [
"28330"
],
"dep": "28",
"zone": "z30",
"parent": "Authon-du-Perche"
},
{
"id": "28378",
"nom": "Souancé-au-Perche",
"cp": [
"28400"
],
"dep": "28",
"zone": "z5"
},
{
"id": "72342",
"nom": "Souvigné-sur-Même",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "61476",
"nom": "Suré",
"cp": [
"61360"
],
"dep": "61",
"zone": "z30"
},
{
"id": "d61471",
"nom": "Sérigny",
"cp": [
"61130",
"61360",
"61400"
],
"dep": "61",
"zone": "z30",
"parent": "Belforêt-en-Perche"
},
{
"id": "28387",
"nom": "Thiron-Gardais",
"cp": [
"28480"
],
"dep": "28",
"zone": "z30"
},
{
"id": "72353",
"nom": "Théligny",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28395",
"nom": "Trizay-Coutretot-Saint-Serge",
"cp": [
"28400"
],
"dep": "28",
"zone": "z15"
},
{
"id": "28398",
"nom": "Unverre",
"cp": [
"28160"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61484",
"nom": "Val-au-Perche",
"cp": [
"61130",
"61260",
"61340"
],
"dep": "61",
"zone": "z15",
"alias": [
"Le Theil"
]
},
{
"id": "61498",
"nom": "Vaunoise",
"cp": [
"61130"
],
"dep": "61",
"zone": "z30"
},
{
"id": "28401",
"nom": "Vaupillon",
"cp": [
"28240"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61501",
"nom": "Verrières",
"cp": [
"61110"
],
"dep": "61",
"zone": "z15"
},
{
"id": "72373",
"nom": "Vibraye",
"cp": [
"72320"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28407",
"nom": "Vichères",
"cp": [
"28480"
],
"dep": "28",
"zone": "z15"
},
{
"id": "72375",
"nom": "Villaines-la-Gonais",
"cp": [
"72400"
],
"dep": "72",
"zone": "z30"
},
{
"id": "28414",
"nom": "Villebon",
"cp": [
"28190"
],
"dep": "28",
"zone": "z30"
},
{
"id": "61507",
"nom": "Villiers-sous-Mortagne",
"cp": [
"61400"
],
"dep": "61",
"zone": "z30"
}
]
