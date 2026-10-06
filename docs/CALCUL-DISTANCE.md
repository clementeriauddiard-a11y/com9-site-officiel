# Calcul du déplacement par la route (Google Maps)

## Ce que fait le site

- Le client tape son adresse complète sur `/reservation`. Le serveur demande à Google Maps
  (Routes API) la distance **par la route** entre l'atelier — place Saint-Pol, 28400
  Nogent-le-Rotrou — et cette adresse (voiture, sans tenir compte du trafic).
- La zone et le prix du déplacement en découlent : jusqu'à 5 km → 9 €, jusqu'à 15 km → 15 €,
  jusqu'à 30 km → 25 €, au-delà → sur devis (bornes incluses).
- La distance est **toujours recalculée par le serveur** au moment de la demande : une valeur
  envoyée par le navigateur est ignorée.
- Adresse reconnue seulement approximativement (ville, code postal…) : la zone est affichée
  mais marquée « à vérifier » dans l'agenda.
- Pas de clé, Google indisponible ou quota atteint : le formulaire repasse sur la liste des
  communes validée par COM'9. Rien n'est présenté comme « calculé » dans ce cas.
- Dans l'agenda, la fiche indique « X km par la route depuis l'atelier (Google Maps) ». Le
  formulaire de fiche propose « calculer depuis l'adresse ».

## Confidentialité

- L'adresse est envoyée à Google pour le calcul (mention visible sous le champ).
- Le cache `distance_cache` ne garde qu'une empreinte de l'adresse et la distance (90 jours),
  jamais l'adresse elle-même.
- La clé reste côté serveur (en-tête `X-Goog-Api-Key`), jamais envoyée au navigateur.

## Mise en place (une seule fois)

1. Google Cloud Console → créer un projet (ex. « COM9 site »).
2. Facturation → associer un compte de facturation (carte bancaire demandée par Google).
3. API et services → Bibliothèque → activer **Routes API**.
4. API et services → Identifiants → **Créer une clé API**, puis la restreindre :
   - Restrictions relatives aux API → uniquement **Routes API**.
   - (Pas de restriction « sites web » : l'appel part du serveur Vercel, pas du navigateur.)
5. Facultatif mais conseillé : Facturation → Budgets et alertes → alerte à 1 €.
6. Vercel → projet com9-site-officiel → Settings → Environment Variables :
   `GOOGLE_MAPS_API_KEY` = la clé, environnement **Production** (et Preview si besoin).
7. Redéployer : la page `/reservation` lit la présence de la clé au moment de la construction.

## Coûts et limites

- Google : 10 000 calculs « Compute Routes Essentials » gratuits par mois, puis environ
  5 $ les 1 000 (tarif Google en vigueur à vérifier sur leur page de tarifs).
- Le site limite : 10 calculs / 10 min et 40 / jour par source, 300 / jour pour tout le site
  (≈ 9 000 / mois maximum). Une même adresse déjà calculée ne déclenche pas de nouvel appel.

## En cas de problème

- Les erreurs Google (clé refusée, facturation inactive…) apparaissent dans les journaux
  Vercel sous `[COM'9 Distance]`, sans la clé. Le client, lui, voit simplement la liste
  des communes.
- Pour couper le calcul : supprimer `GOOGLE_MAPS_API_KEY` dans Vercel puis redéployer.
