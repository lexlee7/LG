# Veridicte

Veridicte est une plateforme web responsive qui affiche un indice de fiabilite de personnalites publiques a partir de faits, de votes visiteurs anonymes et d'un veto administrateur.

## Fonctionnalites

- accueil moderne avec cartes, classements, sections "on fire" et contenus mis en avant
- fiches personnalites avec score agrege et liste de faits associes
- fiches faits avec barre de repartition des votes et vote visiteur anonyme
- limitation de vote par cookie + IP + user-agent sur une fenetre glissante
- espace admin protege par mot de passe
- veto admin possible pour forcer un fait a `vrai`, `faux` ou `inverifiable`
- mise en avant de personnalites et de faits sur la page d'accueil
- creation de nouvelles personnalites et de nouveaux faits depuis l'admin
- mode demo en memoire si aucune base n'est configuree
- mode production avec PostgreSQL via `DATABASE_URL`

## Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL via le package `postgres`

## Demarrage local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Variables d'environnement

Voir `.env.example`.

- `ADMIN_PASSWORD` : mot de passe de l'espace admin
- `ADMIN_COOKIE_SECRET` : secret pour signer le cookie admin
- `VOTER_SALT` : sel utilise pour anonymiser les empreintes visiteur
- `DATABASE_URL` : URL PostgreSQL Render
- `VOTE_COOLDOWN_HOURS` : delai de limitation d'un vote par fait

## Deploiement cible

### Base PostgreSQL sur Render

1. Creer une base PostgreSQL sur Render.
2. Recuperer la `DATABASE_URL`.
3. Ajouter cette variable dans Vercel.

Le schema est initialise automatiquement au premier lancement.

### Front sur Vercel

1. Importer le repository GitHub dans Vercel.
2. Framework detecte : Next.js.
3. Renseigner les variables :
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `ADMIN_COOKIE_SECRET`
   - `VOTER_SALT`
   - `VOTE_COOLDOWN_HOURS`
4. Deployer.

## Acces admin

- URL : `/admin`
- authentification : mot de passe simple + cookie HTTP only signe

## Notes de production

- sans `DATABASE_URL`, les donnees restent en mode demonstration en memoire et ne survivent pas aux redemarrages
- pour une vraie production, configurez obligatoirement PostgreSQL sur Render
- le vote anonyme est limite de maniere pragmatique, mais ne remplace pas un systeme antifraude avance
