# Animal Talk

Animal Talk is a playful web app that lets you "listen" to pet sounds and
play back animal vocalizations. It ships as a React + Vite frontend served by
an Express server in development and production.

## What it does
- Listen mode uses lightweight, rule-based microphone analysis with a simulated fallback.
- Say mode plays synthesized animal sounds using the Web Audio API.
- Switch between guinea pig, cat, and dog sound libraries.
- Toggle English/Chinese UI text.

## Tech stack
- Frontend: React 19, Vite 7, Tailwind CSS, Framer Motion, Wouter
- Backend: Express 5 (serves API + client), TypeScript
- Optional data layer: Drizzle ORM + PostgreSQL (schema only; not wired in)

## Project layout
- `client/`: React app (pages, components, styles)
- `server/`: Express server, Vite dev middleware, static serving
- `shared/`: shared types and schema
- `script/build.ts`: build pipeline (Vite + esbuild)
- `attached_assets/`: mascot imagery

## Third-party assets
- `attached_assets/guinea-pigs-cc0.mp3` from Freesound (CC0): https://freesound.org/people/Breviceps/sounds/540477/
- `attached_assets/cat-meow-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/qubodup/sounds/813119/
- `attached_assets/cat-meow-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/qubodup/sounds/813113/
- `attached_assets/cat-purr-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/rareguy27/sounds/690620/
- `attached_assets/cat-purr-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/soundofsong/sounds/650575/
- `attached_assets/dog-bark-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/qubodup/sounds/813120/
- `attached_assets/dog-bark-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/MWF77/sounds/788196/
- `attached_assets/dog-whine-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/Breviceps/sounds/462660/
- `attached_assets/dog-whine-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/T_saurus/sounds/742053/
- `attached_assets/dog-howl-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/simcotter/sounds/115357/
- `attached_assets/dog-howl-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/chris5s/sounds/835850/
- `attached_assets/dog-pant-1-cc0.mp3` from Freesound (CC0): https://freesound.org/people/PanFlutist/sounds/724909/
- `attached_assets/dog-pant-2-cc0.mp3` from Freesound (CC0): https://freesound.org/people/qubodup/sounds/827433/

## Requirements
- Node.js 20+
- npm 9+ (comes with Node)
- Optional: PostgreSQL 16+ for Drizzle migrations

## Setup
```bash
npm install
```

## Run locally
```bash
npm run dev
```

The app serves on `http://localhost:5000`. The Express server and the Vite
frontend are combined on the same port in development.

### Frontend-only dev
```bash
npm run dev:client
```

This runs Vite directly. Use it only if you do not need the Express server.

## Build and run production
```bash
npm run build
npm start
```

`npm run build` outputs:
- client assets to `dist/public`
- server bundle to `dist/index.cjs`

`npm start` runs the bundled server and serves the built client.

## Environment variables
- `PORT`: server port (defaults to `5000`)
- `DATABASE_URL`: PostgreSQL connection string (required only for Drizzle)

## Database notes (optional)
The schema exists in `shared/schema.ts` and `drizzle.config.ts`, but the server
currently uses in-memory storage. To push schema changes to a database:
```bash
npm run db:push
```

You will need `DATABASE_URL` set before running the command.

## Deployment
### Option 1: Node server (fullstack)
1. Build the project:
   ```bash
   npm run build
   ```
2. Run the server:
   ```bash
   PORT=5000 npm start
   ```

This serves both the API (if you add routes) and the client.

### Option 2: Static hosting (frontend only)
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy `dist/public` to any static host (Netlify, Vercel static, S3, etc).

Static hosting is enough for the current app because there are no API routes
yet. If you add `/api` routes, use the Node server deployment instead.

### Option 3: EC2 + Docker + Caddy
This keeps the app containerized and uses Caddy as a reverse proxy with HTTPS.

1. On your EC2 instance, install Docker and Docker Compose.
2. Open inbound ports 80 and 443 in your security group.
3. Set a DNS A record for your domain to the EC2 public IP (if you want HTTPS).
4. Update the Caddyfile:
   - For a domain, replace `:80` with `yourdomain.com`.
5. Build and run:
   ```bash
   docker compose up -d --build
   ```

Optional environment variables (set in `docker-compose.yml`):
- `DATABASE_URL` if you want to use Drizzle migrations.

Notes:
- Microphone access in browsers requires HTTPS, so use a real domain + Caddy TLS
  if you plan to use Listen mode in production.

## Adding API routes
Add Express routes in `server/routes.ts` under the `/api` prefix. The server
already mounts routes and logs API calls in development.
