# COM'9 — Sécurité des connexions et procédure de déblocage

Ce document décrit comment les connexions sont protégées et comment débloquer un accès
**sans jamais désactiver la protection**. Aucun mot de passe ne doit être écrit ici.

## 1. Ce qui est protégé

| Accès | Adresse | Mot de passe (variable Vercel) |
|---|---|---|
| Espace COM'9 (agenda) | `/login` → `/responsable/agenda` | `ADMIN_PASSWORD` |

Le diagnostic premium payant a été supprimé lors de la refonte (remplacé par le
pré-diagnostic gratuit du parcours « Autre problème »). La variable `DIAGNOSTIC_PASSWORD`
n'est plus lue par le site : elle peut être retirée de Vercel.

Les mots de passe ne sont jamais dans le code. Ils sont vérifiés côté serveur.

## 2. Comment fonctionne la limitation

Chaque essai est enregistré dans la base Postgres (table `auth_attempts`), partagée par
toutes les instances Vercel et conservée après un redémarrage. Seule une empreinte non
réversible de l'adresse IP est stockée, effacée après 2 jours.

Deux compteurs **indépendants** (fenêtre glissante de 15 minutes) :

| Compteur | Limite par source | Limite globale |
|---|---|---|
| `responsable` — appareil inconnu | 5 échecs par adresse | 50 échecs, toutes adresses |
| `responsable-appareil` — vos appareils habituels | 5 échecs par appareil | **aucune** |

Conséquences :

- **Une attaque répartie sur l'espace responsable ne vous bloque pas sur vos appareils
  habituels** : après une connexion réussie, l'appareil reçoit un cookie signé
  (`com9_appareil`, 180 jours, envoyé uniquement aux routes de connexion). Il ne donne
  aucun accès ; il sert seulement à compter vos essais à part. Changer `ADMIN_PASSWORD`
  annule tous ces cookies.
- Une connexion réussie remet à zéro le compteur de sa source.
- Si la base est indisponible, la connexion est **refusée** (jamais ouverte sans contrôle).

## 3. Débloquer — du plus simple au plus exceptionnel

### a) Attendre
Un blocage se lève seul dès que les échecs comptés ont plus de 15 minutes. Tant qu'une
attaque continue, la suspension globale des appareils inconnus continue aussi : passez à b).

### b) Depuis un appareil habituel (cas normal)
Connectez-vous depuis le téléphone ou l'ordinateur que vous utilisez d'habitude : il
n'est pas concerné par le blocage global. Puis :
**Agenda → Réglages (icône) → Sécurité des connexions** :

- l'état de chaque compteur (nombre d'échecs, sources bloquées, suspension globale) ;
- **Débloquer l'espace responsable** : efface les échecs enregistrés.

### c) Sans appareil habituel, pendant une attaque (urgence)
Seule une personne ayant accès au compte Vercel (protégé par sa double authentification)
peut le faire :

1. Vercel → projet **com9-site-officiel** → **Storage** → base Neon → ouvrir la console
   (« Open in Neon ») → **SQL Editor**.
2. Vérifier l'état :
   ```sql
   SELECT scope, COUNT(*) AS echecs
   FROM auth_attempts
   WHERE outcome = 'echec' AND at > NOW() - INTERVAL '15 minutes'
   GROUP BY scope;
   ```
3. Débloquer l'espace :
   ```sql
   DELETE FROM auth_attempts
   WHERE scope IN ('responsable', 'responsable-appareil') AND outcome = 'echec';
   ```
4. Se connecter aussitôt : l'appareil devient « habituel » pour la suite.

### d) Si un mot de passe a pu fuiter
Ne débloquez pas : **changez le mot de passe** dans Vercel (Settings → Environment
Variables), puis **Redeploy**. Pour `ADMIN_PASSWORD`, cela déconnecte toutes les sessions
et annule les appareils habituels ; reconnectez-vous ensuite depuis vos appareils.

## 4. Ce qu'il ne faut jamais faire

- Désactiver ou contourner la limitation (aucune variable ne le permet, volontairement).
- Écrire un mot de passe dans le code, dans ce document ou dans un message.
- Partager l'accès à la console Neon ou au compte Vercel.

## 5. Protection supplémentaire possible (facultative)

Vercel propose un pare-feu (Firewall) avec des règles de limitation de débit. Une règle
sur `/api/auth/login` arrêterait les rafales avant même
qu'elles n'atteignent le site. À configurer dans Vercel → Firewall, selon votre offre.
