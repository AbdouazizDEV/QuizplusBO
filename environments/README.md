# Environnements (`environments/`)

Les variables `VITE_*` sont chargées depuis ce dossier (voir `envDir` dans `vite.config.ts`).

## Fichiers

| Fichier                       | Versionné ? | Rôle |
| ----------------------------- | ----------- | ---- |
| `.env.example`                | ✅ oui       | Template du `.env` (variables communes, souvent vide). |
| `.env.development.example`    | ✅ oui       | Template pour le mode `development` (backend local). |
| `.env.production.example`     | ✅ oui       | Template pour le mode `production` (backend Render). |
| `.env`                        | ❌ non       | **Local uniquement** — variables communes à tous les modes. |
| `.env.development`            | ❌ non       | **Local uniquement** — chargé par `npm run dev`. |
| `.env.production`             | ❌ non       | **Local uniquement** — chargé par `npm run build` / `npm run dev:prod`. |
| `.env.*.local`                | ❌ non       | **Local uniquement** — overrides personnels. |

> ⚠️ **Aucun secret ne doit être committé.** Les fichiers `.env`, `.env.development` et `.env.production` sont ignorés par Git. En production (Vercel), définissez les variables dans **Project Settings → Environment Variables**.

## Première installation

```bash
cp environments/.env.example              environments/.env
cp environments/.env.development.example  environments/.env.development
cp environments/.env.production.example   environments/.env.production
```

Puis ouvrez chaque fichier copié et remplissez les valeurs (clé API, identifiants admin).

## Basculer entre local et production

### Travailler contre le backend local (défaut)

```bash
npm run dev
```

Charge `environments/.env.development` → API `http://localhost:3000/api/v1/backoffice`.

### Tester l'UI contre l'API **production** (Render) tout en gardant le serveur Vite local

```bash
npm run dev:prod
```

Vite démarre en mode `production` : les URLs viennent de `environments/.env.production`.

### Build pour déploiement

```bash
npm run build
```

Charge `environments/.env.production`. **Sur Vercel**, définissez les mêmes variables `VITE_*` dans l'interface « Environment Variables » du projet (scope `Production`).

## URL de base API

`VITE_API_BASE_URL` doit **toujours** se terminer par `/api/v1/backoffice` (préfixe des routes documentées dans `BACKOFFICE_ENDPOINTS.md`).

- Local : `http://localhost:3000/api/v1/backoffice`
- Render : `https://quizzplus-api.onrender.com/api/v1/backoffice`
