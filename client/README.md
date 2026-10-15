# PassCraft Web

React 19 + Vite + TypeScript client for the PassCraft API. Use it to issue a Google Wallet pass, add it to your phone, and push a new number to it live.

- **New pass** (`/`): a form for name, label and number with a live preview of the Google Wallet card. On success it shows the official **Add to Google Wallet** button, a QR code of the save link for desktop users, and the pass ID.
- **Update** (`/passes/:id`): send a new number with `POST /passes/{id}`. The card rolls to the new value, and each update sent is listed with its time. The page also shows a ready-to-copy `curl` command.
- **My passes** (`/passes`): passes issued from this browser (kept in `localStorage`), plus a form to open any pass by its API id.
- Light and dark themes. The app follows the OS setting until you pick one with the header toggle; the choice is saved in `localStorage`.

## Run it

Requirements: Node.js 22.22+ and the PassCraft API running (see [`../server/README.md`](../server/README.md)).

```bash
cd client
cp .env.example .env.local        # VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev                       # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript only |

### Environment

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the PassCraft API, without a trailing slash. Read at build time. |

The API allows all origins when its `CORS_ORIGINS` is empty. In production, set `CORS_ORIGINS` on the API to this site's URL.

## Stack

| Concern | Library |
|---|---|
| UI | React 19, Tailwind CSS v4 (theme in `tailwind.config.js`, colours as CSS variables in `src/index.css`) |
| Components | Shadcn-style primitives in `src/components/ui` (Button, Input, Label, FormField, Card, Alert, Toaster) using `class-variance-authority` and `tailwind-merge` |
| Icons | `lucide-react` |
| Forms | `react-hook-form` and `zod` via `@hookform/resolvers/zod` |
| Server state | `@tanstack/react-query` |
| HTTP | Axios (`src/services/api.ts`) |
| Routing | `react-router` v8 (data router, lazy routes) |
| Toasts | `sonner` |
| QR codes | `qrcode.react` (pass ID on the card preview) |
| Fonts | Bricolage Grotesque (headings and the number on the pass), Instrument Sans (UI), self-hosted via Fontsource |

## Structure

```
src/
├── api/
│   └── endpoints.ts          # every backend path, in one place
├── assets/
│   └── add-to-google-wallet.svg  # official button (Google brand guidelines, unmodified)
├── components/
│   ├── layout/               # AppLayout, SiteHeader, ThemeToggle
│   ├── pass/                 # PassCard (live preview), PassStage, SaveOptions, AddToGoogleWalletButton
│   └── ui/                   # button, input, label, form-field, card, alert, copy-button, toaster
├── constants/                # config (env), pass rules, storage keys, query keys
├── context/                  # ThemeProvider + ThemeContext
├── hooks/                    # usePasses (React Query), useRecentPasses, useTheme, useAnimatedNumber, …
├── pages/                    # CreatePassPage, PassDetailPage, PassesPage, NotFoundPage
├── routes/                   # paths.ts (route constants), router.tsx
├── schemas/                  # zod schemas shared by the forms
├── services/
│   ├── api.ts                # Axios instance + error normalisation (ApiError)
│   └── passService.ts        # create / getById / updateValue
├── types/                    # Pass, request/response and API error types
└── utils/                    # cn(), number/date formatting, error messages
```

### How a request flows

`Page` → `hooks/usePasses.ts` (React Query) → `services/passService.ts` → `services/api.ts` (Axios, base URL from `VITE_API_BASE_URL`) → path from `api/endpoints.ts`.

Every failed request is converted into an `ApiError` with a status and a readable message. The UI shows field errors inline and request errors in an alert next to the form. A 404 on the update page gets its own screen, because the demo server's database resets when it redeploys.

### Validation

The zod schemas in `src/schemas/pass.schema.ts` mirror the server's DTO rules:

- `name`: 1–100 characters.
- `label`: 1–50 characters.
- `value`: a number from 0 to 1,000,000,000 with at most 2 decimals.

Required labels show a red `*`, and errors appear in red under the field once it has been touched or the form is submitted.

## CI/CD (GitHub Actions → your server)

[`.github/workflows/frontend.yml`](../.github/workflows/frontend.yml) runs only when files under `client/` (or the workflow itself) change.

| Trigger | build (lint, type-check, build) | deploy |
|---|---|---|
| Pull request to `main` | ✅ | – |
| Push to `main` / manual run | ✅, and the `dist/` output is uploaded as an artifact | ✅ |

**What deploy does:**

1. Downloads the exact `dist/` that was built and tested.
2. Connects over SSH with the host key checked: either pinned via a secret, or scanned at deploy time.
3. Runs `rsync --delay-updates --delete-delay` into `FRONTEND_DEPLOY_PATH`. New files are swapped in at the end and stale files are removed afterwards, so visitors never get a half-uploaded site.
4. Reloads Nginx.
5. Optionally purges the Cloudflare cache.
6. Smoke-tests the public URL.

### Repository settings

| Name | Kind | Required | Value |
|---|---|---|---|
| `VITE_API_BASE_URL` | variable | ✅ | Public API URL, e.g. `https://api.passcraft.example`. Baked into the bundle at build time. |
| `SERVER_HOST`, `SERVER_USERNAME`, `SERVER_SSH_KEY` | secret | ✅ | Same SSH secrets as the backend pipeline |
| `SERVER_PORT` | secret | | SSH port (default `22`) |
| `SERVER_SSH_KNOWN_HOSTS` | secret | | Output of `ssh-keyscan -H <host>`. Pins the host key instead of trusting the first scan. |
| `FRONTEND_DEPLOY_PATH` | variable | | Folder Nginx serves (default `/var/www/html/passcraft-web/dist`) |
| `RELOAD_NGINX` | variable | | Set to `false` to skip `sudo systemctl reload nginx` |
| `FRONTEND_URL` | variable | | Public site URL; if set, the job checks it serves the app |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | secret | | If both are set, the Cloudflare cache is purged. Use an API token with *Zone → Cache Purge* permission. |

**On the server:**

- The SSH user needs write access to `FRONTEND_DEPLOY_PATH`. For example: `sudo mkdir -p /var/www/html/passcraft-web/dist && sudo chown -R <user> /var/www/html/passcraft-web`.
- The SSH user needs passwordless sudo for the Nginx reload only, e.g. in `/etc/sudoers.d/deploy`:

  ```
  <user> ALL=(root) NOPASSWD: /usr/bin/systemctl reload nginx
  ```

- Add the site's URL to the API's `CORS_ORIGINS`.

### Nginx site config

The app is a single-page app, so unknown paths must fall back to `index.html`. Hashed assets can be cached forever; `index.html` must not be cached:

```nginx
server {
    listen 80;
    server_name passcraft.example.com;
    root /var/www/html/passcraft-web/dist;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /index.html;
    }
}
```

## Deploy (Render static site)

The CI/CD pipeline above is the main deployment path. As an alternative, `render.yaml` in the repo root defines `passcraft-web` as a Render static site with an SPA rewrite:

1. Set `VITE_API_BASE_URL` to the API URL, e.g. `https://passcraft-api.onrender.com`.
2. Add the site URL to the API's `CORS_ORIGINS`.
3. Optionally add it to `WALLET_ORIGINS` too, so the save JWT lists the origin that shows the button.
