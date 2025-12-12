# EdTech Platform

Full-stack Next.js 16 workspace for managing courses with role-based access, Prisma/PostgreSQL, and AI-assisted summaries.

## Features

- JWT auth with Student, Creator, and Admin roles; HTTP-only cookie storage.
- Course catalog with filters, detail pages, and role-aware visibility (published-only for public/students; creators see their own drafts).
- Creator workspace: create/update/delete courses, publish toggle, pricing/duration fields, and enrollment counts.
- Student experience: enroll/unenroll, enrollment list, and course progress entry points.
- AI assist: Gemini-powered course summary endpoint (`POST /api/ai/summary`) for landing copy.
- Dashboards: creator metrics (total/published courses, avg price, enrollments) and student enrollment view.
- API-first: all CRUD flows exposed through typed Next.js App Router handlers.
- UI stack: React 19, TanStack Query, shadcn/ui + Tailwind, theming via `next-themes`, toast via `sonner`.

## Architecture

- **App Router** in `src/app` with colocated API routes under `/api`.
- **Database** via Prisma/PostgreSQL: `User`, `Creator`, `Course`, `Enrollment` models with role enum and ownership checks.
- **Auth** utilities in `src/lib/auth.ts` and guards in `src/lib/auth-guard.ts`; cookies set on sign-in/up, cleared on sign-out.
- **State/data**: TanStack Query hooks in `src/modules/**/hooks`, Zod validation in `schemas/`, UI components in `components/ui`.
- **CORS middleware**: `src/proxy.ts` allows configured origins for API routes.
- **Providers**: `src/components/providers/app-providers.tsx` wires QueryClient, theming, and toasts.

## Key Routes & UI

- Pages: `/` (marketing), `/courses`, `/courses/[id]`, `/creators/[id]`, `/sign-in`, `/sign-up`.
- Creator tooling: course form/table components under `src/modules/courses/components`, dashboard cards in `src/modules/dashboard`.
- Student enrollment list in `StudentDashboard` (`src/modules/dashboard/components/student-dashboard.tsx`).

## API Surface (App Router)

- Auth: `POST /api/auth/sign-up`, `POST /api/auth/sign-in`, `POST /api/auth/sign-out`, `GET /api/auth/me`.
- Courses: `GET/POST /api/courses`, `GET/PUT/DELETE /api/courses/:id`.
- Enrollments: `GET /api/enrollments`, `POST /api/enrollments`, `DELETE /api/enrollments/:courseId`.
- Creators: `GET/PUT /api/creators` (self), `GET /api/creators/:id`.
- Stats: `GET /api/stats` (role-aware aggregates).
- AI: `POST /api/ai/summary` (Gemini 1.5 Flash).

## Prerequisites

- Node.js 20+
- PostgreSQL instance
- Package manager: npm/pnpm/yarn (examples use npm)
- (Optional) Google Generative AI key for summaries

## Quick Start (Local)

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env.local  # create if missing
```

Fill the variables from the table below. 3) Database setup

```bash
npx prisma migrate dev
npx prisma db seed
```

4. Run the app

```bash
npm run dev
# open http://localhost:3000
```

5. Lint

```bash
npm run lint
```

6. Production build

```bash
npm run build
npm run start
```

## Environment Variables

| Name                           | Required | Description                           | Example                                        |
| ------------------------------ | -------- | ------------------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                 | Yes      | Postgres connection string            | `postgresql://user:pass@localhost:5432/edtech` |
| `JWT_SECRET`                   | Yes      | Secret for signing auth cookies       | `superlongrandomstring`                        |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Enables `/api/ai/summary`             | `AIza...`                                      |
| `ALLOWED_ORIGINS`              | Optional | Comma list for CORS in `src/proxy.ts` | `http://localhost:3000`                        |

## Data & Seeding

- Schema defined in `prisma/schema.prisma` with migrations under `prisma/migrations/`.
- `npx prisma db seed` populates sample users, creators, courses, and enrollments for UI demos.
- Seeded passwords are placeholders; create real accounts via the sign-up flow for authentication.

## Notes on Auth & Roles

- Tokens are stored in the `auth_token` HTTP-only cookie.
- Role enforcement lives in `src/lib/auth-guard.ts` and is applied across course/enrollment/creator routes.
- Students can only see published courses; creators see their own; admins bypass ownership checks.

## Monitoring & Errors

- API handlers return structured JSON errors; 401/403 helpers in `auth-guard`.
- Prisma client logs queries in development; errors only in production (`src/lib/prisma.ts`).

## AI Summary Endpoint

- `POST /api/ai/summary` with body `{ "description": "text..." }`.
- Requires `GOOGLE_GENERATIVE_AI_API_KEY`; responds with a concise bullet summary for marketing copy.

## CORS

- `src/proxy.ts` sets CORS headers for `/api/*`; configure `ALLOWED_ORIGINS` for non-same-origin clients.

## Suggested Next Steps

- Add an explicit `/dashboard` route that renders `DashboardScreen`.
- Wire CI for lint/build checks and add tests for auth flows and course ownership rules.
