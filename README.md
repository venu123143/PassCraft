# PassCraft

Issue a digital pass to **Google Wallet** and update it live on the phone.

| Folder | What |
|---|---|
| [`server/`](server/README.md) | NestJS API. Creates passes, signs "Add to Google Wallet" links and pushes live updates. Swagger at `/docs`. |
| [`client/`](client/README.md) | React 19 + Vite web app with a form for the pass, the Add to Google Wallet button, and a page to update the number. |

## Quick start

```bash
# 1. API (needs Google Wallet credentials: see server/README.md)
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev                 # http://localhost:3000/docs

# 2. Web app (in another terminal)
cd client
cp .env.example .env.local
npm install
npm run dev                       # http://localhost:5173
```

Open http://localhost:5173 and create a pass. Tap **Add to Google Wallet** on an Android phone, or scan the QR code shown on a computer. Then open **Update the number** and send a new value. The pass on the phone updates without being re-added.

## Deploy

GitHub Actions deploys both apps to your own server when you push to `main`:

| Workflow | What it does |
|---|---|
| [`backend.yml`](.github/workflows/backend.yml) | Tests, then builds a multi-arch Docker image, pushes it to GHCR, and runs it on the server (`docker compose pull`, migrate, restart, health check) |
| [`frontend.yml`](.github/workflows/frontend.yml) | Lints and builds, then rsyncs `dist/` to the server and reloads Nginx |

Pull requests only run the checks. The required secrets and variables, the server's compose file and the Nginx config are in [server/README.md](server/README.md#cicd-github-actions--ghcr--your-server) and [client/README.md](client/README.md#cicd-github-actions--your-server).

[`render.yaml`](render.yaml) is an alternative: a Render Blueprint for both services.
