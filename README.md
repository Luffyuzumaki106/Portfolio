# Faiz Siddiqui Portfolio — Two-Tier Architecture

This project is structured as a **two-tier web application**:

- **`frontend/` (Tier 1 — Presentation Tier)**: React 18, Vite, Tailwind CSS, Framer Motion, and GSAP UI. Communicates with the backend over `/api/*` and `/uploads/*` (proxied to `http://localhost:5000` in development, or configurable via `VITE_API_BASE_URL`).
- **`backend/` (Tier 2 — Application & Data Tier)**: Node.js + Express REST API backed by SQLite (`node:sqlite`), server-side salted `scrypt` authentication with `HttpOnly` session cookies, multipart image uploads (`backend/uploads/`), and contact inquiry storage.

## Project Structure

```text
faiz-siddiqui-portfolio/
├── package.json            # Root orchestrator scripts (dev, build, test)
├── scripts/dev.mjs         # Runs frontend & backend tiers concurrently
├── frontend/               # React + Vite presentation tier
│   ├── src/api/client.js   # Fetch API client & media URL resolver
│   ├── src/hooks/          # usePortfolioData (backend-synced)
│   └── src/components/     # Public showcase, Contact form, & Admin CMS
└── backend/                # Express + SQLite backend tier
    ├── src/config/env.js   # Port, CORS, DB, upload & session config
    ├── src/db/database.js  # SQLite schema & first-boot seeding
    ├── src/middleware/     # Cookie session auth & Multer image upload
    ├── src/routes/         # auth, portfolio, projects, uploads, contact, health
    └── tests/api.test.js   # End-to-end API integration test suite
```

## Quick Start

1. Install dependencies (if not already installed):
   ```bash
   npm run install:all
   ```
2. Run both tiers in development (`frontend` on `:5173`, `backend` on `:5000`):
   ```bash
   npm run dev
   ```
3. Build the frontend and verify backend API tests:
   ```bash
   npm run build
   npm run test:backend
   ```

## Production Deployment Options

- **Split Deployment**: Deploy `frontend/dist` to a static host (Vercel/Netlify/CDN) with `VITE_API_BASE_URL` pointing to your backend server, and run `npm start` inside `backend/` with `CORS_ORIGIN` set to the frontend origin.
- **Single-Origin Backend Serving**: Build the frontend (`npm run build`) and run `SERVE_FRONTEND=true npm start` inside `backend/` so Express serves both `/api` and the built SPA.
