# STLTH Pawn

Short-term asset loans — Brisbane, Ipswich, Gold Coast, Toowoomba.

React Router 8 (SSR) + Tailwind CSS 4. Applications are emailed through Resend
with the applicant's photos attached.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your Resend details
npm run dev
```

> **Node:** React Router 8 needs Node **> 22.22.0**. Check with `node -v`.

## Environment

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender — must be on a domain verified with Resend |
| `EMAIL_TO` | Where applications are delivered |

`.env` is loaded automatically in dev by the React Router Vite plugin. In
production (`npm start` / Docker) these must come from the host environment.

## Structure

```
app/
  components/   site header & footer, icons, multi-photo uploader
  lib/          site constants, Resend mailer (server only), reveal hook
  routes/       home, services, apply (form + action)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Route typegen + `tsc` |
