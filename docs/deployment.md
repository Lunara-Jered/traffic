# Guide de déploiement

## Préparation

1. Provisionner PostgreSQL managé, Redis privé, un bucket objet privé et un CDN HLS dont l’URL d’origine n’est pas publique.
2. Installer les secrets avec le gestionnaire de secrets de la plateforme. Générer des valeurs aléatoires séparées pour `JWT_ACCESS_SECRET` et `CDN_SIGNING_SECRET`; ne pas employer les valeurs Compose locales.
3. Créer les produits et tarifs Standard/Premium dans Stripe, configurer l’URL de retour HTTPS et enregistrer le webhook Stripe avec son secret dédié.
4. Renseigner `APP_URL`, `DATABASE_URL`, `REDIS_URL`, les variables Stripe et `CDN_BASE_URL` dans l’environnement du service.

## Déploiement

- **Vercel** : déployer le workspace Next.js depuis le dépôt monorepo, configurer la racine de build sur `apps/web` et exposer le client Prisma généré pendant le build. Pour une configuration de workspace Vercel différente, vérifier que le paquet `@streamflix/database` et le schéma sont accessibles au build.
- **Railway/Render ou conteneur** : construire `apps/web/Dockerfile`, ne publier que le port applicatif et placer PostgreSQL/Redis dans le réseau privé. `docker compose --profile full up --build` sert uniquement à valider une instance locale.
- Avant de basculer le trafic, lancer `npm ci`, `npm run db:generate`, `npm run typecheck`, `npm test`, `npm run build`, puis `npm run db:deploy` une seule fois comme tâche de release. Le démarrage Compose applique les migrations automatiquement; désactiver cette responsabilité si plusieurs réplicas démarrent simultanément.

## Contrôles de mise en production

- Configurer le reverse proxy pour écraser `X-Real-IP`; l’IP sert au rate limiting. Redis doit être redondant, privé et surveillé.
- Placer TLS devant l’application; les cookies passent automatiquement à `Secure` en mode production. Vérifier la politique CSP, HSTS, les sauvegardes et la restauration PostgreSQL.
- Faire vérifier les jetons de lecture au CDN, limiter leur durée et leur audience, interdire l’accès public au bucket, et tester révocation/expiration et contrôle du niveau Premium.
- Tester les événements Stripe de bout en bout en mode test avant d’utiliser des identifiants de production.
- Définir un responsable légal pour traiter les signalements, une politique de rétention/suppression RGPD, l’information sur les cookies et un point de contact DMCA.
- Ajouter métriques, alertes, traces, journaux sans secrets, tests de charge, limites de connexions DB et politique de rotation des clés avant d’ouvrir le service à grande échelle.

## Retour arrière

Déployer une version applicative précédente sans supprimer les migrations appliquées. Préférer des migrations Prisma compatibles en expansion/contraction et effectuer une sauvegarde PostgreSQL avant toute évolution destructive.