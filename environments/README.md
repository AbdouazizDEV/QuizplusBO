# Environnements (`environments/`)

Les variables `VITE_*` sont chargées depuis ce dossier (voir `envDir` dans `vite.config.ts`).

## Fichiers

| Fichier               | Quand il est utilisé | Rôle |
| --------------------- | -------------------- | ---- |
| `.env`                | Toujours en premier (optionnel) | Valeurs communes ; peut rester vide. |
| `.env.development`    | `npm run dev`        | Backend **local** (`localhost:3000`). |
| `.env.production`     | `npm run build`      | Backend **Render** + build optimisé. |
| `.env.*.local`        | Si présent           | **Non versionné** — secrets (clé API, mots de passe). |

## Basculer entre local et production

### Travailler contre le backend local (défaut)

```bash
npm run dev
```

### Tester l’UI contre l’API **production** (Render) tout en gardant le serveur Vite local

```bash
npm run dev:prod
```

Cela lance Vite en mode `production` : les URLs viennent de `environments/.env.production`.  
Pour vos secrets (clé API, login admin), créez **`environments/.env.production.local`** (copié depuis `.env.production`, puis rempli) — ce fichier est ignoré par Git.

### Build pour déploiement

```bash
npm run build
```

Charge `environments/.env.production`. Sur Render / Vercel / GitHub Actions, définissez les mêmes variables `VITE_*` dans l’interface « Environment » du service.

## URL de base API

`VITE_API_BASE_URL` doit **toujours** se terminer par `/api/v1/backoffice` (préfixe des routes documentées dans `BACKOFFICE_ENDPOINTS.md`).

- Local : `http://localhost:3000/api/v1/backoffice`
- Render : `https://quizzplus-api.onrender.com/api/v1/backoffice`
