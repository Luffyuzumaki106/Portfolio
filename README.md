# Faiz Siddiqui Portfolio

Static portfolio website built with React 18, Vite, Tailwind CSS, Framer Motion, and GSAP.

## Structure

- `frontend/` — Static React + Vite application
- `frontend/src/data/projects.json` — Portfolio projects and site media links
- `frontend/dist/` — Production static build output

## Commands

Run from the repository root (or inside `frontend/`):

```bash
npm run dev      # Start local Vite dev server
npm run build    # Build static site into frontend/dist
npm run preview  # Preview the production static build locally
```

## Deployment

Deploy `frontend/dist` (or configure your static host with build command `npm --prefix frontend run build` and output directory `frontend/dist`) to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
