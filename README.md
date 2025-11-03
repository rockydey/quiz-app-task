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

Modern Quiz application built with Next.js 15 server actions, Auth.js (NextAuth v5), Prisma (SQLite), role‑based access (Admin/Candidate), and Shadcn UI. Sidebar provides portal switching and an admin navigation aligned with the spec from the v0 reference.

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

- **Next.js 15 Server Actions**: All backend operations use server actions with Prisma
- **Auth.js v5** with Prisma adapter (JWT strategy); `session.user` includes `role`
- **RBAC** via middleware:
  - Public: `/`, `/auth/*`, `/api/auth/*`
  - Candidate: `/dashboard`
  - Admin: `/dashboard/admin`
- **Admin flows implemented**
  - Positions: create/list (`/dashboard/admin`, `/dashboard/admin/positions`)
  - Quizzes (per Position): create/list with duration/date (`/dashboard/admin/positions/[positionId]/quizzes`)
  - Groups (per Quiz): create/list (`/dashboard/admin/quizzes/[testId]/groups`)
  - Questions (per Group): create MCQ/Text, mark correct options (`/dashboard/admin/groups/[groupId]/questions`)
- **Candidate flow implemented**
  - My Tests list with status and progress (`/dashboard/my-tests`)
  - Test taking UI with countdown and auto‑submit (`/dashboard/my-tests/[testId]`)

Interviewee navigation:

- `/dashboard/my-tests` — lists assigned tests with status (Completed / In Progress / Not Started), remaining time, question count, and Start/Continue actions.

---

## 4) Important code locations

- **Server Actions**: `src/actions/`
  - Auth: `src/actions/auth/`
  - Admin: `src/actions/admin/`
  - Interviewee: `src/actions/interviewee/`
- **Test runtime actions**: `src/actions/interviewee/test.js` (start/save/submit)
- **Auth config**: `src/auth.config.js`, `src/auth.js`
- **Middleware**: `src/middleware.js`
- **Sidebar**: `src/components/app-sidebar.jsx`
- **Prisma schema/models**: `prisma/schema.prisma`
- **Seed data**: `prisma/seed.js`

---

## 5) Admin module – Positions

- `/dashboard/admin` lists Positions and lets you create a Position using server actions (Prisma).
- Source: `src/app/dashboard/admin/page.jsx`, `src/actions/admin/position.js`

---

## 6) Troubleshooting

- Cannot access admin pages:
  - Ensure you’re logged in as the seeded admin (`admin@test.com`).
  - Verify `role: "ADMIN"` in the `User` table.
  - Clear cookies and re‑login if the session was created before recent changes.
- "fetch failed" on admin page:
  - The app uses Next.js server actions; ensure Prisma client is generated and the SQLite file path is valid.
- OAuth errors:
  - Providers are loaded only if env vars exist; unset them to disable.
- No tests on Interviewee “My Tests”:
  - Run `node prisma/seed.js` again to populate demo tests and assignments.

---

## 7) Scripts

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

## 8) Notes

- Email verification is disabled in development by default (`NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION=false`).
- Update `app/layout.js` metadata (title/description) to match your project.
- Portal switch is rendered above Logout in the sidebar (`src/components/app-sidebar.jsx`).
