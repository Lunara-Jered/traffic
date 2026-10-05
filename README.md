# StreamFlix

Prototype full-stack d’une plateforme vidéo, organisé en workspace npm. L’application Next.js fournit un accueil éditorial, un catalogue filtrable, des fiches de contenu, un guide EPG fictif, un lecteur HLS de démonstration, un compte à profils, des API d’authentification, Stripe et des signalements de droits.

## Démarrage local

Prérequis : Node.js 22+, npm 10+ et Docker Compose.

```bash
cp .env.example .env
docker compose up -d postgres redis
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

L’application est disponible sur `http://localhost:3000`. Avant un déploiement, remplacez les secrets de `.env` par des valeurs aléatoires distinctes d’au moins 32 caractères. La base de développement Docker utilise des identifiants fixes et ne doit pas être exposée sur Internet.

Pour lancer l’ensemble des conteneurs, y compris le frontend de production :

```bash
docker compose --profile full up --build
```

Le conteneur web attend PostgreSQL et Redis, applique les migrations puis démarre Next.js en mode production. Les mots de passe, identifiants Stripe et clés CDN de démonstration ne sont pas fournis.

## Commandes

| Commande | Usage |
| --- | --- |
| `npm run dev` | Serveur local Next.js |
| `npm run build` | Build optimisé |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests navigateur Playwright Chromium |
| `npm run db:generate` | Génération du client Prisma |
| `npm run db:migrate` | Migration locale en développement |
| `npm run db:deploy` | Application des migrations déployées |
| `npm run db:seed` | Seed idempotent des genres de démonstration |

## Architecture

- `apps/web` : Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, TanStack Query et HLS.js.
- `packages/database` : schéma PostgreSQL/Prisma, migration initiale et seed.
- `docs/openapi.yaml` : contrat des API REST.
- `.github/workflows/ci.yml` : typecheck, tests, build et parcours navigateur.
- `docker-compose.yml` : PostgreSQL, Redis et profil frontend `full`.

Les routes sont regroupées dans Next.js (`apps/web/app/api`). Les principales surfaces sont `api/auth`, `api/account`, `api/profiles`, `api/billing`, `api/video` et `api/rights`.

## Configuration des intégrations

Voir [.env.example](.env.example). Pour Stripe, créez des Price IDs récurrents dans Stripe Test mode, renseignez `STRIPE_SECRET_KEY`, les deux `STRIPE_PRICE_*`, puis `STRIPE_WEBHOOK_SECRET`. Le webhook à déclarer est `POST /api/billing/webhook`; activez `checkout.session.completed`, `customer.subscription.updated` et `customer.subscription.deleted`. Le checkout et le portail de facturation restent désactivés tant que ces paramètres ne sont pas renseignés.

Pour la vidéo, `CDN_BASE_URL` et `CDN_SIGNING_SECRET` servent à émettre des URL d’assets prêts, avec un jeton de cinq minutes. Le CDN ou son worker doit impérativement vérifier la signature HS256, l’audience `streamflix-cdn`, l’expiration et la clé d’asset. La création de ce vérificateur côté CDN, le stockage objet, FFmpeg, les files BullMQ, les sous-titres éditoriaux et le DRM ne sont pas inclus.

## Sécurité et droits

- Mots de passe bcrypt (coût 12), validation d’entrée, cookies `HttpOnly`, `SameSite=Lax`, JWT d’accès de 15 minutes et refresh tokens aléatoires à rotation atomique stockés en SHA-256.
- Les limites d’authentification sont Redis en production; sans Redis, les routes sensibles échouent en mode fermé. En développement, le repli mémoire ne convient pas à plusieurs instances.
- Les rapports reçus sont sauvegardés dans `RightsReport`, limités à trois par heure et munis d’un consentement de contact. Une procédure de réponse, une boîte de réception, des délais légaux et une purge RGPD doivent être définis avant le lancement.
- Le catalogue, le guide EPG et les images sont des exemples éditoriaux; ils ne constituent ni un catalogue sous licence ni une autorisation de diffusion. Le lecteur lit uniquement le flux public de test HLS.js/Mux. N’ajoutez jamais de programme protégé sans contrat de distribution et métadonnées de droits.
- L’endpoint signé ne protège réellement les médias que si l’origine/CDN vérifie le jeton. Ne publiez jamais les clés de stockage directement.

## Périmètre à compléter avant la production

OAuth Google/Apple, 2FA, contrôles parentaux appliqués au playback, téléchargement/PWA hors ligne, DRM, commentaires/chat live, transcodage FFmpeg/BullMQ, intégration de vrais catalogues et EPG licenciés, suivi de progression persistant, vues admin/modérateur, monitoring Sentry/Grafana, purge RGPD automatisée, rapports DMCA traités par un opérateur et tests e2e sur navigateur mobile/TV ne sont pas implémentés. Voir [le guide de déploiement](docs/deployment.md) pour les contrôles de sortie.