# Packers & Movers — Web Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for the Packers & Movers SaaS platform.

## Tech stack
- **Next.js 14** (App Router, React 18)
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query** + **Axios** (data fetching)
- **React Hook Form** + **Zod** (forms & validation)

## Getting started

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment
Copy-Item .env.example .env.local
# edit NEXT_PUBLIC_API_URL to point at the backend (default http://localhost:4000/api)

# 3. Run the dev server
npm run dev
```

App runs at `http://localhost:3000`.

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Lint |

## Structure
```
src/
  app/
    layout.tsx          # root layout
    page.tsx            # landing
    globals.css         # tailwind
    dashboard/page.tsx  # dashboard shell
  lib/
    api.ts              # axios client → backend
```

The backend API lives in the sibling `../backend` repo. See
`../docs/packers-movers-platform-architecture.md` for the full architecture and feature list.
