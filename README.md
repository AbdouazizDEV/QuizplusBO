# Quizz+ Backoffice

Console d'administration React/TypeScript premium pour la plateforme **Quizz+**. Pilotez le catalogue (niveaux, catégories, quiz, questions), animez la communauté (défis, compétitions, notifications), et modérez les profils — le tout via les endpoints `/api/v1/backoffice` du backend NestJS Quizz+.

> Identité visuelle alignée avec l'app mobile Quizz+ : palette `#E8431A → #F5A623 → #FFD166`, typographie Nunito.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts](#scripts)
- [Architecture (SOLID / hexagonale)](#architecture-solid--hexagonale)
- [Mapping pages ↔ endpoints](#mapping-pages--endpoints)
- [Conventions de code](#conventions-de-code)
- [Tests](#tests)
- [Build & déploiement](#build--déploiement)

---

## Stack technique

- **Framework** : Vite + React 18 + TypeScript (strict)
- **Routing** : React Router v6 (lazy-loaded)
- **Data fetching / cache** : TanStack Query v5 (+ devtools en dev)
- **Forms** : React Hook Form + Zod
- **State global** : Zustand (uniquement pour l'auth — TanStack Query gère le reste)
- **UI** : Tailwind CSS 3 + design tokens HSL + composants maison
- **Toasts** : Sonner
- **Icônes** : lucide-react
- **Tests** : Vitest + Testing Library + jsdom
- **Lint/format** : ESLint flat config + Prettier

## Démarrage rapide

Prérequis : Node.js ≥ 20, npm ≥ 10.

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditez .env pour pointer vers votre backend

# 3. Lancer le dev server
npm run dev
# -> http://localhost:5173
```

Le backend NestJS Quizz+ doit être accessible (`/api/v1/backoffice`). En local, il est généralement servi sur `http://localhost:3000`.

## Variables d'environnement

Toutes les variables sont préfixées par `VITE_` (Vite n'expose que celles-là côté client).

| Variable                  | Obligatoire | Description                                                                                       |
| ------------------------- | :---------: | ------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`       |     ✅      | URL de base **incluant** `/api/v1/backoffice`. Ex. `http://localhost:3000/api/v1/backoffice`.     |
| `VITE_BACKOFFICE_API_KEY` |     ❌      | Clé API par défaut (header `x-api-key`). Peut être saisie à l'écran de login pour la persister.   |
| `VITE_DEV_TOOLS`          |     ❌      | `true` pour activer React Query Devtools.                                                          |

> **Sécurité** : la clé API saisie au login est stockée dans `localStorage`. Pour un usage production, préférez un proxy backend (ex. Next.js / Cloudflare Worker) qui injecte la clé côté serveur — ce backoffice est déjà conçu pour fonctionner sans clé en local quand le backend la rend optionnelle.

## Scripts

| Script              | Action                                                                |
| ------------------- | --------------------------------------------------------------------- |
| `npm run dev`       | Serveur de dev (HMR) sur `http://localhost:5173`                      |
| `npm run build`     | Typecheck + build production dans `dist/`                             |
| `npm run preview`   | Preview du build production                                           |
| `npm run typecheck` | `tsc --noEmit`                                                        |
| `npm run lint`      | ESLint                                                                |
| `npm run format`    | Prettier                                                              |
| `npm run test`      | Tests unitaires + composants                                          |
| `npm run ci`        | Pipeline complet (typecheck + lint + tests + build)                   |

## Architecture (SOLID / hexagonale)

Le projet est organisé en **4 couches** isolées par dépendance unidirectionnelle :

```
src/
├── domain/           # Cœur métier (zéro dépendance externe)
│   ├── entities/     # Types des ressources (Quiz, Question, Profile…)
│   ├── errors/       # ApiError + payloads
│   └── ports/        # Interfaces des repositories (contrats)
│
├── application/      # Use-cases : hooks TanStack Query
│   ├── auth/         # auth-store (Zustand) + validateApiKey
│   ├── levels/       # useLevelsQuery, useCreateLevel…
│   ├── … (un dossier par ressource)
│   └── query-keys.ts # Clés de cache centralisées
│
├── infrastructure/   # Adaptateurs externes
│   ├── config/       # Env (VITE_*)
│   ├── http/         # ApiClient + endpoints + error-mapper
│   ├── repositories/ # Implémentations HTTP des ports domain/
│   └── storage/      # localStorage (clé API)
│
└── presentation/     # UI React
    ├── components/
    │   ├── ui/       # Primitives : Button, Input, Card, Badge, Modal, Switch…
    │   ├── data/     # DataTable, Pagination, PageHeader
    │   ├── feedback/ # Toaster, ConfirmDialog, EmptyState, ErrorState, PageLoader
    │   └── layout/   # AppShell, Sidebar, Header, Logo
    ├── hooks/
    ├── pages/        # Une feuille par module (login, dashboard, levels…)
    ├── routes/       # AppRouter, PrivateRoute
    └── theme/        # ThemeProvider (light/dark)
```

### Application des principes SOLID

- **S** — Chaque module a une responsabilité unique : un repo HTTP **ne fait que** parler au backend ; un hook React Query **ne fait que** orchestrer le cache.
- **O** — Ajouter une ressource = créer une entité + un port + une implémentation HTTP + un hook + une page, **sans modifier** le client API ni les pages existantes.
- **L** — Toute implémentation de port (`HttpLevelsRepository` etc.) est strictement substituable à son interface `LevelsRepository`. On peut donc swap pour un mock en test ou un repo offline.
- **I** — Les ports sont segmentés par ressource (`QuizzesRepository`, `ProfilesRepository`…) plutôt qu'un méga-port `ApiRepository`.
- **D** — Les pages dépendent uniquement des hooks `application/`, qui dépendent uniquement des ports `domain/`. La couche HTTP peut être remplacée sans toucher à la UI.

### Flux d'une mutation typique

```
[Page] → useCreateQuiz() → quizzesRepository.create() → apiClient.post()
                                                              ↓
                                          mapHttpError() en cas de 4xx/5xx
                                                              ↓
[ApiError] → toastApiError() → toast.error() avec fieldErrors
                ↑
        [Page] catch
```

## Mapping pages ↔ endpoints

| Module             | Page(s)                              | Endpoints backend                                                                                                                                                |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**           | `/login`                             | `GET /levels` (probe de validité de la clé API)                                                                                                                  |
| **Dashboard**      | `/`                                  | Lectures agrégées de plusieurs ressources (quizzes, profiles, challenges, competitions, levels, categories)                                                      |
| **Niveaux**        | `/levels`                            | `GET/POST/PUT/DELETE /levels`                                                                                                                                    |
| **Catégories**     | `/categories`                        | `GET/POST/PUT/DELETE /categories`                                                                                                                                |
| **Sous-catégories**| `/subcategories`                     | `GET/POST/PUT/DELETE /subcategories` (filtre `?category_id`)                                                                                                     |
| **Quiz**           | `/quizzes`, `/quizzes/:id`           | `GET/POST/PUT/DELETE /quizzes` + `POST /quizzes/import` + `POST /quizzes/:quizId/import`                                                                         |
| **Questions**      | `/quizzes/:id` (onglet questions)    | `GET /quizzes/:quizId/questions` + `POST/PUT/DELETE /questions/...`                                                                                              |
| **Défis**          | `/challenges`                        | `GET/POST/PUT/DELETE /challenges`                                                                                                                                |
| **Compétitions**   | `/competitions`                      | `GET/POST/PUT/DELETE /competitions`                                                                                                                              |
| **Profils**        | `/profiles`, `/profiles/:id`         | `GET /profiles`, `GET /profiles/:id`, `PATCH /profiles/:id/suspend`                                                                                              |
| **Notifications**  | `/notifications`                     | `POST /notifications/send`, `POST /notifications/broadcast`                                                                                                      |
| **Upload média**   | `/media`                             | `POST /media/upload-image` (base64)                                                                                                                              |

## Conventions de code

- Imports alias : `@/*`, `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@shared/*`.
- **Pas d'appel `fetch` direct** dans les composants : passer par les hooks `application/` qui consomment les `repositories/`.
- **Erreurs** : toujours `try/catch` autour des `mutateAsync` et utiliser `toastApiError` pour mapper les `fieldErrors` Zod du backend.
- **Tables** : utiliser `<DataTable>` (gère skeletons, EmptyState, ErrorState).
- **Confirmation de suppression** : utiliser `<ConfirmDialog destructive />`.
- **Invalidation cache** : se faire dans le hook (`onSuccess`), pas dans la page, pour rester DRY.
- **Forms** : RHF + Zod (`zodResolver`). Mapper les erreurs backend via `setError` quand pertinent.
- **A11y** : tous les boutons icône-seule ont un `aria-label`. Focus visible activé globalement.

## Tests

Couverts a minima :
- `api-client` (mock fetch, headers, mapping erreurs)
- `error-mapper`
- `auth-store`
- `format` (slugify/truncate/formatNumber)
- `<Button />` (composant clé)
- `<PrivateRoute />` (smoke navigation)

```bash
npm test               # run once
npm run test:watch     # watch mode
npm run test:coverage  # avec couverture
```

## Build & déploiement

```bash
npm run build  # génère dist/
npm run preview
```

Le backoffice est une SPA statique : déployable sur Vercel, Netlify, Cloudflare Pages, S3+CloudFront, ou tout reverse-proxy (Nginx) capable de servir un fichier `index.html` en fallback (history mode).

Exemple Nginx :

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

Réalisé avec ❤️ pour Quizz+.
