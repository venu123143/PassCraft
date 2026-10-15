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

## Deploy (Render static site)

`render.yaml` in the repo root defines `passcraft-web` as a static site with an SPA rewrite.

1. Set `VITE_API_BASE_URL` to the API URL, e.g. `https://passcraft-api.onrender.com`.
2. Add the site URL to the API's `CORS_ORIGINS`.
3. Optionally add it to `WALLET_ORIGINS` too, so the save JWT lists the origin that shows the button.
