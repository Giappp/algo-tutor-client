# AlgoTutor Client

Frontend for AlgoTutor, built with Next.js 16, React 19, Tailwind CSS, and authenticated API calls to the AlgoTutor backend.

## Requirements

- Node.js `>=20.9.0` (`.nvmrc` pins Node 22)
- npm `>=10`
- AlgoTutor backend reachable from the browser

## Environment

Copy the sample file and update values for your environment:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_USE_MOCK=false
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` must include the backend API prefix, usually `/api/v1`.
- `NEXT_PUBLIC_WS_URL` is used by the coding judge websocket. If omitted, the app derives `{backend-origin}/ws` from `NEXT_PUBLIC_API_BASE_URL`.
- Keep `NEXT_PUBLIC_USE_MOCK=false` in production.
- `NEXT_PUBLIC_*` values are bundled at build time by Next.js, so set production values before running `npm run build`.

## Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Quality Gate

Run this before deploy:

```bash
npm run check
```

This runs ESLint and a production Next.js build.

## Production Build

```bash
npm ci
npm run build
npm run start
```

The app listens on port `3000` by default. Set `PORT` if your host requires another port.

## Deploy On Vercel

Recommended settings:

- Framework preset: `Next.js`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave empty/default
- Node.js version: `22.x`

Add these environment variables in Vercel project settings:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_USE_MOCK=false`

After updating any `NEXT_PUBLIC_*` variable, redeploy so the browser bundle receives the new value.

## Deploy With Docker

Build with production public environment values:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1 \
  --build-arg NEXT_PUBLIC_WS_URL=https://api.example.com/ws \
  -t algotutor-client .
```

Run:

```bash
docker run --rm -p 3000:3000 algotutor-client
```

If you use Docker for real production, prefer building one image per environment because public Next.js variables are compiled into the client bundle.

## Deployment Checklist

- Backend CORS allows the frontend production domain.
- Auth cookies are configured for the production domain and HTTPS.
- `NEXT_PUBLIC_API_BASE_URL` points to the public backend URL, not localhost.
- `NEXT_PUBLIC_WS_URL` points to the public websocket/SockJS endpoint.
- S3/image domains used by roadmap thumbnails are listed in `next.config.ts`.
- `NEXT_PUBLIC_USE_MOCK=false`.
- `npm run check` passes.
