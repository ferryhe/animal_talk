# Animal Talk

Animal Talk is a playful web app that lets you "listen" to pet sounds and
play back animal vocalizations. It ships as a React + Vite frontend served by
an Express server in development and production.

## What it does
- Listen mode simulates translating animal sounds into human-friendly phrases.
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

## Adding API routes
Add Express routes in `server/routes.ts` under the `/api` prefix. The server
already mounts routes and logs API calls in development.
