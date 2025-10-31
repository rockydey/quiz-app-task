### Quiz App – Auth + Admin/Candidate Dashboard

## Quick Start

```bash
# 1) Install deps
npm install

# 2) Configure env
cp .env.example .env  # or create .env using the template below

# 3) Prisma setup + seed demo data
npx prisma generate
npx prisma db push
node prisma/seed.js

# 4) Run the app
npm run dev
```

Login details (seeded):

- Admin: email `admin@test.com` / password `admin123`
- Candidate: email `john@test.com` / password `password123`

Portals:

- Admin: `http://localhost:3000/dashboard/admin`
- Interviewee: `http://localhost:3000/dashboard/my-tests`

Modern Quiz application with Auth.js (NextAuth v5), Prisma (SQLite), role‑based access (Admin/Candidate), and Shadcn UI. Sidebar provides portal switching and an admin navigation aligned with the spec from the v0 reference.

---

## 1) Environment

Create `.env` in project root:

```bash
AUTH_SECRET="cFI2+xO9Uny+1Jb8ErhAB493xAiOrbpOSoEest0pKjE="
NODE_ENV="development"

# Prisma (SQLite)
DATABASE_URL="file:./dev.db"

# Optional OAuth (conditionally loaded if set)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (configure if sending emails)
RESEND_API_KEY=

# App URLs
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Toggle email verification (dev default: false)
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION=false
```

---

## 2) Install, DB setup, and run

```bash
npm install

# Prisma
npx prisma format
npx prisma generate
npx prisma db push

# Seed sample data (admin + candidate, quiz, groups, questions)
node prisma/seed.js

# Start Next.js
npm run dev
```

Default seeded users (see `prisma/seed.js`):

- Admin: email `admin@test.com` / password `admin123`
- Candidate: email `john@test.com` / password `password123`

Demo tests created by seed:

- Frontend Screening (45 min) → completed session for candidate
- JavaScript Fundamentals Quiz (60 min) → in-progress session for candidate
- React Advanced Concepts (120 min) → not started for candidate

---

## 3) Features

- Auth.js v5 with Prisma adapter (JWT strategy), custom callbacks enrich `session.user` with `role`.
- Role‑based middleware gates:
  - Public: `/`, `/auth/*`, `/api/auth/*`
  - Candidate area: `/dashboard`
  - Admin area: `/dashboard/admin`
- Sidebar layout (Shadcn UI) with portal switcher:
  - Admin → “Interviewee Portal” button; Candidate → “Admin Portal” button
- Admin navigation (routes created):
  1. `/dashboard/admin` (Dashboard/Positions overview)
  2. `/dashboard/admin/assign`
  3. `/dashboard/admin/positions`
  4. `/dashboard/admin/groups`
  5. `/dashboard/admin/questions`
  6. `/dashboard/admin/quizzes` (Test Builder)
  7. `/dashboard/admin/users`
  8. `/dashboard/admin/grading`
  9. `/dashboard/admin/analytics`

Interviewee navigation:

- `/dashboard/my-tests` — lists assigned tests with status (Completed / In Progress / Not Started), remaining time, question count, and Start/Continue actions.

---

## 4) Important code locations

- Auth config and server instance: `src/auth.config.js`, `src/auth.js`
- Middleware (RBAC + redirects): `src/middleware.js`
- Routes constants: `src/routes.js`
- Sidebar + navigation: `src/components/app-sidebar.jsx`, `src/components/nav-main.jsx`
- Dashboard layout shell (sidebar wrapper): `src/app/dashboard/layout.jsx`
- Interviewee pages: `src/app/dashboard/my-tests`, `src/app/dashboard/my-tests/[testId]`
- Prisma schema/models: `prisma/schema.prisma`
- Seed data: `prisma/seed.js`

---

## 5) Admin module – Positions (example)

- The `/dashboard/admin` page lists Positions and lets you create a Position using server actions backed by Prisma.
- Source: `src/app/dashboard/admin/page.jsx` and `src/actions/admin/position.js`

---

## 6) Optional backend scaffold (NestJS)

An optional `backend/` NestJS scaffold exists but is not required to run the app. The app defaults to server actions. If you wish to use the Nest API later, start it on port `4000` and point the frontend API utility to it via `NEXT_PUBLIC_API_BASE_URL`.

---

## 7) Troubleshooting

- Cannot access admin pages:
  - Ensure you’re logged in as the seeded admin (`admin@test.com`).
  - Verify `role: "ADMIN"` in the `User` table.
  - Clear cookies and re‑login if the session was created before recent changes.
- “fetch failed” on admin page:
  - The app uses server actions by default; ensure you reverted any temporary API fetch wiring.
- OAuth errors:
  - Providers are loaded only if env vars exist; unset them to disable.
- No tests on Interviewee “My Tests”:
  - Run `node prisma/seed.js` again to populate demo tests and assignments.

---

## 8) Scripts

```bash
# Dev
npm run dev

# Prisma
npx prisma generate
npx prisma db push
node prisma/seed.js

# Lint (if configured)
npm run lint
```

---

## 9) Notes

- Email verification is disabled in development by default (`NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION=false`).
- Update `app/layout.js` metadata (title/description) to match your project.
- Portal switch is rendered above Logout in the sidebar (`src/components/app-sidebar.jsx`).
