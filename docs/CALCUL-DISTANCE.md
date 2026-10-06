# Calcul du déplacement par la route (Google Maps)

## Ce que fait le site

- Le client tape son adresse sur `/reservation` (étape « Votre adresse »). Pendant la
  frappe, des propositions d'adresses s'affichent grâce à la **Base Adresse Nationale**
  (service gratuit de l'État, sans clé, via `/api/adresse`). S'il ne trouve pas son adresse,
  il peut « Utiliser l'adresse telle que tapée ».
- Le serveur demande ensuite à Google Maps (Routes API) la distance **par la route** entre
  l'atelier — place Saint-Pol, 28400 Nogent-le-Rotrou — et cette adresse (voiture, sans
  tenir compte du trafic).
- Frais de déplacement (bornes incluses, valeurs dans `config/com9.ts`) :
  0 à 5 km → 8,90 € · 5 à 15 km → 14,90 € · 15 à 30 km → 24,90 €.
  **Au-delà de 30 km, COM'9 n'intervient pas** : la demande est refusée par le serveur et
  le client voit un message clair avec les moyens de contact.
- La distance est **toujours recalculée par le serveur** au moment de la demande : une valeur
  envoyée par le navigateur est ignorée.
- Adresse reconnue seulement approximativement (ville, code postal…) : la zone est affichée
  mais marquée « à vérifier » dans l'agenda.
- Pas de clé, Google indisponible ou quota atteint : si l'adresse choisie dans les
  propositions donne sa commune, le site affiche un **déplacement estimé** d'après la liste
  indicative des communes, présenté comme une estimation que COM'9 confirmera. Sinon :
  « Déplacement à confirmer ». Rien n'est présenté comme « calculé » dans ces cas.
- Dans l'agenda, la fiche indique « X km par la route depuis l'atelier (Google Maps) ». Le
  formulaire de fiche propose « calculer depuis l'adresse ».

## Confidentialité

- L'adresse est envoyée à la Base Adresse Nationale (propositions) et à Google (calcul) ;
  une mention est visible sous le champ.
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
  Vercel sous `[COM'9 Distance]`, sans la clé. Le client, lui, voit un déplacement
  estimé ou « à confirmer ».
- Pour couper le calcul : supprimer `GOOGLE_MAPS_API_KEY` dans Vercel puis redéployer.
